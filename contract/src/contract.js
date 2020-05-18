/* eslint-disable no-use-before-define */
// @ts-check

import harden from '@agoric/harden';
import produceIssuer from '@agoric/ertp';
// import { produceNotifier } from '@agoric/notifier';
import {
  makeZoeHelpers,
  defaultAcceptanceMsg,
} from '@agoric/zoe/src/contractSupport/zoeHelpers';

// zcf is the Zoe Contract Facet, i.e. the contract-facing API of Zoe
export const makeContract = harden(
  /** @param {ContractFacet} zcf */ zcf => {
    /*
    const messages = {
      purchase: `Thank you for your purchase! - VoltAir Loot`,
    };
    const { notifier, updater } = produceNotifier();
    */

    // Create the internal Loot Box mint
    const { issuer, mint, amountMath: lootAmountMath } = produceIssuer(
      'Loot Boxes',
      'set',
    );

    /*
    const updateNotification = () => {
      updater.updateState({ messages });
    };
    updateNotification();
    */

    const {
      terms: { game, count, expectedAmountPerLoot },
      issuerKeywordRecord: { Money: moneyIssuer },
    } = zcf.getInstanceRecord();

    const { amountMath: moneyAmountMath } = zcf.getIssuerRecord(moneyIssuer);

    const { rejectOffer, checkHook, escrowAndAllocateTo } = makeZoeHelpers(zcf);

    let platformOfferHandle;

    return zcf.addNewIssuer(issuer, 'Loot').then(() => {
      const lootsAmount = lootAmountMath.make(
        harden(
          Array(count)
            .fill()
            .map((_, i) => {
              const lootNumber = i + 1;
              return harden({
                game,
                number: lootNumber,
                price: expectedAmountPerLoot.extent,
              });
            }),
        ),
      );
      const lootsPayment = mint.mintPayment(lootsAmount);

      const platformOfferHook = offerHandle => {
        platformOfferHandle = offerHandle;
        return escrowAndAllocateTo({
          amount: lootsAmount,
          payment: lootsPayment,
          keyword: 'Loot',
          recipientHandle: platformOfferHandle,
        }).then(() => defaultAcceptanceMsg);
      };

      const buyLootOfferHook = buyerOfferHandle => {
        const buyerOffer = zcf.getOffer(buyerOfferHandle);

        const currentPlatformAllocation = zcf.getCurrentAllocation(
          platformOfferHandle,
        );

        /*
        let purchaseMessage = messages.purchase;
        */

        const currentBuyerAllocation = zcf.getCurrentAllocation(
          buyerOfferHandle,
        );

        const wantedLootsCount = buyerOffer.proposal.want.Loot.extent.length;
        const wantedMoney = expectedAmountPerLoot.extent * wantedLootsCount;

        try {
          if (
            !moneyAmountMath.isGTE(
              currentBuyerAllocation.Money,
              moneyAmountMath.make(wantedMoney),
            )
          ) {
            throw new Error(
              'The offer associated with this loot does not contain enough moolas',
            );
          }

          const wantedPlatformAllocation = {
            Money: moneyAmountMath.add(
              currentPlatformAllocation.Money,
              currentBuyerAllocation.Money,
            ),
            Loot: lootAmountMath.subtract(
              currentPlatformAllocation.Loot,
              buyerOffer.proposal.want.Loot,
            ),
          };

          const wantedBuyerAllocation = {
            Money: moneyAmountMath.getEmpty(),
            Loot: lootAmountMath.add(
              currentBuyerAllocation.Loot,
              buyerOffer.proposal.want.Loot,
            ),
          };

          zcf.reallocate(
            [platformOfferHandle, buyerOfferHandle],
            [wantedPlatformAllocation, wantedBuyerAllocation],
          );
          zcf.complete([buyerOfferHandle]);
        } catch (err) {
          // amounts don't match or reallocate certainly failed
          rejectOffer(buyerOfferHandle);
        }
      };

      const buyLootExpected = harden({
        want: { Loot: null },
        give: { Money: null },
      });

      return harden({
        invite: zcf.makeInvitation(platformOfferHook, 'platform'),
        publicAPI: {
          makeBuyerInvite: () =>
            zcf.makeInvitation(
              checkHook(buyLootOfferHook, buyLootExpected),
              'buy loot',
            ),
          getLootIssuer: () => issuer,
          getAvailableLoots() {
            // Because of a technical limitation in @agoric/marshal, an array of extents
            // is better than a Map https://github.com/Agoric/agoric-sdk/issues/838
            return zcf.getCurrentAllocation(platformOfferHandle).Loot.extent;
          },
        },
      });
    });
  },
);
