# TALOS Unified V2.0.3 — Provider Directory

- Adds `cmsProviderLookup` API wired to the new estate-wide read-only provider lookup flow.
- Loads all distinct provider names independently from the selected site; both manual site and manual officer entry retain complete provider suggestions.
- Defaults blank contractor values in Rolling Staff DB and CMS submissions to `SecurIT`.
- Keeps known officer auto-fill and override, existing reporting API and other modules unchanged.
- On API error retains manual entry and SecurIT fallback.
- Provider API is called with email, token and empty siteName to satisfy the cloned UAT trigger schema.
- The website/API are UAT only; signed URLs in client code do not constitute secure authorisation.
