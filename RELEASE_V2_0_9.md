# TALOS Unified V2.0.9 — Operational usability

Based on the complete V2.0.8 build.

- Persistent red **Log New Event** shortcut by the sidebar sign-out, opens CMS New Event on every module.
- CMS Agent-style logins (email prefix `agent.` / `agent_` / `agent-`) open CMS Reporting by default; an explicit list in `window.TALOS_CONFIG.cmsAgentEmails` is also supported. This is navigation only, not authorisation. Other users retain Estate default.
- CMS 4th metric rotates every five seconds through **today's** incident categories with counts; zero incidents and unavailable data treated separately.
- Build version **TALOS V2.0.9** is legible at the bottom of the sidebar, including narrower displays.
- All V2.0.8 SIA status visuals and C247 link retained unchanged.

UAT checks: test Agent login, non-Agent login, event button from Estate/Compliance/Wallboard, today's category cycle, empty data, mobile and narrow screen.

**Known limitation:** current TALOS auth response doesn't supply an authoritative CMS role; current Agent detection uses naming conventions or configuration only. Exact role-driven landing needs a verified role field from the authentication service.
