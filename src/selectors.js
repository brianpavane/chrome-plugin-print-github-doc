// All GitHub DOM assumptions live here so they're easy to update when
// GitHub changes its markup. Assigned to globalThis (not const) because this
// file is re-injected on every click.

globalThis.GHP_SELECTORS = {
  // Rendered markdown containers, most specific first. The first selector
  // that matches anything wins; among its matches the largest is used.
  content: [
    "#wiki-body .markdown-body",
    "#readme article.markdown-body",
    "article.markdown-body",
    ".markdown-body",
  ],

  // Wiki page title (lives outside the markdown body).
  wikiTitle: ["#wiki-wrapper .gh-header-title", ".gh-header-title"],

  // Mermaid / other rich renderers are cross-origin iframes.
  diagramFrames: [
    "iframe.render-viewer",
    "section[data-type='mermaid'] iframe",
    ".js-render-enrichment-target iframe",
    "iframe[src*='viewscreen.githubusercontent.com']",
  ],

  // Links that shouldn't get their URL printed.
  skipLinkUrl: ["a.anchor", "a[aria-hidden='true']"],
};
