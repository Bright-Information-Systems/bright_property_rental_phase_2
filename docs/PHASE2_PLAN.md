# Qatar Property — Phase 2 Plan

**Bright Information Systems W.L.L**  
**Based on:** Phase 1 UAT closure (June 2026)  
**Status:** Planning  
**Target addon:** `qatar_property_base`

---

## 1. Phase 2 Summary

Phase 2 introduces **Qatar Property Core** — the first custom addon layer on top of the validated Phase 1 native `sale_renting` foundation.

| Attribute | Detail |
|-----------|--------|
| **Name** | Qatar Property Core |
| **Module** | `qatar_property_base` |
| **Priority** | P0 |
| **Estimated duration** | 4–6 weeks |
| **Depends on** | Phase 1 closed · Phase 1.5 architecture decision signed |

**Phase 2 does not include:** PDC, reservations, rent schedules, Arabic reports, or portal — those are Phases 3–7.

---

## 2. Prerequisites

### 2.1 Phase 1 (complete)

- 6/6 Playwright UAT scenarios PASS on native `sale_renting`
- Demo records validated: S00006, INV/2026/00001, S00007, 4 units, 2 buildings
- No third-party property module installed
- Cybrosys Advanced Property Management — **rejected**
- Phase 1 repo: `bright_property_rental_phase_1`

### 2.2 Phase 1.5 — Architecture Decision Gate (required before coding)

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A — Continue `sale_renting`** | Extend product/category model + custom property master | Lower migration risk; Phase 1 UAT preserved | May diverge from Odoo industry package long-term |
| **B — Pivot `industry_real_estate`** | Adopt official Property Management (analytic property, subscriptions) | Odoo-supported industry model | Migration from products; different contract model |
| **C — Hybrid** | `sale_renting` short-term; industry patterns long-term | Flexible | Highest integration complexity |

**Gate activities:**

1. Sandbox install `industry_real_estate` in isolated database only
2. Map 4 Phase 1 demo units to industry model
3. Compare accounting impact vs S00006 trail
4. Stakeholder workshop → **signed architecture decision document**

**Rejected permanently:** Cybrosys Advanced Property Management.

---

## 3. Business Objective

Deliver Qatar-specific property master data and classification fields so the client can:

- Register buildings and units with Qatar regulatory metadata
- Track owner, sponsor, and guarantor relationships on partners
- Classify units by district, type, and compliance references (RERA, Baladiya, Plot, Kahramaa placeholder)
- Maintain a single source of truth without breaking Phase 1 rental/accounting flows

---

## 4. Technical Objective

Build `qatar_property_base` as the foundation addon for all later `qatar_property_*` modules.

**Principles:**

- Integrate with native Odoo apps (`sale_renting`, `crm`, `contacts`, `account`)
- No parallel accounting silo
- No custom business logic that overrides core posting rules
- Modular — each later phase adds a sibling addon, not a monolith

---

## 5. Scope — In Phase 2

### 5.1 Data model (proposed)

| Area | Proposed model / extension |
|------|---------------------------|
| Building | `property.building` (optional) or extended `product.category` per architecture gate |
| Unit | Extension on `product.template` **or** `property.property` per gate decision |
| Partner roles | Extensions on `res.partner` — owner, sponsor, guarantor, tenant tags |
| Qatar classification | District, zone, unit type, regulatory reference fields |
| Compliance fields | RERA ref, Baladiya ref, Plot no., Kahramaa meter ref (capture only; workflow in Phase 7) |

### 5.2 Features

- Building ↔ unit hierarchy (aligned with architecture decision)
- Qatar district / zone classification lists
- Partner role tagging (owner, sponsor, guarantor, tenant)
- Unit form views with Qatar fields
- Property register list/report (basic)
- Demo data migration from Phase 1 units (Shop G-01, Office 203, Apartment 1204, Kiosk K-05)

### 5.3 Integrations

| App | Integration |
|-----|-------------|
| `sale_renting` | Units remain rentable; no regression on S00006 |
| `crm` | Opportunity can reference unit with Qatar fields visible |
| `contacts` | Partner roles and sponsor/guarantor links |
| `account` | No new posting logic in Phase 2 |

---

## 6. Scope — Out of Phase 2

| Item | Target phase |
|------|----------------|
| Unit reservation / hold / deposit | Phase 3 — `qatar_property_reservation` |
| PDC cheque lifecycle | Phase 4 — `qatar_property_pdc` |
| Rent escalation / installment schedules | Phase 5 — `qatar_property_rent_schedule` |
| Arabic/English lease PDF, tenant/owner statements | Phase 6 — `qatar_property_reports` |
| Tenant/owner portal | Phase 7 — `qatar_property_portal` |
| Kahramaa utility workflow | Phase 7 — `qatar_property_kahramaa` |

---

## 7. Deliverables

| # | Deliverable |
|---|-------------|
| 1 | Signed Phase 1.5 architecture decision document |
| 2 | `qatar_property_base` Odoo module (installable on Odoo.sh) |
| 3 | Qatar classification master data (districts, unit types) |
| 4 | Extended unit and partner forms with Qatar fields |
| 5 | Property register report |
| 6 | Demo data XML — migrated Phase 1 units with Qatar fields populated |
| 7 | Phase 2 UAT scenarios (Playwright) |
| 8 | Phase 2 documentation and handover notes |

---

## 8. UAT Scenarios (planned)

| # | Scenario | Proves |
|---|----------|--------|
| 2.1 | Install `qatar_property_base` on Phase 1 database clone | Module loads without breaking Phase 1 apps |
| 2.2 | Open Shop G-01 — Qatar fields visible and savable | Unit extension works |
| 2.3 | Assign owner/sponsor/guarantor on Doha Trading LLC | Partner role extensions work |
| 2.4 | Property register lists 4 demo units with districts | Report works |
| 2.5 | Confirm S00006 still valid — no accounting regression | Phase 1 rental trail intact |
| 2.6 | Create new rental on unit with Qatar fields — confirm + invoice | End-to-end still works |

---

## 9. Acceptance Criteria

1. Architecture decision document signed before development starts
2. Qatar classification fields operational on all 4 demo units
3. Owner / sponsor / guarantor roles captured on partners
4. Property register report produces correct unit list
5. **No regression** on S00006 accounting trail (INV/2026/00001, PBNK1/2026/00001)
6. Playwright Phase 2 suite passes (minimum scenarios 2.1–2.6)
7. Module installable on Odoo.sh from standalone Phase 2 repo

---

## 10. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Architecture pivot mid-build | Phase 1.5 gate with signed decision before sprint 1 |
| Overlap with `industry_real_estate` if pivot chosen | Model design follows gate outcome; no premature coding |
| Accounting regression | Automated Playwright check on S00006 after every merge |
| Demo data drift | Versioned demo XML in Phase 2 module; clone Phase 1 DB for UAT |
| Field scope creep | Phase 2 = capture fields only; workflows deferred to later phases |

---

## 11. Timeline (proposed)

| Week | Activity |
|------|----------|
| 1 | Phase 1.5 architecture workshop + sandbox comparison |
| 2 | Sign decision · module scaffold · model design review |
| 3–4 | Development — models, views, demo data |
| 5 | Property register · partner/unit forms polish |
| 6 | Playwright UAT · documentation · client review |

---

## 12. Future Phases (reference)

| Phase | Name | Addon |
|-------|------|-------|
| 3 | Reservation Engine | `qatar_property_reservation` |
| 4 | PDC Cheques | `qatar_property_pdc` |
| 5 | Rent Schedules | `qatar_property_rent_schedule` |
| 6 | Reports & Arabic | `qatar_property_reports` |
| 7 | Portal & Kahramaa | `qatar_property_portal`, `qatar_property_kahramaa` |

Full multi-phase roadmap remains in Phase 1 repo:  
`bright_property_rental_phase_1/docs/final_documentation_pack/PHASE2_ROADMAP.md`

---

## 13. References

- Phase 1 GitHub: https://github.com/Bright-Information-Systems/bright_property_rental_phase_1
- Phase 1 use cases UC-011–UC-016 (future phases): Phase 1 `USE_CASE_CATALOG.md`
- Phase 1 key records: S00006, S00007, 4 units, 2 buildings

---

**Bright Information Systems W.L.L** · Qatar Property Phase 2 Plan · June 2026
