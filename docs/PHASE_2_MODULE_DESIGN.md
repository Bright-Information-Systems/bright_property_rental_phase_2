# Phase 2 — Module Design

**Bright Information Systems W.L.L**  
**Module:** `qatar_property_base`  
**Foundation:** `industry_real_estate` (Option B — signed in Phase 1.5)  
**Version target:** `19.0.1.0.0`

> **No Odoo module code created yet.** Client approval required before implementation.

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **Extend industry package** | Do not recreate building/unit master — extend `industry_real_estate` models |
| **No accounting override** | No custom `account.move` posting, no payment hooks, no revenue recognition logic |
| **Qatar layer only** | `qatar_property_base` adds Qatar fields, districts, partner roles, property register |
| **Phase scope only** | No reservation, PDC, portal, rent schedule, or Arabic reports in Phase 2 |
| **Demo safe** | Demo XML only; no cron, no controllers, no automated business workflows |

---

## 2. Module Overview — `qatar_property_base`

```python
# Provisional __manifest__.py structure (not created yet)
{
    'name': 'Qatar Property Base',
    'version': '19.0.1.0.0',
    'category': 'Real Estate',
    'summary': 'Qatar property extensions on industry_real_estate',
    'depends': [
        'industry_real_estate',
        'contacts',
        'crm',
        'account',
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/qatar_district.xml',
        'data/qatar_zone.xml',
        'data/qatar_unit_type.xml',
        'views/x_buildings_views.xml',
        'views/account_analytic_account_views.xml',
        'views/res_partner_views.xml',
        'reports/property_register_report.xml',
        'data/qatar_demo_buildings.xml',
        'data/qatar_demo_units.xml',
        'data/qatar_demo_partners.xml',
    ],
    'installable': True,
    'application': False,
}
```

**Not a dependency:** `sale_renting` — Phase 2+ uses `industry_real_estate` subscription contracts.

---

## 3. Official Industry Models (from `industry_real_estate`)

| Model | Role | Qatar extension |
|-------|------|-----------------|
| `x_buildings` | Building master | Add Qatar district, RERA, Baladiya, plot fields |
| `account.analytic.account` (Properties plan) | Unit / property | Add Qatar classification, unit code, Kahramaa ref |
| `sale.order` | Subscription contract | Link via `x_account_analytic_account_id` (industry field) — read only in Phase 2 |
| `x_meters` / `x_meter_reading` | Utilities | No change in Phase 2 — Kahramaa workflow in Phase 7 |
| `res.partner` | Tenants, owners | Add Qatar partner roles |

---

## 3.1 `x_buildings` extension

Extend Odoo industry building model — **do not create** a parallel `property.building`.

| Field (new on `x_buildings`) | Type | Description |
|------------------------------|------|-------------|
| `qatar_district_id` | Many2one → `qatar.district` | Qatar district |
| `qatar_zone_id` | Many2one → `qatar.zone` | Zone / area |
| `qatar_building_code` | Char | Internal code (e.g. ART, DBC) |
| `qatar_rera_building_ref` | Char | RERA building reference |
| `qatar_baladiya_ref` | Char | Baladiya reference |
| `qatar_plot_no` | Char | Plot number |

**Phase 2 demo buildings:**

| Name | Code | Maps from Phase 1 |
|------|------|-------------------|
| Al Rayyan Tower | ART | `product.category` Al Rayyan Tower |
| Doha Business Center | DBC | `product.category` Doha Business Center |

---

## 3.2 Unit — `account.analytic.account` extension (Properties plan)

Units are analytic accounts on the **Properties** plan — not `product.template`.

| Field (new) | Type | Description |
|-------------|------|-------------|
| `qatar_unit_code` | Char | ART-SHOP-G01, ART-OFF-203, … |
| `qatar_district_id` | Many2one → `qatar.district` | District |
| `qatar_zone_id` | Many2one → `qatar.zone` | Zone |
| `qatar_unit_type_id` | Many2one → `qatar.unit.type` | Shop, Office, Apartment, Kiosk |
| `qatar_floor` | Char | Floor number |
| `qatar_area_sqm` | Float | Area m² |
| `qatar_rera_unit_ref` | Char | RERA unit reference |
| `qatar_baladiya_ref` | Char | Baladiya reference |
| `qatar_plot_no` | Char | Plot number |
| `qatar_kahramaa_meter_ref` | Char | Kahramaa meter (capture only) |

Uses existing industry fields: `x_property_building_id`, `x_property_type`, `x_property_address`.

**Phase 2 demo units:**

| Unit | Code | Building | Industry `x_property_type` |
|------|------|----------|--------------------------|
| Shop G-01 | ART-SHOP-G01 | Al Rayyan Tower | Shop |
| Office 203 | ART-OFF-203 | Al Rayyan Tower | Office |
| Apartment 1204 | ART-APT-1204 | Al Rayyan Tower | Apartment |
| Kiosk K-05 | DBC-KIOSK-K05 | Doha Business Center | Kiosk |

---

## 3.3 `res.partner` extension

| Field | Type | Description |
|-------|------|-------------|
| `qatar_is_property_owner` | Boolean | Owner flag |
| `qatar_is_property_sponsor` | Boolean | Sponsor flag |
| `qatar_is_property_guarantor` | Boolean | Guarantor flag |
| `qatar_is_property_tenant` | Boolean | Tenant flag |
| `qatar_sponsor_id` | Many2one → `res.partner` | Linked sponsor |
| `qatar_guarantor_id` | Many2one → `res.partner` | Linked guarantor |
| `qatar_owner_id` | Many2one → `res.partner` | Linked owner |
| `qatar_id_type` | Selection | QID, CR, Passport |
| `qatar_id_number` | Char | ID document number |

Industry package already provides `x_guarant_partner_id` on `sale.order` — align with Qatar partner roles.

---

## 3.4 Master data models (new — Qatar only)

#### `qatar.district` / `qatar.zone` / `qatar.unit.type`

Same as prior design — BIS-owned master data, not part of industry package.

---

## 4. Regulatory Fields (capture only)

| Field | Target model |
|-------|--------------|
| RERA ref | `x_buildings`, `account.analytic.account` |
| Baladiya ref | `x_buildings`, `account.analytic.account` |
| Plot no. | `x_buildings`, `account.analytic.account` |
| Kahramaa meter ref | `account.analytic.account` |

---

## 5. Views (planned)

| View | Model |
|------|-------|
| Building form extension | `x_buildings` |
| Unit / property form extension | `account.analytic.account` (Properties plan) |
| Partner form extension | `res.partner` |
| District / zone / unit type config | `qatar.*` master data |

**No changes** to subscription invoice posting logic in Phase 2.

---

## 6. Reports

### Property Register

| Column | Source |
|--------|--------|
| Unit name | `account.analytic.account.name` |
| Unit code | `qatar_unit_code` |
| Building | `x_property_building_id.x_name` |
| District | `qatar_district_id.name` |
| Unit type | `qatar_unit_type_id.name` or `x_property_type` |
| Contract status | From industry computed rental status |
| RERA ref | `qatar_rera_unit_ref` |

---

## 7. Explicitly Out of Scope (Phase 2)

| Feature | Target module / phase |
|---------|----------------------|
| Standalone building/unit model | **Not created** — use industry models |
| `sale_renting` integration | **Not used** — industry subscriptions |
| Reservation / PDC / portal / reports | Phases 3–7 (`qatar_property_*`) |
| Accounting posting override | **Never** |

---

## 8. Dependencies & Integration

```
industry_real_estate (Odoo official)
    └── qatar_property_base
            ├── x_buildings (Qatar fields)
            ├── account.analytic.account (Qatar fields)
            ├── res.partner (Qatar roles)
            └── qatar.district / zone / unit.type (master data)
```

**Future addons** (all depend on `qatar_property_base`):

- `qatar_property_reservation`
- `qatar_property_pdc`
- `qatar_property_rent_schedule`
- `qatar_property_reports`
- `qatar_property_portal`
- `qatar_property_kahramaa`

---

## 9. Demo Data (planned)

**New records** on industry model — not migration of Phase 1 `product.template` rows:

- 2 × `x_buildings` (Al Rayyan Tower, Doha Business Center)
- 4 × `account.analytic.account` (Shop G-01, Office 203, Apartment 1204, Kiosk K-05)
- 2 × tenants (Doha Trading LLC, Gulf Pharmacy W.L.L) with Qatar partner roles
- 1 × subscription contract demo (replaces S00006 reference for Phase 2 UAT)
- District / unit type master data

Phase 1 records (S00006, INV/2026/00001) remain in Phase 1 repo as historical UAT only.

---

## 10. File Structure (future module)

```
qatar_property_base/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── x_buildings.py
│   ├── account_analytic_account.py
│   ├── res_partner.py
│   ├── qatar_district.py
│   ├── qatar_zone.py
│   └── qatar_unit_type.py
├── views/
│   ├── x_buildings_views.xml
│   ├── account_analytic_account_views.xml
│   └── res_partner_views.xml
├── reports/
│   └── property_register_report.xml
├── security/
│   └── ir.model.access.csv
└── data/
    ├── qatar_district.xml
    ├── qatar_demo_buildings.xml
    ├── qatar_demo_units.xml
    └── qatar_demo_partners.xml
```

---

## References

- [PHASE_1_5_ARCHITECTURE_DECISION.md](PHASE_1_5_ARCHITECTURE_DECISION.md) — Option B decision
- [PHASE2_PLAN.md](PHASE2_PLAN.md)
- Industry module: `industry_real_estate-19.0.1.3/`

---

**Bright Information Systems W.L.L** · Phase 2 Module Design · June 2026
