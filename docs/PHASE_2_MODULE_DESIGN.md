# Phase 2 — Module Design (Provisional)

**Bright Information Systems W.L.L**  
**Module:** `qatar_property_base`  
**Status:** Provisional — finalize after Phase 1.5 architecture decision  
**Version target:** `19.0.1.0.0`

> **No Odoo module code created yet.** This document is the technical design reference for Phase 2 implementation.

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **No accounting override** | No custom `account.move` posting, no payment hooks, no revenue recognition logic |
| **Native integration** | Extend standard models; depend on `sale_renting`, `contacts`, `crm`, `account` (read-only) |
| **Phase scope only** | No reservation, PDC, portal, rent schedule, or Arabic reports in Phase 2 |
| **Architecture gate** | Model targets in §3 marked **provisional** until Phase 1.5 sign-off |
| **Demo safe** | Demo XML only; no cron, no controllers, no automated business workflows |

---

## 2. Module Overview — `qatar_property_base`

```python
# Provisional __manifest__.py structure (not created yet)
{
    'name': 'Qatar Property Base',
    'version': '19.0.1.0.0',
    'category': 'Real Estate',
    'summary': 'Qatar property classification, districts, and regulatory fields',
    'depends': [
        'base',
        'contacts',
        'product',
        'sale',
        'sale_renting',
        'crm',
        # 'industry_real_estate',  # TBD — only if Option B/C chosen in Phase 1.5
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/qatar_district.xml',
        'data/qatar_unit_type.xml',
        'data/qatar_zone.xml',
        'views/property_building_views.xml',
        'views/product_template_views.xml',
        'views/res_partner_views.xml',
        'reports/property_register_report.xml',
    ],
    'installable': True,
    'application': False,
}
```

---

## 3. Data Models

### 3.1 `property.building` (new)

**Purpose:** Qatar building master — optional hierarchy above units.

| Field | Type | Description |
|-------|------|-------------|
| `name` | Char | Building name (e.g. Al Rayyan Tower) |
| `code` | Char | Internal code |
| `district_id` | Many2one → `qatar.district` | Qatar district |
| `zone_id` | Many2one → `qatar.zone` | Zone / area (optional) |
| `street` | Char | Address line |
| `city` | Char | Default: Doha |
| `baladiya_ref` | Char | Baladiya reference |
| `rera_building_ref` | Char | RERA building reference |
| `plot_no` | Char | Plot number |
| `active` | Boolean | Archive flag |
| `unit_ids` | One2many | Link to units (see §3.2) |

**Provisional link to Phase 1:** Maps from `product.category` (Al Rayyan Tower, Doha Business Center).

**Architecture gate note:**

- **Option A:** `property.building` + `product.template.building_id` — primary design
- **Option B:** May defer to `industry_real_estate` building model — redesign required
- **Option C:** Building model shared; unit link varies by contract type

---

### 3.2 Unit model — `product.template` extension (provisional)

**Purpose:** Extend rentable products (Phase 1 units) with Qatar fields.

| Field | Type | Description |
|-------|------|-------------|
| `building_id` | Many2one → `property.building` | Building link |
| `district_id` | Many2one → `qatar.district` | District (can mirror building) |
| `zone_id` | Many2one → `qatar.zone` | Zone |
| `unit_type_id` | Many2one → `qatar.unit.type` | Shop, Office, Apartment, Kiosk, … |
| `unit_code` | Char | Internal unit code (ART-SHOP-G01, …) |
| `floor` | Char | Floor number |
| `area_sqm` | Float | Area in m² |
| `rera_unit_ref` | Char | RERA unit reference |
| `baladiya_ref` | Char | Baladiya reference |
| `plot_no` | Char | Plot number |
| `kahramaa_meter_ref` | Char | Kahramaa meter reference (capture only) |
| `is_rentable_unit` | Boolean | Computed from `rent_ok` — display helper |

**Phase 1 units to extend:**

| Unit | Code | Building |
|------|------|----------|
| Shop G-01 | ART-SHOP-G01 | Al Rayyan Tower |
| Office 203 | ART-OFFICE-203 | Al Rayyan Tower |
| Apartment 1204 | ART-APT-1204 | Al Rayyan Tower |
| Kiosk K-05 | DBC-KIOSK-K05 | Doha Business Center |

**Architecture gate — Option B alternative:** Replace `product.template` extensions with `property.property` extensions if pivot chosen. Field list remains; target model changes.

---

### 3.3 `res.partner` extension

**Purpose:** Qatar partner roles for property stakeholders.

| Field | Type | Description |
|-------|------|-------------|
| `is_property_owner` | Boolean | Property owner flag |
| `is_property_sponsor` | Boolean | Sponsor flag |
| `is_property_guarantor` | Boolean | Guarantor flag |
| `is_property_tenant` | Boolean | Tenant flag (complements customer) |
| `sponsor_id` | Many2one → `res.partner` | Linked sponsor |
| `guarantor_id` | Many2one → `res.partner` | Linked guarantor |
| `owner_id` | Many2one → `res.partner` | Linked owner (for tenant records) |
| `qatar_id_type` | Selection | QID, CR, Passport, … |
| `qatar_id_number` | Char | ID document number |

**No accounting fields** on partner in Phase 2.

---

### 3.4 Master data models (new)

#### `qatar.district`

| Field | Type |
|-------|------|
| `name` | Char |
| `code` | Char |

Examples: West Bay, Al Rayyan, Al Wakra, Industrial Area (TBD with client).

#### `qatar.zone`

| Field | Type |
|-------|------|
| `name` | Char |
| `district_id` | Many2one → `qatar.district` |

#### `qatar.unit.type`

| Field | Type |
|-------|------|
| `name` | Char |
| `code` | Char |

Examples: Shop, Office, Apartment, Kiosk, Warehouse, Villa.

---

## 4. Regulatory & Compliance Fields (capture only)

Phase 2 **captures** these fields — no workflow automation.

| Field | Model | Phase 2 scope |
|-------|-------|---------------|
| RERA ref | `property.building`, `product.template` | Store + display |
| Baladiya ref | `property.building`, `product.template` | Store + display |
| Plot no. | `property.building`, `product.template` | Store + display |
| Kahramaa meter ref | `product.template` | Store + display |

**Deferred:**

- Kahramaa transfer workflow → Phase 7 (`qatar_property_kahramaa`)
- RERA export / compliance reports → Phase 6 (`qatar_property_reports`)
- Legal validation of field requirements → Client workshop

---

## 5. Views (planned)

| View | Model | Notes |
|------|-------|-------|
| Building form / list / search | `property.building` | Menu under Real Estate or Rental |
| Unit form extension | `product.template` | Qatar tab on rentable products |
| Partner form extension | `res.partner` | Qatar Property tab |
| District / zone / unit type config | Master data | Settings or Configuration menu |

**No changes** to invoice, payment, or journal entry views in Phase 2.

---

## 6. Reports

### Property Register (Phase 2 only report)

| Column | Source |
|--------|--------|
| Unit name | `product.template.name` |
| Unit code | `unit_code` |
| Building | `building_id.name` |
| District | `district_id.name` |
| Unit type | `unit_type_id.name` |
| Rentable | `rent_ok` |
| RERA ref | `rera_unit_ref` |

Output: list view + PDF/QWeb (minimal).

---

## 7. Security

| Model | Access |
|-------|--------|
| `property.building` | Real Estate User / Manager groups (TBD) |
| `qatar.district`, `qatar.zone`, `qatar.unit.type` | Read: all internal users; Write: manager |
| Partner / product extensions | Inherit existing product/contact access |

No portal security in Phase 2.

---

## 8. Explicitly Out of Scope (Phase 2)

| Feature | Target module / phase |
|---------|----------------------|
| Unit reservation / hold / deposit | `qatar_property_reservation` — Phase 3 |
| PDC cheque lifecycle | `qatar_property_pdc` — Phase 4 |
| Rent escalation / schedules | `qatar_property_rent_schedule` — Phase 5 |
| Arabic/English lease PDF | `qatar_property_reports` — Phase 6 |
| Tenant / owner statements | `qatar_property_reports` — Phase 6 |
| Tenant / owner portal | `qatar_property_portal` — Phase 7 |
| Kahramaa workflow | `qatar_property_kahramaa` — Phase 7 |
| Accounting posting override | **Never** in base module |
| CRM stage automation | Phase 3+ |
| Approval workflow changes | Phase 1 scope only |

---

## 9. Dependencies & Integration Points

```
qatar_property_base
    ├── contacts      (res.partner extensions)
    ├── product       (product.template extensions)
    ├── sale_renting  (rentable units — read/extend only)
    ├── crm           (opportunity can reference units — no override)
    └── account       (dependency for report context only — no posting logic)
```

**No `account.move` inherit.**  
**No `account.payment` inherit.**  
**No `sale.order` state override.**

---

## 10. Demo Data (planned)

Migrate Phase 1 demo units with Qatar fields pre-filled:

- 2 buildings → `property.building` records
- 4 units → Qatar fields on products
- 2 customers → tenant role flags
- District / unit type master data

Demo XML path (future): `qatar_property_base/data/`

---

## 11. File Structure (future module)

```
qatar_property_base/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── property_building.py
│   ├── product_template.py
│   ├── res_partner.py
│   ├── qatar_district.py
│   ├── qatar_zone.py
│   └── qatar_unit_type.py
├── views/
│   ├── property_building_views.xml
│   ├── product_template_views.xml
│   └── res_partner_views.xml
├── reports/
│   └── property_register_report.xml
├── security/
│   └── ir.model.access.csv
└── data/
    ├── qatar_district.xml
    ├── qatar_unit_type.xml
    ├── qatar_building_demo.xml
    └── qatar_unit_demo.xml
```

---

## 12. Open Design Questions (resolve in Phase 1.5)

| # | Question | Blocks |
|---|----------|--------|
| 1 | `product.template` vs `property.property` as unit master? | Model implementation |
| 2 | Keep `product.category` for buildings or fully migrate to `property.building`? | Data migration |
| 3 | Add `industry_real_estate` as dependency? | Manifest depends |
| 4 | District master list — client-provided or BIS default? | Demo data |
| 5 | Menu placement — under Rental, Real Estate, or custom app root? | UX |

---

## References

- [PHASE2_PLAN.md](PHASE2_PLAN.md)
- [PHASE_1_5_ARCHITECTURE_DECISION.md](PHASE_1_5_ARCHITECTURE_DECISION.md)
- [PHASE_2_UAT_SCENARIOS.md](PHASE_2_UAT_SCENARIOS.md)

---

**Bright Information Systems W.L.L** · Phase 2 Module Design (Provisional) · June 2026
