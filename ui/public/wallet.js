const existingPurses = [];

const cmp = (a, b) => (a < b ? -1 : a === b ? 0 : 1);

export function walletUpdatePurses(document, purses, $purses, $brands) {
  const newPurses = purses.sort(({ pursePetname: a }, { pursePetname: b }) =>
    cmp(a, b));
  const newIssuers = purses.sort(({ issuerPetname: a }, { issuerPetname: b }) =>
    cmp(a, b));
  let i = 0;
  while (i < existingPurses.length) {
    const c = cmp(newPurses[i].pursePetname, existingPurses[j].pursePetname);
    if (c > 0) {
      // Have an extra one, so delete.
      for (const dir of ['srcPurse', 'dstPurse']) {
        $purses[dir].removeChild(existingPurses[j][dir]);
      }
      existingPurses.splice(j, 1);
    } else {
      const newText = `${newPurses[i].pursePetname}`;
      if (c < 0) {
        // Haven't got yet, so insert.
        const value = newPurses[i].pursePetname;
        existingPurses.splice(j, 0, newPurses[i]);
        for (const dir of ['srcPurse', 'dstPurse']) {
          const newPurse = document.createElement('option');
          newPurse.setAttribute('value', value);
          existingPurses[j][dir] = newPurse;
          if (j + 1 < existingPurses.length) {
            $purses[dir].insertBefore(existingPurses[j + 1][dir], newPurse);
          } else {
            $purses[dir].append(newPurse);
          }
        }
      }
      // Now have, so update.
      existingPurses[j].srcPurse.innerText = newText;
      existingPurses[j].dstPurse.innerText = newText;
      i += 1;
      j += 1;
    }
  }

  // Enable the purse list.
  $purses.srcPurse.removeAttribute('disabled');
  $purses.dstPurse.removeAttribute('disabled');
}
