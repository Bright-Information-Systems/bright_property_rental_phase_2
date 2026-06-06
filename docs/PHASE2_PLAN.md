# Qatar Property — Phase 2 Plan

**Bright Information Systems W.L.L**  
**Based on:** Phase 1 UAT closure + Phase 1.5 architecture decision (June 2026)  
**Status:** Planning  
**Foundation:** `industry_real_estate` (Odoo official)  
**Target addon:** `qatar_property_base`

---

## 1. Phase 2 Summary

Phase 2 introduces **Qatar Property Core** — Qatar-specific extensions on top of Odoo official **`industry_real_estate`**.

| Attribute | Detail |
|-----------|--------|
| **Name** | Qatar Property Core |
| **Foundation** | `industry_real_estate` (Option B — Phase 1.5 decision) |
| **Extension module** | `qatar_property_base` |
| **Priority** | P0 |
| **Estimated duration** | 4–6 weeks |
| **Depends on** | Phase 1.5 decision signed · client approval before coding |

**Phase 2 does not include:** PDC, reservations, rent schedules, Arabic reports, or portal — those are Phases 3–7.

---

## 2. Prerequisites

### 2.1 Phase 1 (complete — historical reference)

- 6/6 Playwright UAT scenarios PASS on native `sale_renting` (workflow validation)
- **No custom property module** in Phase 1 — only demo data module
- Phase 1 records (S00006, INV/2026/00001, S00007) remain **historical UAT evidence**
- Phase 1 repo: https://github.com/Bright-Information-Systems/bright_property_rental_phase_1

### 2.2 Phase 1.5 — Architecture Decision (complete)

| Decision | Value |
|----------|--------|
| **Selected option** | **B — Pivot to `industry_real_estate`** |
| **Sandbox** | `qatar_property_architecture_sandbox` — install successful |
| **Phase 1 UAT DB** | Not modified |
| **Document** | [PHASE_1_5_ARCHITECTURE_DECISION.md](PHASE_1_5_ARCHITECTURE_DECISION.md) |

**Rejected permanently:** Cybrosys Advanced Property Management.

---

## 3. Business Objective

Deliver Qatar-specific property data on the **official Odoo real estate foundation**:

- Extend `x_buildings` and industry property units with Qatar regulatory metadata
- Track owner, sponsor, and guarantor on partners
- Classify units by district, zone, type, RERA, Baladiya, Plot, Kahramaa
- Property register report on industry model
- **New demo records** on `industry_real_estate` (not migration of Phase 1 products)

---

## 4. Technical Objective

Build `qatar_property_base` as the Qatar extension layer — **not** a standalone property system.

**Principles:**

- **Depend on `industry_real_estate`** — buildings, units, subscription contracts from industry package
- Add Qatar fields via Python model inheritance on `x_buildings`, `account.analytic.account`, `res.partner`
- No parallel accounting silo; no posting overrides
- All future `qatar_property_*` modules build on this stack

**Planned module chain:**

```
industry_real_estate
  → qatar_property_base (Phase 2)
  → qatar_property_reservation (Phase 3)
  → qatar_property_pdc (Phase 4)
  → qatar_property_rent_schedule (Phase 5)
  → qatar_property_reports (Phase 6)
  → qatar_property_portal + qatar_property_kahramaa (Phase 7)
```

---

## 5. Scope — In Phase 2

### 5.1 Data model

| Area | Model |
|------|-------|
| Building | Extend `x_buildings` (industry) |
| Unit | Extend `account.analytic.account` — Properties plan (industry) |
| Contract | Industry `sale.order` subscription (read/integrate — no override) |
| Partner roles | Extend `res.partner` |
| Qatar master data | `qatar.district`, `qatar.zone`, `qatar.unit.type` (new) |

### 5.2 Features

- Qatar fields on buildings and units (industry models)
- Partner owner / sponsor / guarantor / tenant roles
- Property register report
- Demo data: 2 buildings, 4 units, 2 tenants — **new industry records**
- Remap conceptually from Phase 1 units: Shop G-01, Office 203, Apartment 1204, Kiosk K-05

### 5.3 Integrations

| App | Integration |
|-----|-------------|
| `industry_real_estate` | **Required foundation** |
| `sale_subscription` | Contracts via industry package |
| `crm` | CRM + property opportunity flow (industry) |
| `contacts` | Partner Qatar roles |
| `account` | Analytic accounts — no posting override |

---

## 6. Scope — Out of Phase 2

| Item | Target phase |
|------|----------------|
| `sale_renting` product/category model | Phase 1 only (historical) |
| Unit reservation | Phase 3 — `qatar_property_reservation` |
| PDC cheques | Phase 4 — `qatar_property_pdc` |
| Rent schedules | Phase 5 — `qatar_property_rent_schedule` |
| Arabic reports | Phase 6 — `qatar_property_reports` |
| Portal / Kahramaa | Phase 7 |

---

## 7. Deliverables

| # | Deliverable |
|---|-------------|
| 1 | Phase 1.5 architecture decision (Option B) — done |
| 2 | Client approval of pivot |
| 3 | `qatar_property_base` module (depends on `industry_real_estate`) |
| 4 | Qatar master data + demo XML on industry models |
| 5 | Property register report |
| 6 | Phase 2 UAT scenarios (industry subscription flow) |
| 7 | Phase 2 documentation |

---

## 8. UAT Scenarios (to be revised for industry flow)

Phase 1 scenarios (S00006 regression) are **replaced** by industry-model UAT. See [PHASE_2_UAT_SCENARIOS.md](PHASE_2_UAT_SCENARIOS.md) — revision required before coding.

| # | Scenario (revised target) |
|---|--------------------------|
| 2.1 | Install `industry_real_estate` + `qatar_property_base` on Phase 2 sandbox DB |
| 2.2 | Shop G-01 property — Qatar fields on analytic account |
| 2.3 | Partner roles on Doha Trading LLC |
| 2.4 | Property register — 4 industry units |
| 2.5 | New subscription contract + invoice (replaces S00006 regression) |
| 2.6 | CRM → subscription quotation (replaces S00007 flow) |

---

## 9. Acceptance Criteria

1. Client approves Option B pivot before development
2. `qatar_property_base` installs with `industry_real_estate`
3. Qatar fields on all 4 demo units (`account.analytic.account`)
4. Partner roles operational
5. Property register lists 4 units across 2 buildings
6. New subscription demo contract + invoice UAT passes
7. Module installable on Odoo.sh

---

## 10. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| 136+ modules from industry package | Document Odoo.sh footprint; plan Enterprise dependencies |
| Different contract model vs Phase 1 | New UAT on subscription flow; Phase 1 as historical reference |
| Studio `x_*` models | Use Python inherit in `qatar_property_base` for stable extensions |
| UAT scenario rewrite | Revise `PHASE_2_UAT_SCENARIOS.md` before sprint 1 |

---

## 11. Timeline (proposed)

| Week | Activity |
|------|----------|
| 1 | Client sign-off · revise UAT scenarios · module scaffold |
| 2 | `qatar_property_base` models — extend industry models |
| 3–4 | Views, demo data, property register |
| 5 | Subscription demo contract UAT |
| 6 | Playwright Phase 2 suite · documentation |

---

## 12. Future Phases

| Phase | Addon | Depends on |
|-------|-------|------------|
| 3 | `qatar_property_reservation` | `qatar_property_base` |
| 4 | `qatar_property_pdc` | `qatar_property_base` |
| 5 | `qatar_property_rent_schedule` | `qatar_property_base` |
| 6 | `qatar_property_reports` | `qatar_property_base` |
| 7 | `qatar_property_portal`, `qatar_property_kahramaa` | `qatar_property_base` |

---

## 13. References

- Phase 1: https://github.com/Bright-Information-Systems/bright_property_rental_phase_1
- Phase 2: https://github.com/Bright-Information-Systems/bright_property_rental_phase_2
- [PHASE_1_5_ARCHITECTURE_DECISION.md](PHASE_1_5_ARCHITECTURE_DECISION.md)
- [PHASE_2_MODULE_DESIGN.md](PHASE_2_MODULE_DESIGN.md)

---

**Bright Information Systems W.L.L** · Qatar Property Phase 2 Plan · June 2026
