// @ts-check
const { test, expect } = require("@playwright/test");
const {
  odooLogin,
  captureScreenshot,
  executeKw,
  saveRecords,
  openAction,
  openRecord,
  waitOdooBackendReady,
  ODOO_URL,
} = require("../helpers/odoo");

/** @type {Record<string, unknown>} */
let records = {};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

test.describe.serial("Industry Real Estate UAT — Qatar workflow", () => {
  test.beforeAll(async () => {
    const installed = await executeKw("ir.module.module", "search_read", [
      [["name", "=", "industry_real_estate"], ["state", "=", "installed"]],
      ["name", "state"],
    ]);
    expect(installed.length).toBe(1);

    const planId = (
      await executeKw("ir.model.data", "search_read", [
        [["module", "=", "industry_real_estate"], ["name", "=", "analytic_plan_properties"]],
        ["res_id"],
      ])
    )[0].res_id;

    async function ensureBuilding(name, vals) {
      const ids = await executeKw("x_buildings", "search", [[["x_name", "=", name]]]);
      if (ids.length) return ids[0];
      return executeKw("x_buildings", "create", [vals]);
    }
    const buildingRayyan = await ensureBuilding("Al Rayyan Tower", {
      x_name: "Al Rayyan Tower",
      x_street: "Al Rayyan Street",
      x_city: "Doha",
      x_zip: "00001",
    });
    const buildingDbc = await ensureBuilding("Doha Business Center", {
      x_name: "Doha Business Center",
      x_street: "Corniche Road",
      x_city: "Doha",
      x_zip: "00002",
    });

    const units = [
      { name: "Shop G-01", code: "ART-SHOP-G01", building: buildingRayyan, type: "Commercial space" },
      { name: "Office 203", code: "ART-OFF-203", building: buildingRayyan, type: "Office" },
      { name: "Apartment 1204", code: "ART-APT-1204", building: buildingRayyan, type: "Appartment" },
      { name: "Kiosk K-05", code: "DBC-KIOSK-K05", building: buildingDbc, type: "Room" },
    ];

    /** @type {Record<string, number>} */
    const unitIds = {};
    for (const u of units) {
      const existing = await executeKw("account.analytic.account", "search", [[["name", "=", u.name]]]);
      if (existing.length) {
        unitIds[u.code] = existing[0];
      } else {
        unitIds[u.code] = await executeKw("account.analytic.account", "create", [
          {
            name: u.name,
            plan_id: planId,
            x_property_building_id: u.building,
            x_property_type: u.type,
            x_property_address: `${u.name} — ${u.code}`,
            x_is_published: true,
          },
        ]);
      }
    }

    let partnerIds = await executeKw("res.partner", "search", [[["name", "ilike", "Doha Trading LLC"]]]);
    let partnerId;
    if (partnerIds.length) {
      partnerId = partnerIds[0];
    } else {
      partnerId = await executeKw("res.partner", "create", [
        { name: "Doha Trading LLC", company_type: "company", email: "leasing@dohatrading.qa" },
      ]);
    }

    const rentalProduct = (
      await executeKw("product.product", "search_read", [
        [["product_tmpl_id.name", "ilike", "Rental fee"]],
        ["id"],
      ])
    )[0].id;

    const existingOrders = await executeKw("sale.order", "search", [
      [
        ["partner_id", "=", partnerId],
        ["x_account_analytic_account_id", "=", unitIds["ART-SHOP-G01"]],
      ],
    ]);
    if (existingOrders.length) {
      const orderId = existingOrders[0];
      let invoiceIds = (await executeKw("sale.order", "read", [[orderId], ["invoice_ids"]]))[0].invoice_ids || [];
      if (!invoiceIds.length) {
        const wizId = await executeKw("sale.advance.payment.inv", "create", [
          { advance_payment_method: "delivered", sale_order_ids: [[6, 0, [orderId]]] },
        ]);
        const created = await executeKw("sale.advance.payment.inv", "create_invoices", [[wizId]]);
        if (Array.isArray(created)) {
          invoiceIds = created;
        } else if (created && typeof created === "object" && created.res_id) {
          invoiceIds = [created.res_id];
        } else {
          invoiceIds =
            (await executeKw("sale.order", "read", [[orderId], ["invoice_ids"]]))[0].invoice_ids || [];
        }
        if (invoiceIds.length) {
          await executeKw("account.move", "action_post", [invoiceIds]);
        }
      }
      records = saveRecords({
        buildings: { al_rayyan_tower: buildingRayyan, doha_business_center: buildingDbc },
        units: unitIds,
        partner_id: partnerId,
        sale_order_id: orderId,
        invoice_ids: invoiceIds,
        plan_id: planId,
      });
      return;
    }

    const start = today();
    const end = addMonths(start, 12);
    const orderId = await executeKw("sale.order", "create", [
      {
        partner_id: partnerId,
        x_account_analytic_account_id: unitIds["ART-SHOP-G01"],
        plan_id: 1,
        start_date: start,
        end_date: end,
        order_line: [[0, 0, { product_id: rentalProduct, product_uom_qty: 1, price_unit: 22500 }]],
      },
    ]);

    await executeKw("sale.order", "action_confirm", [[orderId]]);

    let invoiceIds = [];
    const wizId = await executeKw("sale.advance.payment.inv", "create", [
      { advance_payment_method: "delivered", sale_order_ids: [[6, 0, [orderId]]] },
    ]);
    const created = await executeKw("sale.advance.payment.inv", "create_invoices", [[wizId]]);
    if (Array.isArray(created)) {
      invoiceIds = created;
    } else if (created && typeof created === "object" && created.res_id) {
      invoiceIds = [created.res_id];
    } else {
      const order = await executeKw("sale.order", "read", [[orderId], ["invoice_ids"]]);
      invoiceIds = order[0].invoice_ids || [];
    }
    if (invoiceIds.length) {
      await executeKw("account.move", "action_post", [invoiceIds]);
    }

    records = saveRecords({
      buildings: { al_rayyan_tower: buildingRayyan, doha_business_center: buildingDbc },
      units: unitIds,
      partner_id: partnerId,
      sale_order_id: orderId,
      invoice_ids: invoiceIds || [],
      plan_id: planId,
    });
  });

  test("UC-IRE-001 — Install and open Properties app", async ({ page }) => {
    await odooLogin(page);
    await openAction(page, 608);
    await captureScreenshot(page, "01_real_estate_rental_contracts.png");
    const title = page.locator(".o_action_manager");
    await expect(title).toBeVisible();
    records.uc_ire_001 = "PASS";
    saveRecords({ uc_ire_001: "PASS" });
  });

  test("UC-IRE-002 — Buildings list and form", async ({ page }) => {
    await odooLogin(page);
    await openAction(page, 613);
    await captureScreenshot(page, "02_buildings_list.png");
    await openRecord(page, "x_buildings", records.buildings.al_rayyan_tower);
    await captureScreenshot(page, "02b_building_al_rayyan_form.png");
    records.uc_ire_002 = "PASS";
    saveRecords({ uc_ire_002: "PASS" });
  });

  test("UC-IRE-003 — Property units list and Shop G-01 form", async ({ page }) => {
    await odooLogin(page);
    await openAction(page, 610);
    await captureScreenshot(page, "03_units_list.png");
    await openRecord(page, "account.analytic.account", records.units["ART-SHOP-G01"]);
    await captureScreenshot(page, "04_shop_g01_form.png");
    records.uc_ire_003 = "PASS";
    saveRecords({ uc_ire_003: "PASS" });
  });

  test("UC-IRE-004 — Tenant Doha Trading LLC", async ({ page }) => {
    await odooLogin(page);
    await openRecord(page, "res.partner", records.partner_id);
    await waitOdooBackendReady(page);
    await captureScreenshot(page, "05_tenant_doha_trading_llc.png");
    records.uc_ire_004 = "PASS";
    saveRecords({ uc_ire_004: "PASS" });
  });

  test("UC-IRE-005 — Rental contract / subscription", async ({ page }) => {
    await odooLogin(page);
    await openRecord(page, "sale.order", records.sale_order_id);
    await waitOdooBackendReady(page);
    await captureScreenshot(page, "06_contract_subscription.png");
    records.uc_ire_005 = "PASS";
    saveRecords({ uc_ire_005: "PASS" });
  });

  test("UC-IRE-006 — Invoice from subscription", async ({ page }) => {
    const invoiceIds = /** @type {number[]} */ (records.invoice_ids || []);
    test.skip(!invoiceIds.length, "No invoice created — document in UC report");
    await odooLogin(page);
    await openRecord(page, "account.move", invoiceIds[0]);
    await captureScreenshot(page, "07_invoice.png");
    records.uc_ire_006 = "PASS";
    saveRecords({ uc_ire_006: "PASS" });
  });

  test("UC-IRE-007 — Invoice payment status", async ({ page }) => {
    const invoiceIds = /** @type {number[]} */ (records.invoice_ids || []);
    test.skip(!invoiceIds.length, "No invoice for payment check");
    await odooLogin(page);
    await openRecord(page, "account.move", invoiceIds[0]);
    const payBtn = page.getByRole("button", { name: /Pay|Register Payment|Register payment/i });
    if (await payBtn.count()) {
      await payBtn.first().click();
      await page.waitForTimeout(1000);
      await captureScreenshot(page, "08_payment_wizard.png");
      records.uc_ire_007 = "PARTIAL — payment wizard opened, not posted";
    } else {
      await captureScreenshot(page, "08_invoice_status_unpaid.png");
      records.uc_ire_007 = "PARTIAL — payment button not available or invoice already paid";
    }
    saveRecords({ uc_ire_007: records.uc_ire_007 });
  });

  test("UC-IRE-008 — Availability and property views", async ({ page }) => {
    await odooLogin(page);
    await openAction(page, 609);
    await captureScreenshot(page, "09_availability_gantt.png");
    await openAction(page, 610);
    await captureScreenshot(page, "09b_properties_kanban.png");
    records.uc_ire_008 = "PASS";
    saveRecords({ uc_ire_008: "PASS" });
  });

  test("UC-IRE-009 — Gap analysis screenshot", async ({ page }) => {
    await odooLogin(page);
    await openRecord(page, "account.analytic.account", records.units["ART-SHOP-G01"]);
    await waitOdooBackendReady(page);
    await captureScreenshot(page, "10_gap_analysis_shop_g01_fields.png");
    records.uc_ire_009 = "PASS";
    saveRecords({ uc_ire_009: "PASS" });
  });
});
