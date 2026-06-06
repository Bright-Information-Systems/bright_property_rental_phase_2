# Screenshots — Qatar Property Phase 2

**Bright Information Systems W.L.L**

This folder will store visual evidence for Phase 2 UAT and Phase 1 regression checks.

---

## Planned Structure

```
docs/screenshots/
├── README.md                    ← This file
├── phase1_uat/                  ← Phase 1 reference screenshots (optional copy for regression context)
├── phase2_uat/                ← Phase 2 Playwright UAT screenshots (primary)
└── regression/                  ← S00006 accounting regression evidence
```

---

## Phase 1 UAT Screenshots (reference)

Canonical Phase 1 screenshots live in the Phase 1 repository:

`bright_property_rental_phase_1/docs/screenshots/phase1_uat/` (30 files, `00`–`29`)

Optional copies may be placed in `phase1_uat/` here for side-by-side regression comparison during Phase 2 UAT. Do not duplicate unless needed for offline Phase 2 documentation pack.

**Key Phase 1 evidence for regression:**

| File | Record |
|------|--------|
| `04_rental_order_confirmed.png` | S00006 confirmed |
| `07_invoice_posted.png` | INV/2026/00001 |
| `08_payment_registered.png` | PBNK1/2026/00001 |
| `09_journal_entry_validation.png` | Journal lines |
| `10_partner_ledger_validation.png` | Partner ledger |

---

## Phase 2 Playwright Screenshots (planned)

Target folder: `docs/screenshots/phase2_uat/`

| File (planned) | Scenario | Description |
|----------------|----------|-------------|
| `00_install_module.png` | 2.1 | `qatar_property_base` installed |
| `01_shop_g01_qatar_fields.png` | 2.2 | Shop G-01 Qatar fields |
| `02_partner_roles.png` | 2.3 | Owner / sponsor / guarantor on partner |
| `03_property_register.png` | 2.4 | Property register — 4 units |
| `04_s00006_regression.png` | 2.5 | S00006 still valid |
| `05_new_rental_invoice.png` | 2.6 | New rental + invoice |

Additional screenshots may be added per Playwright spec steps.

---

## Regression Screenshots for S00006 (planned)

Target folder: `docs/screenshots/regression/`

Dedicated evidence proving Phase 1 accounting trail unchanged after Phase 2 changes:

| Check | Record | Evidence |
|-------|--------|----------|
| Rental order | S00006 | State `sale`, customer, lines |
| Invoice | INV/2026/00001 | Posted, 22,500 QAR |
| Payment | PBNK1/2026/00001 | Reconciled |
| Journal | JE from invoice | Receivable + revenue lines |

Capture before and after Phase 2 module install for comparison when required.

---

## Conventions

- **Format:** PNG
- **Naming:** `{index}_{short_description}.png` (lowercase, underscores)
- **Index:** Document in `docs/SCREENSHOT_INDEX.md` (to be created during Phase 2 UAT)
- **Automation:** Playwright helpers save to `phase2_uat/` (same pattern as Phase 1)
- **Git:** Commit screenshots with UAT report updates; no secrets in filenames

---

## References

- [PHASE_2_UAT_SCENARIOS.md](../PHASE_2_UAT_SCENARIOS.md)
- Phase 1 screenshot index: `bright_property_rental_phase_1/docs/SCREENSHOT_INDEX.md`

---

**Bright Information Systems W.L.L** · June 2026
