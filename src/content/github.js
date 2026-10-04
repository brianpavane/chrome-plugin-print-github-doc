// Knowledge of GitHub pages: what page we're on, where the document is, and
// how to list a folder's Markdown files and fetch their rendered HTML.
//
// Folder listing and rendered Markdown come from GitHub's own JSON responses
// (the same ones its web app uses): requesting a /tree/ or /blob/ URL with
// "Accept: application/json". The request is same-origin, so it carries the
// user's login and works for private repositories.

globalThis.GHP = globalThis.GHP || {};

GHP.github = (() => {
  const S = globalThis.GHP_SELECTORS;
  const MARKDOWN = /\.(md|markdown|mdown|mkd)$/i;
  // Folder printing fetches one page per file; cap it so a huge folder
  // can't send hundreds of requests to GitHub.
  const MAX_FOLDER_FILES = 100;

  function pageInfo(loc = location) {
    const parts = loc.pathname.split("/").filter(Boolean).map(safeDecode);
    const [owner = "", repo = ""] = parts;
    let kind = "other";
    if (parts.length === 2) kind = "home";
    else if (parts[2] === "wiki") kind = "wiki";
    else if (parts[2] === "blob") kind = "blob";
    else if (parts[2] === "tree") kind = "tree";

    // For display only: assumes a single-segment branch name.
    const file = kind === "blob" ? parts.slice(4).join("/") : kind === "home" ? "README" : "";

    return {
      owner,
      repo,
      repoPath: `${owner}/${repo}`,
      kind,
      file,
      url: loc.href,
      parts,
    };
  }

  function findContent(doc = document) {
    for (const sel of S.content) {
      const matches = [...doc.querySelectorAll(sel)].filter(
        (el) => el.textContent.trim().length > 0 && !el.closest(".ghp-bundle")
      );
      if (matches.length) {
        return matches.reduce((a, b) => (b.textContent.length > a.textContent.length ? b : a));
      }
    }
    return null;
  }

  function wikiTitle(doc = document) {
    for (const sel of S.wikiTitle) {
      const text = doc.querySelector(sel)?.textContent.trim();
      if (text) return text;
    }
    return doc.title.split(" · ")[0];
  }

  // Title for the printed header: wiki page title, else the document's
  // first heading, else the file name.
  function docTitle(info, root) {
    if (info.kind === "wiki") {
      return wikiTitle() || (info.parts[3] || "Home").replace(/-/g, " ");
    }
    const h1 = root?.querySelector("h1");
    return h1?.textContent.trim() || baseName(info.file) || info.repo;
  }

  // Short name used as the PDF file name, e.g. "cli - install_linux".
  function pdfTitle(info, { folder } = {}) {
    if (folder) return `${info.repo} - ${folder.dir ? baseName(folder.dir) : "docs"}`;
    if (info.kind === "wiki") return `${info.repo} - wiki - ${wikiTitle()}`;
    if (info.kind === "blob") return `${info.repo} - ${stripExt(baseName(info.file))}`;
    return `${info.repo} - README`;
  }

  // ---- folder printing ----------------------------------------------------

  // URL of the folder that contains (or is) the current page, or null if
  // this page has no folder to print.
  function folderUrl(info) {
    const base = `/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}`;
    if (info.kind === "blob" && info.parts.length >= 5) {
      // Everything between "blob/" and the file name is "<ref>/<dir>"; GitHub
      // resolves which part is the branch.
      return `${base}/tree/${info.parts.slice(3, -1).map(encodeURIComponent).join("/")}`;
    }
    if (info.kind === "tree" && info.parts.length >= 4) {
      return `${base}/tree/${info.parts.slice(3).map(encodeURIComponent).join("/")}`;
    }
    if (info.kind === "home") return `${base}/tree/HEAD`;
    return null;
  }

  // -> { ref, dir, files: [{ name, path, url }] } or null.
  async function listMarkdown(info) {
    const url = folderUrl(info);
    if (!url) return null;
    const json = await fetchJson(url);
    const route = json?.payload?.codeViewTreeRoute || json?.payload?.codeViewRepoRoute;
    const items = route?.tree?.items;
    const ref = route?.refInfo?.name;
    if (!Array.isArray(items) || typeof ref !== "string" || !isSafePath(ref)) return null;

    const dir = typeof route.path === "string" && route.path !== "/" ? route.path : "";
    const base = `/${encodeURIComponent(info.owner)}/${encodeURIComponent(info.repo)}/blob/`;
    const files = items
      .filter((i) => i.contentType === "file" && isSafeName(i.name) && isSafePath(i.path))
      .filter((i) => MARKDOWN.test(i.name))
      .sort(compareFiles)
      .map((i) => ({
        name: i.name,
        path: i.path,
        url: base + [...ref.split("/"), ...i.path.split("/")].map(encodeURIComponent).join("/"),
      }));
    return { ref, dir, files };
  }

  // README first, then natural order (so "2-x" sorts before "10-x").
  function compareFiles(a, b) {
    const ra = /^readme\./i.test(a.name);
    const rb = /^readme\./i.test(b.name);
    if (ra !== rb) return ra ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
  }

  // Rendered HTML (an <article class="markdown-body">) for one file.
  async function fetchRendered(file) {
    const json = await fetchJson(file.url);
    const html = json?.payload?.codeViewBlobRoute?.richText;
    if (typeof html !== "string" || !html.trim()) {
      throw new Error(`GitHub returned no rendered content for ${file.path}`);
    }
    return html;
  }

  // Only ever requests github.com paths, from the github.com page itself.
  async function fetchJson(url) {
    const target = new URL(url, location.href);
    if (target.origin !== location.origin) throw new Error(`Refusing to fetch ${target.href}`);
    const res = await fetch(target, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });
    if (res.url && new URL(res.url).origin !== location.origin) {
      throw new Error(`Unexpected redirect to ${res.url}`);
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
    if (!/json/.test(res.headers.get("content-type") || "")) {
      throw new Error(`Expected JSON from ${url}`);
    }
    return res.json();
  }

  // ---- helpers -----------------------------------------------------------

  // Names and paths come from GitHub's JSON; reject anything that could
  // step outside the repository when turned into a URL.
  function isSafeName(name) {
    return typeof name === "string" && name !== "" && name !== "." && name !== ".." && !/[\/\\]/.test(name);
  }

  function isSafePath(path) {
    return (
      typeof path === "string" &&
      path !== "" &&
      path.split("/").every((seg) => seg !== "" && seg !== "." && seg !== "..") &&
      !path.includes("\\")
    );
  }

  function baseName(path) {
    return (path || "").split("/").filter(Boolean).pop() || "";
  }

  function stripExt(name) {
    return name.replace(/\.[^.]+$/, "");
  }

  function safeDecode(s) {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  }

  return {
    pageInfo,
    findContent,
    docTitle,
    pdfTitle,
    folderUrl,
    listMarkdown,
    fetchRendered,
    compareFiles,
    baseName,
    MAX_FOLDER_FILES,
  };
})();
