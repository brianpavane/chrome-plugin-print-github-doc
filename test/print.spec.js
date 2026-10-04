import { test, expect } from "@playwright/test";
import { openPage, trigger, waitForPrint, panel, leftovers, NO_DOC_URL } from "./helpers.js";

const NO_PANEL = { showPanel: false };
const WHITE = "rgb(255, 255, 255)";
const LIGHT_TEXT = "rgb(31, 35, 40)";

test.describe("single document", () => {
  test("prints only the document, in light mode, with a header", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    await page.emulateMedia({ media: "print", colorScheme: "dark" });
    await trigger(page);
    const snap = await waitForPrint(page);

    expect(snap.colorMode).toBe("light");
    expect(snap.bodyBg).toBe(WHITE);
    expect(snap.textColor).toBe(LIGHT_TEXT);
    expect(snap.visible).toMatchObject({
      siteHeader: false,
      sidebar: false,
      toolbar: false,
      footer: false,
      article: true,
    });
    expect(snap.printHeaderShown).toBe(true);
    expect(snap.printHeader).toContain("Getting started");
    expect(snap.printHeader).toContain("Repository: test-owner/test-repo");
    expect(snap.printHeader).toContain("File: docs/2-two.md");
    expect(snap.printHeader).toContain("URL: https://github.com/test-owner/test-repo/blob/main/docs/2-two.md");
  });

  test("sets a short PDF file name and restores the title", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    const before = await page.title();
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(snap.title).toBe("test-repo - 2-two");
    expect((await leftovers(page)).title).toBe(before);
  });

  test("expands collapsed sections, then collapses them again", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(snap.detailsOpen).toEqual([true, true]);
    expect((await leftovers(page)).detailsOpen).toEqual([false, true]);
  });

  test("uses the light variant of <picture> images when the OS is dark", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    await page.emulateMedia({ media: "print", colorScheme: "dark" });
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(decodeURIComponent(snap.pictureSrc)).toContain("<title>light</title>");
  });

  test("inverts diagrams that GitHub rendered dark", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(snap.inverted).toBe(1);
  });

  test("does not print link URLs by default", async ({ page }) => {
    await openPage(page, { stored: NO_PANEL });
    await trigger(page);
    expect((await waitForPrint(page)).linkUrls).toEqual([]);
  });

  test("prints link URLs when enabled, skipping anchors and bare URLs", async ({ page }) => {
    await openPage(page, { stored: { ...NO_PANEL, printLinkUrls: true } });
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(snap.linkUrls).toEqual([
      '" (https://example.com/page)"',
      '" (https://github.com/test-owner/test-repo/blob/main/docs/10-ten.md)"',
    ]);
  });

  test("can omit the header", async ({ page }) => {
    await openPage(page, { stored: { ...NO_PANEL, includeHeader: false } });
    await trigger(page);
    expect((await waitForPrint(page)).printHeader).toBeNull();
  });

  test("starts each top-level section on a new page when enabled", async ({ page }) => {
    await openPage(page, { stored: { ...NO_PANEL, sectionPageBreaks: true } });
    await trigger(page);
    const snap = await waitForPrint(page);
    expect(snap.breaks).toBe(2); // three h2 sections; the first stays with the title
    expect(snap.breakStyle).toBe("page");
  });

  test("leaves the page exactly as it was", async ({ page }) => {
    await openPage(page, { stored: { ...NO_PANEL, printLinkUrls: true, sectionPageBreaks: true } });
    const before = await leftovers(page);
    await trigger(page);
    await waitForPrint(page);
    expect(await leftovers(page)).toEqual(before);
    expect(before.colorMode).toBe("dark");
  });
});

test.describe("options panel", () => {
  test("shows settings and the folder option, then prints", async ({ page }) => {
    await openPage(page);
    await trigger(page);
    await expect(panel(page)).toBeVisible();
    await expect(panel(page)).toContainText("Print all 3 Markdown files in docs/ as one document");
    await expect(panel(page).getByRole("button", { name: "Print", exact: true })).toBeVisible();

    await panel(page).getByText("Include header").click(); // turn off for this print
    await panel(page).getByRole("button", { name: "Print", exact: true }).click();
    const snap = await waitForPrint(page);
    expect(snap.panel).toBe(false);
    expect(snap.printHeader).toBeNull();
    expect(await page.evaluate(() => window.__saved)).toBeNull(); // not remembered
  });

  test("remembers settings when asked", async ({ page }) => {
    await openPage(page);
    await trigger(page);
    await panel(page).getByText("Print link URLs").click();
    await panel(page).getByText("Remember these settings").click();
    await panel(page).getByRole("button", { name: "Print", exact: true }).click();
    await waitForPrint(page);
    expect(await page.evaluate(() => window.__saved)).toMatchObject({ printLinkUrls: true });
  });

  test("Escape cancels without printing or changing the page", async ({ page }) => {
    await openPage(page);
    const before = await leftovers(page);
    await trigger(page);
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel(page)).toHaveCount(0);
    expect(await page.evaluate(() => window.__prints.length)).toBe(0);
    expect(await leftovers(page)).toEqual(before);
  });

  test("pressing the shortcut again while the panel is open prints", async ({ page }) => {
    await openPage(page);
    await trigger(page);
    await expect(panel(page)).toBeVisible();
    await trigger(page);
    expect((await waitForPrint(page)).colorMode).toBe("light");
  });
});

test.describe("folder printing", () => {
  test("prints every Markdown file in the folder, README first, in natural order", async ({ page }) => {
    await openPage(page);
    await trigger(page);
    await panel(page).getByText("Print all 3 Markdown files").click();
    await expect(panel(page).getByRole("button", { name: "Print folder" })).toBeVisible();
    await panel(page).getByRole("button", { name: "Print folder" }).click();
    const snap = await waitForPrint(page);

    expect(snap.title).toBe("test-repo - docs");
    expect(snap.visible.bundle).toBe(true);
    expect(snap.visible.article).toBe(false); // the page's own copy is hidden
    expect(snap.visible.sidebar).toBe(false);
    expect(snap.bundleContents).toEqual([
      "Docs index (README.md)",
      "Getting started (2-two.md)",
      "Advanced (10-ten.md)",
    ]);
    expect(snap.bundleDocs.map((d) => d.split("https://")[0])).toEqual([
      "docs/README.md",
      "docs/2-two.md",
      "docs/10-ten.md",
    ]);
    expect(snap.printHeader).toContain("Folder: docs");
    expect(snap.printHeader).toContain("Branch: main");
    expect(snap.printHeader).toContain("URL: https://github.com/test-owner/test-repo/tree/main/docs");
    // GitHub's script isn't on the test page, so the diagram falls back to source.
    expect(snap.mermaidSourceShown).toBe(true);

    expect((await leftovers(page)).elements).toBe(0);
  });

  test("shows an error and doesn't print if a file can't be loaded", async ({ page }) => {
    await openPage(page);
    await page.route("**/blob/main/docs/10-ten.md", (route) =>
      route.fulfill({ status: 500, body: "boom" })
    );
    await trigger(page);
    await panel(page).getByText("Print all 3 Markdown files").click();
    await panel(page).getByRole("button", { name: "Print folder" }).click();
    await expect(panel(page)).toContainText("Couldn't load the folder");
    expect(await page.evaluate(() => window.__prints.length)).toBe(0);
    await panel(page).getByRole("button", { name: "Cancel" }).click();
    await expect(panel(page)).toHaveCount(0);
  });
});

test.describe("folder printing safety", () => {
  test("strips scripts and event handlers from fetched documents", async ({ page }) => {
    await openPage(page);
    const evil =
      `<article class="markdown-body"><h1>Evil</h1>` +
      `<img src="https://github.com/x.png" onerror="window.__pwned = 1">` +
      `<script>window.__pwned = 2</script>` +
      `<iframe srcdoc="<script>parent.__pwned = 3</script>"></iframe>` +
      `<a href=" javascript:window.__pwned = 4">click</a>` +
      `<p onclick="window.__pwned = 5">text</p></article>`;
    await page.route("**/blob/main/docs/2-two.md", (route) =>
      (route.request().headers().accept || "").includes("application/json")
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ payload: { codeViewBlobRoute: { richText: evil } } }),
          })
        : route.fallback()
    );
    await trigger(page);
    await panel(page).getByText("Print all 3 Markdown files").click();
    await panel(page).getByRole("button", { name: "Print folder" }).click();
    const snap = await waitForPrint(page);
    expect(snap.unsafeInBundle).toBe(0);
    expect(snap.bundleImages).toBe(1); // the image itself is kept
    expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
  });

  test("ignores entries whose paths leave the folder", async ({ page }) => {
    await openPage(page);
    await page.route("**/tree/main/docs", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payload: {
            codeViewTreeRoute: {
              path: "docs",
              refInfo: { name: "main" },
              tree: {
                items: [
                  { name: "README.md", path: "docs/README.md", contentType: "file" },
                  { name: "2-two.md", path: "docs/2-two.md", contentType: "file" },
                  { name: "x.md", path: "docs/../../../other/x.md", contentType: "file" },
                  { name: "../y.md", path: "docs/y.md", contentType: "file" },
                ],
              },
            },
          },
        }),
      })
    );
    await trigger(page);
    await expect(panel(page)).toContainText("Print all 2 Markdown files");
  });

  test("refuses folders with too many files", async ({ page }) => {
    await openPage(page);
    const items = Array.from({ length: 101 }, (_, i) => ({
      name: `${i}.md`,
      path: `docs/${i}.md`,
      contentType: "file",
    }));
    await page.route("**/tree/main/docs", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          payload: { codeViewTreeRoute: { path: "docs", refInfo: { name: "main" }, tree: { items } } },
        }),
      })
    );
    await trigger(page);
    await expect(panel(page)).toContainText("folder printing is limited to 100");
    await expect(panel(page).getByRole("button", { name: "Print" })).toBeVisible();
  });
});

test.describe("no document on the page", () => {
  test("offers to print the whole page in light mode", async ({ page }) => {
    await openPage(page, { url: NO_DOC_URL, fixture: "no-doc.html" });
    await trigger(page);
    await expect(panel(page)).toContainText("No rendered document was found");
    await panel(page).getByRole("button", { name: "Print whole page" }).click();
    const snap = await waitForPrint(page);
    expect(snap.colorMode).toBe("light");
    expect(snap.bodyBg).toBe(WHITE);
    expect(snap.visible.siteHeader).toBe(true);
    expect(snap.visible.issueList).toBe(true);
    expect((await leftovers(page)).colorMode).toBe("dark");
  });

  test("asks with a confirm dialog when the panel is turned off", async ({ page }) => {
    await openPage(page, { url: NO_DOC_URL, fixture: "no-doc.html", stored: NO_PANEL });
    page.once("dialog", (d) => d.accept());
    await trigger(page);
    expect((await waitForPrint(page)).colorMode).toBe("light");
  });
});
