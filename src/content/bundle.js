// Builds one printable element containing every Markdown file in a folder.

globalThis.GHP = globalThis.GHP || {};

GHP.bundle = (() => {
  const CONCURRENCY = 4;

  // -> detached <div class="ghp-bundle"> with a contents list and one
  // <section class="ghp-doc"> per file, in listing order. Files that fail
  // are left out and listed in bundle.ghpFailures. Pass the same `cache`
  // (a Map) to a retry so only the files that failed are fetched again.
  // Errors thrown with `retryable: true` may succeed if tried again.
  async function build(info, listing, onProgress = () => {}, { signal, cache = new Map() } = {}) {
    if (!listing?.files) throw new Error("The folder listing is no longer available.");
    const { files } = listing;
    if (files.length > GHP.github.MAX_FOLDER_FILES) {
      throw new Error(`Too many files (${files.length}); the limit is ${GHP.github.MAX_FOLDER_FILES}.`);
    }
    const bundle = document.createElement("div");
    bundle.className = "ghp-bundle";

    const contents = document.createElement("div");
    contents.className = "ghp-contents";
    const heading = document.createElement("div");
    heading.className = "ghp-contents-title";
    heading.textContent = `Contents (${files.length} documents)`;
    const list = document.createElement("ol");
    contents.append(heading, list);
    bundle.append(contents);

    let done = 0;
    onProgress(done, files.length);
    const htmls = await mapLimit(files, CONCURRENCY, async (file) => {
      if (signal?.aborted) throw signal.reason || new DOMException("Cancelled", "AbortError");
      try {
        const html = cache.get(file.url) ?? (await GHP.github.fetchRendered(file, { signal }));
        cache.set(file.url, html);
        onProgress(++done, files.length);
        return html;
      } catch (err) {
        if (signal?.aborted) throw err;
        onProgress(++done, files.length);
        return { error: err };
      }
    });

    const failures = files.flatMap((file, i) =>
      htmls[i] && typeof htmls[i] === "object" ? [{ file, error: htmls[i].error }] : []
    );
    if (failures.length === files.length) {
      throw Object.assign(new Error(`None of the ${files.length} documents could be loaded.`), { retryable: true });
    }
    const loadedCount = files.length - failures.length;
    heading.textContent = `Contents (${loadedCount} document${loadedCount === 1 ? "" : "s"})`;
    if (failures.length) {
      const warning = document.createElement("p");
      warning.className = "ghp-bundle-warning";
      const one = failures.length === 1;
      warning.textContent =
        `${failures.length} document${one ? " was" : "s were"} left out because GitHub couldn't load ` +
        `${one ? "it" : "them"}: ${failures.map(({ file }) => file.path).join(", ")}.`;
      contents.append(warning);
    }

    files.forEach((file, i) => {
      if (htmls[i] && typeof htmls[i] === "object") return;
      const section = document.createElement("section");
      section.className = "ghp-doc";

      const docHeader = document.createElement("div");
      docHeader.className = "ghp-doc-header";
      docHeader.append(file.path, document.createElement("br"), new URL(file.url, location.href).href);

      const body = parseArticle(htmls[i]);
      section.append(docHeader, body);
      bundle.append(section);

      const item = document.createElement("li");
      const title = body.querySelector("h1")?.textContent.trim();
      item.textContent = title ? `${title} (${file.name})` : file.name;
      list.append(item);
    });

    Object.defineProperty(bundle, "ghpFailures", { value: failures });
    return bundle;
  }

  // GitHub's rendered HTML -> element. GitHub already sanitizes it, but it
  // is inserted into the live github.com page, so strip anything active
  // first: parsing doesn't run scripts, but event handlers on inserted
  // elements (e.g. <img onerror>) would.
  function parseArticle(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    let article = doc.querySelector(".markdown-body");
    if (!article) {
      article = doc.createElement("article");
      article.className = "markdown-body";
      article.append(...doc.body.childNodes);
    }
    sanitize(article);
    return document.importNode(article, true);
  }

  const BLOCKED_ELEMENTS =
    "script, style, link, meta, base, iframe, frame, frameset, object, embed, applet, form, template, noscript";
  const URL_ATTRS = new Set(["href", "src", "xlink:href", "action", "formaction", "poster", "background", "cite"]);

  function sanitize(root) {
    root.querySelectorAll(BLOCKED_ELEMENTS).forEach((el) => el.remove());
    for (const el of [root, ...root.querySelectorAll("*")]) {
      for (const { name, value } of [...el.attributes]) {
        const n = name.toLowerCase();
        if (n.startsWith("on") || n === "srcdoc" || n === "style" || n === "srcset") {
          el.removeAttribute(name);
        } else if (URL_ATTRS.has(n) && !isSafeUrl(value, el, n)) {
          el.removeAttribute(name);
        }
      }
      if (el.localName === "input") el.disabled = true; // task-list checkboxes
    }
  }

  function isSafeUrl(value, el, attr) {
    const compact = value.replace(/[\u0000-\u0020]/g, "");
    if (/^(#|\/|\.\/|\.\.\/)/.test(compact)) return true;
    let url;
    try {
      url = new URL(compact, location.href);
    } catch {
      return false;
    }
    if (url.protocol === "https:" || url.protocol === "http:") return true;
    if (url.protocol === "mailto:" && (attr === "href" || attr === "xlink:href")) return true;
    return url.protocol === "data:" && el.localName === "img" && attr === "src" && /^data:image\/(?:png|gif|jpe?g|webp|avif);/i.test(compact);
  }

  async function mapLimit(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;
    async function worker() {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
  }

  return { build };
})();
