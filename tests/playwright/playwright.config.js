// @ts-check
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 180000,
  expect: { timeout: 30000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.ODOO_URL ?? "http://127.0.0.1:9020",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    screenshot: "off",
    trace: "off",
    viewport: { width: 1600, height: 1000 },
  },
});
