// Agoric Dapp api deployment script

export default async function deployApi(homeP, { bundleSource, pathResolve }) {
  let overrideInstanceRegKey;
  const dc = `${process.cwd()}/dappConstants.js`;
  let dappConstants;
  try {
    require(dc);
    dappConstants = __DAPP_CONSTANTS__;
    overrideInstanceRegKey = __DAPP_CONSTANTS__.CONTRACT_ID;
  } catch (e) {
    console.log(`Proceeeding with defaults; cannot load ${dc}:`, e.message);
  }

  const scratch = homeP~.uploads;
  const { brandRegKeys, INSTANCE_REGKEY, ADMIN_SEAT_SCRATCH } = dappConstants;

  const { source, moduleFormat } = await bundleSource(pathResolve('./handler.js'));
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
    async ([keyword, brandRegKey]) => {
      brands[keyword] = await issuerKeywordRecord[keyword]~.getBrand();
    }));
  const adminSeats = {
    [overrideInstanceRegKey]: adminSeat,
  };
  const handler = handlerInstall~.spawn({adminSeats, brands, brandRegKeys, zoe, registrar, http, overrideInstanceRegKey});
  await homeP~.http~.registerAPIHandler(handler);
}
