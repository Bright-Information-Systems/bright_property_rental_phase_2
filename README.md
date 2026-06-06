# Qatar Property Rental Management — Phase 2 Plan

**Bright Information Systems W.L.L** · Odoo 19 Enterprise

| Item | Value |
|------|--------|
| **Status** | Planning — not started |
| **Prerequisite** | Phase 1 sign-off + Phase 1.5 architecture decision **signed** |
| **Phase 1 repo** | https://github.com/Bright-Information-Systems/bright_property_rental_phase_1 |
| **Phase 2 repo** | https://github.com/Bright-Information-Systems/bright_property_rental_phase_2 |
| **Primary addon** | `qatar_property_base` (planned — no code yet) |

> **No Phase 2 coding starts before Phase 1.5 architecture decision is signed.**

---

## Planning Documents

| Document | Description |
|----------|-------------|
| [docs/PHASE2_PLAN.md](docs/PHASE2_PLAN.md) | Phase 2 scope, deliverables, timeline, acceptance criteria |
| [docs/PHASE_1_5_ARCHITECTURE_DECISION.md](docs/PHASE_1_5_ARCHITECTURE_DECISION.md) | Architecture gate — sale_renting vs industry_real_estate (status: **Pending**) |
| [docs/PHASE_2_UAT_SCENARIOS.md](docs/PHASE_2_UAT_SCENARIOS.md) | UAT scenarios 2.1–2.6 including S00006 regression |
| [docs/PHASE_2_MODULE_DESIGN.md](docs/PHASE_2_MODULE_DESIGN.md) | Provisional technical design for `qatar_property_base` |
| [docs/screenshots/README.md](docs/screenshots/README.md) | Screenshot folder plan (Phase 1 ref, Phase 2 UAT, regression) |

---

## Repository Structure (planned)

Standalone Phase 2 repository (same pattern as Phase 1).

```
bright_property_rental_phase_2/     ← repo root (future addons_path on Odoo.sh)
├── README.md                       ← This file
├── .gitignore
├── docs/
│   ├── PHASE2_PLAN.md
│   ├── PHASE_1_5_ARCHITECTURE_DECISION.md
│   ├── PHASE_2_UAT_SCENARIOS.md
│   ├── PHASE_2_MODULE_DESIGN.md
│   └── screenshots/
│       ├── README.md
│       ├── phase1_uat/             ← optional reference copies
│       ├── phase2_uat/             ← Playwright evidence (future)
│       └── regression/             ← S00006 regression (future)
└── qatar_property_base/            ← future Odoo module (not created yet)
```

For now this folder contains **planning documents only** — no Odoo module code.

---

## Phase 2 at a Glance

| Attribute | Detail |
|-----------|--------|
| **Name** | Qatar Property Core |
| **Module** | `qatar_property_base` |
| **Duration** | 4–6 weeks (after Phase 1.5 gate) |
| **In scope** | Qatar fields, buildings, partner roles, property register |
| **Out of scope** | PDC, reservations, rent schedules, Arabic reports, portal |

---

## Phase 1 Reference

- **GitHub:** https://github.com/Bright-Information-Systems/bright_property_rental_phase_1
- **UAT:** 6/6 PASS · 30 screenshots · S00006 / INV/2026/00001 validated
- **Stack:** Native `sale_renting` only

---

**Bright Information Systems W.L.L** · June 2026
