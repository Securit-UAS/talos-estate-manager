// Shared TALOS configuration bridge. All endpoints are maintained in /config.js.
const shared = window.parent !== window && window.parent.TALOS_CONFIG ? window.parent.TALOS_CONFIG : window.TALOS_CONFIG;
window.SECURIT_AUTH = shared?.auth || {};
window.SECURIT_SIA_API_URL = shared?.api?.compliance || "";
window.SECURIT_INCIDENT_API_URL = shared?.api?.incidents || "";
