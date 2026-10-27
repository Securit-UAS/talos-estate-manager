# TALOS V2.0.31 — GPS replay state initialisation repair

Fixed omission of the essential DOM helper and playback state declarations when V3 replay logic was embedded. This caused a ReferenceError on page load, leaving CSV imports, evidence selection and mapping inoperative. Restored SP_SITE, SP_FOLDER, colours, $, records, selected shifts, playback state and map layers. No live authentication or SharePoint connection added.

Validation: JS syntax checked using node --check; browser-level test unavailable (Chromium not installed). Import a CSV and verify site, shift count, selection and map.
