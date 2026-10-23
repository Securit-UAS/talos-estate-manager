# TALOS Unified V2.0.25 - temporary SharePoint gate removal

- Temporarily disables the **blocking pre-login SharePoint image check** due to cross-site image requests failing in fresh sessions.
- Restores normal TALOS email/PIN login and existing backend session validation and role authorisation.
- Keeps SharePoint image status check available manually after login (diagnostic only).
- Does not add or bypass server-side login permissions.
- TEMPORARY SECURITY NOTE: the former image check was not identity verification; nevertheless removing it changes the login prerequisite. Review access controls and replace with verified Entra ID authentication in a planned release.
- Deploy as a complete ZIP, test fresh browser, then confirm valid and invalid credentials.
