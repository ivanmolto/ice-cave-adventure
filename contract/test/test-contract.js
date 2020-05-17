// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from 'tape-promise/tape';
// eslint-disable-next-line import/no-extraneous-dependencies
import bundleSource from '@agoric/bundle-source';
import harden from '@agoric/harden';
import produceIssuer from '@agoric/ertp';
import { E } from '@agoric/eventual-send';

import { makeZoe } from '@agoric/zoe';

const contractPath = `${__dirname}/../src/contract`;

// __Test Scenario__

// The Game Store plays the contract creator and the platform
// It creates the contract for a game ("VoltAir Ice Cave", 3 loot boxes)
// The Game Store wants 99 moolas per loot

// Alice buys loot #1

// Then, the Joker tries malicious things:
// - Joker tries to buy again loot #1 (and will fail)
// - Joker tries to buy loot #2 for 1 moola (and will fail)

// Then, Bob tries to buy loot 1 and fails. He buys loot #2 and #3

// The Game Store is told about the game loots being sold out. It gets all the moolas from
// the sale

test(`Zoe game loots contract`, async t => {
  // Setup initial conditions
  const {
    mint: moolaMint,
    issuer: moolaIssuer,
    amountMath: { make: moola },
  } = produceIssuer('moola');

  const zoe = makeZoe({ require });
  const inviteIssuer = zoe.getInviteIssuer();

  // === Initial Game Store part ===
  const contractReadyP = bundleSource(contractPath).then(
    ({ source, moduleFormat }) => {
      const expectedAmountPerLoot = moola(99);

      const installationHandle = zoe.install(source, moduleFormat);

      return zoe
        .makeInstance(installationHandle, harden({ Money: moolaIssuer }), {
          game: 'VoltAir Ice Cave',
          count: 3,
          expectedAmountPerLoot,
        })
        .then(platformInvite => {
          return inviteIssuer
            .getAmountOf(platformInvite)
            .then(({ extent: [{ instanceHandle: platformHandle }] }) => {
              const { publicAPI } = zoe.getInstanceRecord(platformHandle);

              t.equal(
                typeof publicAPI.makeBuyerInvite,
                'function',
                'publicAPI.makeBuyerInvite should be a function',
              );
              t.equal(
                typeof publicAPI.getLootIssuer,
                'function',
                'publicAPI.getLootIssuer should be a function',
              );
              t.equal(
                typeof publicAPI.getAvailableLoots,
                'function',
                'publicAPI.getAvailableLoots should be a function',
              );

              // The platform makes an offer.
              return (
                // Note that the proposal here is empty
                // This is due to a current limitation in proposal
                // expressiveness:
                // https://github.com/Agoric/agoric-sdk/issues/855
                zoe
                  .offer(platformInvite, harden({}))
                  // completeObj exists because of a current limitation in @agoric/marshal : https://github.com/Agoric/agoric-sdk/issues/818
                  .then(
                    async ({
                      outcome: platformOutcomeP,
                      payout,
                      completeObj: { complete },
                      offerHandle,
                    }) => {
                      t.equal(
                        await platformOutcomeP,
                        `The offer has been accepted. Once the contract has been completed, please check your payout`,
                        `default acceptance message`,
                      );
                      t.equal(
                        typeof complete,
                        'function',
                        'complete should be a function',
                      );

                      const currentAllocation = await E(
                        zoe,
                      ).getCurrentAllocation(await offerHandle);

                      t.equal(
                        currentAllocation.Loot.extent.length,
                        3,
                        `the platform offerHandle should be associated with the 3 loots`,
                      );

                      return {
                        publicAPI,
                        gamePayout: payout,
                        complete,
                      };
                    },
                  )
              );
            });
        });
    },
  );

  const alicePartFinished = contractReadyP.then(({ publicAPI }) => {
    const lootIssuer = publicAPI.getLootIssuer();
    const lootAmountMath = lootIssuer.getAmountMath();

    // === Alice part ===
    // Alice starts with 300 moolas
    const alicePurse = moolaIssuer.makeEmptyPurse();
    alicePurse.deposit(moolaMint.mintPayment(moola(300)));

    // Alice makes an invite
    const aliceInvite = inviteIssuer.claim(publicAPI.makeBuyerInvite());
    return inviteIssuer
      .getAmountOf(aliceInvite)
      .then(({ extent: [{ instanceHandle: aliceHandle }] }) => {
        const { terms: termsOfAlice } = zoe.getInstanceRecord(aliceHandle);
        // Alice checks terms
        t.equal(termsOfAlice.game, 'VoltAir Ice Cave');
        t.equal(termsOfAlice.expectedAmountPerLoot.brand, moola(99).brand);
        t.equal(termsOfAlice.expectedAmountPerLoot.extent, moola(99).extent);

        const availableLoots = publicAPI.getAvailableLoots();
        // and sees the currently available tickets
        t.equal(availableLoots.length, 3, 'Alice should see 3 available loots');
        t.ok(
          availableLoots.find(loot => loot.number === 1),
          `availableLoots contains loot number 1`,
        );
        t.ok(
          availableLoots.find(loot => loot.number === 2),
          `availableLoots contains loot number 2`,
        );
        t.ok(
          availableLoots.find(loot => loot.number === 3),
          `availableLoots contains loot number 3`,
        );

        // find the extent corresponding to loot #1
        const loot1Extent = availableLoots.find(loot => loot.number === 1);
        // make the corresponding amount
        const loot1Amount = lootAmountMath.make(harden([loot1Extent]));

        const aliceProposal = harden({
          give: { Money: termsOfAlice.expectedAmountPerLoot },
          want: { Loot: loot1Amount },
        });

        const alicePaymentForLoot = alicePurse.withdraw(
          termsOfAlice.expectedAmountPerLoot,
        );

        return zoe
          .offer(aliceInvite, aliceProposal, {
            Money: alicePaymentForLoot,
          })
          .then(({ payout: payoutP }) => {
            return payoutP.then(alicePayout => {
              return lootIssuer
                .claim(alicePayout.Loot)
                .then(aliceLootPayment => {
                  return lootIssuer
                    .getAmountOf(aliceLootPayment)
                    .then(aliceBoughtLootAmount => {
                      t.equal(
                        aliceBoughtLootAmount.extent[0].game,
                        'VoltAir Ice Cave',
                        'Alice should have receieved the loot for the correct game',
                      );
                      t.equal(
                        aliceBoughtLootAmount.extent[0].number,
                        1,
                        'Alice should have received the loot for the correct number',
                      );
                    });
                });
            });
          });
      });
  });

  const jokerPartFinished = Promise.all([
    contractReadyP,
    alicePartFinished,
  ]).then(([{ publicAPI }]) => {
    // === Joker part ===
    const lootIssuer = publicAPI.getLootIssuer();
    const lootAmountMath = lootIssuer.getAmountMath();

    // Joker starts with 300 moolas
    const jokerPurse = moolaIssuer.makeEmptyPurse();
    jokerPurse.deposit(moolaMint.mintPayment(moola(300)));

    // Joker attempts to buy loot 1 (and should fail)
    const buyLoot1Attempt = Promise.resolve().then(() => {
      const jokerInvite = inviteIssuer.claim(publicAPI.makeBuyerInvite());

      return inviteIssuer
        .getAmountOf(jokerInvite)
        .then(({ extent: [{ instanceHandle: instanceHandleOfJoker }] }) => {
          const { terms } = zoe.getInstanceRecord(instanceHandleOfJoker);

          const { expectedAmountPerLoot: expectedAmountPerLootOfJoker } = terms;

          // Joker does NOT check available tickets and tries to buy the loot
          // number 1(already bought by Alice, but he doesn't know)
          const loot1Amount = lootAmountMath.make(
            harden([
              {
                game: terms.game,
                number: 1,
              },
            ]),
          );

          const jokerProposal = harden({
            give: { Money: expectedAmountPerLootOfJoker },
            want: { Loot: loot1Amount },
          });

          const jokerPaymentForLoot = jokerPurse.withdraw(
            expectedAmountPerLootOfJoker,
          );

          return zoe
            .offer(jokerInvite, jokerProposal, {
              Money: jokerPaymentForLoot,
            })
            .then(({ outcome, payout: payoutP }) => {
              t.rejects(
                outcome,
                'performExchange from Joker should throw when trying to buy loot #1',
              );

              return payoutP.then(({ Loot, Money }) => {
                return Promise.all([
                  lootIssuer.getAmountOf(Loot),
                  moolaIssuer.getAmountOf(Money),
                ]).then(([jokerRefundLootAmount, jokerRefundMoneyAmount]) => {
                  t.ok(
                    lootAmountMath.isEmpty(jokerRefundLootAmount),
                    'Joker should not receive loot #1',
                  );
                  t.equal(
                    jokerRefundMoneyAmount.extent,
                    99,
                    'Joker should get a refund after trying to get loot #1',
                  );
                });
              });
            });
        });
    });

    // Joker attempts to buy loot #2 for 1 moola (and should fail)
    return buyLoot1Attempt.then(() => {
      const jokerInvite = inviteIssuer.claim(publicAPI.makeBuyerInvite());

      return inviteIssuer
        .getAmountOf(jokerInvite)
        .then(({ extent: [{ instanceHandle: instanceHandleOfJoker }] }) => {
          const { terms } = zoe.getInstanceRecord(instanceHandleOfJoker);

          const loot2Amount = lootAmountMath.make(
            harden([
              {
                game: terms.game,
                number: 2,
              },
            ]),
          );

          const jokerInsufficientAmount = moola(1);

          const jokerProposal = harden({
            give: { Money: jokerInsufficientAmount },
            want: { Loot: loot2Amount },
          });

          const jokerInsufficientPaymentForLoot = jokerPurse.withdraw(
            jokerInsufficientAmount,
          );

          return zoe
            .offer(jokerInvite, jokerProposal, {
              Money: jokerInsufficientPaymentForLoot,
            })
            .then(({ outcome, payout }) => {
              t.rejects(
                outcome,
                'outcome from Joker should throw when trying to buy a loot for 1 moola',
              );

              return payout.then(({ Loot, Money }) => {
                return Promise.all([
                  lootIssuer.getAmountOf(Loot),
                  moolaIssuer.getAmountOf(Money),
                ]).then(([jokerRefundLootAmount, jokerRefundMoneyAmount]) => {
                  t.ok(
                    lootAmountMath.isEmpty(jokerRefundLootAmount),
                    'Joker should not receive loot #2',
                  );
                  t.equal(
                    jokerRefundMoneyAmount.extent,
                    1,
                    'Joker should get a refund after trying to get loot #2 for 1 moola',
                  );
                });
              });
            });
        });
    });
  });

  const bobPartFinished = Promise.all([contractReadyP, jokerPartFinished]).then(
    ([{ publicAPI }]) => {
      // === Bob part ===
      const lootIssuer = publicAPI.getLootIssuer();
      const lootAmountMath = lootIssuer.getAmountMath();

      // Bob starts with 300 moolas
      const bobPurse = moolaIssuer.makeEmptyPurse();
      bobPurse.deposit(moolaMint.mintPayment(moola(300)));

      const availableLoots = publicAPI.getAvailableLoots();

      // and sees the currently available tickets
      t.equal(availableLoots.length, 2, 'Bob should see 2 available loots');
      t.ok(
        !availableLoots.find(loot => loot.number === 1),
        `availableLoots should NOT contain loot number 1`,
      );
      t.ok(
        availableLoots.find(loot => loot.number === 2),
        `availableLoots should still contain loot number 2`,
      );
      t.ok(
        availableLoots.find(loot => loot.number === 3),
        `availableLoots should still contain loot number 3`,
      );

      // Bob buys loots #2 and #3
      const bobInvite = inviteIssuer.claim(publicAPI.makeBuyerInvite());

      const loot2and3Amount = lootAmountMath.make(
        harden([
          availableLoots.find(loot => loot.number === 2),
          availableLoots.find(loot => loot.number === 3),
        ]),
      );

      const bobProposal = harden({
        give: { Money: moola(2 * 99) },
        want: { Loot: loot2and3Amount },
      });
      const bobPaymentForLoot = bobPurse.withdraw(moola(2 * 99));

      return zoe
        .offer(bobInvite, bobProposal, {
          Money: bobPaymentForLoot,
        })
        .then(({ payout: payoutP }) => {
          return payoutP.then(bobPayout => {
            return lootIssuer
              .getAmountOf(bobPayout.Loot)
              .then(bobLootAmount => {
                t.equal(
                  bobLootAmount.extent.length,
                  2,
                  'Bob should have received 2 loots',
                );
                t.ok(
                  bobLootAmount.extent.find(loot => loot.number === 2),
                  'Bob should have received loot #2',
                );
                t.ok(
                  bobLootAmount.extent.find(loot => loot.number === 3),
                  'Bob should have received loot #3',
                );
              });
          });
        });
    },
  );

  return Promise.all([contractReadyP, bobPartFinished])
    .then(([{ publicAPI, gamePayout, complete }]) => {
      // === Final Game Store part ===
      // getting the money back
      const availableLoots = publicAPI.getAvailableLoots();

      t.equal(availableLoots.length, 0, 'All the loots have been sold');

      const gamePurse = moolaIssuer.makeEmptyPurse();

      const done = gamePayout.then(payout => {
        return payout.Money.then(moneyPayment => {
          return gamePurse.deposit(moneyPayment);
        }).then(() => {
          t.equal(
            gamePurse.getCurrentAmount().extent,
            3 * 99,
            `The Game Store should get ${3 * 99} moolas from loot sales`,
          );
        });
      });

      complete();

      return done;
    })
    .catch(err => {
      console.error('Error in last Game Store part', err);
      t.fail('error');
    })
    .then(() => t.end());
});
