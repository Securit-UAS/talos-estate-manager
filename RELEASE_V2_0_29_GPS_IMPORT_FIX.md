# TALOS Unified V2.0.29 — GPS import UAT fix

- GPS import now uses a visible native browser file input (and clickable label). This does not depend on a hidden input being triggered by JavaScript in an iframe.
- Multiple downloaded SharePoint CSV or JSON files can be selected in one operation; imported records are combined and deduplicated in memory.
- Invalid/empty imports report an explicit error.
- Updated footer to V2.0.29 and cache-busted app/config/styles and GPS iframe URL.
- No production flows or backend credentials changed.

**Testing:** deploy the full ZIP preserving directory structure; hard refresh browser; open GPS Logs & Checkpoint; use visible Choose File(s) picker; select the downloaded SharePoint CSV files; inspect site dropdown/shift counts. The user must first download CSVs from the secured SharePoint tab; a browser cannot read across tabs automatically.
