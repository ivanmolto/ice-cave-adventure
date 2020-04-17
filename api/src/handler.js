// @ts-check
import harden from '@agoric/harden';
import { E } from '@agoric/eventual-send';

export default harden(({ publicAPI, http, overrideInstanceRegKey = undefined }, _inviteMaker) => {
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

  // Here's how you could implement a notification-based
  // publish/subscribe.
  const subscribers = new Map();
  const lastPublished = new Map();
  function handleNotification(instanceRegKey, publicAPI) {
    let subs = subscribers.get(instanceRegKey);
    if (!subs) {
      subs = new Set();
      subscribers.set(instanceRegKey, subs);
    }

    const sendToSubscribers = obj => {
      lastPublished.set(instanceRegKey, obj);
      E(http).send(obj, [...subs.keys()])
        .catch(e => console.error('cannot send for', instanceRegKey, e));
    };

    const fail = e => {
      const obj = {
        type: 'encouragement/encouragedError',
        instanceRegKey,
        data: e && e.message || e,
      };
      sendToSubscribers(obj);
    };

    const doOneNotification = ({ changed, ...rest }) => {
      // Publish to our subscribers.
      const obj = {
        type: 'encouragement/encouragedResponse',
        instanceRegKey,
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
    startedInstances.add(instanceRegKey);

    // TODO: This is where you could call any functions from the initial
    // (privately-held) seat that the Zoe contract creates.

  
    handleNotification(instanceRegKey, publicAPI);
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
            case 'encouragement/getEncouragement': {
              let { instanceRegKey, name } = obj;
              instanceRegKey = coerceInstanceRegKey(instanceRegKey);

              return harden({
                type: 'encouragement/getEncouragementResponse',
                instanceRegKey,
                data: `You shouldn't be getting an encouragement yet! This needs to go through your wallet.`,
              });
            }

            case 'encouragement/subscribeNotifications': {
              let { instanceRegKey } = obj;
              instanceRegKey = coerceInstanceRegKey(instanceRegKey);

              if (!channelHandle) {
                throw Error(`Channel is not set for ${instanceRegKey} subscription`);
              }

              const instances = activeChannels.get(channelHandle);
              if (!instances) {
                throw Error(`Subscriptions not initialised for channel ${channelHandle}`);
              }

              if (instances.has(instanceRegKey)) {
                return harden({
                  type: 'encouragement/subscribeNotificationsResponse',
                  instanceRegKey,
                  data: 'already',
                });
              }

              ensureNotifications(instanceRegKey);

              instances.add(instanceRegKey);
              let subs = subscribers.get(instanceRegKey);
              if (!subs) {
                subs = new Set();
                subscribers.set(instanceRegKey, subs);
              }
              subs.add(channelHandle);

              const last = lastPublished.get(instanceRegKey);
              if (last) {
                E(http).send(last, [channelHandle]);
              }

              return harden({
                type: 'encouragement/subscribeNotificationsResponse',
                instanceRegKey,
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
