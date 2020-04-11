# Encouragement Agoric Dapp

This is an [Agoric Dapp](https://agoric.com/documentation/dapps/) whose purpose is to show how the plumbing between a browser UI, the chain-connected ag-solo API server, and the on-chain contract should be done.

This particular Dapp UI is written in vanilla JS (as opposed to using a framework), and does:

1. subscribe to contract notifications via the API server
2. accesses your Agoric wallet, and
3. at the user's requoest, either:
  a. requests some free encouragement, or
   b. proposes (via the user's wallet and Zoe) exchanging a Tip for
   some Encouragement

To learn more about how to build Agoric Dapps, please see the [Dapp Guide](https://agoric.com/documentation/dapps/).

Here's the interface:

![Screenshot Before Encouragement](readme-assets/before.png)

and after we click the "Encourage Me!" button:

![Screenshot After Encouragement](readme-assets/after.png)

## TODO

Things we need to fix are listed in [the Github issues for this repository](https://github.com/Agoric/dapp-encouragement/issues).