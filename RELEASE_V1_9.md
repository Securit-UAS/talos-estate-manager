# TALOS Unified V1.9 — Estate contact directory and Create API

- Master Records API integrated, maps imported SharePoint `field_1` through `field_8`.
- Checkbox multi-select with manual validated email add for Ops Manager and CC1 (also CC3 and Site Visit notifications).
- Other email fields use the same picker, with email-string storage.
- Existing semicolon-delimited recipient values round-trip through chips, including custom addresses.
- Existing Create API connected; request includes logged-in session email/token; coordinates sent as numeric values.
- Duplicate-name check against loaded Estate directory.
- Inactive Retail site records remain visible when created (previously filtered out).
- Existing pilot write settings unchanged. Production requires server-side authorisation and credential rotation.
- Compliance, Incidents and Wallboard files unchanged.

## Checks still required
1. Upload to test GitHub deployment, confirm Master Records pickers load.
2. Create inactive test site and confirm SharePoint record, email fields and response ID.
3. Reopen and edit site. Verify semicolon-separated fields.
4. Confirm existing Create and Update flows validate the email/token and permitted fields server-side before Lee uses the tool.

Signed URLs in config.js are pilot secrets: protect repository and rotate them before production.
