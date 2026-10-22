# TALOS Unified V2.0.21 — Shift Handovers API connected (UAT)

- Connected `window.TALOS_CONFIG.api.handoverRead` to the newly configured Power Automate Shift Handovers read API.
- All other TALOS API endpoints, existing modules, and business logic are retained from V2.0.20.
- The read-only handover dashboard sends `email`, `token`, and `action: listHandovers`. The Power Automate flow must validate the session before Get items, and return 401 without reading SharePoint for invalid sessions.
- Expected successful Response: HTTP 200 with a JSON array of SharePoint list items (or a JSON object with a `value` array).
- A deliberately invalid token has been confirmed to receive HTTP 401; a valid-session browser load still needs testing.
- **UAT only:** the signed URL is browser-visible. Rotate all exposed signatures and review role/site authorisation and returned personal-data fields before production. Existing TALOS session validation checks authentication, not necessarily authorisation for every site.
- When deploying, replace the entire website directory and hard-refresh the browser. Sign in and click Shift handovers.
