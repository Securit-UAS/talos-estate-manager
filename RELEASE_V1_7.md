# TALOS Unified V1.7

- Theme CSS corrections in Compliance, Incidents and Wallboard, with explicit dark incident table rows and light Wallboard skin.
- Removed duplicate in-module navigation visually; hidden navigation elements retained so existing click event registration cannot break dashboards.
- Preserved Wallboard provider rotation and loading spinner.
- API, authentication and Estate operations unchanged.
- Deployment: overwrite entire site, hard refresh. Do not publish unprotected signed API URLs publicly.
- Static checks only: verify both themes with live data, modals, tables and Wallboard.
