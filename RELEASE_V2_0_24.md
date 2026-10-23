# TALOS Unified V2.0.24 — SharePoint gate diagnostic and URL compatibility (UAT)

- First test the **exact protected image URL** used by the manual Check link (no cache-busting query).
- If it fails, retry with the legacy timestamp query.
- Keep the access gate enforced: neither failure permits access to the TALOS login.
- Explain why opening the SharePoint image in a separate tab does not prove that cross-site background image loading works.
- Retain all modules and API configuration unchanged.

## Important limitation

This is a compatibility and diagnostic improvement, **not** a guaranteed fix for third-party cookie restrictions. If a fresh browser still fails, the browser cannot reliably perform this SharePoint access check. A robust security implementation requires Microsoft Entra ID sign-in with server-side validation, rather than treating an image load as authorisation. The existing TALOS PIN/session APIs remain the actual application authentication.

## UAT

1. Preserve the currently working deployment.
2. Deploy to a separate UAT URL and test with Mac Chrome normal, Mac Chrome Incognito, Windows Edge, and iPhone Chrome.
3. Confirm both failed and successful paths, and verify TALOS PIN/session authorisation remains enforced.
4. Do not promote until the fresh-session issue is resolved.
