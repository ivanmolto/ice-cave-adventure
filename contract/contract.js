/* eslint-disable no-use-before-define */
import harden from '@agoric/harden';
import { assert, details } from '@agoric/assert';
import makePromise from '@agoric/make-promise';

/**
 * The SimpleExchange uses Asset and Price as its keywords. In usage,
 * they're somewhat symmetrical. Participants will be buying or
 * selling in both directions.
 *
 * { give: { Asset: simoleans(5) }, want: { Price: quatloos(3) } }
 * { give: { Price: quatloos(8) }, want: { Asset: simoleans(3) } }
 *
 * The Asset is treated as an exact amount to be exchanged, while the
 * Price is a limit that may be improved on. This simple exchange does
 * not partially fill orders.
 */
export const makeContract = harden(zoe => {
  let count = 0;
  let messageTemplate = ['Hello, ', '$name', `, you're doing great!`];

  let changed = makePromise();
  const updateNotification = () => {
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

  const getNotification = () => ({
    changed: changed.p,
    messageTemplate,
    count,
  });

  return harden({
    invite: makeAdminInvite(),
    publicAPI: { getEncouragement, getNotification },
  });
});
