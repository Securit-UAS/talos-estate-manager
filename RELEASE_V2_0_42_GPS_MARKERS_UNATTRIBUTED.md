# TALOS V2.0.42 – GPS Marker and Unattributed Records UAT

- Large active/latest trace marker now has the same record detail and omit/restore popup as its underlying checkpoint/GPS dot. Tooltip remains on hover. Omitting moves the large marker to the latest remaining projected point.
- Records with neither an identifiable officer name nor a valid staff ID are filtered out of the trace selection, original/tidied maps, checkpoint clustering, playback and evidence player.
- Where a record has a valid staff ID but an unknown/missing name, display `Staff ID <id>` rather than mistakenly excluding a potentially identifiable officer.
- Deduplication retains the staff ID in its composite key.
- Evidence Pack includes `excluded_unattributed.json` for audit (site-scoped, excluded from projected CSV and viewer), and a count/reason in manifest.json. Source archives are not altered.
- GPS controls and archive loading unchanged.

Review the new exclusion and marker behaviour using test data before live deployment.
