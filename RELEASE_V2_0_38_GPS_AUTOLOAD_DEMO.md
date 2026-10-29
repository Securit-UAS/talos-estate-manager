TALOS V2.0.38 — GPS automatic archive loading

GPS Replay initiates a POST to the configured Power Automate flow on opening and on Refresh Archive. The response is parsed using the existing CSV import process. Existing manual import, shift replay and evidence functionality is retained.

This demonstration build contains a signed anonymous Power Automate trigger URL in browser JavaScript. Replace the endpoint with a server-side authenticated proxy and revoke the signed URL before loading real GPS records. Browser CORS permissions require live testing.
