# TALOS V2.0.37 – GPS archive auto-load integration (UAT)

- Based on the full V2.0.36 package. GPS player now auto-loads CSV or JSON from its **same-origin** `/api/checkpoints/archive` endpoint on opening; **Refresh Archive** manually retries. Local file imports and existing evidence exports remain.
- Added response-format checking and a safeguard against empty/unrecognised timestamp data. Fixed **Select up to 14** button selecting only seven.
- `integration/talos-gps-proxy.example.mjs` is an illustrative server adapter, **not deployed, not connected to any live endpoint**. It requires an authenticated and authorised server-side session.
- The new Power Automate flow has been confirmed via Terminal, but its signed trigger URL MUST NOT be embedded in browser code. Store a newly rotated signature solely in a server secret `TALOS_GPS_FLOW_URL`. Do not expose the proxy without server-side authorisation. Existing PIN-only access is not sufficient to authorise that server proxy.
- If the TALOS host is static-only, it cannot safely host this proxy. IT must deploy the API behind the planned intranet/authentication layer. Browser CORS has not been verified; using the same-origin proxy avoids cross-origin browser requests.
- The flow currently returns only the latest CSV. Extending to 14 days requires changes to Power Automate.
- UAT checks: proxy returns CSV; module automatically loads without manually selecting file; 14 shift selection; reload; access denied; missing proxy fallback; evidence export.
