// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from 'tape-promise/tape';
// eslint-disable-next-line import/no-extraneous-dependencies
import bundleSource from '@agoric/bundle-source';

import { E } from '@agoric/eventual-send'
import harden from '@agoric/harden';

import { makeZoe } from '@agoric/zoe';
import produceIssuer from '@agoric/ERTP';
import { makeGetInstanceHandle } from '@agoric/zoe/src/clientSupport';

const contractPath = `${__dirname}/../src/contract`;

test('contract with valid offers', async t => {
  t.plan(11);
  try {

    // Outside of tests, we should use the long-lived Zoe on the
    // testnet. In this test, we must create a new Zoe.
    const zoe = makeZoe({ require });

    // Get the Zoe invite issuer from Zoe.
    const inviteIssuer = await E(zoe).getInviteIssuer();

    // Make our helper functions.
    const getInstanceHandle = makeGetInstanceHandle(inviteIssuer);

    // Pack the contract.
    const { source, moduleFormat } = await bundleSource(contractPath);

    // Install the contract on Zoe, getting an installationHandle (an
    // opaque identifier). We can use this installationHandle to look
    // up the code we installed. Outside of tests, we can also send the
    // installationHandle to someone else, and they can use it to
    // create a new contract instance using the same code.
    const installationHandle = await E(zoe).install(source, moduleFormat);
    
    // Let's check the code. Outside of this test, we would probably
    // want to check more extensively,
    const code = await E(zoe).getInstallation(installationHandle);
    t.ok(code.includes(`This contract does a few interesting things.`), `the code installed passes a quick check of what we intended to install`);

    // Make some mints/issuers just for our test.
    const shruteBucksBundle = produceIssuer('bucks');
    const stanleyNickelsBundles = produceIssuer('nickels');

    // Create the contract instance, using our new issuers.
    const invite = await E(zoe).makeInstance(installationHandle, {
      Fee: shruteBucksBundle.issuer,
      Bonus: stanleyNickelsBundles.issuer,
    });

    // Check that we received an invite as the result of making the
    // contract instance.
    t.ok(await E(inviteIssuer).isLive(invite), `an valid invite (an ERTP payment) was created`);
    
    // Use the helper function to get an instanceHandle from the invite.
    const instanceHandle = await getInstanceHandle(invite);

    // Let's test some of the publicAPI methods. The publicAPI is
    // accessible to anyone who has access to Zoe and the
    // instanceHandle. The publicAPI methods are up to the contract,
    // and Zoe doesn't require contracts to have any particular
    // publicAPI methods.
    const instanceRecord = await E(zoe).getInstance(instanceHandle);
    const { publicAPI } = instanceRecord;

    // `getNotification` returns a record (bundle). The record has a
    // property `changed` which is a promise that is resolved to undefined when
    // something has changed. We can use this signal to know when to
    // call `getNotification` again.
    const notificationBundle = await E(publicAPI).getNotification();

    // Count starts at 0
    t.equals(notificationBundle.count, 0, `count starts at 0`);

    // The message template default
    t.deepEquals(
      notificationBundle.messageTemplate,
      harden([ 'Hello, ', '$name', ', you\'re doing great!' ]),
      `messageTemplate default`
    );

    // Let's use the contract like a client and get some encouragement!
    const encouragement = await E(publicAPI).getEncouragement('Alice');
    t.equals(encouragement, `Hello, Alice, you\'re doing great!`, `encouragement matches expected`);
    
    // Calling `getEncouragement` resolves the `changed` promise
    notificationBundle.changed.then(async result => {
      t.equals(result, undefined, 'resolves to undefined')

      // Let's call `getNotification` again to see what changed
      const notificationBundle2 = await E(publicAPI).getNotification();
      t.equals(notificationBundle2.count, 1, `count increments by 1`);

      // Now, let's change the message template with our admin invite.
      // First we must redeem the invite to get a seat from Zoe.
      const { seat } = await E(zoe).redeem(invite);

      // This is the wrong format - the new message template must be
      // an array.
      t.rejects(() => E(seat).setMessageTemplate('new message'), /Error: \(a string\) must be an array/, `must be an array`);

      const newTemplate = ['Hey! ', '$name', ', how did you get so good at this?!' ];
      const setMessageTemplateResult = await E(seat).setMessageTemplate(newTemplate);
      t.equals(setMessageTemplateResult, undefined, `nothing is returned when setting message template`);

      notificationBundle2.changed.then(async result => {
        const notificationBundle3 = await E(publicAPI).getNotification();
        
        // Let's check that we successfully set the new template.
        t.deepEquals(notificationBundle3.messageTemplate, newTemplate, `template is new template`);
        
        // Let's check that the new template works.
        const encouragement = await E(publicAPI).getEncouragement('Bob');
        t.equals(encouragement, `Hey! Bob, how did you get so good at this?!`, `encouragement matches new message`);
      });
    });
  } catch (e) {
    t.isNot(e, e, 'unexpected exception');
  }
});