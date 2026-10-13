// Copy to config.js only for an internal development environment.
// Never commit live Power Automate signature-bearing URLs to a public repository.
// IMPORTANT: This static frontend CANNOT enforce server-side authorisation.
window.TALOS_CONFIG = {
  api: { list: '', detail: '', update: '' },
  auth: { getSalt: '', login: '', validate: '', changePin: '' },
  writesEnabled: false,
  // Development guard only. Must ALSO be enforced by the update flow or gateway.
  testOnlySiteId: 235,
  protectedByGateway: false
};
