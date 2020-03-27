import { rpc, activateSocket, deactivateSocket } from './dapp/socket.js';
import dappConstants from './dapp/constants.js';
import { walletUpdatePurses } from './wallet.js';

const { INSTANCE_REGKEY } = dappConstants;

const $messages = document.getElementById(`messages`);
const connect = (idPrefix, recv, endpoint = undefined) => {
  const $status = document.getElementById(`${idPrefix}-status`);
  $status.innerHTML = 'Connecting...';

  const send = obj => {
    const $m = document.createElement('div');
    $m.className = `message send ${idPrefix}`;
    $m.innerText = `${idPrefix}> ${JSON.stringify(obj)}`;
    $messages.appendChild($m);
    console.log(`${idPrefix}>`, obj);
    return rpc(obj, endpoint);
  };

  let resolve, reject;
  const sendP = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  })
  activateSocket({
    onConnect() {
      $status.innerHTML = 'Connected';
      resolve(send);
    },
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

const $brands = document.getElementById('brands');
const $purses = { srcPurse: document.getElementById('srcPurse'), dstPurse: document.getElementById('dstPurse') };

export default async function main(document) {
  const walletRecv = obj => {
    switch (obj.type) {
      case 'walletUpdatePurses': {
        const purses = JSON.parse(obj.data);
        console.log('got purses', purses);
        walletUpdatePurses(document, purses, $purses, $brands);
        break;
      }
    }
  };

  const apiRecv = obj => {
    switch (obj.type) {
      case 'skeleton/getEncouragementResponse':
        alert(`Encourager says: ${obj.data}`);
        break;
    }
  };

  const $encourageMe = document.getElementById('encourageMe');
  const $inputName = document.getElementById('inputName');

  const $debug = document.getElementById('debug');
  function debugChange() {
    console.log('checked', $debug.checked);
    if ($debug.checked) {
      $messages.style.display = '';
    } else {
      $messages.style.display = 'none';
    }
  }
  $debug.addEventListener('change', debugChange);
  debugChange();

  const [walletSend, apiSend] = await Promise.all([
    connect('wallet', walletRecv).then(walletSend => {
      walletSend({ type: 'walletGetPurses'});
      return walletSend;
    }),
    connect('api', apiRecv, '/api').then(apiSend => {
      apiSend({
        instanceRegKey: INSTANCE_REGKEY,
        type: 'skeleton/subscribeNotifications',
      });

      $encourageMe.removeAttribute('disabled');
      $encourageMe.addEventListener('click', () => {
        const name = $inputName.value.trim();
        if (name === '') {
          alert(`I don't know who to encourage!`);
          return false;
        }
        apiSend({
          instanceRegKey: INSTANCE_REGKEY,
          type: 'skeleton/getEncouragement',
          name,
        });
      });
    }),
  ]);
}

main(document);
