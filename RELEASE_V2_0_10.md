# TALOS Unified V2.0.10 — SIA modal and quick-event fixes

- Fixed absent SIA modal border styles: clearly visible 6px pulsing green/red/blue/amber outline and vivid corresponding header in both themes.
- SIA identity mismatch is explicitly a **critical red** manual review; confirmed eligible identity/role is green, no eligible licence red, API failures blue. No automatic override.
- Fixed persistent Log New Event shortcut race for first opening of CMS iframe: register iframe onload before assuming readyState; cached CMS receives immediate postMessage.
- Cache-bumped app and CMS module to 2.0.10.

Live-browser UAT still required.
