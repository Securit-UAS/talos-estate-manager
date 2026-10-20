// TALOS Estate Manager — CONTROLLED PILOT BUILD.
// Signed URLs in this file are visible to anyone who can load the site.
// Rotate and replace with identity-checked backend URLs before wider rollout.
window.TALOS_CONFIG = {
  api: {
    cmsSubmit: 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/24/workflows/3871bfb00d034d3ca033079d3bb66e7b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=dv_MMduOK9VqnWAcTFHICQYNd_OmbjzrAZI8Xj19J9A', // UAT only: rotate before production
    cmsStaffLookup: 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/19/workflows/36895625a7d34ed0815a389718bc7960/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Lk6ie_3CwzjdI-gNnlXCxBCmiildCXxW-4TfUE6KEoE', // UAT-only signed staff lookup API
    cmsProviderLookup: 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/7ce811299aa843fab2ec41381812b860/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=L5ax2s8cn1w3y4Uipr_L7zc9kBE9LSZVIO0kP9lLrQ0', // UAT provider directory
    cmsRead: '', // TODO: return current Talos DB v2 reports
    cmsConfirm: '', // TODO: update confirmation status
    masterRecords: 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/26/workflows/c44b9854ee2d400d94a6ce5ec9e188e1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yawIce99Ztnx_V2BRsF0Hq89CFVn9RBZ9GlpchQTbhg',
    create: 'https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/16/workflows/ac9178619cf043b7ba074c06fe2f07ed/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=V4QSDqUYF8pJY4xiNP5lje6Ay4-4DtPM0lzzcyU1vno',
    compliance: "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/17/workflows/c839f80ae5314a8997c693dccf60fd95/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iNQpx1uQwuRAZpwRmSCHer7iGXotIeAE7wHvznvvDz4", // Add your existing Master Compliance combined API URL
    incidents: "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/29/workflows/366a5eeb76764dad8ee4d6620b4c0d1b/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=J-5TCnYLpy7MsFbu_YCKPRD4cpJkIhc94kRoKD5vnBg", // Add your existing Incident API URL
    "list": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/09/workflows/599f3244ed2f46ffbd9ccbb456e2431d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=8bRy_shcrKLo4_HsN3rTDsgQXztwTb7jXrnROFF3Z-s",
    "detail": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/04/workflows/81724e545cf94605b4918cddfd0f741d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=WPsJbwkV1Q3Jp6LvinoZvtiaJwELe9kzdGjwOMMX5Ts",
    "update": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/24/workflows/1e60d3e73c2945f88cbca97d8a9ae6f1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=7U5LKR4072VP5e9a7hnYDJJ-NBmkDijs1RKVGAUILNY"
},
  auth: {
    "getSalt": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/05/workflows/87f7b9e1e1eb4231a7ba99534433d5b8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=iXxs-E_fronl-K1TiJ-AFwFeIYO1fVrCQfiF9JL13II",
    "login": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/27/workflows/9230fbd7083d454399933f5886c94636/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6cfaucdvEHvwZ1Vx5yd8Oq1-k0dsG9BuRYmjR5czDVQ",
    "validate": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/29/workflows/40dd6f1b2a504dd8aed177e59bab951e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=G2mJtM4TjLz6XAY2bUtrEt0x-viN2zThtrsafkW6nAI",
    "changePin": "https://default83caf35c4b184a57820900e447faa7.10.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/03/workflows/482d761e7f774b5db9bee5b81827cf51/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kkeFsWKGcfV4b2G2Br7jBNaqouapsWzGFnmVod9rwm4"
},
  writesEnabled: true,
  pilotMode: true, // Enables pilot UI edits; NOT a security mechanism.
  testOnlySiteId: null,
  protectedByGateway: false
};
