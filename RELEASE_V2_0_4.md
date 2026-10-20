# TALOS Unified V2.0.4 — Compliance contractor fallback

Based on V2.0.3. When an officer has a matching Rolling Staff DB row but its Contractor is blank, Compliance and Compliance Wallboard use **SecurIT** as the provider. If no staff record matches the Staff ID, the provider remains **Not available** (unknown), avoiding falsely classifying unmatched officers as direct employees. This affects provider grouping and declaration/PPAC applicability; no changes to the backend SharePoint records, API endpoints or CMS submission logic.

Browser UAT required: blank contractor with known staff row, nonblank labour provider, and absent staff row.
