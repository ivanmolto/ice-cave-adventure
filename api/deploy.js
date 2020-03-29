// @ts-check
// Agoric Dapp api deployment script

import dappConstants from '../ui/public/lib/constants.js';

/**
 * @typedef {Object} DeployPowers The special powers that agoric deploy gives us
 * @property {(path: string) => { moduleFormat: string, source: string }} bundleSource
 * @property {(path: string) => string} pathResolve
 */

/**
 * @param {any} homeP A promise for the REPL home
 * @param {DeployPowers} powers
 */
export default async function deployApi(homeP, { bundleSource, pathResolve }) {
  const overrideInstanceRegKey = dappConstants.INSTANCE_REGKEY;

  const scratch = homeP~.uploads;
  const { brandRegKeys, INSTANCE_REGKEY, ADMIN_SEAT_SCRATCH } = dappConstants;

  const { source, moduleFormat } = await bundleSource(pathResolve('./src/handler.js'));
  const handlerInstall = homeP~.spawner~.install(source, moduleFormat);
  const [instance, zoe, registrar, http, adminSeat] = await Promise.all([
    homeP~.registrar~.get(INSTANCE_REGKEY)
      .then(instanceHandle => homeP~.zoe~.getInstance(instanceHandle)),
    homeP~.zoe,
    homeP~.registrar,
    homeP~.http,
    scratch~.get(ADMIN_SEAT_SCRATCH),
  ]);

  const { issuerKeywordRecord } = instance;
  const brands = {};
  await Promise.all(Object.entries(brandRegKeys).map(
    async ([keyword, _brandRegKey]) => {
      brands[keyword] = await issuerKeywordRecord[keyword]~.getBrand();
    }));
  const adminSeats = {
    [overrideInstanceRegKey]: adminSeat,
  };
  const handler = handlerInstall~.spawn({adminSeats, brands, brandRegKeys, zoe, registrar, http, overrideInstanceRegKey});
  await homeP~.http~.registerAPIHandler(handler);
}
