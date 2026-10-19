# TALOS Unified V1.8 — visual and wallboard pilot

- Added mouse-clickable **Full screen wallboard** button within TALOS shell. Browser Fullscreen API expands the wallboard iframe to fill the entire monitor, hides sidebar/header, and keeps data and rotation state in place.
- Added persistent **Exit full screen** mouse button, no keyboard required; Escape remains optional. Browser fullscreen permission is required.
- Adjusted contrast of embedded Compliance and Incident modal metadata/card surfaces in dark mode.
- Removed redundant module placeholder message above embedded dashboards.
- Updated module version query string to 1.8 to prompt fresh module loads.

## Manual checks
1. Verify Wallboard loads data and auto-rotates; click Full screen wallboard, then mouse-click Exit full screen.
2. Verify wallboard still shows data, loading spinner and provider controls in full screen.
3. Check dark-mode officer booking panels and Incident modal metadata tiles for readable text.
4. Recheck light mode and all three embedded modules.

API and login settings are carried forward unchanged from V1.7. This is a controlled pilot, not a production security review.

## Wallboard audit additions
- SIA now displays **Other critical SIA** so conflicts, not-found, expiry/review and remaining critical outcomes cover the entire officer population without silently omitting name mismatches or expired licences.
- Appraisal **Review/action** now counts amber reviews only. Critical action items are reported separately as **Other action required**, avoiding double counting.
- SIA and appraisal reconciliation indicators show accounted officers against the eligible total.
- Overall Review subtitle explicitly separates amber review from blue due/renewal.
- Wallboard supports vertical scrolling on tighter display resolutions rather than cropping its extra reconciliation figures.
