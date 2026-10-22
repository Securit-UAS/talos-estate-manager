# TALOS Unified V2.0.20 — Shift Handovers UAT

## Changes
- New **Shift handovers** navigation entry, following the existing module/iframe pattern.
- Read-only dashboard: KPI totals, search, handover and GPS filters, and a complete expandable master-record audit view.
- Two **independent** row indicators: handover confirmation and GPS assessment.
- Handover: green for confirmed, red for awaiting / exception, yellow for no-recipient review (including acknowledged no-recipient cases).
- GPS: red for outside range, yellow for review/partial assessment, green for within range, animated yellow ↔ blue for no GPS (respects reduced-motion settings).
- Uses `field_1`–`field_63` from `TALOS - Shift Handovers`. Times displayed in Europe/London.
- Preserves existing TALOS pages, auth and navigation.

## Connection required before real records appear
The uploaded V2.0.19 ZIP has **no handover read API endpoint**. The new page deliberately displays a **not configured** message instead of fabricated test data or claiming live connectivity.

1. Create a **separately authorised, read-only** Power Automate HTTP-trigger flow that retrieves items from the SharePoint list `TALOS - Shift Handovers` (AllGuarding; list GUID `594b80e8-e7cf-4bc6-8699-6b88c0bbe614`).
2. Enforce the caller's permission **server-side** before returning any personal/operational data. The TALOS browser session values are supplied as `email` and `token`; they must be verified by the backend, not merely trusted. Do not expose a publicly callable unauthenticated list endpoint. Ideally place the flow behind an authenticated gateway.
3. Return JSON with a top-level `value` array (or `records` array), containing SharePoint internal fields such as `ID`, `field_1` ... `field_63`. Configure pagination as needed; SharePoint Get items default page size may truncate results. Scope the data to the approved sites and an appropriate recent date range.
4. In `config.js`, set `window.TALOS_CONFIG.api.handoverRead` to that approved endpoint. The final appended line is an empty placeholder until connected.
5. Reload TALOS, sign in, select **Shift handovers**. Use the refresh button to reload.

**Important:** Handover colour is driven by the existing `field_25`, `field_26`, `field_27`, `field_33` and recipient fields. It is not evidence that the outstanding exception logic, incoming GPS or client confirmation workflows are finished. The current incoming Officer MERGE sets confirmed when the officer answers Yes; other checks remain future work.

## Files
- `modules/handovers/index.html`
- `modules/handovers/handovers.css`
- `modules/handovers/handovers.js`
- Updated `index.html`, `app.js`, `config.js`.
