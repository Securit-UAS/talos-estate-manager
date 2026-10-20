# TALOS Unified V2.0.6 — CMS Wall and Automatic Refresh

Built on V2.0.5 with existing APIs unchanged.

- Removed Awaiting Acknowledgement metric from individual officer history (register and wall still track outstanding reports).
- Native browser tooltip for full details only when hovering the truncated incident description; keyboard focus also reveals it.
- Automatic Reports Read API refresh every 90 seconds; manual Refresh remains available. Concurrent refreshes guarded.
- Dedicated CMS wall view tab, with full-screen control; displays all unacknowledged incidents in rolling 60 days and acknowledged reports from last 24h, max 35 visible rows; 60-day count and 24-hour count. Same API, no new flow.
- Confirmation state remains read-only pending Confirmation API.

UAT: check hover exact scope, 90-second updated time, wall full screen, existing submission and officer matching.
