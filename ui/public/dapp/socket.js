// @ts-check
/* globals window, WebSocket */

import dappConstants from './constants.js';

const { API_URL, BRIDGE_URL } = dappConstants;

// === WEB SOCKET

const endpointToSocket = new Map();

function getWebSocketEndpoint(endpoint) {
  // TODO proxy socket.
  let url;
  if (endpoint === '/api') {
    url = new URL(endpoint, API_URL || window.origin);
  } else {
    url = new URL(endpoint, BRIDGE_URL || window.origin);
  }
  url.protocol = url.protocol.replace(/^http/, 'ws');
  return url.href;
}

/**
 * @typedef {Object} SocketHandler
 * @property {() => void} [onConnect]
 * @property {(msg: string) => void} [onMessage]
 * @property {() => void} [onDisconnect]
 */

const walletBridgeId = 'walletBridgeIFrame';
let walletLoaded = false;
const connectSubscriptions = new Set();
const messageSubscriptions = new Set();
let initializedIframe = false;

/**
 * Make a new "socket", whether WebSocket or postMessage bridge.
 * 
 * @param {SocketHandler} handler
 * @param {string} endpoint 
 */
function createSocket({ onConnect, onDisconnect, onMessage }, endpoint) {
  if (endpoint === '/private/wallet-bridge') {
    let ifr = /** @type {HTMLIFrameElement} */ (document.getElementById(walletBridgeId));
    if (!ifr) {
      ifr = document.createElement('iframe');
      ifr.id = walletBridgeId;
      ifr.setAttribute('width', '0');
      ifr.setAttribute('height', '0');
      ifr.setAttribute('style', 'display: none');
      document.body.appendChild(ifr);
    }
    if (!initializedIframe) {
      initializedIframe = true;
      window.addEventListener('message', ev => {
        // console.log('dapp ui got', ev);
        if (ev.data && ev.data.type === 'walletBridgeLoaded') {
          walletLoaded = true;
          for (const sub of connectSubscriptions.keys()) {
            sub();
          }
          connectSubscriptions.clear();
        } else {
          const msg = JSON.stringify(ev.data);
          for (const sub of messageSubscriptions.keys()) {
            sub(msg);
          }
        }
      });
    }
    ifr.src = 'dapp/agoric-wallet.html';
    if (onMessage) {
      messageSubscriptions.add(onMessage);
    }
    const messageListeners = new Set();
    endpointToSocket.set(endpoint, {
      send(msg) {
        const obj = JSON.parse(msg);
        ifr.contentWindow.postMessage(obj, window.origin);
      },
      close() {
        walletLoaded = false;
        if (onConnect) {
          connectSubscriptions.delete(onConnect);
        }
        if (onMessage) {
          messageSubscriptions.delete(onMessage);
        }
        for (const sub of messageListeners.keys()) {
          messageSubscriptions.delete(sub);
        }
        let ifr = /** @type {HTMLIFrameElement} */ (document.getElementById(walletBridgeId));
        if (ifr) {
          ifr.src = '';
        }
    
        if (onDisconnect) {
          onDisconnect();
        }
      },
      addEventListener(kind, cb) {
        if (kind !== 'message') {
          throw Error(`Cannot bridge.addEventListener kind ${kind}`);
        }
        const onmsg = data => cb({ data });
        messageListeners.add(onmsg);
        messageSubscriptions.add(onmsg);
      },
      removeEventListener(kind, cb) {
        if (kind !== 'message') {
          throw Error(`Cannot bridge.removeEventListener kind ${kind}`);
        }
        messageSubscriptions.delete(cb);
        messageListeners.delete(cb);
      },
    });

    if (onConnect) {
      if (walletLoaded) {
        onConnect();
      } else {
        connectSubscriptions.add(onConnect);
      }
    }
    return;
  }

  const socket = new WebSocket(getWebSocketEndpoint(endpoint));
  endpointToSocket.set(endpoint, socket);
  if (onConnect) {
    socket.addEventListener('open', () => onConnect());
  }
  if (onDisconnect) {
    socket.addEventListener('close', () => onDisconnect());
  }
  if (onMessage) {
    socket.addEventListener('message', ({ data }) => onMessage(data));
  }
}

function closeSocket(endpoint) {
  const socket = endpointToSocket.get(endpoint);
  socket.close();
  endpointToSocket.delete(endpoint);
}

function getActiveSocket(endpoint) {
  return endpointToSocket.get(endpoint);
}

/**
 * Start a given socket connection.
 * 
 * @param {SocketHandler} socketListeners 
 * @param {*} endpoint 
 */
export function activateSocket(socketListeners = {}, endpoint = '/private/wallet-bridge') {
  if (getActiveSocket(endpoint)) return;
  createSocket(socketListeners, endpoint);
}

export function deactivateSocket(endpoint = '/private/wallet-bridge') {
  if (!getActiveSocket(endpoint)) return;
  closeSocket(endpoint);
}

export async function rpc(req, endpoint = '/private/wallet-bridge') {
  // Use the socket directly.
  const socket = getActiveSocket(endpoint);
  if (!socket) {
    throw Error(`Must activate socket before rpc to ${endpoint}`);
  }

  let resolve;
  const p = new Promise(res => {
    resolve = res;
  });
  socket.send(JSON.stringify(req));
  const expectedResponse = `${req.type}Response`;
  function getResponse({ data: msg }) {
    // console.log('got', msg);
    const obj = JSON.parse(msg);
    if (obj.type === expectedResponse) {
      resolve(obj);
      socket.removeEventListener('message', getResponse);
    }
  }
  socket.addEventListener('message', getResponse);
  return p;
}
