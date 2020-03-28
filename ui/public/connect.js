// @ts-check
import { rpc, activateSocket, deactivateSocket } from './dapp/socket.js';

const $messages = /** @type {HTMLDivElement} */ (document.getElementById(`messages`));
const $debug = /** @type {HTMLInputElement} */ (document.getElementById('debug'));

function debugChange() {
  // console.log('checked', $debug.checked);
  if ($debug.checked) {
    $messages.style.display = '';
  } else {
    $messages.style.display = 'none';
  }
}
$debug.addEventListener('change', debugChange);
debugChange();

/**
 * @param {string} idPrefix
 * @param {(obj: { type: string, data: any }) => void} recv
 * @param {string} endpoint
 */
export const connect = (idPrefix, recv, endpoint = undefined) => {
  const $status = /** @type {HTMLSpanElement} */(document.getElementById(`${idPrefix}-status`));
  $status.innerHTML = 'Connecting...';

  /**
   * @param {{ type: string, data: any}} obj
   */
  const send = obj => {
    const $m = document.createElement('div');
    $m.className = `message send ${idPrefix}`;
    $m.innerText = `${idPrefix}> ${JSON.stringify(obj)}`;
    $messages.appendChild($m);
    console.log(`${idPrefix}>`, obj);
    return rpc(obj, endpoint);
  };

  /**
   * @type {(value?: any) => void}
   */
  let resolve;
  /**
   * @type {(reason?: any) => void}
   */
  let reject;
  const sendP = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  })
  activateSocket({
    onConnect() {
      $status.innerHTML = 'Connected';
      resolve(send);
    },
    /**
     * @param {string} msg
     */
    onMessage(msg) {
      const obj = JSON.parse(msg);
      const $m = document.createElement('div');
      $m.className = `message receive ${idPrefix}`;
      $m.innerText = `${idPrefix}< ${JSON.stringify(obj)}`;
      $messages.appendChild($m);
      console.log(`${idPrefix}<`, obj);
      recv(obj);
    },
    onDisconnect() {
      $status.innerHTML = 'Disconnected';
      reject();
    },
  }, endpoint);

  return sendP;
};
