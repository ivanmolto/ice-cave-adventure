// @ts-check
import dappConstants from '../lib/constants.js';
import { connect, BRIDGE_ENDPOINT } from './connect.js';
import { walletUpdatePurses } from './wallet.js';

const { INSTANCE_REGKEY } = dappConstants;

/**
 * @type {Object.<string, HTMLSelectElement>}
 */
const options = {
  $brands: /** @type {HTMLSelectElement} */ (document.getElementById('brands')),
  $srcPurse: /** @type {HTMLSelectElement} */ (document.getElementById('srcPurse')),
  $dstPurse: /** @type {HTMLSelectElement} */ (document.getElementById('dstPurse')),
};

export default async function main() {
  /**
   * @param {{ type: string; data: any; }} obj
   */
  const walletRecv = obj => {
    switch (obj.type) {
      case 'walletUpdatePurses': {
        const purses = JSON.parse(obj.data);
        console.log('got purses', purses);
        walletUpdatePurses(purses, options);
        break;
      }
    }
  };

  /**
   * @param {{ type: string; data: any; }} obj
   */
  const apiRecv = obj => {
    switch (obj.type) {
      case 'skeleton/getEncouragementResponse':
        alert(`Encourager says: ${obj.data}`);
        break;
    }
  };

  const $encourageMe = /** @type {HTMLInputElement} */ (document.getElementById('encourageMe'));
  const $inputName = /** @type {HTMLInputElement} */ (document.getElementById('inputName'));

  await Promise.all([
    connect('wallet', walletRecv).then(walletSend => {
      walletSend({ type: 'walletGetPurses'});
      return walletSend;
    }),
    connect('api', apiRecv).then(apiSend => {
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

main();
