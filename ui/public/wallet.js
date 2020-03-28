// @ts-check

/**
 * @typedef {Object} Purse
 * @property {string} issuerPetname
 * @property {string} pursePetname
 * @property {any} extent
 * @property {string} brandRegKey
 */

/**
 * @typedef {Purse} PurseWithOptions
 * @property {HTMLOptionElement[]} [options]
 */

/**
 * @type {PurseWithOptions[]}
 */
const existingPurses = [];

/**
 * @type {PurseWithOptions[]}
 */
const existingIssuers = [];

/**
 * Compare two values, much like Perl's cmp operator.
 * 
 * @param {any} a
 * @param {any} b
 * @returns {number} -1, 0, or 1
 */
const cmp = (a, b) => (a < b ? -1 : a === b ? 0 : 1);

/**
 * Apply the update purses message.
 * 
 * @param {Purse[]} purses
 * @param {{ [x: string]: HTMLSelectElement }} selects
 */
export function walletUpdatePurses(purses, selects) {
  /**
   * Adjust the option elements in existing.
   * 
   * @param {string} key
   * @param {PurseWithOptions[]} existing
   * @param {Purse[]} currents
   * @param {string[]} names
   */
  const updateOptions = (key, existing, currents, names) => {
    for (const name of names) {
      const children = selects[name].children;
      for (let i = 0; i < children.length; i ++) {
        if (children[i].getAttribute('value') === 'remove()') {
          children[i].remove();
        }
      }
    }

    let i = 0;
    let j = 0;
    while (i < currents.length) {
      const c = j < existing.length ? cmp(currents[i][key], existing[j][key]) : -1;
      if (c > 0) {
        // Have an extra one, so delete.
        for (const name of names) {
          selects[name].removeChild(existing[j][name]);
        }
        existing.splice(j, 1);
      } else {
        const current = currents[i];
        const newText = `${current[key]}`;
        if (c < 0) {
          // Haven't got yet, so insert.
          const value = current[key];
          existing.splice(j, 0, current);
          for (const name of names) {
            const option = document.createElement('option');
            option.setAttribute('value', value);
            existing[j][name] = option;
            if (j + 1 < existing.length) {
              selects[name].insertBefore(existing[j + 1][name], option);
            } else {
              selects[name].append(option);
            }
          }
        }
        // Now have, so update.
        for (const name of names) {
          existing[j][name].innerText = newText;
        }
        i += 1;
        j += 1;
      }
    }

    for (const name of names) {
      selects[name].removeAttribute('disabled');
    }
  }

  const newPurses = purses.sort(({ pursePetname: a }, { pursePetname: b }) =>
    cmp(a, b));
  const newIssuers = purses.sort(({ issuerPetname: a }, { issuerPetname: b }) =>
    cmp(a, b));

  // Enable the purse list.
  updateOptions('pursePetname', existingPurses, newPurses, ['$srcPurse', '$dstPurse']);
  updateOptions('issuerPetname', existingIssuers, newIssuers, ['$brands']);
}
