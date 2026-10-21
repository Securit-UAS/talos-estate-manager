# TALOS Unified V2.0.8 — SIA Result Visuals

Built on confirmed V2.0.7.

- SIA verification dialog now uses pulsing green for verified identity + eligible guarding licence; amber for an eligible licence with identity mismatch needing manual review; red for no eligible guarding licence; blue for API errors or unrecognised/inconclusive outcomes.
- Adds a prominent all-caps status banner and respects reduced-motion browser settings.
- Removes redundant signed-in agent details and sign-out button from Compliance's top bar. The shared Unified sidebar retains authentication controls. Internal hidden sync state remains for loading/error handling.
- No changes to APIs, alert suppression, C247 compliance status, other modules or backend.
- Manual UAT needed for all four visual outcomes.
