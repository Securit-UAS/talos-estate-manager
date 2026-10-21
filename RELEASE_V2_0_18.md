# TALOS Unified V2.0.18 — C247 / Compliance cross-link UAT

- Clickable C247 officer names navigate to existing Master Compliance modal via same-origin module messages and Staff ID.
- The Compliance module maintains its own login/session requirements. A sign-in may be required, after which the officer card opens.
- Added TALOS History section to the existing compliance modal, showing last 30 calendar days of C247 shifts and an exceptions-only view. Historical non-roster modules are explicitly not represented as audit events.
- Snapshot timestamps: actual Power BI dataset refresh metadata is not yet exposed by either existing API, so no fabricated timestamp is presented.
- Existing sandbox endpoints preserved unchanged. Production must move signed API secrets away from frontend source.
- UAT known limitations: browser connectivity not verified here; officers absent from current compliance snapshot display a warning rather than fabricated card; history covers shift-start dates only; exceptions are observations, not confirmed breaches.
