// @ts-check
import dappConstants from '../lib/constants.js';
import { connect } from './connect.js';
import { walletUpdatePurses, flipSelectedBrands } from './wallet.js';

const { INSTANCE_REGKEY } = dappConstants;

/**
 * @type {Object.<string, HTMLSelectElement>}
 */
const selects = {
  $brands: /** @type {HTMLSelectElement} */ (document.getElementById('brands')),
  $tipPurse: /** @type {HTMLSelectElement} */ (document.getElementById('tipPurse')),
  $encouragementPurse: /** @type {HTMLSelectElement} */ (document.getElementById('encouragementPurse')),
};

export default async function main() {
  selects.$brands.addEventListener('change', () => {
    flipSelectedBrands(selects);
  });
  
  /**
   * @param {{ type: string; data: any; }} obj
   */
  const walletRecv = obj => {
    switch (obj.type) {
      case 'walletUpdatePurses': {
        const purses = JSON.parse(obj.data);
        console.log('got purses', purses);
        walletUpdatePurses(purses, selects);
        break;
      }
      case 'walletURL': {
       // FIXME: Change the anchor href to URL.
       break;
      }
    }
  };

  const $numEncouragements = /** @type {HTMLInputElement} */ (document.getElementById('numEncouragements'));

  /**
   * @param {{ type: string; data: any; }} obj
   */
  const apiRecv = obj => {
    switch (obj.type) {
      case 'encouragement/getEncouragementResponse':
        alert(`Encourager says: ${obj.data}`);
        break;
      case 'encouragement/encouragedResponse':
        $numEncouragements.innerHTML = obj.data.count;
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
        type: 'encouragement/subscribeNotifications',
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
          type: 'encouragement/getEncouragement',
          name,
        });
      });
    }),
  ]);
}

main();
