# Industry Real Estate — UAT Use Cases

**Bright Information Systems W.L.L** · Qatar Property Phase 2  
**Module:** Odoo official `industry_real_estate` v19.0.1.3  
**UAT date:** 6 June 2026  
**Branch:** `feature/industry-real-estate-workflow-uat`

---

## Business objective

Validate the **official Odoo Property Management (`industry_real_estate`)** workflow as the foundation for Qatar Property Phase 2 **before** any `qatar_property_base` custom module is written. Evidence is captured via Playwright automation and screenshots.

Client approval for the Phase 1.5 architecture pivot (Option B — `industry_real_estate`) is recorded as **granted**.

---

## Test environment

| Item | Value |
|------|--------|
| **Sandbox DB** | `qatar_property_industry_uat` (isolated — Phase 1 UAT DB **not** touched) |
| **URL / port** | http://127.0.0.1:9020 |
| **Odoo** | 19 Enterprise |
| **Module installed** | `industry_real_estate` (`-i industry_real_estate --without-demo=all`) |
| **Module path (local)** | `projects/qatar_property_phase2/industry_real_estate-19.0.1.3` (gitignored OEEL) |
| **Config** | `config/projects/qatar_property_industry_uat.conf` (workspace root) |
| **Login** | `admin` |
| **Automation** | `tests/playwright/tests/industry_real_estate_uat.spec.js` |
| **Run script** | `tests/playwright/run_industry_uat.sh` |

---

## Test data

| Entity | Record | Model | ID |
|--------|--------|-------|-----|
| Building | Al Rayyan Tower | `x_buildings` | 1 |
| Building | Doha Business Center | `x_buildings` | 2 |
| Unit | Shop G-01 (ART-SHOP-G01) | `account.analytic.account` | 1 |
| Unit | Office 203 (ART-OFF-203) | `account.analytic.account` | 2 |
| Unit | Apartment 1204 (ART-APT-1204) | `account.analytic.account` | 3 |
| Unit | Kiosk K-05 (DBC-KIOSK-K05) | `account.analytic.account` | 4 |
| Tenant | Doha Trading LLC | `res.partner` | 9 |
| Rental contract | S00001 (subscription, Shop G-01) | `sale.order` | 1 |
| Invoice | INV/2026/00001 | `account.move` | 1 |

**Subscription terms:** Monthly plan, 22,500 QAR/month, 06/06/2026 → 06/06/2027, product *Rental fee*.

---

## Summary

| UC | Title | Status |
|----|-------|--------|
| UC-IRE-001 | Install and open Real Estate app | **PASS** |
| UC-IRE-002 | Create or verify building | **PASS** |
| UC-IRE-003 | Create or verify 4 property units | **PASS** |
| UC-IRE-004 | Create tenant/customer | **PASS** |
| UC-IRE-005 | Quotation / contract / subscription flow | **PASS** |
| UC-IRE-006 | Generate invoice | **PASS** |
| UC-IRE-007 | Register payment | **PARTIAL** |
| UC-IRE-008 | Property register / report check | **PASS** |
| UC-IRE-009 | Gap analysis for Qatar Phase 2 | **PASS** |

**Overall:** 8 PASS · 1 PARTIAL · 0 FAIL

---

## UC-IRE-001 — Install and open Real Estate app

**Objective:** Confirm `industry_real_estate` is installed and open the Properties app main view.

**Steps:**
1. JSON-RPC: verify `ir.module.module` state = `installed` for `industry_real_estate`.
2. Log in to sandbox.
3. Open action **Rental Contracts** (Properties root menu).

**Expected:** Properties app loads; Rental Contracts kanban/list visible.

**Actual:** Module installed (136 dependent modules). App menu **Properties** with sub-menus Rental Contracts, Availability, Properties, Configuration. Default landing = Rental Contracts (`sale.order` filtered by property).

**Screenshot:** [01_real_estate_rental_contracts.png](screenshots/industry_real_estate_uat/01_real_estate_rental_contracts.png)

**Status:** PASS

**Notes:** App name in UI is **Properties** (not “Real Estate”). Does not use `sale_renting`.

---

## UC-IRE-002 — Create or verify building

**Objective:** Create/verify **Al Rayyan Tower** and **Doha Business Center**; capture building views.

**Steps:**
1. RPC create/verify `x_buildings` records.
2. Open **Properties → Properties → Buildings** (action 613).
3. Open Al Rayyan Tower form.

**Expected:** Two buildings in kanban; form shows address fields.

**Actual:** Buildings stored in model `x_buildings`. UI view mode = **kanban, form** (no list). Fields: Name, Street, City, ZIP, Country, State.

**Screenshots:**
- [02_buildings_list.png](screenshots/industry_real_estate_uat/02_buildings_list.png) — kanban
- [02b_building_al_rayyan_form.png](screenshots/industry_real_estate_uat/02b_building_al_rayyan_form.png) — form

**Status:** PASS

**Notes:** Duplicate building records exist from earlier sandbox runs (IDs 3–4); UAT uses IDs 1–2. Qatar Phase 2 may need deduplication rules.

---

## UC-IRE-003 — Create or verify 4 property units

**Objective:** Map Shop G-01, Office 203, Apartment 1204, Kiosk K-05 to the official industry property model.

**Steps:**
1. RPC create/verify units on **Properties** analytic plan (`plan_id` = Properties).
2. Open **Properties → Properties → Properties** (action 610).
3. Open Shop G-01 form.

**Expected:** Four units with building, type, and property flag.

**Actual:**

| Unit | Building | Type (`x_property_type`) | `x_is_property` | Address ref |
|------|----------|--------------------------|-----------------|-------------|
| Shop G-01 | Al Rayyan Tower | Commercial space | true | Shop G-01 — ART-SHOP-G01 |
| Office 203 | Al Rayyan Tower | Office | true | Office 203 — ART-OFF-203 |
| Apartment 1204 | Al Rayyan Tower | Appartment *(Odoo typo)* | true | Apartment 1204 — ART-APT-1204 |
| Kiosk K-05 | Doha Business Center | Room | true | Kiosk K-05 — DBC-KIOSK-K05 |

Availability/status: computed via linked `sale.order` subscriptions and `x_invoice_status` on the analytic account (not set until contracted).

**Screenshots:**
- [03_units_list.png](screenshots/industry_real_estate_uat/03_units_list.png) — kanban
- [04_shop_g01_form.png](screenshots/industry_real_estate_uat/04_shop_g01_form.png) — Shop G-01 form

**Status:** PASS

**Notes:** Units are `account.analytic.account` on analytic plan **Properties**, not `product.template`. Form shows Plan = Properties; extended fields (building, type) are on the industry form view when opened via Properties menu.

---

## UC-IRE-004 — Create tenant/customer

**Objective:** Create/verify tenant **Doha Trading LLC**.

**Steps:**
1. RPC create/verify `res.partner` (company).
2. Open partner form.

**Expected:** Customer record usable on rental contracts.

**Actual:** Standard `res.partner` — no dedicated “tenant” role field. Tenant is the **Customer** on `sale.order`. No direct partner↔unit relation until a rental contract links them via `x_account_analytic_account_id`.

**Screenshot:** [05_tenant_doha_trading_llc.png](screenshots/industry_real_estate_uat/05_tenant_doha_trading_llc.png)

**Status:** PASS

**Notes:** Owner/sponsor/guarantor roles are **not** native — gap for `qatar_property_base`.

---

## UC-IRE-005 — Real estate quotation / contract / subscription flow

**Objective:** Document the official flow: property → customer → subscription contract.

**Steps:**
1. Create `sale.order` with `x_account_analytic_account_id` = Shop G-01, `plan_id` = Monthly, rental product line.
2. Confirm order (`action_confirm`).
3. Open contract form S00001.

**Expected flow:** Property/unit → customer → subscription → invoice capability.

**Actual Odoo flow:**

1. **Property** selected on sales order field **Property** (`x_account_analytic_account_id`).
2. **Customer** = `partner_id` (Doha Trading LLC).
3. **Recurring Plan** = `plan_id` (Monthly); **Start / End** dates set subscription period.
4. On confirm: `state` → `sale`, `subscription_state` → **In Progress**, **Next Invoice** scheduled.
5. No separate quotation stage required for RPC-created orders; UI supports kanban stages (Quotation → Sales Order).

**Screenshot:** [06_contract_subscription.png](screenshots/industry_real_estate_uat/06_contract_subscription.png)

**Status:** PASS

**Notes:** Contract is `sale.order` with `sale_subscription` — **not** `sale_renting`. MRR smart button shows 22,500. Property link is analytic account, not rental product.

---

## UC-IRE-006 — Generate invoice

**Objective:** Create invoice from subscription and capture invoice evidence.

**Steps:**
1. Wizard `sale.advance.payment.inv` → `create_invoices` on S00001.
2. Post invoice (`account.move` `action_post`).
3. Open INV/2026/00001.

**Expected:** Draft/posted customer invoice linked to S00001.

**Actual:** Invoice **INV/2026/00001** created from S00001. Line: *Rental fee* — 1 Month 06/06/2026 to 07/05/2026, 22,500. Origin = S00001. Sale Orders smart button = 1.

**Screenshot:** [07_invoice.png](screenshots/industry_real_estate_uat/07_invoice.png)

**Status:** PASS

**Notes:** Recurring billing uses standard subscription invoicing. `_create_invoices` is private; tests use public wizard API.

---

## UC-IRE-007 — Register payment if possible

**Objective:** Register payment on posted invoice if sandbox allows.

**Steps:**
1. Open posted invoice INV/2026/00001.
2. Click **Pay** / Register Payment.
3. Capture wizard or paid state.

**Expected:** Payment wizard opens; optional full reconciliation.

**Actual:** **Pay** button visible on posted invoice. Playwright opened the payment wizard; payment was **not** posted (automation stops at wizard for safety). Invoice remains `payment_state = not_paid`.

**Screenshots:**
- [08_payment_wizard.png](screenshots/industry_real_estate_uat/08_payment_wizard.png) — Register Payment wizard opened
- [08_invoice_status_unpaid.png](screenshots/industry_real_estate_uat/08_invoice_status_unpaid.png) — earlier capture (draft invoice, superseded)

**Status:** PARTIAL

**Notes:** Full payment registration is possible manually (same as Phase 1 `account.payment`). Automated posting was intentionally not executed to avoid journal side-effects in shared sandbox.

---

## UC-IRE-008 — Property register / report check

**Objective:** Identify out-of-the-box reporting and views.

**Steps:**
1. Open **Availability** gantt (action 609).
2. Open **Properties** kanban (action 610).

**Expected:** Native list/report/dashboard for property register.

**Actual (out of the box):**

| View | Model | Mode | Purpose |
|------|-------|------|---------|
| Rental Contracts | `sale.order` | kanban, list, form, calendar | Active contracts |
| Availability | `sale.order` | **gantt**, list, form | Occupancy timeline |
| Properties | `account.analytic.account` | kanban, list, form | Unit register |
| Buildings | `x_buildings` | kanban, form | Building register |
| Products | `product.template` | kanban, list, form | Rental fee products |
| Meters | `x_meters` | list | Utility meters (config) |

**No** dedicated Qatar property register PDF, pivot, or statutory report. CRM/website/knowledge modules install as part of industry package but are not core to rental accounting.

**Screenshots:**
- [09_availability_gantt.png](screenshots/industry_real_estate_uat/09_availability_gantt.png)
- [09b_properties_kanban.png](screenshots/industry_real_estate_uat/09b_properties_kanban.png)

**Status:** PASS

---

## UC-IRE-009 — Gap analysis for Qatar Phase 2

**Objective:** Document missing Qatar-specific fields vs `qatar_property_base` scope.

**Steps:**
1. Open Shop G-01 property form.
2. Compare native `x_*` fields to Phase 2 requirements.

**Expected:** Gaps listed for future custom module.

**Actual — missing / insufficient for Qatar:**

| Requirement | Native `industry_real_estate` |
|-------------|------------------------------|
| Qatar district | Not present |
| Zone | Not present |
| RERA reference | Not present |
| Baladiya reference | Not present |
| Plot number | Not present |
| Kahramaa meter reference | `x_meters` model exists; no Kahramaa-specific link on unit |
| Owner / sponsor / guarantor | Not on `res.partner` |
| Qatar property register report | Not present; only kanban/list/gantt |
| Unit code (ART-SHOP-G01) | Only in free-text `x_property_address`, not structured |
| Tenant role | Uses generic Customer |

**Screenshot:** [10_gap_analysis_shop_g01_fields.png](screenshots/industry_real_estate_uat/10_gap_analysis_shop_g01_fields.png)

**Status:** PASS (gap analysis complete)

**Notes:** `qatar_property_base` should **extend** `industry_real_estate` models (`x_buildings`, `account.analytic.account`, `res.partner`, reports) — not replace with Phase 1 `sale_renting` pattern.

---

## Automation reference

```bash
cd tests/playwright
export ODOO_PASSWORD='<admin password>'
./run_industry_uat.sh
```

Playwright spec: `tests/playwright/tests/industry_real_estate_uat.spec.js`  
Record IDs persisted locally in `tests/playwright/.industry_uat_records.json` (gitignored).

---

**Bright Information Systems W.L.L** · June 2026
