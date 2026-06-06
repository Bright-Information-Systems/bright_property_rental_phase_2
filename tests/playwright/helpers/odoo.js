// @ts-check
const fs = require("fs");
const path = require("path");

const ODOO_URL = process.env.ODOO_URL ?? "http://127.0.0.1:9020";
const ODOO_DB = process.env.ODOO_DB ?? "qatar_property_industry_uat";
const ODOO_LOGIN = process.env.ODOO_LOGIN ?? "admin";
const ODOO_PASSWORD = process.env.ODOO_PASSWORD ?? "";

const SCREENSHOTS_DIR = path.resolve(
  __dirname,
  "../../../docs/screenshots/industry_real_estate_uat"
);

const RECORDS_FILE = path.resolve(__dirname, "../.industry_uat_records.json");

async function waitOdooBackendReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector(".o_web_client, .o_action_manager", { timeout: 90000 });
  await page.waitForTimeout(800);
}

async function odooLogin(page) {
  if (!ODOO_PASSWORD) throw new Error("Set ODOO_PASSWORD before running UAT tests.");
  await page.goto(`${ODOO_URL}/web/login`);
  await page.waitForLoadState("domcontentloaded");
  const dbLink = page.locator(`a[href*="db=${ODOO_DB}"], a:has-text("${ODOO_DB}")`);
  if (await dbLink.count()) {
    await dbLink.first().click();
    await page.waitForLoadState("domcontentloaded");
  }
  const dbSelect = page.locator('select[name="db"], #db');
  if (await dbSelect.count()) await dbSelect.selectOption(ODOO_DB);
  await page.locator('input[name="login"]').fill(ODOO_LOGIN);
  await page.locator('input[name="password"]').fill(ODOO_PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/\/(web|odoo)(?!\/login)/, { timeout: 90000 });
  await waitOdooBackendReady(page);
}

function screenshotPath(filename) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  return path.join(SCREENSHOTS_DIR, filename);
}

async function captureScreenshot(page, filename) {
  const target = screenshotPath(filename);
  await page.screenshot({ path: target, fullPage: true });
  return target;
}

async function jsonRpc(service, method, args) {
  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "call", params: { service, method, args }, id: Date.now() }),
  });
  const payload = await response.json();
  if (payload.error) {
    throw new Error(`JSON-RPC error: ${JSON.stringify(payload.error.data ?? payload.error)}`);
  }
  return payload.result;
}

let cachedUid = null;
async function getUid() {
  if (!ODOO_PASSWORD) throw new Error("Set ODOO_PASSWORD for JSON-RPC.");
  if (cachedUid) return cachedUid;
  cachedUid = await jsonRpc("common", "authenticate", [ODOO_DB, ODOO_LOGIN, ODOO_PASSWORD, {}]);
  return cachedUid;
}

async function executeKw(model, method, args = [], kwargs = {}) {
  const uid = await getUid();
  return jsonRpc("object", "execute_kw", [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs]);
}

function saveRecords(patch) {
  let existing = {};
  if (fs.existsSync(RECORDS_FILE)) {
    existing = JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
  }
  const merged = { ...existing, ...patch, updated_at: new Date().toISOString() };
  fs.writeFileSync(RECORDS_FILE, JSON.stringify(merged, null, 2));
  return merged;
}

function loadRecords() {
  if (!fs.existsSync(RECORDS_FILE)) return {};
  return JSON.parse(fs.readFileSync(RECORDS_FILE, "utf8"));
}

async function openAction(page, actionId) {
  await page.goto(`${ODOO_URL}/odoo/action-${actionId}`);
  await waitOdooBackendReady(page);
}

async function openRecord(page, model, recordId) {
  await page.goto(`${ODOO_URL}/odoo/${model}/${recordId}`);
  await waitOdooBackendReady(page);
}

module.exports = {
  ODOO_URL,
  ODOO_DB,
  SCREENSHOTS_DIR,
  RECORDS_FILE,
  waitOdooBackendReady,
  odooLogin,
  captureScreenshot,
  executeKw,
  saveRecords,
  loadRecords,
  openAction,
  openRecord,
};
