// Builds one printable element containing every Markdown file in a folder.

globalThis.GHP = globalThis.GHP || {};

GHP.bundle = (() => {
  const CONCURRENCY = 4;

  // -> detached <div class="ghp-bundle"> with a contents list and one
  // <section class="ghp-doc"> per file, in listing order.
  async function build(info, listing, onProgress = () => {}) {
    const { files } = listing;
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
    let failed = false; // stop reporting progress (and fetching) after an error
    onProgress(done, files.length);
    const htmls = await mapLimit(files, CONCURRENCY, async (file) => {
      if (failed) return null;
      try {
        const html = await GHP.github.fetchRendered(file);
        if (!failed) onProgress(++done, files.length);
        return html;
      } catch (err) {
        failed = true;
        throw err;
      }
    });

    files.forEach((file, i) => {
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

    return bundle;
  }

  // GitHub's rendered (and sanitized) HTML -> element. Scripts in parsed
  // HTML never run.
  function parseArticle(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    let article = doc.querySelector(".markdown-body");
    if (!article) {
      article = doc.createElement("article");
      article.className = "markdown-body";
      article.append(...doc.body.childNodes);
    }
    return document.importNode(article, true);
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
