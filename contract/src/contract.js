// @ts-check
import harden from '@agoric/harden';
import { producePromise } from '@agoric/produce-promise';
import { makeZoeHelpers } from '@agoric/zoe/src/contractSupport/zoeHelpers';

/**
 * This contract does a few interesting things.
 */
export const makeContract = harden(zcf => {
  let count = 0;
  const messages = {
    basic: `You're doing great!`,
    premium: `Wow, just wow. I have never seen such talent!`,
  };
  let adminOfferHandle;
  const tipAmountMath = zcf.getAmountMaths(harden(['Tip'])).Tip;

  const { inviteAnOffer, rejectOffer } = makeZoeHelpers(zcf);

  // Implement simple notifications for the contract state.
  // A caller of getNotification is notified that the state
  // has changed when the 'changed' promise resolves.
  // They then can call getNotification again to get the new
  // state and a new 'changed' promise.
  let changed = producePromise();
  const getNotification = () => ({
    changed: changed.promise,
    messages,
    count,
  });

  const updateNotification = () => {
    // Resolve the old changed promise, and create a new
    // one.
    changed.resolve();
    changed = producePromise();
  };

  const adminHook = offerHandle => {
    adminOfferHandle = offerHandle;
    return `admin invite redeemed`;
  };

  const encouragementHook = offerHandle => {
    // if the adminOffer is no longer active (i.e. the admin cancelled
    // their offer and retrieved their tips), we just don't give any
    // encouragement.
    if (!zcf.isOfferActive(adminOfferHandle)) {
      rejectOffer(offerHandle, `We are no longer giving encouragement`);
    }

    const userTipAllocation = zcf.getCurrentAllocation(offerHandle).Tip;
    let encouragement = messages.basic;
    // if the user gives a tip, we provide a premium encouragement
    // message
    if (
      userTipAllocation &&
      tipAmountMath.isGTE(userTipAllocation, tipAmountMath.make(1))
    ) {
      encouragement = messages.premium;
      // reallocate the tip to the adminOffer
      const adminTipAllocation = zcf.getCurrentAllocation(adminOfferHandle).Tip;
      const newAdminAllocation = {
        Tip: tipAmountMath.add(adminTipAllocation, userTipAllocation),
      };
      const newUserAllocation = {
        Tip: tipAmountMath.getEmpty(),
      };

      zcf.reallocate(
        harden([adminOfferHandle, offerHandle]),
        harden([newAdminAllocation, newUserAllocation]),
        harden(['Tip']),
      );
    }
    zcf.complete(harden([offerHandle]));
    count += 1;
    updateNotification();
    return encouragement;
  };

  const makeInvite = () =>
    inviteAnOffer(
      harden({
        offerHook: encouragementHook,
        customProperties: { inviteDesc: 'encouragement' },
      }),
    );

  return harden({
    invite: inviteAnOffer(
      harden({
        offerHook: adminHook,
        customProperties: { inviteDesc: 'admin' },
      }),
    ),
    publicAPI: {
      getNotification,
      makeInvite,
      getFreeEncouragement: () => {
        count += 1;
        updateNotification();
        return messages.basic;
      },
    },
  });
});
