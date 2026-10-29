# TALOS Unified V2.0.39 – GPS landing view

- GPS archive still loads automatically from the configured Power Automate endpoint.
- Site selector initially reads All Sites (with the count of available sites).
- No traces are selected or plotted until a particular site/shift is selected.
- Map starts at HQ (53.10638937252628, -1.3190199209975286); browser geolocation (when available and permitted) replaces HQ, without subsequent auto-recentering while the user is interacting.
- The day/night shift editor is disabled in All Sites overview because shift hours are configured per site.
- After choosing an individual site, the dated shift list and evidence replay work as before.
- Reminder: this demo build contains the signed Power Automate trigger URL in browser-source code; suitable only with anonymised data under user-controlled test conditions.
