# TALOS Unified V2.0 — CMS Reporting UAT

## Delivered
- CMS Reporting menu module with site-aware operational submission form.
- Live POST integration to existing TALOS CMS Submit API and Talos DB v2.
- Source Power App v2.2 issue taxonomy and conditional issue questions.
- Optional client notification control shown but disabled.
- Dashboard/register with searching, filtering, status, and event detail.
- Accurate empty/unconfigured state until CMS Read API exists; current-session submissions display in browser only.
- Existing Estate, Compliance, Incidents and Wallboard retained.

## Remaining before replacing Desktop Power App
1. Add authenticated CMS Read API for latest Talos DB v2 records, map returned JSON.
2. Add confirm/acknowledge API and map Power App confirmation rules.
3. Source officer/contractor options from Rolling Staff DB (currently manual entry).
4. Verify conditional issue fields and Talos History calculation against live workflow.
5. Test with Pinewood Lodge; confirm V5 notification routing by category.
6. Enforce server-side authorisation of all flows and rotate signed URLs before production.

## Note
The CMS module is a **controlled UAT** build. It does not claim that the replacement of Talos Desktop is complete.
