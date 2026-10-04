// Generates the Chrome Web Store images in store/: three 1280x800
// screenshots, the 440x280 small promo tile, and the 1400x560 marquee.
//
// Screenshots are taken on the live, public GitHub CLI docs
// (github.com/cli/cli/tree/trunk/docs) with the extension's own scripts
// injected the same way background.js injects them, so they show exactly
// what users get. Needs network access and installed Chrome.
// Run: node scripts/store-assets.mjs   (or npm run store-assets)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "store");
const DOC_URL = "https://github.com/cli/cli/blob/trunk/docs/install_linux.md";
const NAME = JSON.parse(readFileSync(join(ROOT, "manifest.json"), "utf8")).name;

const background = readFileSync(join(ROOT, "src/background.js"), "utf8");
const CSS_FILE = background.match(/CSS_FILE = "([^"]+)"/)[1];
const SCRIPT_FILES = [...background.matchAll(/^\s+"(src\/[^"]+\.js)",?$/gm)].map((m) => m[1]);
const LIBS = SCRIPT_FILES.filter((f) => !f.endsWith("/main.js"));

const icon = `data:image/png;base64,${readFileSync(join(ROOT, "icons/icon128.png")).toString("base64")}`;

const BASE_CSS = `
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
    background: linear-gradient(135deg, #1d3b5a 0%, #0f1f30 100%);
    color: #f0f6fc; overflow: hidden;
  }
`;

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

try {
  // 1. The panel over a dark-mode GitHub page.
  const panelShot = await capture({ colorScheme: "dark", width: 1280, height: 800 }, async (page) => {
    await inject(page, SCRIPT_FILES);
    await page.locator(".ghp-panel-host .panel").getByText(/Print all \d+ Markdown files/).waitFor();
  });

  // 2. The printed result: just the document, light, with a header.
  const paperShot = await capture(
    { colorScheme: "dark", width: 700, height: 1000, print: true },
    async (page) => {
      await inject(page, LIBS);
      await page.evaluate(async () => {
        await GHP.prepare({
          root: GHP.github.findContent(),
          info: GHP.github.pageInfo(),
          options: GHP_DEFAULTS,
        });
      });
    }
  );

  // 3. A whole folder printed as one document: the contents page.
  const folderShot = await capture(
    { colorScheme: "light", width: 700, height: 1000, print: true },
    async (page) => {
      await inject(page, LIBS);
      await page.evaluate(async () => {
        const info = GHP.github.pageInfo();
        const listing = await GHP.github.listMarkdown(info);
        const bundle = await GHP.bundle.build(info, listing);
        await GHP.prepare({ root: GHP.github.findContent(), bundle, listing, info, options: GHP_DEFAULTS });
      });
    }
  );

  await render("screenshot-1-panel.jpg", 1280, 800, slide({
    title: "Print any GitHub doc in one click",
    text: "Button, Alt+Shift+P, or right-click. Pick options, then print or Save as PDF.",
    image: panelShot,
    layout: "wide",
  }));
  await render("screenshot-2-clean.jpg", 1280, 800, slide({
    title: "Just the document, always light",
    text: "No GitHub header, sidebars, or file tree. Dark mode prints in light colors. Long code lines wrap, tables fit, and a header shows the title, repository, and URL.",
    image: paperShot,
    layout: "paper",
  }));
  await render("screenshot-3-folder.jpg", 1280, 800, slide({
    title: "Print a whole folder as one PDF",
    text: "Every Markdown file in the folder, README first, with a contents page. Works in private repositories too.",
    image: folderShot,
    layout: "paper",
  }));
  await render("promo-small-440x280.jpg", 440, 280, promo({ small: true }));
  await render("promo-marquee-1400x560.jpg", 1400, 560, promo({ small: false }));
} finally {
  await browser.close();
}

// Opens DOC_URL, runs `act`, and returns a PNG data URL of the viewport.
async function capture({ colorScheme, width, height, print = false }, act) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme,
    bypassCSP: true, // the scripts are added as page scripts, like the tests do
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    // Stand-ins for extension APIs the content scripts touch.
    window.chrome = window.chrome || {};
    window.chrome.storage = { sync: { get: async (d) => ({ ...d }), set: async () => {} } };
    window.print = () => {};
  });
  await page.goto(DOC_URL, { waitUntil: "load" });
  await page.locator("article.markdown-body").first().waitFor();
  if (print) await page.emulateMedia({ media: "print", colorScheme });
  await act(page);
  await page.waitForTimeout(500);
  const png = await page.screenshot();
  await context.close();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function inject(page, files) {
  await page.addStyleTag({ path: join(ROOT, CSS_FILE) });
  for (const file of files) await page.addScriptTag({ path: join(ROOT, file) });
}

async function render(name, width, height, html) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: "load" });
  // JPEG: the store wants JPEG or 24-bit PNG without alpha.
  writeFileSync(join(OUT, name), await page.screenshot({ type: "jpeg", quality: 92 }));
  await context.close();
  console.log(`✓ store/${name}`);
}

function slide({ title, text, image, layout }) {
  if (layout === "wide") {
    return `<!doctype html><style>${BASE_CSS}
      .wrap { padding: 40px 56px 0; height: 100%; display: flex; flex-direction: column; }
      h1 { margin: 0 0 8px; font-size: 38px; font-weight: 650; letter-spacing: -0.5px; }
      p { margin: 0 0 28px; font-size: 20px; color: #c9d1d9; }
      .shot { flex: 1; overflow: hidden; border-radius: 12px 12px 0 0; box-shadow: 0 12px 40px rgba(0,0,0,.5); border: 1px solid #3d444d; border-bottom: 0; }
      .shot img { width: 100%; display: block; }
    </style><div class="wrap"><h1>${title}</h1><p>${text}</p><div class="shot"><img src="${image}"></div></div>`;
  }
  return `<!doctype html><style>${BASE_CSS}
    .wrap { display: grid; grid-template-columns: 1fr 620px; gap: 56px; height: 100%; padding: 0 64px; }
    .copy { align-self: center; }
    .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; font-size: 18px; color: #c9d1d9; }
    .logo img { width: 40px; height: 40px; }
    h1 { margin: 0 0 16px; font-size: 40px; line-height: 1.15; font-weight: 650; letter-spacing: -0.5px; }
    p { margin: 0; font-size: 20px; line-height: 1.5; color: #c9d1d9; }
    /* Padding stands in for the printed page margins. */
    .paper { margin-top: 48px; padding: 44px 48px 0; background: #fff; border-radius: 4px 4px 0 0; box-shadow: 0 16px 48px rgba(0,0,0,.55); overflow: hidden; }
    .paper img { width: 100%; display: block; }
  </style><div class="wrap">
    <div class="copy"><div class="logo"><img src="${icon}">${NAME}</div><h1>${title}</h1><p>${text}</p></div>
    <div class="paper"><img src="${image}"></div>
  </div>`;
}

function promo({ small }) {
  const s = small ? 1 : 2.2;
  return `<!doctype html><style>${BASE_CSS}
    body { display: flex; align-items: center; justify-content: center; gap: ${20 * s}px; padding: ${24 * s}px; }
    img { width: ${96 * s}px; height: ${96 * s}px; flex: none; }
    h1 { margin: 0 0 ${6 * s}px; font-size: ${30 * s}px; line-height: 1.1; font-weight: 700; letter-spacing: -0.5px; }
    p { margin: 0; font-size: ${15 * s}px; line-height: 1.35; color: #c9d1d9; max-width: ${250 * s}px; }
  </style><img src="${icon}"><div><h1>${NAME}</h1><p>Clean prints and PDFs of READMEs, Markdown docs, and wikis.</p></div>`;
}
