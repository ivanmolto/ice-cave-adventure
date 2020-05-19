# ICE CAVE ADVENTURE

A decentralized game with non-fungible loot boxes on top of Agoric blockchain.

This game demonstrates the three layers of a decentralized game and how they should be connected:
- The frontend - browser UI 
- The backend - API server 
- The on-chain contract

This decentralized game starts a local blockchain and deploys a contract to that blockchain.
It does not currently deploy or connect to the Agoric testnet.

This game has been developed using Phaser.

## Setup

Clone the repo and move to the directory where the project has been cloned.

Once there install the JavaScript dependencies with the following command in the terminal:
`agoric install`

Then start the Agoric VM in the terminal with the command:
`agoric start --reset`

Open another shell and enter the command:
`agoric deploy ./contract/deploy.js ./api/deploy.js ./ui/deploy.js`

Open another shell to deploy the frontend, go to the ui folder and install the NPM dependencies:
```
cd ui
npm install
```
To launch the Phaser development server with the following command in the terminal:
`npm start`

Go to a browser and open `http://localhost:8080` to see the game and `http://localhost:8 to see and interact with the wallet.

To learn more about how to build Agoric Dapps, please see the [Dapp Guide](https://agoric.com/documentation/dapps/).


## Test
Test the contract with the following command in the terminal:
`yarn test`


## Roles in the arrangement
The contract is adapted from the Opera Concert Ticket - contract

  
The Game Developer and Contract creator describe the contract with:
- Number of Non Fungible Loot Boxes (Tokens),
- Expected (ERTP) amount per Loot Box (all loot boxes cost the same)
The Smart Contract:
- Mints the loot boxes
The Game Store is the platform hosting and selling the loot boxes and getting the payment back.
Players/Gamers (Loot boxes buyers):
- can see the available loot boxes
- can consult the terms
- can redeem the zoe invite with the proper payment to get the loot back
  

## License
This project is licensed under the MIT license.






