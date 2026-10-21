# TALOS Unified V2.0.13 — SharePoint Image Access UAT gate

- Added pre-login browser image-access screen using protected AllGuarding JPG. Browser must successfully decode it to reveal TALOS PIN form or restore saved TALOS session.
- Failure shows Microsoft 365 sign-in/check link, retry control and support guidance.
- SharePoint Image Access topbar indicator mirrors Jotform green/red Check and Recheck design.
- UAT-only user-experience prerequisite, NOT identity validation, secure authentication or API protection. Must use Entra ID and server-side authorisation for production.
- The source can serve JPG as attachment or block embedding, producing red even to signed-in users. Test normal and incognito browsers before rollout.
- No operational flows changed.
