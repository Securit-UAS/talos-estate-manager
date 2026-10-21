# TALOS Unified V2.0.19 — Compliance card usability / CMS history UAT

- Improved training-card text contrast for both TALOS themes.
- Removed redundant compliance module header logo and legacy colour-status legend.
- Officer click in C247 Reporting now opens the actual Master Compliance card in an overlay over the reporting page, without leaving the page. Separate compliance iframe may need its own login / initial 42-second load.
- Added 60-day CMS reports to officer history, with separate CMS read and explicit name-only identity-match qualification; exceptions toggle filters CMS reports awaiting acknowledgement.
- Embedded signed API URLs remain UAT-only.
- CMS history availability depends on existing session and CMS read endpoint permissions.
