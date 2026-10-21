# TALOS Unified V2.0.14 — SharePoint gate startup fix

- Fix startup-order defect where SharePoint gate ran before image-probe state initialised, trapping application on Checking screen.
- Defer gate until configuration is initialised and catch unexpected errors with accessible sign-in/retry UI.
- Retains V2.0.13 SharePoint image check and status indicator.
- Client-side gate is not secure authentication or backend authorisation.
