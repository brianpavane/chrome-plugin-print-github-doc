// Fake versions of the JSON GitHub returns for /tree/ and /blob/ URLs when
// asked with "Accept: application/json". Shapes match responses captured
// from github.com (payload.codeViewTreeRoute / payload.codeViewBlobRoute).

const article = (inner) =>
  `<article class="markdown-body entry-content container-lg" itemprop="text">${inner}</article>`;

const files = {
  "docs/README.md": article(`<div class="markdown-heading"><h1 class="heading-element">Docs index</h1></div><p>Start here.</p>`),
  "docs/2-two.md": article(`<div class="markdown-heading"><h1 class="heading-element">Getting started</h1></div><p>Two.</p>`),
  "docs/10-ten.md": article(
    `<div class="markdown-heading"><h1 class="heading-element">Advanced</h1></div><p>Ten.</p>` +
      `<section class="js-render-needs-enrichment render-needs-enrichment" data-type="mermaid">` +
      `<div class="js-render-enrichment-target"><div class="render-plaintext-hidden"><pre lang="mermaid">graph TD; A--&gt;B</pre></div></div>` +
      `<span class="js-render-enrichment-loader">Loading</span></section>`
  ),
};

export const treeJson = {
  payload: {
    codeViewTreeRoute: {
      path: "docs",
      refInfo: { name: "main", refType: "branch" },
      tree: {
        items: [
          { name: "images", path: "docs/images", contentType: "directory" },
          { name: "10-ten.md", path: "docs/10-ten.md", contentType: "file" },
          { name: "2-two.md", path: "docs/2-two.md", contentType: "file" },
          { name: "notes.txt", path: "docs/notes.txt", contentType: "file" },
          { name: "README.md", path: "docs/README.md", contentType: "file" },
        ],
        totalCount: 5,
      },
    },
  },
};

export function blobJson(path) {
  const richText = files[path];
  return richText ? { payload: { codeViewBlobRoute: { richText } } } : null;
}
