# TALOS Unified V2.0.2 — Connected CMS officer lookup (UAT)

- Builds on the uploaded V2.0.1 baseline without changing Estate, Compliance, Wallboard or CMS Submit APIs.
- Configures the tested Rolling Staff DB CMS Staff Lookup Power Automate endpoint in config.js.
- Sends `{email,token,siteName}` because this API filters server-side and requires the site name.
- Starts lookup after selecting/typing a complete, known Estate site name; does not request staff for unknown sites.
- Offers officer suggestions for the selected site, and auto-populates Labour Provider for an exact officer match (normalising whitespace).
- Keeps both Officer and Labour Provider manually editable, including for unknown sites and failed lookups.
- Cancels pending/stale lookup results when switching sites, and resets the selection to prevent cross-site errors.
- Retains existing CMS submission behaviour, alert compatibility and other modules.

## UAT
Use OHS 3E Priory Park as known site; expected officers Muhammad Rohail, Sheroz Ali, Mudassir Iqbal; Labour Provider Adelar. Test free-text unknown site (do not submit a real record unless intended). The live submit endpoint can issue real internal alerts.

## Production caveat
The HTTP-triggered Power Automate URLs embed Shared Access Signatures in client-side config. This is suitable only for the controlled UAT arrangement agreed; production requires server-side access controls.
