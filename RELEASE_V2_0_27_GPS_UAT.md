# TALOS Unified V2.0.27 — GPS / Checkpoint UAT

- GPS Logs & Checkpoint placeholder now opens the replay as a first-class navigation module inside the existing TALOS shell.
- Retains seven-day, seven-trace selection; shift-level evidence counts; timeline scrubbing; and playback speed controls.
- Reuses parent theme messages and adds light appearance bridge.
- Does NOT ship the real Ares GPS and checkpoint evidence in the public website package. The archive is NOT connected yet.
- Data may be imported using the module CSV/JSON control for local UAT.
- Production data route: authenticated TALOS backend proxy at `/api/checkpoints/archive` returning JSON. Do not expose a Power Automate HTTP trigger URL, SharePoint file permission or secret in browser source.
- Existing Estate, Compliance, C247, CMS and Handovers module files are retained. No changes to their flow endpoints.
- Confirm TALOS module access is enforced server-side before connecting the archive; current shell UI gating alone is not sufficient.
- The source `modules/gps/index.html` contains no embedded case evidence.

## Flow recommendation
Create a SharePoint archive-read operation that lists metadata for `Shared Documents/TALOS/Checkpoint Archive/Raw Captures`, filters by requested date-range, retrieves matching CSVs (server-side), deduplicates and parses them, and responds as JSON. For initial testing, manually verify retrieval of a single latest CSV before implementing date filters. Validate 200-response with count/timestamp, handle pagination and CSV headers, cap payload size and check per-user permissions. Avoid opening unprotected HTTP-triggered flows to browsers.
