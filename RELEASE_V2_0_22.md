# TALOS Unified V2.0.22 — Email-style Handover Report Popup (UAT)

- Clicking **View** on any Shift Handovers row now opens a centred, scrollable modal card styled after `TALOS_Shift_Handover_Email_v4.html` (navy header/footer, Securit logo, gold section accents, red rule, white paper).
- Shows site details, independent handover and GPS status, outgoing/incoming GPS evidence with maps links where coordinates are valid, outgoing declarations/observations, incoming declarations, client confirmation, management acknowledgement and audit references.
- Empty optional fields and wholly empty sections are suppressed. Existing read-only API, filters, KPIs and row logic are unchanged.
- Escape, backdrop and Close button dismiss the modal; focus returns to the View button. Mobile responsive, modal scroll confined within iframe.
- No changes to C247, Compliance, Estate, CMS, auth, API configuration or Power Automate flows.
- **UAT only**. Rotate exposed signed URLs and validate server-side site/role permissions before production.
