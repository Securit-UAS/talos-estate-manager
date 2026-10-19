# TALOS Unified V1.6 — UI stabilisation
- Estate, Compliance and Incidents stay in the same application; no API endpoint or operational decision logic changes.
- Versioned embedded module URLs (build=1.6) to prevent old Wallboard JavaScript remaining in browser cache.
- Cross-module light/dark theme sync through same-origin messages; added scoped dark styling for Compliance/Incidents.
- Estate dropdowns now inherit matching native popup colour scheme and option colours.
- Wallboard displays a prominent spinner and progress message during initial data retrieval.
- Note: manager suggestions still come from existing Estate entries, not a dedicated manager directory. Multi-address manager records need separate data clean-up/editor design.
- Deployment: upload ALL files, then hard refresh once. Pilot testing needed; syntax checking does not prove runtime/API behaviour.
