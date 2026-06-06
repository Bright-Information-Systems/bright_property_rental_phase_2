# Phase 1.5 — Architecture Decision Gate

**Bright Information Systems W.L.L**  
**Project:** Qatar Property Rental Management  
**Analysis date:** June 2026  
**Status:** **Analysis complete — pending stakeholder sign-off**  
**Blocks:** Phase 2 development (`qatar_property_base`)

---

## Decision Status

| Field | Value |
|-------|--------|
| **Analysis** | **Complete** (sandbox + module inspection) |
| **Sign-off** | **Pending** — client approval required |
| **BIS recommendation** | **Option A — Continue `sale_renting`** |
| **Required before coding** | Stakeholder sign-off (§9) |
| **Sandbox DB** | `qatar_property_architecture_sandbox` (isolated — not Phase 1 UAT) |

> **No Phase 2 coding starts before stakeholder sign-off is recorded.**

---

## 1. Context

Phase 1 validated native Odoo 19 **`sale_renting`** on database `qatar_property_phase1_demo`:

| Concept | Phase 1 model |
|---------|---------------|
| Building | `product.category` |
| Unit | `product.template` (`rent_ok=True`) |
| Rental contract | `sale.order` (`is_rental_order=True`) |
| Invoice / payment | Standard `account.move` / `account.payment` |

**Validated records (Phase 1 UAT DB — not modified):**

| Record | Reference | Verified state |
|--------|-----------|----------------|
| Confirmed rental | S00006 | `sale`, `is_rental_order=True`, Doha Trading LLC |
| Invoice | INV/2026/00001 | posted, 22,500 QAR, paid |
| Payment | PBNK1/2026/00001 | reconciled |
| CRM draft rental | S00007 | draft, Gulf Pharmacy W.L.L |
| Units | Shop G-01, Office 203, Apartment 1204, Kiosk K-05 | `rent_ok=True` |
| Buildings | Al Rayyan Tower, Doha Business Center | `product.category` |

---

## 2. Module Inspected — `industry_real_estate`

| Item | Value |
|------|--------|
| **Package path** | `projects/qatar_property_phase2/industry_real_estate-19.0.1.3/` |
| **Technical name** | `industry_real_estate` |
| **Version** | 19.0.1.3 (manifest `1.3`) |
| **Author** | Odoo S.A. (OEEL-1) |
| **Python models** | None — Studio/custom models defined via XML (`ir.model`, `ir.model.fields`) |

### 2.1 Direct dependencies (manifest)

| Dependency | Purpose |
|------------|---------|
| `base_automation` | Automated actions |
| `crm_enterprise` | CRM enterprise features |
| `crm_iap_enrich` / `crm_iap_mine` | Lead enrichment |
| `knowledge` | Knowledge base articles |
| `project_sale_subscription` | Project + subscription bridge |
| `sale_crm` | CRM ↔ Sales |
| `website_crm` | Website lead capture |
| `website_studio` | Website / Studio |

**Not a dependency:** `sale_renting` — industry package uses **subscriptions**, not the Rental app.

### 2.2 Transitive install impact (sandbox)

Installing `industry_real_estate` on sandbox pulled **136 modules**, including:

- `sale_subscription`, `project_sale_subscription`
- `knowledge`, `website`, `website_studio`, `web_studio`
- `crm_enterprise`, `ai`, `ai_knowledge`, `ai_website`

**`sale_renting` remained uninstalled** on sandbox.

### 2.3 Data models created

| Model | Type | Role |
|-------|------|------|
| `x_buildings` | Studio custom | Building master (address, city, zip) |
| `account.analytic.account` (Properties plan) | Extended analytic account | **Unit / property** master |
| `x_meters` | Studio custom | Utility meters |
| `x_meter_reading` | Studio custom | Meter readings |
| `sale.order` | Extended | **Subscription contract** linked to property via `x_account_analytic_account_id` |

**There is no `property.property` standard model.** Units are analytic accounts on the **Properties** analytic plan (`account.analytic.plan`).

### 2.4 Key custom fields (sandbox `ir_model_fields`)

**On `account.analytic.account` (unit):**

- `x_property_building_id` → `x_buildings`
- `x_property_type` (selection: Apartment, Office, …)
- `x_property_address`, `x_property_image`, `x_is_published`
- `x_rental_contract_id` → `sale.order`
- `x_property_meter_reading_ids`

**On `sale.order` (contract):**

- `x_account_analytic_account_id` → unit (property)
- `plan_id` → subscription plan (recurring)
- `start_date` / `end_date` — subscription period
- Uses `subscription_state`, not `is_rental_order`

**Products in industry package:** generic services (`Rental fee`, `Security deposit`, utilities) with `recurring_invoice=True` — **not** rentable unit products.

---

## 3. Sandbox Install Result

| Item | Result |
|------|--------|
| **Sandbox DB** | `qatar_property_architecture_sandbox` |
| **Config** | `config/projects/qatar_property_architecture_sandbox.conf` |
| **Port** | `9020` (isolated from Phase 1 port `9019`) |
| **Addons path** | Enterprise + `.../industry_real_estate-19.0.1.3` |
| **Install command** | `-i industry_real_estate --without-demo=all --stop-after-init` |
| **Exit code** | **0 — SUCCESS** |
| **Modules installed** | 136 |
| `industry_real_estate` state | **installed** |
| `sale_renting` state | **uninstalled** |
| `sale_subscription` state | **installed** |
| Demo buildings in DB | 0 (installed without demo data) |
| Properties analytic plan | **created** (id: 2, name: Properties) |
| Phase 1 UAT DB touched | **No** |

---

## 4. Data Model Comparison

| Concept | Option A — `sale_renting` (Phase 1) | Option B — `industry_real_estate` |
|---------|--------------------------------------|-----------------------------------|
| **Building** | `product.category` | `x_buildings` (Studio model) |
| **Unit** | `product.template` (`rent_ok=True`) | `account.analytic.account` (Properties plan) |
| **Unit pricing** | `product.pricing` + rental recurrence | Subscription product lines (`Rental fee`, recurring) |
| **Contract** | `sale.order` (`is_rental_order=True`) | `sale.order` (subscription, `plan_id`) |
| **Unit link on contract** | Order line → product | `x_account_analytic_account_id` on order |
| **CRM bridge** | `sale_renting_crm` → New Rental | CRM + subscription quotation |
| **Availability** | Product rental status | Computed from active subscription on analytic account |
| **Website** | Optional (`website_sale_renting`) | Built-in property listing (website module) |
| **Meters / utilities** | Not in Phase 1 | `x_meters`, `x_meter_reading` native in industry |
| **Accounting** | Standard invoice from rental order | Recurring subscription invoices |

**Conclusion:** These are **different foundations**, not a drop-in upgrade. Option B is a subscription-centric property model, not an extension of `sale_renting`.

---

## 5. Unit Mapping Comparison

### Phase 1 units (validated on `qatar_property_phase1_demo`)

| Unit | Code | Building (`product.category`) | Monthly list price |
|------|------|-------------------------------|-------------------|
| Shop G-01 | ART-SHOP-G01 | Al Rayyan Tower | 12,000 QAR |
| Office 203 | ART-OFF-203 | Al Rayyan Tower | 8,500 QAR |
| Apartment 1204 | ART-APT-1204 | Al Rayyan Tower | 6,500 QAR |
| Kiosk K-05 | DBC-KIOSK-K05 | Doha Business Center | 4,500 QAR |

### Option A — no migration (extend in place)

| Phase 1 unit | Phase 2 target |
|--------------|----------------|
| Shop G-01 | Same `product.template` + `qatar_property_base` Qatar fields + optional `property.building` |
| Office 203 | Same |
| Apartment 1204 | Same |
| Kiosk K-05 | Same |
| Al Rayyan Tower | `product.category` or new `property.building` linked |
| Doha Business Center | Same |

**Migration effort:** Low — additive fields only.

### Option B — conceptual remap to industry model

| Phase 1 unit | Industry equivalent | Migration action |
|--------------|---------------------|------------------|
| Al Rayyan Tower | `x_buildings` record | Create building; deprecate or unlink category mapping |
| Doha Business Center | `x_buildings` record | Same |
| Shop G-01 | `account.analytic.account` (Properties plan, type Shop) | Create analytic account; link to building; **retire product** or keep orphan |
| Office 203 | `account.analytic.account` (type Office) | Same |
| Apartment 1204 | `account.analytic.account` (type Apartment) | Same |
| Kiosk K-05 | `account.analytic.account` (type Kiosk/Shop) | Same |
| S00006 | New `sale.order` subscription with `x_account_analytic_account_id` | **Rebuild contract** — cannot convert `is_rental_order` order in place |
| INV/2026/00001 | New subscription billing | **New accounting trail** — historical link broken unless manual journal bridge |
| S00007 | New subscription quotation | Rebuild CRM → subscription flow |

**Migration effort:** High — 4 units, 2 buildings, 2 orders, full Playwright suite rewrite, CRM flow change.

---

## 6. Accounting Impact

### Phase 1 baseline (unchanged — `qatar_property_phase1_demo`)

| Check | Value |
|-------|--------|
| S00006 state | `sale` |
| is_rental_order | `true` |
| INV/2026/00001 amount | 22,500.00 QAR |
| INV/2026/00001 payment_state | `paid` |
| move_type | `out_invoice` |

### Option A — accounting impact

| Impact | Assessment |
|--------|------------|
| S00006 trail | **No change** — metadata-only Phase 2 |
| New invoices | Same `sale_renting` → invoice path |
| Journal entries | Unchanged posting logic |
| Risk | **Low** |

### Option B — accounting impact

| Impact | Assessment |
|--------|------------|
| S00006 | Cannot remain as `sale_renting` order; must migrate to subscription model |
| INV/2026/00001 | Tied to rental order invoice — migration requires opening balance or manual carry-forward |
| Recurring billing | Subscription engine generates invoices on schedule — different from Phase 1 one-shot 22,500 QAR flow |
| Analytic distribution | Property analytic account on every subscription line — different JE structure |
| Risk | **High** — proven trail would be broken without formal migration project |

### Option C — hybrid accounting impact

| Impact | Assessment |
|--------|------------|
| Dual contract types | Rental orders + subscription orders coexist |
| Reporting | Tenant ledger must reconcile two order types |
| Phase 2 scope | `qatar_property_base` needs dual linking logic |
| Risk | **Very high** — long-term duplication |

---

## 7. Migration Risk Summary

| Risk ID | Risk | A | B | C |
|---------|------|---|---|---|
| R1 | S00006 accounting regression | Low | **High** | High |
| R2 | 4-unit / 2-building migration | None | **High** | High |
| R3 | CRM → rental bridge breakage | Low | **High** | Medium |
| R4 | Playwright suite rewrite | None | **Required** | Partial |
| R5 | Dual-model complexity | Low | Medium | **Very high** |
| R6 | Module bloat (136 vs ~20 apps) | Low | **High** | **Very high** |
| R7 | `sale_renting` + subscriptions conflict | N/A | **Yes** | **Yes** |
| R8 | Client retraining | Low | High | Very high |

---

## 8. Options Summary

### Option A — Continue `sale_renting` ✓ Recommended

- Keep Phase 1 validated foundation
- Phase 2 adds Qatar metadata on `product.template`, optional `property.building`, partner roles, property register
- S00006 / INV/2026/00001 remain authoritative
- Lowest risk, fastest Phase 2 delivery
- Aligns with Phase 2 scope (metadata capture only)

### Option B — Pivot to `industry_real_estate`

- Superior for full property-management industry demo (meters, website listings, subscriptions)
- **Not compatible** with Phase 1 `sale_renting` UAT without full migration
- Sandbox proved: installs 136 modules, does not use `sale_renting`
- Defer to Phase 3+ re-evaluation if client requires subscription-native property management

### Option C — Hybrid

- **Not recommended** — sandbox shows orthogonal models (rental orders vs subscription contracts)
- Would duplicate units across `product.template` and `account.analytic.account`
- Highest long-term maintenance cost

---

## 9. Recommendation

| Field | Value |
|-------|--------|
| **Recommended option** | **A — Continue `sale_renting`** |
| **Rationale** | Phase 1 is validated (6/6 UAT, S00006 accounting proven). Sandbox confirmed `industry_real_estate` uses a **different** unit model (analytic account), **different** contract model (subscription), and does **not** depend on `sale_renting`. Pivot would break the proven trail and delay Phase 2 with no benefit for current scope (Qatar metadata, partner roles, property register). |
| **Phase 2 model target** | `product.template` + optional `property.building` + `res.partner` extensions |
| **Re-evaluate Option B** | Phase 3+ or if client mandates Odoo industry subscription model |
| **Estimated re-UAT if Option B chosen** | 4–6 weeks full re-UAT + migration scripts |

### Conditions for future Option B reconsideration

1. Client explicitly requires subscription-based leases and property website portal
2. Formal migration budget approved for S00006 trail and 4 units
3. Isolated pilot DB with demo data (`--with-demo`) and full accounting comparison completed
4. `sale_renting` vs `sale_subscription` coexistence policy signed

---

## 10. Final Decision

| Field | Value |
|-------|--------|
| **BIS technical recommendation** | **Option A — Continue `sale_renting`** |
| **Decision status** | **Pending client sign-off** |
| **Effective upon** | Completion of §11 stakeholder sign-off |

---

## 11. Stakeholder Sign-Off

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| Bright Information Systems — Technical Lead | | A / B / C | | |
| Bright Information Systems — Project Manager | | Approved / Rejected | | |
| Client — Business Owner | | A / B / C | | |
| Client — Finance / Accounting | | Approved / Rejected | | |

**Signed decision:** _________________________

**Effective date:** _________________________

---

## 12. Gate Exit Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Module inspected | ✓ Done |
| 2 | Sandbox install on isolated DB | ✓ Done — `qatar_property_architecture_sandbox` |
| 3 | Model comparison documented | ✓ Done |
| 4 | Unit mapping documented | ✓ Done |
| 5 | Accounting impact assessed | ✓ Done |
| 6 | BIS recommendation recorded | ✓ Option A |
| 7 | Stakeholder sign-off | ☐ Pending |
| 8 | Update `PHASE_2_MODULE_DESIGN.md` for Option A | ☐ Next step after sign-off |

---

## References

- [PHASE2_PLAN.md](PHASE2_PLAN.md)
- [PHASE_2_MODULE_DESIGN.md](PHASE_2_MODULE_DESIGN.md)
- Module path: `industry_real_estate-19.0.1.3/industry_real_estate/`
- Sandbox config: `config/projects/qatar_property_architecture_sandbox.conf` (monorepo)
- Phase 1 repo: https://github.com/Bright-Information-Systems/bright_property_rental_phase_1
- Phase 2 repo: https://github.com/Bright-Information-Systems/bright_property_rental_phase_2

---

**Bright Information Systems W.L.L** · Phase 1.5 Architecture Decision Gate · June 2026
