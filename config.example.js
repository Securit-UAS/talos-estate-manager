// Copy to config.js only for an internal development environment.
// Never commit live Power Automate signature-bearing URLs to a public repository.
// IMPORTANT: This static frontend CANNOT enforce server-side authorisation.
window.TALOS_CONFIG = {
  api: {
    cmsSubmit: '', cmsRead: '', cmsConfirm: '', cmsStaffLookup: '', cmsProviderLookup: '',
    compliance: "", // Existing Master Compliance combined API endpoint
    incidents: "", // Existing Incident dashboard API endpoint list: '', detail: '', update: '', create: '' },
  auth: { getSalt: '', login: '', validate: '', changePin: '' },
  writesEnabled: false,
  // Development guard only. Must ALSO be enforced by the update flow or gateway.
  testOnlySiteId: 235,
  protectedByGateway: false
};
