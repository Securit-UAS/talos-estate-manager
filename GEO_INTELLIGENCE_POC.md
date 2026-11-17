# TALOS Geo Intelligence — POC 1.1

## Purpose
Read-only comparison of existing TALOS Estate Manager locations and GPS/Checkpoint records against independent public geospatial intelligence.

## Data sources
- **Estate sites:** existing Estate List API, already loaded by the Estate Manager. Geo requests an estate list refresh if no records are loaded when opened. Only records with valid latitude/longitude appear; no fallback coordinates.
- **Checkpoint scans / historical GPS:** existing GPS & Checkpoint module, with its current archive input and attribution/deduplication logic. A local same-origin message bridge shares only necessary event fields (site, type, label, coordinates, timestamp, shift) with Geo.
- **USGS earthquakes:** same public feed URL used by God's Eye View source module (USGS 24h GeoJSON).
- **NASA EONET:** browser-direct open natural events source catalogued by God's Eye View. Point events are plotted; lines/polygons are omitted in this first pass.

No demo markers, simulated routes, or invented site locations. Empty layers remain empty. Checkpoint marker positions represent latest recorded scans, not independently surveyed fixed checkpoint coordinates.

## Operation
1. Sign in to TALOS Estate Manager and select **Geo Intelligence**.
2. Check the counts for mapped estates and attributed historical GPS/checkpoint records.
3. Toggle the TALOS layers independently.
4. Enable USGS earthquakes or NASA EONET and inspect the data status below the switches.
5. Select an estate to focus and narrow recorded GPS/checkpoint history where the estate and GPS source names match.
6. Return to UK overview at any time.

## Technical notes
- The shell retains its original module router and existing estate records/forms; Geo is a same-origin standalone module.
- No SharePoint writes, new flows, new columns, or direct C247 calls.
- Cesium is loaded from jsDelivr. Basemap uses OpenStreetMap tiles. Network/CSP failures display a message.
- Public source feeds have browser CORS/service availability limitations. Any unavailable feed is shown as unavailable; no data is fabricated.
- Original God's Eye View is a full Vue/Vite app with proxy-backed feeds. This integration includes initial public source layers; aircraft, vessel, satellite, CCTV, and full upstream UI are **not yet integrated**.
- Attribution: [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view), [USGS](https://earthquake.usgs.gov/), [NASA EONET](https://eonet.gsfc.nasa.gov/), OpenStreetMap contributors.
- TALOS GPS history may contain position anomalies. Geo displays recorded positions for review, not safety-critical use. The module currently has no per-officer route selection or GPS tidy/omit workflow; use GPS Logs & Checkpoint for evidential playback.
- Public GitHub Pages and browser-side static controls do not provide protection against unauthorised API access. Do not introduce sensitive datasets before replacing the pilot gateway pattern.
