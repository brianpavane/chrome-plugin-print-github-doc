import { test, expect, chromium } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const runExtensionTest = process.env.GHP_EXTENSION_TEST === "1" ? test : test.skip;

runExtensionTest("loads the real extension service worker and manifest", async () => {
  const profile = mkdtempSync(join(tmpdir(), "ghp-extension-test-"));
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [`--disable-extensions-except=${ROOT}`, `--load-extension=${ROOT}`],
  });
  try {
    const worker =
      context.serviceWorkers()[0] || (await context.waitForEvent("serviceworker", { timeout: 10000 }));
    const state = await worker.evaluate(async () => {
      const manifest = chrome.runtime.getManifest();
      const rules = await new Promise((resolve) =>
        chrome.declarativeContent.onPageChanged.getRules(undefined, resolve)
      );
      return {
        manifestVersion: manifest.manifest_version,
        worker: manifest.background.service_worker,
        permissions: manifest.permissions,
        command: manifest.commands._execute_action.suggested_key.default,
        ruleCount: rules.length,
      };
    });
    expect(state).toMatchObject({
      manifestVersion: 3,
      worker: "src/background.js",
      command: "Alt+Shift+P",
      ruleCount: 1,
    });
    expect(state.permissions).toContain("activeTab");
  } finally {
    await context.close();
    rmSync(profile, { recursive: true, force: true });
  }
});
