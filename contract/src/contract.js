// @ts-check
/* eslint-disable no-use-before-define */
import harden from '@agoric/harden';
import { assert, details } from '@agoric/assert';
import makePromise from '@agoric/make-promise';

/**
 * This contract does a few interesting things.
 */
export const makeContract = harden(zoe => {
  let count = 0;
  let messageTemplate = ['Hello, ', '$name', `, you're doing great!`];

  // Implement simple notifications for the contract state.
  // A caller of getNotification is notified that the state
  // has changed when the 'changed' promise resolves.
  // They then can call getNofication again to get the new
  // state and a new 'changed' promise.
  let changed = makePromise();
  const getNotification = () => ({
    changed: changed.p,
    messageTemplate,
    count,
  });

  const updateNotification = () => {
    // Resolve the old changed promise, and create a new
    // one.
    changed.res();
    changed = makePromise();
  };

  const getEncouragement = name => {
    let encouragement = '';
    for (let i = 0; i < messageTemplate.length; i += 2) {
      const [plain, lookup] = messageTemplate.slice(i, i + 2);
      encouragement += plain;

      switch (lookup) {
        case undefined:
          break;
        case '$name':
          encouragement += name;
          break;
        default:
          encouragement += `**${lookup}**`;
      }
    }
    count += 1;
    updateNotification();
    return encouragement;
  };

  const makeAdminInvite = () => {
    const seat = harden({
      setMessageTemplate(msg) {
        assert(Array.isArray(msg), details`${msg} must be an array`);
        messageTemplate = msg;
        updateNotification();
      },
    });
    const { invite } = zoe.makeInvite(seat);
    return invite;
  };

  return harden({
    invite: makeAdminInvite(),
    publicAPI: { getEncouragement, getNotification },
  });
});
