require('dotenv').config();
const HelloDefiAAVE2Factory = artifacts.require("HelloDefiAAVE2Factory");



module.exports = function (deployer) {
  deployer.deploy(HelloDefiAAVE2Factory, process.env.LENDING_POOL_AAVE2_CONTRACT_ADDRESS);
};