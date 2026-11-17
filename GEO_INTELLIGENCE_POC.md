# Geo Intelligence proof of concept

This release adds **Geo Intelligence (POC)** to TALOS Estate Manager's Operational Assurance navigation without changing existing Estate Manager workflows.

## Included
- 3D CesiumJS globe with OpenStreetMap imagery.
- Uses Latitude/Longitude already returned by the existing Estate List API; otherwise displays clearly labelled sample estate sites.
- Reuses checkpoint and historical GPS rows from the existing GPS Logs & Checkpoint module using same-origin read-only messages. The existing module remains responsible for fetching, deduplicating and excluding unattributed data.
- Checkpoint markers represent the latest recorded scan per site/checkpoint name, not surveyed fixed checkpoint coordinates.
- GPS line overlays are historical, not live positions. No C247 writes or new SharePoint fields.
- Before GPS data is available, demo checkpoint markers and a demo route are shown. Existing GPS data replaces those placeholders.

## Testing
1. Open current TALOS site and authenticate normally.
2. Select **Geo Intelligence** in Operational Assurance.
3. Toggle Site, Checkpoint and Patrol layers; open the site list.
4. Verify the map loads recorded events after the GPS module completes loading.
5. Test all other modules remain operational, particularly GPS Logs & Checkpoint.
6. Test both dark/light themes and desktop/mobile browser sizes.

## Boundaries
This is a proof of concept, not an operationally validated tracking or safety tool. Original God's Eye View intelligence services (aircraft, satellites, maritime, environmental) are not yet imported. The initial globe uses the open-source CesiumJS engine rather than bundling the whole upstream God's Eye app.

CesiumJS is currently loaded from a public CDN and map tiles from OpenStreetMap; deployments with strict CSP policies may need adjustments. Data rendered from TALOS must remain under existing authorised access. This frontend authentication model is not a replacement for backend controls.
