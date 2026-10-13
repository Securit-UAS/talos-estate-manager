# TALOS Estate Manager — V1 development build

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
- Test-mode write restriction is controlled by `testOnlySiteId` (frontend-only, NOT security).

## Configure and deploy
1. Copy `config.example.js` to `config.js` for private internal testing. Populate `api.list`, `api.detail`, `api.update` and `auth.getSalt`, `auth.login`, `auth.validate`, `auth.changePin` with secured endpoints. Don't commit live signature-bearing values.
2. Keep `writesEnabled: false` and `protectedByGateway: false` until a proper authorising proxy or authenticated Power Automate flow verifies the current user's identity and edit permission. A frontend login **does not** protect signed URLs.
3. Host in a controlled static environment, or deploy GitHub Pages only after replacing HTTP trigger URLs with endpoints that enforce tenant identity and user permissions. GH Pages alone has no access controls even if its repository is private.
4. Once the backend guards are in place set `writesEnabled: true`, `protectedByGateway: true`, and during the pilot keep `testOnlySiteId: 235` **plus a server-side allowlist**. Move to live sites only after verification.
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

`config.js` is included as an unconfigured local-development placeholder and intentionally ignored by Git. It is NOT a secure secret store when delivered to a browser. Implement a secure proxy for deployed environments.
