# TALOS Unified V2.0.17 — C247 reporting UAT

Based on supplied V2.0.15 ZIP (not V2.0.16). Existing modules and endpoints retained.

- Adds C247 Reporting navigation and a standalone module.
- Wires both confirmed Power Automate UAT signed endpoints in config.js.
- Loads client/site, Labour Provider, and officer lookups; supports all independently selectable filters and date ranges.
- Groups displayed clients by TALOS site-name prefixes, retaining raw C247 client identities.
- Shows scheduled vs booked times and indicative late >5 min flags. No billing/payroll calculation.
- CSV export and local result search.
- UAT caveat: cross-origin browser POST requires Power Automate CORS support; terminal success does not prove browser availability.
- SECURITY: Endpoint signatures are exposed to anyone with access to config.js. Rotate before production.
- PERFORMANCE: client-group-only requests fetch all roster shifts for date range before local filtering; keep to short date ranges.
