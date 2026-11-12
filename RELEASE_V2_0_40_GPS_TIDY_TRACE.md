# TALOS Unified V2.0.40 — GPS Trace Presentation Controls

Based on the supplied 12 November 2026 Archive.zip (GPS module V2.0.39).

## Changes
- GPS dated-shift selection now sorts newest to oldest.
- Added `Tidy Trace Routes` toggle with mandatory acknowledgement and evidence-reference justification.
- Group historical checkpoint observations by site and checkpoint label; derive the dominant local cluster, with minimum 10 scans across 3 dates and at least 70% support. Reposition only outliers > max(25m, 3×median cluster deviation) when enabled. Ambiguous/inadequate history remains unchanged.
- Click individual displayed checkpoint or GPS dots to inspect locations and omit a point from the current projection, with a required reason; restore omitted points in the viewer.
- Original import records are never rewritten. Removed points only disappear from the plotted presentation, not the underlying evidence.
- Evidence ZIP now contains original and displayed positions, `adjustments.json`, updated manifest and a standalone viewer with Original GPS / Exported Projection switches.
- Standalone viewer retains satellite imagery when online and coordinate plot fallback.

## Scope and caution
- Tidy is a presentation aid and cannot establish a physical route or independently verify the tag was scanned at its claimed location.
- Historical reference points are estimated from records currently loaded in the browser; single/latest archive limits clustering reliability.
- The acknowledgement and omit reasons are recorded inside the Evidence Pack manifest/adjustment log. **No server-side audit logging endpoint was added**, so nothing is claimed to have been centrally logged.
- Manual omissions are session-local; evidence export carries the changes. Exported original records remain available via `selected_traces.csv`.
- Existing GPS archive URL and other TALOS services were left unchanged.

## UAT cases
1. Import repeated scans of same checkpoint over at least three days, including clearly inaccurate GPS outliers; verify Original / Tidied toggle.
2. Verify sparse / two-cluster checkpoint histories are left unmodified.
3. Click a dot and omit with reason, then restore; check affected trace only.
4. Export Evidence Pack and inspect `adjustments.json`, CSV, manifest and both standalone projections, including online satellite/offline fallback.
5. Verify no dated shifts auto-selected, and sorted newest to oldest.
6. Test real browser with your existing archive connection before production deployment.
