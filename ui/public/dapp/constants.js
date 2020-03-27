// Taken from window.DAPP_CONSTANTS_JSON in index.html, defaulting to .env.local.
import defaults from './defaults.js';
export default window.__DAPP_CONSTANTS__ || defaults;
