# TALOS Unified V2.0.23 — Handover API cache fix (UAT)

- Cache-bust the root `config.js` in `index.html` (previously unversioned).
- Cache-bust the iframe copy of `config.js` in `modules/handovers/index.html`.
- Version-bump the app and handover module assets.
- If the parent page sends an empty handover API value, fall back to the freshly loaded, same-origin TALOS config inside the handover iframe. TALOS session email/token still originate from the parent; the API retains server-side validation.
- Retain the V2.0.22 email-style popup and other modules unchanged.
- UAT only: rotate browser-exposed signed flow URLs and verify role/site access restrictions before production.
