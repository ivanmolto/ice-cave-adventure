import harden from '@agoric/harden';
import { E } from '@agoric/eventual-send';

export default harden(({ adminSeats, brands, brandRegKeys, zoe, registrar, http, overrideInstanceRegKey = undefined }, _inviteMaker) => {
  // If we have an overrideInstanceRegKey, use it to assert the correct value in the RPC.
  function coerceInstanceRegKey(instanceRegKey = undefined) {
    if (instanceRegKey === undefined) {
      return overrideInstanceRegKey;
    }
    if (overrideInstanceRegKey === undefined || instanceRegKey === overrideInstanceRegKey) {
      return instanceRegKey;
    }
    throw TypeError(`instanceRegKey ${JSON.stringify(instanceRegKey)} must match ${JSON.stringify(overrideInstanceRegKey)}`);
  }

  const brandToBrandRegKey = new Map();
  Object.entries(brands).forEach(([keyword, brand]) =>
    brandToBrandRegKey.set(brand, brandRegKeys[keyword]));

  const registrarPCache = new Map();
  function getRegistrarP(id) {
    let regP = registrarPCache.get(id);
    if (!regP) {
      // Cache miss, so try the registrar.
      regP = E(registrar).get(id);
      registrarPCache.set(id, regP);
    }
    return regP;
  }

  const instancePCache = new Map();
  function getInstanceP(id) {
    let instanceP = instancePCache.get(id);
    if (!instanceP) {
      const instanceHandleP = getRegistrarP(id);
      instanceP = instanceHandleP.then(instanceHandle =>
        E(zoe).getInstance(instanceHandle));
      instancePCache.set(id, instanceP);
    }
    return instanceP;
  }

  // Here's how you could implement a notification-based
  // publish/subscribe.
  const subscribers = new Map();
  function handleNotification(instanceRegKey, publicAPI) {
    let subs = subscribers.get(instanceRegKey);
    if (!subs) {
      subs = new Set();;
      subscribers.set(instanceRegKey, subs);
    }

    const sendToSubscribers = obj =>
      E(http).send(obj, [...subs.keys()])
        .catch(e => console.error('cannot send for', instanceRegKey, e));

    const fail = e => {
      const obj = {
        type: 'encouragement/encouragedError',
        data: e && e.message || e,
      };
      sendToSubscribers(obj);
    };

    const doOneNotification = ({ changed, ...rest }) => {
      // Publish to our subscribers.
      const obj = {
        type: 'encouragement/encouragedResponse',
        data: rest,
      };
      sendToSubscribers(obj);

      // Wait until the next notification resolves.
      changed.then(_ => E(publicAPI).getNotification().then(doOneNotification, fail));
    };

    E(publicAPI).getNotification().then(doOneNotification, fail);
  }

  const startedInstances = new Set();
  function ensureNotifications(instanceRegKey) {
    const adminSeat = adminSeats[instanceRegKey];
    if (!adminSeat || startedInstances.has(instanceRegKey)) {
      return;
    }
    startedInstances.add(instanceRegKey);

    // TODO: This is where you could call any functions from the initial
    // (privately-held) seat that the Zoe contract creates.
    E(adminSeat).setMessageTemplate(
      ['Hey ', '$name', `, you sure know how to use this Dapp!`]);
  
    getInstanceP(instanceRegKey)
      .then(({ publicAPI }) => handleNotification(instanceRegKey, publicAPI));
  }

  // TODO: Do any startup initialization here.
  if (overrideInstanceRegKey) {
    ensureNotifications(overrideInstanceRegKey);
  }

  const activeChannels = new Map();
  return harden({
    getCommandHandler() {
      const handler = {
        onError(obj, _meta) {
          console.error('Have error', obj);
        },

        // The following is to manage the subscribers map.
        onOpen(_obj, { channelHandle }) {
          activeChannels.set(channelHandle, new Set());
        },
        onClose(_obj, { channelHandle }) {
          const instances = activeChannels.get(channelHandle);
          if (instances) {
            for (const instanceRegKey of instances.keys()) {
              const subs = subscribers.get(instanceRegKey);
              if (subs) {
                // Clean up the subscriptions from the Set.
                subs.delete(channelHandle);
              }
            }
          }
          activeChannels.delete(channelHandle);
        },

        async onMessage(obj, { channelHandle } = {}) {
          // These are messages we receive from either POST or WebSocket.
          switch (obj.type) {
            case 'encouragement/ping':
              return harden({
                type: 'encouragement/pingResponse',
                message: obj.message,
              });

            case 'encouragement/getEncouragement': {
              let { instanceRegKey, name } = obj;
              instanceRegKey = coerceInstanceRegKey(instanceRegKey);
              const { publicAPI } = await getInstanceP(instanceRegKey);

              return harden({
                type: 'encouragement/getEncouragementResponse',
                instanceRegKey,
                data: await E(publicAPI).getEncouragement(name),
              });
            }

            case 'encouragement/subscribeNotifications': {
              let { instanceRegKey } = obj;
              instanceRegKey = coerceInstanceRegKey(instanceRegKey);

              if (!channelHandle) {
                throw Error(`Channel is not set for ${instanceRegKey} subscription`);
              }

              const subs = activeChannels.get(channelHandle);
              if (!subs) {
                throw Error(`Subscriptions not initialised for channel ${channelHandle}`);
              }

              if (subs.has(instanceRegKey)) {
                return harden({
                  type: 'encouragement/subscribeNotificationsResponse',
                  data: 'already',
                });
              }

              subs.add(instanceRegKey);
              ensureNotifications(instanceRegKey);

              return harden({
                type: 'encouragement/subscribeNotificationsResponse',
                data: true,
              });
            }

            default:
              return undefined;
          }
        },
      };
      return harden(handler);
    },
  });
});
