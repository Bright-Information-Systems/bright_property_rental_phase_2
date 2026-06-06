# Phase 1.5 — Architecture Decision Gate

**Bright Information Systems W.L.L**  
**Project:** Qatar Property Rental Management  
**Analysis date:** June 2026  
**Status:** **Final business decision recorded**  
**Blocks:** Phase 2 module coding (pending client approval of pivot)

---

## Decision Status

| Field | Value |
|-------|--------|
| **Analysis** | **Complete** (sandbox + module inspection) |
| **Final business decision** | **Option B — Pivot to `industry_real_estate`** |
| **Client approval before coding** | **Required** (§11) |
| **Sandbox DB** | `qatar_property_architecture_sandbox` (isolated — Phase 1 UAT not touched) |
| **Module path tested** | `projects/qatar_property_phase2/industry_real_estate-19.0.1.3` |

> **No Phase 2 module coding starts before client approves the pivot (§11).**

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

### Option A — Continue `sale_renting` (not selected)

- Preserved Phase 1 UAT records without migration
- Extended `product.template` / `product.category` for Qatar metadata
- Rejected as long-term foundation — does not align with official Odoo property industry model

### Option B — Pivot to `industry_real_estate` ✓ **Selected**

- Official Odoo industry package — real-estate-oriented foundation
- Sandbox install **successful** on `qatar_property_architecture_sandbox`
- Buildings (`x_buildings`), units (`account.analytic.account` / Properties plan), subscription contracts
- Reduces custom property-structure development across Phase 2 and later phases
- **Selected** as Qatar Property foundation from Phase 2 onward

### Option C — Hybrid (not selected)

- Dual models (`sale_renting` + industry) — rejected due to duplication and complexity

---

## 9. Business Rationale for Option B

Phase 1 was **workflow validation only** — not a custom technical dependency:

| Fact | Implication |
|------|-------------|
| Phase 1 used native `sale_renting` with **no custom property module** | No proprietary code to preserve — pivot is a foundation change, not a rewrite of BIS modules |
| Phase 1 UAT DB (`qatar_property_phase1_demo`) was **not touched** by sandbox | Historical evidence remains valid as Phase 1 reference |
| `industry_real_estate` installed **successfully** in isolated sandbox | Official package is viable on Odoo 19 Enterprise |
| Industry model provides buildings, units, meters, subscriptions, website | Less custom scaffolding for property structure, contracts, ownership/tenant logic |
| Qatar needs are **extensions** (RERA, Baladiya, districts, partner roles) | `qatar_property_base` adds Qatar fields on top — does not replace the industry foundation |

**Rebuilding the Phase 1 demo flow is acceptable** because Phase 1 proved business workflows (rental → invoice → payment → CRM) using temporary product/category mapping. Phase 2 will recreate equivalent scenarios on the official industry model with **new demo records**.

---

## 10. Impact on Phase 2 and Future Phases

| Impact | Detail |
|--------|--------|
| **No standalone property model from scratch** | Phase 2 must not reinvent building/unit master — extend `industry_real_estate` |
| **`qatar_property_base` depends on `industry_real_estate`** | Qatar-specific fields layered on official models |
| **Qatar fields on official models** | Extend `x_buildings`, `account.analytic.account` (Properties), `res.partner` |
| **Future modules build on industry foundation** | All `qatar_property_*` addons depend on `industry_real_estate` + `qatar_property_base` |

**Future module stack (planned):**

```
industry_real_estate          ← Odoo official foundation
    └── qatar_property_base   ← Qatar fields + register (Phase 2)
            ├── qatar_property_reservation   (Phase 3)
            ├── qatar_property_pdc           (Phase 4)
            ├── qatar_property_rent_schedule (Phase 5)
            ├── qatar_property_reports       (Phase 6)
            ├── qatar_property_portal        (Phase 7)
            └── qatar_property_kahramaa      (Phase 7)
```

---

## 11. Migration Note

### Phase 1 records — historical UAT references only

| Record | Status in Phase 2+ |
|--------|-------------------|
| S00006 | Historical — `sale_renting` rental order on Phase 1 DB |
| S00007 | Historical — CRM draft rental on Phase 1 DB |
| INV/2026/00001 | Historical — Phase 1 invoice reference |
| PBNK1/2026/00001 | Historical — Phase 1 payment reference |

These remain documented evidence in the Phase 1 repo. **Phase 2 creates new demo records** on `industry_real_estate`.

### Unit remap — Phase 1 → industry model

| Phase 1 unit | Code | Building (Phase 1) | Phase 2 target (industry) |
|--------------|------|--------------------|---------------------------|
| Shop G-01 | ART-SHOP-G01 | Al Rayyan Tower (`product.category`) | `x_buildings` + `account.analytic.account` (Shop) |
| Office 203 | ART-OFF-203 | Al Rayyan Tower | `x_buildings` + `account.analytic.account` (Office) |
| Apartment 1204 | ART-APT-1204 | Al Rayyan Tower | `x_buildings` + `account.analytic.account` (Apartment) |
| Kiosk K-05 | DBC-KIOSK-K05 | Doha Business Center | `x_buildings` + `account.analytic.account` (Kiosk) |

| Phase 1 building | Phase 2 target |
|------------------|----------------|
| Al Rayyan Tower | `x_buildings` record |
| Doha Business Center | `x_buildings` record |

---

## 12. Risks (Option B — acknowledged)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Industry package pulls **136+ modules** (subscriptions, knowledge, website) | Medium | Document Odoo.sh dependencies; accept Enterprise footprint |
| Contract flow differs from `sale_renting` (subscriptions vs rental orders) | High | New UAT suite for industry subscription flow |
| Accounting path differs from Phase 1 S00006 trail | Medium | New demo contracts + invoices on industry model; Phase 1 records as reference only |
| Playwright Phase 1 suite not portable | Medium | Write Phase 2 UAT from scratch (`PHASE_2_UAT_SCENARIOS.md` to be revised) |
| Studio custom models (`x_*`) less standard than Python ORM modules | Low | Extend via `qatar_property_base` Python inherits where needed |
| Client must approve pivot before coding | **Gate** | §13 sign-off required |

---

## 13. Final Decision

| Field | Value |
|-------|--------|
| **Final business decision** | **Option B — Pivot to `industry_real_estate`** |
| **Foundation from Phase 2** | Odoo official `industry_real_estate` + `qatar_property_base` extensions |
| **Phase 1 role** | Workflow validation reference — no custom module dependency |
| **Sandbox evidence** | `industry_real_estate` installed on `qatar_property_architecture_sandbox` |
| **Coding gate** | Client approval in §14 before module implementation |

---

## 14. Stakeholder Sign-Off

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| Bright Information Systems — Technical Lead | | A / B / C | | |
| Bright Information Systems — Project Manager | | Approved / Rejected | | |
| Client — Business Owner | | A / B / C | | |
| Client — Finance / Accounting | | Approved / Rejected | | |

**Signed decision:** _________________________

**Effective date:** _________________________

---

## 15. Gate Exit Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Module inspected | ✓ Done |
| 2 | Sandbox install on isolated DB | ✓ Done — `qatar_property_architecture_sandbox` |
| 3 | Model comparison documented | ✓ Done |
| 4 | Unit mapping documented | ✓ Done |
| 5 | Accounting impact assessed | ✓ Done |
| 6 | Final business decision recorded | ✓ **Option B** |
| 7 | `PHASE_2_MODULE_DESIGN.md` updated | ✓ Option B |
| 8 | `PHASE2_PLAN.md` updated | ✓ Option B |
| 9 | Client sign-off (§14) | ☐ Pending before coding |
| 10 | Phase 2 UAT scenarios revised for industry flow | ☐ Next step |

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
