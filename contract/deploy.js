// @ts-check
// Generic Agoric Dapp contract deployment script
// NOTE: YOUR CONTRACT-SPECIFIC INITIALIZATION is in solo-deploy.js
import fs from 'fs';

// This javascript source file uses the "tildot" syntax (foo~.bar()) for
// eventual sends. Tildot is standards track with TC39, the JavaScript standards
// committee.
// TODO: improve this comment. https://github.com/Agoric/agoric-sdk/issues/608

/**
 * @typedef {Object} DeployPowers The special powers that agoric deploy gives us
 * @property {(path: string) => { moduleFormat: string, source: string }} bundleSource
 * @property {(path: string) => string} pathResolve
 */

/**
 * 
 * @param {*} homeP 
 * @param {DeployPowers} powers
 */
export default async function deployContract(homeP, { bundleSource, pathResolve }) {
  const [
    installBundle,
    contractBundle,
  ] = await Promise.all([
    bundleSource(pathResolve(`./scripts/custom-deploy.js`)),
    bundleSource(pathResolve(`./src/contract.js`)),
  ]);

  const wallet = homeP~.wallet;
  const zoe = homeP~.zoe;
  const registrar = homeP~.registrar;
  const scratch = homeP~.uploads;

  const installerInstall = homeP~.spawner~.install(
    installBundle.source,
    installBundle.moduleFormat,
  );
  const installer = installerInstall~.spawn({ wallet, zoe, scratch, registrar });

  const installationHandle = await zoe~.install(contractBundle.source, contractBundle.moduleFormat);

  const { initP, ...contract } =
    await installer~.initInstance(installationHandle, Date.now());

    console.log('- instance made', contract.CONTRACT_NAME, '=>', contract.INSTANCE_REGKEY);
    console.log('- admin seat scratch key', contract.ADMIN_SEAT_SCRATCH);

  try {
    await initP;
  } catch (e) {
    console.error('cannot create initial offers', e);
  }

  // Save the constants somewhere where the UI can find it.
  const dappConstants = {
    ...contract,
    // BRIDGE_URL: 'agoric-lookup:https://local.agoric.com?append=/bridge',
    BRIDGE_URL: 'http://127.0.0.1:8000',
    API_URL: 'http://127.0.0.1:8000',
  };

  const defaultsFile = pathResolve(`../ui/public/conf/defaults.js`);
  console.log('writing', defaultsFile);
  const defaultsContents = `\
// GENERATED FROM ${pathResolve('./deploy.js')}
export default ${JSON.stringify(dappConstants, undefined, 2)};
`;
  await fs.promises.writeFile(defaultsFile, defaultsContents);
}
