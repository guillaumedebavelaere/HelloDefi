[![CI](https://github.com/guillaumedebavelaere/HelloDefi/actions/workflows/ci.yml/badge.svg)](https://github.com/guillaumedebavelaere/HelloDefi/actions/workflows/ci.yml)

# Hello Defi

HelloDefi is a decentralized application (dapp) that allows you to invest funds securely and transparently using the blockchain.

This is a simple POC that allows AAVE V2 DAI and LINK lending pool investment on Goerli testnet.

The platform uses smart contracts to interact with AAVE lending pools. 
A smart contract is created for the user who will own the contract to assure security and transparency.

<img width="1080" alt="Capture d’écran 2022-12-10 à 12 33 56" src="https://user-images.githubusercontent.com/17125662/206855406-131d1e6a-f5d1-4039-a851-b7c0b7d7bf4a.png">


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

Smart contracts
```sh
cd truffle
yarn compile
```

Tests
```sh
cd truffle
yarn test
```


