# TALOS Unified V2.0.5 — CMS Reports Read Integration

Built on validated V2.0.4. Configures the verified rolling 60-day Reports Read endpoint (430 records in last UAT test); live CMS register and its search, issue and acknowledgement filters now operate on SharePoint reports. Includes officer 60-day incident summary by name, normalising whitespace and case, with issue breakdown and unacknowledged count. CMS Submit includes a snapshot summary in TalosHistory when the read feed has loaded. Existing submission, staff/provider lookup and Estate/Compliance/Wallboard modules retained.

Known limitations: reports refresh when module loads or Refresh is clicked, not by push; confirmation API still pending and the email acknowledgement route is untouched. Matching by name alone can confuse two officers with identical names. The read API's 60-day period is UTC-based rather than the Desktop's local midnight. The browser shows comments as literal text (including legacy encoded HTML entities). Signed Power Automate URLs are UAT credentials, not production-grade authentication.

Smoke tests: load CMS register, check 430-ish reports and Pinewood Lodge, filter acknowledgements, search names, inspect history, ensure manual forms can still submit on Pinewood Lodge.
