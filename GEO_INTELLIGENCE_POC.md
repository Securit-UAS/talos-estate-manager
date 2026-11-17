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

## ADS-B aircraft layer (POC 1.2)
- Reuses [SecurIT Radar](https://github.com/Securit-UAS/Radar) provider contract: the existing Cloudflare Worker `/point?lat=...&lon=...&radiusNm=...` and Airplanes.live-compatible `ac` records.
- Enabled manually. On each 30-second refresh only when the Geo tab is visible, retrieves aircraft within **100 km** of the selected estate or the original Radar headquarters centre if no estate is selected.
- Applies Radar's **30,000 ft** altitude ceiling and **30 s** stale-position limit; shows aircraft position, callsign/ICAO, altitude, speed and heading when available.
- No invented aircraft or demonstration data. Worker failures remain visible in layer status.
- Unlike original Radar, initial Geo integration does **not** yet include approach prediction, warning rings, persistent trails or full Radar control panel.
- The original Worker is a pre-existing external dependency and was not modified. Airplanes.live access conditions and authorisation for business use need verification before operational rollout. Aircraft reports are not exhaustive and must never substitute for drone airspace checks or aviation separation.

## Site location resolution — POC 1.3
For each TALOS Estate Manager record, the map resolves the site without modifying the record:
1. Existing valid Latitude/Longitude from the Estate List API (excluding blank and 0,0).
2. A location calculated from that same site's attributed historical **NEW START** checkpoint scan positions in the GPS module, using the densest cluster within 125 m and rejecting ambiguous multiple clusters. Exact normalised site-name matching is required. Position is an average of the qualifying cluster, not a surveyed entrance.
3. The geographic coordinate returned for the site's UK postcode by [Postcodes.io](https://postcodes.io/docs/postcode/lookup/), marked as approximate postcode location.

Only if all three fail is the estate left off the map. Estate name and officer/GPS history are not sent to Postcodes.io; the third party receives the postcode string for unresolved sites. The browser caches successful postcode lookups for the current session. Sources are indicated on map-marker detail and estate selection list. The site panel shows counts by coordinate source.

No SharePoint writes, no GPS record edits, no mock locations. Postcode-derived points are approximate and should not be used for precise checkpoint or drone launch positioning.

## Geo 1.6 — Estate filters and collapsible checkpoint player
- Geo sidebar filters: site/client search, active/inactive/unspecified, client (only when an explicit client field is returned), site type and region. These apply to mapped estate markers and site selections, not SharePoint records. Client dropdown remains disabled if the existing Estate List API supplies no separate client values.
- Checkpoint Replay floats over the map as a collapsible panel. It reads the already-normalised historical GPS/Checkpoint bridge rows and offers site, shift date, day/night shift, speed, play/pause, start/end and timeline scrubbing.
- The Geo bridge excludes officer identities, so this playback is a **combined chronological site/shift event projection**, not an individual officer trace. Use the existing GPS Logs & Checkpoint viewer for officer-specific and evidential playback, including its trace selection and tidying.
- No synthetic records, new APIs, or write operations. Site-name matching applies when Geo estate filters are active. All control code is isolated in `modules/geo/replay.js` so the original GPS viewer is unchanged.
- Browser testing and production suitability remain unverified.
