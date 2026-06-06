# Phase 1.5 — Architecture Decision Gate

**Bright Information Systems W.L.L**  
**Project:** Qatar Property Rental Management  
**Status:** **Pending**  
**Blocks:** Phase 2 development (`qatar_property_base`)

---

## Decision Status

| Field | Value |
|-------|--------|
| **Status** | **Pending** — not signed |
| **Required before** | Any Phase 2 coding or module scaffolding |
| **Owner** | Bright Information Systems + Client stakeholder |
| **Output** | Signed architecture decision document (this file, completed §7) |

> **No Phase 2 coding starts before this decision is signed.**

---

## 1. Context

Phase 1 validated native Odoo 19 **`sale_renting`** with a temporary portfolio model:

- **Building** → `product.category`
- **Unit** → rentable `product.template` (`rent_ok=True`)

Key validated records:

| Record | Reference |
|--------|-----------|
| Confirmed rental | S00006 |
| Invoice | INV/2026/00001 |
| Payment | PBNK1/2026/00001 (22,500 QAR) |
| CRM draft rental | S00007 |
| Demo units | Shop G-01, Office 203, Apartment 1204, Kiosk K-05 |

Phase 2 (`qatar_property_base`) must align with the chosen long-term architecture — not build on assumptions.

---

## 2. Options Comparison

### Option A — Continue `sale_renting`

| Aspect | Detail |
|--------|--------|
| **Description** | Extend Phase 1 product/category model; add custom property master (`property.building`) alongside rentable products |
| **Pros** | Lowest migration risk; Phase 1 UAT and Playwright suite preserved; familiar rental order flow |
| **Cons** | Long-term model may diverge from Odoo industry package; more custom glue for property-specific features |
| **Phase 2 impact** | `qatar_property_base` extends `product.template` + optional `property.building` |

### Option B — Pivot to `industry_real_estate`

| Aspect | Detail |
|--------|--------|
| **Description** | Adopt Odoo official Property Management patterns (analytic property, subscriptions, industry data model) |
| **Pros** | Odoo-supported industry model; richer native property features; better long-term alignment with Enterprise roadmap |
| **Cons** | Migration from Phase 1 products; different contract model (subscriptions vs `sale.order` rental); re-UAT required |
| **Phase 2 impact** | `qatar_property_base` extends `property.property` (or industry equivalent); Phase 1 units remapped |

### Option C — Hybrid

| Aspect | Detail |
|--------|--------|
| **Description** | `sale_renting` for short-term / simple leases; industry patterns for long-term / complex property management |
| **Pros** | Flexible; can phase migration by contract type |
| **Cons** | Highest integration complexity; dual models to maintain; risk of data inconsistency |
| **Phase 2 impact** | `qatar_property_base` must support both paths or explicit contract-type routing |

---

## 3. Comparison Matrix

| Criterion | A — sale_renting | B — industry_real_estate | C — Hybrid |
|-----------|------------------|--------------------------|------------|
| Phase 1 UAT preservation | ✓ High | △ Requires migration | △ Partial |
| Odoo official support | △ Rental app only | ✓ Industry package | △ Mixed |
| Accounting integrity | ✓ Proven (S00006) | ? Sandbox required | ? Complex |
| Development effort (Phase 2) | Low–Medium | Medium–High | High |
| Long-term scalability | Medium | High | High (if managed) |
| Migration risk | Low | Medium–High | High |

---

## 4. Permanently Rejected

| Module | Reason |
|--------|--------|
| **Cybrosys Advanced Property Management** | Accounting bugs; missing `partner_id` on invoices; parallel accounting silo; security concerns — rejected in Phase 1 |

Do not re-evaluate without explicit security and accounting audit.

---

## 5. Sandbox Test Checklist

Execute in an **isolated database only** — never on production or Phase 1 UAT database.

### 5.1 Environment setup

- [ ] Create sandbox DB: `qatar_property_architecture_sandbox`
- [ ] Install: `sale_renting`, `account`, `crm`, `contacts` (Phase 1 baseline)
- [ ] Install: `industry_real_estate` (sandbox only)
- [ ] Do **not** install Cybrosys or other third-party property modules

### 5.2 Map Phase 1 demo units

| Phase 1 unit | Internal ref | Building | Map to industry model |
|--------------|--------------|----------|------------------------|
| Shop G-01 | ART-SHOP-G01 | Al Rayyan Tower | [ ] |
| Office 203 | ART-OFFICE-203 | Al Rayyan Tower | [ ] |
| Apartment 1204 | ART-APT-1204 | Al Rayyan Tower | [ ] |
| Kiosk K-05 | DBC-KIOSK-K05 | Doha Business Center | [ ] |

- [ ] Document field mapping: `product.category` → building
- [ ] Document field mapping: `product.template` → unit / property record
- [ ] Document rentable flag / availability equivalent

### 5.3 Recreate S00006 flow in sandbox (Option B / C test)

- [ ] Create rental/contract for Doha Trading LLC + Shop G-01 equivalent
- [ ] Confirm contract / order
- [ ] Create invoice (target: equivalent of INV/2026/00001, 22,500 QAR)
- [ ] Register payment
- [ ] Export journal lines for comparison

### 5.4 Accounting impact comparison

Compare sandbox result against Phase 1 baseline:

| Check | Phase 1 baseline (S00006) | Sandbox result | Match? |
|-------|---------------------------|----------------|--------|
| Customer invoice total | 22,500 QAR | | [ ] |
| Receivable account used | (from JE) | | [ ] |
| Revenue account used | (from JE) | | [ ] |
| Payment reconciliation | PBNK1/2026/00001 | | [ ] |
| Partner on invoice | Doha Trading LLC | | [ ] |
| Unit traceability on contract | Shop G-01 | | [ ] |

- [ ] Screenshot journal entry (sandbox)
- [ ] Screenshot partner ledger (sandbox)
- [ ] Note any account mapping differences
- [ ] Note any missing `partner_id` or broken links

### 5.5 CRM → rental bridge

- [ ] Test CRM opportunity → rental/contract creation (Gulf Pharmacy / Kiosk K-05 scenario)
- [ ] Compare to Phase 1 S00007 draft flow
- [ ] Document differences in UX and data model

### 5.6 Risk documentation

| Risk ID | Risk | Severity | Notes |
|---------|------|----------|-------|
| R1 | Accounting regression on S00006 trail | High | |
| R2 | Migration effort for 4 demo units | Medium | |
| R3 | CRM integration breakage | Medium | |
| R4 | Playwright suite rewrite required | Medium | |
| R5 | Dual-model complexity (Hybrid only) | High | |
| R6 | Client training / UX change | Medium | |
| R7 | Odoo.sh module dependency changes | Low | |

- [ ] All risks reviewed in workshop
- [ ] Mitigation noted per chosen option

### 5.7 Workshop outputs

- [ ] Comparison presentation prepared (A vs B vs C)
- [ ] Sandbox screenshots attached
- [ ] Accounting comparison table completed
- [ ] Recommendation drafted by Bright Information Systems
- [ ] Client questions documented

---

## 6. Recommendation (to be completed after sandbox)

| Field | Value |
|-------|--------|
| **Recommended option** | _Pending sandbox_ |
| **Rationale** | |
| **Migration plan (if B or C)** | |
| **Phase 2 model target** | `product.template` extension **or** `property.property` extension |
| **Estimated re-UAT effort** | |

---

## 7. Stakeholder Sign-Off

| Role | Name | Decision | Date | Signature |
|------|------|----------|------|-----------|
| Bright Information Systems — Technical Lead | | A / B / C | | |
| Bright Information Systems — Project Manager | | Approved / Rejected | | |
| Client — Business Owner | | A / B / C | | |
| Client — Finance / Accounting | | Approved / Rejected | | |

**Signed decision:** _________________________

**Effective date:** _________________________

---

## 8. Gate Exit Criteria

Phase 1.5 is **complete** when all of the following are true:

1. Sandbox checklist (§5) executed and documented
2. Options comparison reviewed with client
3. Recommendation recorded (§6)
4. Stakeholder sign-off completed (§7)
5. Phase 2 `PHASE_2_MODULE_DESIGN.md` updated to reflect chosen option

Only then may Phase 2 sprint 1 begin.

---

## References

- [PHASE2_PLAN.md](PHASE2_PLAN.md)
- Phase 1 repo: https://github.com/Bright-Information-Systems/bright_property_rental_phase_1
- Phase 1 roadmap: Phase 1 `docs/final_documentation_pack/PHASE2_ROADMAP.md`

---

**Bright Information Systems W.L.L** · Phase 1.5 Architecture Decision Gate · June 2026
