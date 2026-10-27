# TALOS V2.0.33 — GPS Evidence Pack UAT

Adds **Build Evidence Pack** to the GPS module. Exports a ZIP from browser memory with only explicitly selected (up to seven) dated officer traces. No Power Automate flow required.

ZIP contents: `index.html` self-contained local player with embedded selected data and offline coordinate plot, `selected_traces.csv`, `manifest.json`. No TALOS/SharePoint credentials or other site records included. Source timezones and per-site shift configuration are retained as available.

Offline player is a coordinate plot, not satellite imagery. Original archived files unchanged. Zip uses standard uncompressed ZIP entries. CSV spreadsheet formula prefixes are escaped.

UAT: import multi-site CSV, select a single trace, export ZIP, disconnect internet, open `index.html` extracted from ZIP; inspect selected CSV for any unrelated site/person; test seven traces and no selection.
