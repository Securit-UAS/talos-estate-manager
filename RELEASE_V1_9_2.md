# TALOS Unified V1.9.2 — Estate Create/Update contract fix

- Update API requests no longer send `email`/`token`, because they are disallowed by the current Update trigger schema. Security note: this does not provide backend authorisation; protect the Update flow before broader rollout.
- Update latitude/longitude are serialised as strings, matching the Update trigger schema; Create still uses numbers.
- Create API continues to receive session `email`/`token`.
- New-site form defaults `active` to `Yes`, while the user can choose `No`. The Create request sends the chosen value rather than hardcoding `NO`.
- Removed a client-only check that prevented creating active Retail sites.
- Updated sidebar version label and module build identifiers.

**Deployment check:** Ensure Create flow SharePoint `Active` field uses `triggerBody()?['active']` or equivalent and is not hardcoded to No; ensure response's `active` reflects the saved value. Test a dummy site and confirm SharePoint data.

**Security:** The Update API currently accepts requests without an authenticated session claim in its schema; the client change merely matches that contract and is not a substitute for server-side authorisation.
