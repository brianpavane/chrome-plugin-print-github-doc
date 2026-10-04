// Injected on demand. Prepares the page for a clean print of the rendered
// markdown only, opens Chrome's print dialog, then restores the page.

(async () => {
  if (globalThis.__ghpPrinting) return;
  globalThis.__ghpPrinting = true;

  const S = globalThis.GHP_SELECTORS;
  const html = document.documentElement;
  const undo = []; // functions that revert each change, run in reverse order

  const defaults = { printLinkUrls: false };
  const options = await chrome.storage.sync.get(defaults).catch(() => defaults);

  const root = findContent();
  if (!root) {
    globalThis.__ghpPrinting = false;
    alert(
      "Print GitHub Doc: couldn't find a rendered document on this page.\n\n" +
        "Open a markdown file (in Preview mode), a repository README, or a wiki page."
    );
    return;
  }

  const wasDark = isDarkMode();

  try {
    forceLightTheme();
    preferLightPictureSources();
    markPrintTree(root);
    insertHeader(root);
    expandDetails(root);
    if (options.printLinkUrls) markLinkUrls(root);
    setClass(html, "ghp-printing");

    await loadImages(root);
    await delay(300); // let theme change and any diagram re-render settle
    if (wasDark) invertDarkDiagrams(root);
    await nextFrame();

    window.print(); // blocks until the dialog closes in Chrome
  } catch (err) {
    console.error("Print GitHub Doc:", err);
  } finally {
    while (undo.length) {
      try {
        undo.pop()();
      } catch (err) {
        console.error("Print GitHub Doc: restore failed", err);
      }
    }
    globalThis.__ghpPrinting = false;
  }

  // ---- content discovery -------------------------------------------------

  function findContent() {
    for (const sel of S.content) {
      const matches = [...document.querySelectorAll(sel)].filter(
        (el) => el.textContent.trim().length > 0
      );
      if (matches.length) {
        return matches.reduce((a, b) =>
          b.textContent.length > a.textContent.length ? b : a
        );
      }
    }
    return null;
  }

  function pageInfo() {
    const parts = location.pathname.split("/").filter(Boolean);
    const repo = parts.slice(0, 2).join("/");
    const kind = parts[2];
    let title = "";
    let file = "";

    if (kind === "wiki") {
      title =
        textOf(S.wikiTitle) ||
        document.title.split(" · ")[0] ||
        decodeURIComponent(parts[3] || "Home").replace(/-/g, " ");
    } else if (kind === "blob") {
      file = decodeURIComponent(parts.slice(4).join("/"));
    } else {
      file = "README";
    }

    if (!title) {
      const h1 = root.querySelector("h1");
      title = h1 ? h1.textContent.trim() : file.split("/").pop();
    }
    return { repo, title, file, url: location.href };
  }

  function textOf(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      const text = el && el.textContent.trim();
      if (text) return text;
    }
    return "";
  }

  // ---- theme -------------------------------------------------------------

  function isDarkMode() {
    const mode = html.getAttribute("data-color-mode");
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function forceLightTheme() {
    setAttr(html, "data-color-mode", "light");
    setAttr(html, "data-light-theme", "light");
  }

  // <picture> sources keyed on prefers-color-scheme follow the OS, not
  // GitHub's theme, so pin them to the light variant.
  function preferLightPictureSources() {
    for (const source of document.querySelectorAll("picture source[media]")) {
      const media = source.getAttribute("media");
      if (/prefers-color-scheme:\s*dark/.test(media)) setAttr(source, "media", "not all");
      else if (/prefers-color-scheme:\s*light/.test(media)) setAttr(source, "media", "all");
    }
  }

  // Diagram iframes are cross-origin, so we can't restyle their contents.
  // If one is still rendered dark, invert it (hue-rotate keeps colors close).
  function invertDarkDiagrams(scope) {
    for (const frame of scope.querySelectorAll(S.diagramFrames.join(","))) {
      const src = frame.getAttribute("src") || "";
      if (/color_mode=light/.test(src)) continue;
      setClass(frame, "ghp-invert");
    }
  }

  // ---- layout ------------------------------------------------------------

  function markPrintTree(el) {
    setAttr(el, "data-ghp-root", "");
    for (let p = el.parentElement; p && p !== html; p = p.parentElement) {
      setAttr(p, "data-ghp-path", "");
    }
  }

  function insertHeader(el) {
    const info = pageInfo();
    const header = document.createElement("div");
    header.className = "ghp-print-header";

    const title = document.createElement("div");
    title.className = "ghp-print-title";
    title.textContent = info.title;
    header.append(title);

    addMeta(header, "Repository", info.repo);
    if (info.file) addMeta(header, "File", info.file);
    addMeta(header, "URL", info.url);

    el.prepend(header);
    undo.push(() => header.remove());
  }

  function addMeta(parent, label, value) {
    const row = document.createElement("div");
    row.className = "ghp-print-meta";
    const b = document.createElement("span");
    b.className = "ghp-print-label";
    b.textContent = label + ": ";
    row.append(b, value);
    parent.append(row);
  }

  function expandDetails(scope) {
    for (const d of scope.querySelectorAll("details:not([open])")) {
      d.open = true;
      undo.push(() => (d.open = false));
    }
  }

  function markLinkUrls(scope) {
    const skip = S.skipLinkUrl.join(",");
    for (const a of scope.querySelectorAll("a[href]")) {
      const raw = a.getAttribute("href");
      if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) continue;
      if (a.matches(skip)) continue;
      const text = a.textContent.trim();
      if (!text) continue; // image-only links
      const href = a.href;
      const shown = href.replace(/^mailto:/, "");
      if (text === href || text === shown || text === raw) continue;
      setAttr(a, "data-ghp-href", shown);
    }
  }

  async function loadImages(scope) {
    const imgs = [...scope.querySelectorAll("img")];
    for (const img of imgs) {
      if (img.loading === "lazy") setAttr(img, "loading", "eager");
    }
    await Promise.race([
      Promise.all(imgs.map((img) => img.decode().catch(() => {}))),
      delay(5000),
    ]);
  }

  // ---- reversible DOM helpers -------------------------------------------

  function setAttr(el, name, value) {
    const had = el.hasAttribute(name);
    const prev = el.getAttribute(name);
    el.setAttribute(name, value);
    undo.push(() => (had ? el.setAttribute(name, prev) : el.removeAttribute(name)));
  }

  function setClass(el, name) {
    if (el.classList.contains(name)) return;
    el.classList.add(name);
    undo.push(() => el.classList.remove(name));
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function nextFrame() {
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }
})();
