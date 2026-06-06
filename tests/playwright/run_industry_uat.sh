#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
export ODOO_URL="${ODOO_URL:-http://127.0.0.1:9020}"
export ODOO_DB="${ODOO_DB:-qatar_property_industry_uat}"
export ODOO_LOGIN="${ODOO_LOGIN:-admin}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-/tmp/npm-cache-qatar-industry-uat}"
if [[ -z "${ODOO_PASSWORD:-}" ]]; then
  echo "ERROR: Set ODOO_PASSWORD before running industry UAT." >&2
  exit 1
fi
npm install --no-bin-links
node node_modules/@playwright/test/cli.js test tests/industry_real_estate_uat.spec.js "$@"
