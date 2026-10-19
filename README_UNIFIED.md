# TALOS Unified Pilot V1.3 — Estate + Compliance r29

## What is integrated
- Estate Manager V1.2 retained as the home module (directory, review centre, detail, create/update, settings).
- Compliance r29, Incident Dashboard and Compliance Wallboard copied intact into `modules/compliance/`.
- One landing page, sidebar and shared TALOS login/session (`securitSiaAuthV1`).
- Each module is **lazy loaded** on its first selection, preserving separate scripts and API calls. Switching modules keeps previously loaded frames alive and preserves filters, rendered data, and in-flight loads.
- Module Refresh refreshes *only* that module. The Compliance API never loads just because Estate is opened.

## REQUIRED BEFORE DEPLOYMENT
In root `config.js`, provide `api.compliance` and `api.incidents` with the existing live API endpoints used by your current Compliance/Incident deployment. **Neither URL was supplied inside Compliance r29 ZIP** (it references a separate config.js). Estate config endpoints remain unchanged from your uploaded pilot. For safety, do not publish unprotected signed URLs to a public repo.

## Known limits / next phases
- This is an integration of the existing working frontends, not a rewrite into shared JavaScript components. The module isolation is intentional for a low-regression first merge. Both module frames perform their own session validation using the shared key.
- Wallboard loads separately from Compliance and makes its own compliance API request, as in r29. Consider common-data caching / one-request-per-session in a later revision.
- Legacy module headers and logout buttons remain visible within the iframe; shell logout is recommended. UI consolidation is future polish.
- R30: Adelar provider aliases, access-health checks, on-demand SIA check and auditable until-06:00 override. Third-party access deferred.
- TALOS V6: operational alert config/HTML email branding/unified Toolbox. Preserve live V5 notification configuration for now.
- API authorization is not enforced by hiding modules. Signed Power Automate URLs embedded in a static frontend are exposed; use an authenticated gateway before wider rollout.

## Test checklist
1. Serve the folder on HTTPS (e.g. existing GitHub Pages origin) and log into TALOS.
2. Confirm Estate opens and no Compliance API request is made until Master Compliance is clicked.
3. Click Compliance, validate one API response and all r29 filters, officer modal and certificate flows.
4. Return Estate: edits/search/sorting intact. Return Compliance: filtering state persists and API has not refetched.
5. Check independent Incidents/Wallboard navigation, and that Refresh targets the active module.
6. Check sign-out and session expiry and test site updates only in authorised pilot scope.
