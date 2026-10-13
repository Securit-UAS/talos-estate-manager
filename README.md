# TALOS Estate Manager — V1 pilot build (connected)

Target repository: https://github.com/Securit-UAS/talos-estate-manager/

## Themes
- Dark: inspired by TALOS Wall View's navy / operational-monitoring palette.
- Light: inspired by the TALOS Compliance Dashboard's bright panels and blue accents.
- Theme choice is saved in the browser; toggle in the upper-right corner.

## Functionality
- Reuses Compliance Dashboard authentication: PIN verifier derived with PBKDF2-SHA256 (210,000 iterations), salt, login, PIN change, token validation and existing `securitSiaAuthV1` browser session key.
- Loads the slim Estate List API, excluding CMS and inactive retail records.
- Searches names, postcodes, managers; normalises `MCL` to `McLaren`.
- Filters by type, region and active state; review centre shows attention-needed records.
- Loads SharePoint Site Detail only after selecting a site.
- Full 24-field editor with **diff-only** update requests and explicit clear (`""`) support.
- Uses only list ID internally; optimistic concurrency is NOT YET implemented.
- Pilot UI editing is enabled for all records returned by the Estate List API; `testOnlySiteId: null` is a frontend setting, NOT a security measure.

## Configure and deploy
1. This PILOT ZIP includes a populated `config.js` with the existing signed Estate and TALOS authentication URLs. Uploading it to GitHub Pages exposes those URL signatures publicly. Use for an explicitly accepted short pilot only; rotate afterwards.
2. This build has `writesEnabled: true`, `pilotMode: true`, `protectedByGateway: false`, and `testOnlySiteId: null`. These are frontend controls only. They DO NOT restrict the backend signed Update URL; any holder can call it directly for other IDs.
3. GitHub Pages is a public static host on non-Enterprise accounts; publishing the API URLs exposes them. Approval and PIN login gate the user interface only. Do not equate them with API access control.
4. Pilot UI permits editing all listed records. The signed Update flow does not yet independently enforce user permissions or site scope; apply server-side controls before wider rollout.
5. Check cross-origin requests are permitted by your gateway. If Microsoft Power Automate browser CORS policies disallow direct calls, use an authenticated same-origin proxy.

## Critical before Lee's real-world edit pilot
- Update API: validate user/session and enforce allowed site scope independently of the frontend, particularly **no CMS and no inactive Retail**. Current HTTP trigger = Anyone; not secure for production.
- Enforce per-user read/edit permissions and preferably audit who changed each field.
- Rotate all signed Power Automate trigger URLs (previously pasted into chat during development).
- Enforce optimistic concurrency using the detail API's ETag/Modified date, rather than `IF-MATCH: *`.
- Validate input types and dates, especially SharePoint Number columns for Latitude and Longitude. Current mappings send string values.
- Check EntityPropertyName values for other escaped-field columns and test all new fields.
- Remove or disable the obsolete `Update item` action below `Terminate` in Power Automate when safe.
- Review presence of sensitive site instructions and contact details and use suitable tenant-controlled hosting.

## Build files
`index.html`, `styles.css`, `app.js`, `config.example.js`, `.gitignore`, `securit-logo.png`.

`config.js` is populated for pilot testing and included in the ZIP. Anyone visiting the published GitHub Pages site can inspect its contents and use the API signatures. It is not a secure secret store. Replace with an authenticated backend proxy for production.
