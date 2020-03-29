// @ts-check
import harden from '@agoric/harden';

const CONTRACT_NAME = 'encouragement';

// This initInstance function is specific to the contract.
//
// Notably, it interacts with the contract to prepopulate some
// details.

/**
 * @param {Object.<string, any>} powers
 */
export default harden(({ wallet, zoe, scratch, registrar }) => {
  return harden({
    async initInstance(installationHandle, _now = Date.now()) {
      // =====================
      // === AWAITING TURN ===
      // =====================
    
      // 1. Issuers and purse petnames
      // Just take the first two purses.
      const [[pursePetname0], [pursePetname1]] = await wallet~.getPurses();

      // =====================
      // === AWAITING TURN ===
      // =====================
    
      const [issuer0, issuer1] = await Promise.all([
        wallet~.getPurseIssuer(pursePetname0),
        wallet~.getPurseIssuer(pursePetname1),
      ]);

      // =====================
      // === AWAITING TURN ===
      // =====================

      // 2. Contract instance.
      const [
        invite,
        inviteIssuer,
        brandRegKey0,
        brandRegKey1,
      ] = await Promise.all([
        zoe~.makeInstance(installationHandle, {
          Fee: issuer0,
          Bonus: issuer1,
        }),
        zoe~.getInviteIssuer(),
        wallet~.getIssuerNames(issuer0)~.brandRegKey,
        wallet~.getIssuerNames(issuer1)~.brandRegKey,
      ])
    
      // =====================
      // === AWAITING TURN ===
      // =====================
    
      // 3. Get the instanceHandle
    
      const [
        {
          extent: [{ instanceHandle }],
        },
        { seat: adminSeat },
      ] = await Promise.all([
        inviteIssuer~.getAmountOf(invite),
        zoe~.redeem(invite),
      ]);
      const INSTANCE_REGKEY = await registrar~.register(CONTRACT_NAME, instanceHandle);

      const ADMIN_SEAT_SCRATCH = `${INSTANCE_REGKEY}-admin`;
      scratch~.set(ADMIN_SEAT_SCRATCH, adminSeat);
      const initP = Promise.resolve();
      return {
        CONTRACT_NAME,
        ADMIN_SEAT_SCRATCH,
        INSTANCE_REGKEY,
        initP,
        brandRegKeys: {
          Fee: brandRegKey0,
          Bonus: brandRegKey1,
        },
      };
    },
  });
});
