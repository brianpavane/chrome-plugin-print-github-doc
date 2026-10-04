import { defineConfig } from "@playwright/test";

// Uses your installed Google Chrome (channel "chrome"), so no separate
// browser download is needed. Tests run offline: every github.com request
// is answered from test/fixtures.
export default defineConfig({
  testDir: "test",
  timeout: 30000,
  fullyParallel: true,
  reporter: "list",
  use: {
    ...(process.env.PLAYWRIGHT_BROWSER === "chromium" ? {} : { channel: process.env.PLAYWRIGHT_CHANNEL || "chrome" }),
    headless: true,
  },
});
