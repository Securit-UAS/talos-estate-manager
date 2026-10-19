# TALOS Unified V2.0.1 — CMS form lookup improvements

- Free-text site names remain supported even when the site isn't in Estate. Unlisted sites display an explicit manual-entry hint; the existing backend unmatched-site alert remains responsible for escalation.
- Officer options are now populated from a new optional `cmsStaffLookup` read-only API (Rolling Staff DB), filtered client-side by exact selected Estate site name. Unknown sites require manual officer entry.
- When a suggested officer is selected, Contractor/Labour Provider is automatically derived from that officer's Rolling Staff DB record. The field is always manually editable. Provider suggestions use unique provider values from the staff lookup data.
- If the lookup API isn't configured or fails, reporting still works with manual officer and provider entry. Existing submission path and authentication are unchanged.

## Required backend for live officer/provider suggestions
Add `api.cmsStaffLookup` in `config.js` once created. HTTP POST accepts `{email, token}` (UAT session fields); return an array or `{ "value": [ {"SiteName":"Pinewood Lodge", "FullName":"Example Officer", "Contractor":"Example Provider", "StaffID":"1234"} ] }`. Fields are case-sensitive on the recommended contract. This should be read-only and retrieve current entries from the existing **Rolling Staff DB**; the Power App used `Filter('Rolling Staff DB', SiteName = selectedSite.Title)` and derived Contractor by `FullName` (with `Staff Contractor List` fallback). Filtering for assigned site is done in this version of frontend. Secure the endpoint before production; the current signed URL UAT architecture isn't authenticated by the webpage alone.

**No live staff lookup API URL was supplied or found in the existing V2.0 package.** Therefore officer and provider suggestions will remain empty until that endpoint is built and configured. The form can still submit reports successfully using manual values.
