// Loads a fixture page as if it were github.com, injects the extension's
// content scripts the way background.js does, and records what the page
// looks like (in print media) at the moment window.print() is called.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { treeJson, blobJson } from "./fixtures/github-json.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const background = readFileSync(join(ROOT, "src/background.js"), "utf8");
const CSS_FILE = background.match(/CSS_FILE = "([^"]+)"/)[1];
const SCRIPT_FILES = [...background.matchAll(/^\s+"(src\/[^"]+\.js)",?$/gm)].map((m) => m[1]);

export const DOC_URL = "https://github.com/test-owner/test-repo/blob/main/docs/2-two.md";
export const NO_DOC_URL = "https://github.com/test-owner/test-repo/issues";

export async function openPage(page, { url = DOC_URL, fixture = "doc.html", stored = {} } = {}) {
  const html = readFileSync(join(ROOT, "test/fixtures", fixture), "utf8");

  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    if (u.hostname !== "github.com") return route.fulfill({ status: 200, body: "" });
    if ((req.headers().accept || "").includes("application/json")) {
      const json = jsonFor(u.pathname);
      return json
        ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(json) })
        : route.fulfill({ status: 404, contentType: "text/html", body: "Not found" });
    }
    return route.fulfill({ status: 200, contentType: "text/html", body: html });
  });

  await page.addInitScript((stored) => {
    // Stand-in for chrome.storage.sync.
    window.chrome = window.chrome || {};
    window.__saved = null;
    window.chrome.storage = {
      sync: {
        get: async (defaults) => ({ ...defaults, ...stored }),
        set: async (values) => {
          window.__saved = values;
        },
      },
      local: {
        get: async () => ({}),
        set: async () => {},
      },
    };
    // Record the print-time state instead of opening a dialog.
    window.__prints = [];
    window.print = () => window.__prints.push(window.__snapshot());
    window.__snapshot = () => {
      const q = (s) => document.querySelector(s);
      const shown = (s) => (q(s) ? getComputedStyle(q(s)).display !== "none" : null);
      return {
        title: document.title,
        colorMode: document.documentElement.getAttribute("data-color-mode"),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        textColor: q(".markdown-body") && getComputedStyle(q(".markdown-body")).color,
        visible: {
          siteHeader: shown(".site-header"),
          sidebar: shown(".sidebar"),
          toolbar: shown(".file-toolbar"),
          footer: shown(".site-footer"),
          article: shown("article.markdown-body"),
          bundle: shown(".ghp-bundle"),
          issueList: shown(".issue-list"),
        },
        printHeader: q(".ghp-print-header")?.textContent ?? null,
        printHeaderShown: shown(".ghp-print-header"),
        detailsOpen: [...document.querySelectorAll("article details")].map((d) => d.open),
        linkUrls: [...document.querySelectorAll("[data-ghp-href]")].map(
          (a) => getComputedStyle(a, "::after").content
        ),
        breaks: document.querySelectorAll(".ghp-break-before").length,
        breakStyle: q(".ghp-break-before") && getComputedStyle(q(".ghp-break-before")).breakBefore,
        pictureSrc: q("picture img")?.currentSrc || null,
        inverted: document.querySelectorAll(".ghp-invert").length,
        panel: !!q(".ghp-panel-host"),
        bundleDocs: [...document.querySelectorAll(".ghp-doc-header")].map((e) => e.textContent),
        bundleContents: [...document.querySelectorAll(".ghp-contents li")].map((e) => e.textContent),
        mermaidSourceShown: shown(".ghp-show-source .render-plaintext-hidden"),
        unsafeInBundle: document.querySelectorAll(
          ".ghp-bundle script, .ghp-bundle iframe, .ghp-bundle [onerror], .ghp-bundle [onclick], .ghp-bundle [style], .ghp-bundle [srcset], .ghp-bundle a[href^='javascript:'], .ghp-bundle a[href^='file:']"
        ).length,
        bundleImages: document.querySelectorAll(".ghp-bundle img[src]").length,
      };
    };
  }, stored);

  await page.goto(url);
  await page.emulateMedia({ media: "print" });
}

// Same as clicking the toolbar button.
export async function trigger(page) {
  await page.addStyleTag({ path: join(ROOT, CSS_FILE) });
  for (const file of SCRIPT_FILES) await page.addScriptTag({ path: join(ROOT, file) });
}

export async function waitForPrint(page, count = 1) {
  await page.waitForFunction((n) => window.__prints.length >= n, count, { timeout: 15000 });
  return page.evaluate(() => window.__prints.at(-1));
}

export const panel = (page) => page.locator(".ghp-panel-host .panel");

// Every trace the extension leaves while printing; all should be gone after.
export function leftovers(page) {
  return page.evaluate(() => ({
    attrs: document.querySelectorAll("[data-ghp-root],[data-ghp-path],[data-ghp-href]").length,
    classes: document.querySelectorAll(
      ".ghp-printing,.ghp-printing-whole,.ghp-break-before,.ghp-invert,.ghp-show-source"
    ).length,
    elements: document.querySelectorAll(".ghp-print-header,.ghp-bundle,.ghp-panel-host").length,
    colorMode: document.documentElement.getAttribute("data-color-mode"),
    title: document.title,
    detailsOpen: [...document.querySelectorAll("article details")].map((d) => d.open),
    pictureMedia: [...document.querySelectorAll("picture source")].map((s) => s.media),
    lazy: document.querySelector("picture img")?.getAttribute("loading"),
  }));
}

function jsonFor(pathname) {
  if (/^\/test-owner\/test-repo\/tree\/main\/docs\/?$/.test(pathname)) return treeJson;
  const blob = pathname.match(/^\/test-owner\/test-repo\/blob\/main\/(.+)$/);
  return blob ? blobJson(decodeURIComponent(blob[1])) : null;
}
