# Phase 2 — UAT Scenarios

**Bright Information Systems W.L.L**  
**Module under test:** `qatar_property_base`  
**Prerequisite:** Phase 1.5 architecture decision signed  
**Database:** Clone of `qatar_property_phase1_demo` (never test on production)

---

## Overview

| # | Scenario | Priority | Type |
|---|----------|----------|------|
| 2.1 | Install `qatar_property_base` on Phase 1 DB clone | P0 | Smoke |
| 2.2 | Shop G-01 — Qatar fields visible and savable | P0 | Functional |
| 2.3 | Partner — owner, sponsor, guarantor roles | P0 | Functional |
| 2.4 | Property register — 4 units with districts | P0 | Report |
| 2.5 | S00006 accounting trail regression | P0 | Regression |
| 2.6 | New rental + invoice from Qatar-classified unit | P0 | End-to-end |

**Pass criteria:** All scenarios PASS before Phase 2 sign-off.

**Automation target:** Playwright specs `phase2_01` through `phase2_06` (to be created in Phase 2 implementation).

---

## Environment

| Setting | Value |
|---------|--------|
| Base database | Clone of `qatar_property_phase1_demo` |
| Odoo port | TBD (e.g. 9020 — separate from Phase 1 port 9019) |
| Module | `qatar_property_base` |
| Phase 1 module | `qatar_property_phase1` (demo data — already installed on clone) |
| Login | `admin` |
| Password | `ODOO_PASSWORD` env var |

---

## Scenario 2.1 — Install Module on Phase 1 Clone

**Objective:** Prove `qatar_property_base` installs without breaking Phase 1 apps or data.

### Preconditions

- Phase 1 clone DB with `qatar_property_phase1` installed
- S00006, INV/2026/00001, 4 units present

### Steps

1. Add Phase 2 repo root to `addons_path`
2. Update apps list
3. Install **`qatar_property_base`**
4. Verify no install errors in log
5. Verify Phase 1 apps still installed: `sale_renting`, `account`, `crm`
6. JSON-RPC: confirm S00006 still exists with `state=sale`

### Expected result

- Module installs successfully
- No uninstall/upgrade of Phase 1 module required
- S00006 unchanged

### Evidence

- Screenshot: Apps list showing `qatar_property_base` installed
- Screenshot: S00006 form still accessible
- Playwright spec: `phase2_01_install_smoke.spec.js`

**Status:** Not run

---

## Scenario 2.2 — Shop G-01 Qatar Fields

**Objective:** Qatar classification fields are visible on unit form and persist after save.

### Preconditions

- Scenario 2.1 PASS
- Product Shop G-01 (ART-SHOP-G01) exists

### Steps

1. Open **Products** → Shop G-01
2. Verify Qatar fields section visible (district, zone, unit type, RERA, Baladiya, Plot, Kahramaa ref)
3. Enter test values:
   - District: _TBD from master data_
   - Unit type: Shop
   - RERA ref: `TEST-RERA-G01`
4. Save
5. Re-open form — confirm values persisted

### Expected result

- All Phase 2 Qatar fields render on unit form
- Values save without error
- `rent_ok` still true — unit remains rentable

### Evidence

- Screenshot: Shop G-01 form with Qatar fields populated
- Screenshot: After save/re-open confirmation
- Playwright spec: `phase2_02_unit_qatar_fields.spec.js`

**Status:** Not run

---

## Scenario 2.3 — Partner Owner, Sponsor, Guarantor

**Objective:** Partner role extensions work on tenant/customer records.

### Preconditions

- Scenario 2.1 PASS
- Partner Doha Trading LLC exists (id from Phase 1 demo)

### Steps

1. Open **Contacts** → Doha Trading LLC
2. Verify Qatar partner fields / role tags visible
3. Set role flags or links:
   - Owner: _test partner or self-reference per design_
   - Sponsor: _test partner_
   - Guarantor: _test partner_
4. Save and re-open
5. Verify links persisted

### Expected result

- Owner, sponsor, guarantor assignable and visible
- No impact on S00006 customer link

### Evidence

- Screenshot: Doha Trading LLC with roles assigned
- Playwright spec: `phase2_03_partner_roles.spec.js`

**Status:** Not run

---

## Scenario 2.4 — Property Register Report

**Objective:** Property register lists all 4 demo units with district classification.

### Preconditions

- Scenarios 2.1–2.2 PASS
- Qatar fields populated on at least Shop G-01 and Kiosk K-05

### Steps

1. Open **Property Register** report (menu TBD per module design)
2. Verify 4 units listed:
   - Shop G-01
   - Office 203
   - Apartment 1204
   - Kiosk K-05
3. Verify district / building column populated where data entered
4. Export or screenshot list view

### Expected result

- All 4 Phase 1 units appear
- District/building columns correct
- No duplicate or missing rows

### Evidence

- Screenshot: Property register list
- Playwright spec: `phase2_04_property_register.spec.js`

**Status:** Not run

---

## Scenario 2.5 — S00006 Accounting Regression

**Objective:** Phase 1 accounting trail remains intact after Phase 2 module install and field changes.

### Preconditions

- Scenarios 2.1–2.4 PASS
- S00006, INV/2026/00001, PBNK1/2026/00001 exist from Phase 1

### Steps

1. Open rental order **S00006** — confirm state `sale`, customer Doha Trading LLC, Shop G-01
2. Open invoice **INV/2026/00001** — confirm posted, total 22,500 QAR, paid
3. Open payment **PBNK1/2026/00001** — confirm reconciled
4. Open journal entry from invoice — verify receivable + revenue lines unchanged
5. JSON-RPC validation:
   - `account.move` INV/2026/00001: `amount_total = 22500`, `state = posted`, `payment_state = paid`
   - `sale.order` S00006: `state = sale`

### Expected result

- No amount, state, or reconciliation changes
- No duplicate invoices or payments created by Phase 2 install

### Evidence

- Screenshot: S00006 unchanged
- Screenshot: INV/2026/00001 paid status
- Screenshot: Journal entry lines
- Playwright spec: `phase2_05_s00006_regression.spec.js`

**Status:** Not run

---

## Scenario 2.6 — New Rental from Qatar-Classified Unit

**Objective:** End-to-end rental flow still works on a unit with Qatar fields populated.

### Preconditions

- Scenario 2.2 PASS (Kiosk K-05 or Office 203 has Qatar fields)
- Gulf Pharmacy W.L.L exists (from Phase 1 CRM scenario)

### Steps

1. Create new **Rental Order**:
   - Customer: Gulf Pharmacy W.L.L
   - Unit: Kiosk K-05 (with Qatar fields)
   - Rental period: 1 month (or per Phase 1 pattern)
2. Save quotation
3. Confirm order
4. Create invoice from rental order
5. Post invoice
6. Verify invoice total > 0 and linked to correct unit/customer

### Expected result

- Rental order confirms without error
- Invoice created and posted
- Qatar fields visible on order line / unit reference
- No conflict with S00007 or S00006

### Evidence

- Screenshot: New rental order confirmed
- Screenshot: Posted invoice
- Playwright spec: `phase2_06_new_rental_invoice.spec.js`
- Record new order reference in `.phase2_created_records.json`

**Status:** Not run

---

## Regression Scope (Phase 1 records)

These records must remain valid after every Phase 2 change:

| Record | Check |
|--------|-------|
| S00006 | state=sale, customer, lines intact |
| INV/2026/00001 | posted, 22,500 QAR, paid |
| PBNK1/2026/00001 | reconciled |
| S00007 | draft, unchanged (unless explicitly updated in test 2.6) |
| Shop G-01, Office 203, Apartment 1204, Kiosk K-05 | exist, rent_ok |

---

## Screenshot Naming Convention (planned)

```
docs/screenshots/phase2_uat/
  00_install_module.png
  01_shop_g01_qatar_fields.png
  02_partner_roles.png
  03_property_register.png
  04_s00006_regression.png
  05_new_rental_invoice.png
```

See [screenshots/README.md](screenshots/README.md).

---

## References

- [PHASE2_PLAN.md](PHASE2_PLAN.md)
- [PHASE_2_MODULE_DESIGN.md](PHASE_2_MODULE_DESIGN.md)
- [PHASE_1_5_ARCHITECTURE_DECISION.md](PHASE_1_5_ARCHITECTURE_DECISION.md)
- Phase 1 UAT: `bright_property_rental_phase_1/docs/PHASE1_NATIVE_UAT_REPORT.md`

---

**Bright Information Systems W.L.L** · Phase 2 UAT Scenarios · June 2026
