# TALOS Unified V2.0.7 — Independent SIA verification (UAT)

- Adds **Verify directly with SIA** to every Compliance officer card.
- Sends the staff ID, C247 name, and licence number from the selected officer record to the tested direct-check Power Automate API.
- Displays official returned name, role, sector, status, expiry and verification time with a clear review/no-clearance outcome.
- Adds **Edit Officer C247 Profile** in the verification popup, using the exact Staff-ID URL already used elsewhere in Compliance.
- Existing 05:30 C247 reconciliation warning retained.
- Read-only: no SIA status or alert suppression, no SharePoint writes.
- The API currently trusts caller-supplied officer details; server-side source validation and authentication remain required before enabling alert suppression or wider release.
- Jotform session-detection improvement and CMS hover improvement remain pending; no reliable Jotform authentication probe is available through the current API.
