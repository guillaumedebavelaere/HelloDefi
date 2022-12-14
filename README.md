[![CI](https://github.com/guillaumedebavelaere/HelloDefi/actions/workflows/ci.yml/badge.svg)](https://github.com/guillaumedebavelaere/HelloDefi/actions/workflows/ci.yml)

# Hello Defi

HelloDefi is a decentralized application (dapp) that allows you to invest funds securely and transparently using the blockchain.

# Table of contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [How to Use HelloDefi ?](#how-to-use-hellodefi-)  
4. [How it works ?](#how-it-works-)
5. [Project structure](#project-structure)
6. [Requirements](#requirements)
7. [Installation](#installation)
8. [Deployment](#deployment)
9. [TODO/Improvements](#todo--improvements)

## Introduction

This project is a simple POC that allows AAVE V2 DAI and LINK lending pool investment on Goerli testnet.

The platform uses smart contracts to interact with AAVE lending pools. 
A smart contract is created for the user who will own the contract to assure security and transparency.

<img width="1080" alt="Capture d’écran 2022-12-10 à 12 33 56" src="https://user-images.githubusercontent.com/17125662/206855406-131d1e6a-f5d1-4039-a851-b7c0b7d7bf4a.png">

## Features

Use the simple and intuitive interface to manage your deposit and withdraw activities.  
Take advantage of the security and transparency of the Ethereum blockchain.  
Choose between various investment strategies based on their risk rate and APY.  


## How to Use HelloDefi ?

Using HelloDefi is simple and intuitive. Here's how you can get started using the platform:

1. Download and install an Ethereum-compatible wallet on your device. You can use wallets such as MetaMask or MyEtherWallet.

2. Sign in to your wallet and make sure you have enough funds to cover transaction fees on the Ethereum blockchain (Goerli testnet).  
To add Goerli as a network go to: [chainlist](https://chainlist.org/?testnets=true&search=goerli).  
To get DAI and LINK tokens go to: [AAVE2 staging](https://staging.aave.com/) (select Ethereum network Goerli on AAVE 2)

3. Visit the HelloDefi website and connect your wallet to the platform, you should see your wallet address on the right top of the screen.

4. From then choose the asset that you want to deposit and enter the amount in the deposit form. You will have to approve the amount to spent bedore depositing.

5. If you want to withdraw funds, select the asset that you want to withdraw,  and select the "withdraw" side when the form pops up. You can now enter the amount that you want to withdraw.

Click [here](https://www.loom.com/share/8533906345b94c4c852abd327299cdfb) to see a video demo.

## How it works ?

The HelloDefi dApp lets you take advantage of the benefits of decentralized finance. When you deposit funds into a protocol a unique smart contract is created with your wallet address, your funds are then sent from your smart contract to the protocol that you have chosen.   
This lets you track your funds in the dApp and only you can withdraw them when needed. Until you withdraw, the funds are in the protocol and are working for you, you gain rewards as interests for providing liquidity to borrowers. The interest rate is related to the use of the pool.

## Project structure

This project was created with truffle unbox react.  
2 main folders : client for the frontend and truffle for the smart contracts.  

## Requirements

Node 16 Truffle Ganache Yarn

## Installation

Front-end
```sh
cd client
yarn install
```

You have to create a .env file in the client directory with the following content:
```
REACT_APP_PROTOCOL_DATA_PROVIDER_AAVE2_CONTRACT_ADDRESS=0x927F584d4321C1dCcBf5e2902368124b02419a1E // contract address of AAVE 2 data provider on goerli network
REACT_APP_DAI_CONTRACT_ADDRESS=0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33 // DAI address on goerli network (DAI used in AAVE 2)
REACT_APP_LINK_CONTRACT_ADDRESS=0x7337e7FF9abc45c0e43f130C136a072F4794d40b // LINK address on goerli network (LINK used in AAVE 2)
```

Smart contracts
```sh
cd truffle
yarn compile
```

You have to create a .env file in the truffle directory with the following content:
```
INFURA_PROJECT_ID=YOUR INFURA PROJECT ID // used for deploy
MNEMONIC=YOUR MNEMONIC // used for deploy
LENDING_POOL_AAVE2_CONTRACT_ADDRESS=0x4bd5643ac6f66a5237E18bfA7d47cF22f1c9F210 // contract address of AAAVE2 lending pool on goerli network
PROTOCOL_DATA_PROVIDER_AAVE2_CONTRACT_ADDRESS=0x927F584d4321C1dCcBf5e2902368124b02419a1E // contract address of AAVE 2 data provider on goerli network
DAI_AGGREGATOR_V3_CHAIN_LINK_CONTRACT_ADDRESS=0x0d79df66BE487753B02D015Fb622DED7f0E9798d // contract address of DAI chainlink aggregatorv3 on goerli network
LINK_AGGREGATOR_V3_CHAIN_LINK_CONTRACT_ADDRESS=0x48731cF7e84dc94C5f84577882c14Be11a5B7456 // contract address of LINK chainlink aggregatorv3 on goerli network
```


Tests
```sh
cd truffle
yarn test
```
## Deployment
The dApp is deployed on the goerli network and available at https://hello-defi.vercel.app/

## TODO / Improvements

- The [PriceFeedConsumer](https://github.com/guillaumedebavelaere/HelloDefi/blob/master/truffle/contracts/FeesCollector.sol) is using AggregatorV3Interface from chainlink. The problem is we have to import a price feed for each asset. We could use [feed registry](https://docs.chain.link/data-feeds/feed-registry), but it is not available yet on testnet.
- We created manually mocks for external contracts to run the tests. The issue is the abi for mocks are generated in the same folder as other abis and not necessary to run the dapps. Moreover it is painful to create a mock each time we want to add an external contract. It would be probably better to migrate the app to use hardhat instead of truffle in order to use a library like [waffle](https://ethereum-waffle.readthedocs.io/en/latest/mock-contract.html#mock-contract). Hardhat comes also with solidity-coverage plugin, which doesn't work anymore with truffle.
- The fees are taken currently from token deposited/withdrawn. It may be better to take the fees in ethers to simplify the code (separating the action of taking the fees from deposit/withdrawn methods). It would also simplify the withdraw of the fees (only eth to withdraw).
- The FeesCollector actually have a simple withdraw methods. It would be nice to have an admin dashboard to see the token collected and withdraw from the interface. Also the FeesCollector should able to be managed by multiple admins.
- The referal fees should go directly to the wealth manager. We should add a dashboard for the admin to register the adress of the users and corresponding wealth managers.
- Add support of eth lending.
- Use of the aave borrowing to do leverage.
- Add other protocols.
- Add a website (landing page, ...).
- Create our own token and distribute as a reward to the users. It could be used for a DAO to vote to add certain protocols for example, or to decrease the fees if the user holds it.
- Add a seamless on ramp solution.
