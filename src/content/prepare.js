// Prepares the page for printing and returns a session whose restore()
// undoes every change. All print-only rules live in print.css and are keyed
// off attributes/classes set here.

globalThis.GHP = globalThis.GHP || {};

GHP.prepare = async function prepare({
  root, // the document element on the page, or null
  bundle = null, // detached folder bundle from GHP.bundle.build, or null
  listing = null, // folder listing (for the header), when printing a bundle
  info, // GHP.github.pageInfo()
  options, // settings (see shared/defaults.js)
  wholePage = false, // fallback: print the full page, only forced light
}) {
  const S = globalThis.GHP_SELECTORS;
  const html = document.documentElement;
  const undo = [];
  const restore = () => {
    while (undo.length) {
      try {
        undo.pop()();
      } catch (err) {
        console.error("Print Doc for GitHub: restore failed", err);
      }
    }
  };

  try {
    const wasDark = isDarkMode();
    forceLightTheme();
    preferLightPictureSources();
    setTitle(GHP.github.pdfTitle(info, { folder: bundle ? listing : null }));

    if (wholePage) {
      setClass(html, "ghp-printing-whole");
      await nextFrame();
      return { restore };
    }

    let target = root;
    if (bundle) {
      if (root) root.after(bundle);
      else (document.querySelector("main") || document.body).append(bundle);
      undo.push(() => bundle.remove());
      target = bundle;
    }

    markPrintTree(target);
    if (options.includeHeader) insertHeader(target);
    if (options.expandDetails) expandDetails(target);
    if (options.printLinkUrls) markLinkUrls(target);
    if (options.sectionPageBreaks) {
      const docs = bundle ? bundle.querySelectorAll(".ghp-doc > .markdown-body") : [target];
      for (const doc of docs) markSectionBreaks(doc);
    }
    setClass(html, "ghp-printing");

    await loadImages(target);
    if (bundle) await settleDiagrams(bundle);
    await delay(300); // let the theme change and diagram re-renders settle
    if (wasDark) invertDarkDiagrams(target);
    await nextFrame();
  } catch (err) {
    restore();
    throw err;
  }
  return { restore };

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
      if (/color_mode=light/.test(frame.getAttribute("src") || "")) continue;
      setClass(frame, "ghp-invert");
    }
  }

  // In a bundle, diagrams arrive as unrendered placeholders. GitHub's page
  // script may render them; if it doesn't within a few seconds, show the
  // diagram's source text instead of a blank space.
  async function settleDiagrams(scope) {
    const pending = [...scope.querySelectorAll(S.diagramPlaceholders.join(","))];
    if (!pending.length) return;
    const hasFrame = (el) => el.querySelector("iframe");
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline && !pending.every(hasFrame)) await delay(250);
    for (const el of pending) {
      if (!hasFrame(el)) setClass(el, "ghp-show-source");
    }
    if (pending.some(hasFrame)) await delay(1500); // let frames draw and size
  }

  // ---- content -----------------------------------------------------------

  function setTitle(title) {
    const prev = document.title;
    document.title = title;
    undo.push(() => (document.title = prev));
  }

  function markPrintTree(el) {
    setAttr(el, "data-ghp-root", "");
    for (let p = el.parentElement; p && p !== html; p = p.parentElement) {
      setAttr(p, "data-ghp-path", "");
    }
  }

  function insertHeader(el) {
    const header = document.createElement("div");
    header.className = "ghp-print-header";

    const title = document.createElement("div");
    title.className = "ghp-print-title";
    header.append(title);

    if (bundle) {
      title.textContent = listing.dir || info.repo;
      addMeta(header, "Repository", info.repoPath);
      addMeta(header, "Folder", listing.dir || "(repository root)");
      // From the repository home page GitHub resolves HEAD to a commit id.
      if (/^[0-9a-f]{40}$/.test(listing.ref)) addMeta(header, "Commit", listing.ref.slice(0, 7));
      else addMeta(header, "Branch", listing.ref);
      addMeta(header, "URL", new URL(GHP.github.folderUrl(info), location.href).href);
    } else {
      title.textContent = GHP.github.docTitle(info, el);
      addMeta(header, "Repository", info.repoPath);
      if (info.file) addMeta(header, "File", info.file);
      addMeta(header, "URL", info.url);
    }

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
      if (a.matches(skip) || a.closest(".ghp-print-header, .ghp-doc-header")) continue;
      const text = a.textContent.trim();
      if (!text) continue; // image-only links
      const href = a.href;
      const shown = href.replace(/^mailto:/, "");
      if (text === href || text === shown || text === raw) continue;
      setAttr(a, "data-ghp-href", shown);
    }
  }

  // Start each top-level section on a new page. "Top level" is h1 when the
  // document has several, otherwise h2. The first section stays with the
  // title so page one isn't nearly empty.
  function markSectionBreaks(doc) {
    const level = doc.querySelectorAll("h1").length > 1 ? "h1" : "h2";
    const headings = [...doc.querySelectorAll(level)].slice(1);
    for (const h of headings) {
      const wrapper = h.parentElement?.classList.contains("markdown-heading") ? h.parentElement : h;
      setClass(wrapper, "ghp-break-before");
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
};
