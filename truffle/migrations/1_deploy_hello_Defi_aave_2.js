require('dotenv').config();
const HelloDefiAAVE2 = artifacts.require("HelloDefiAAVE2");


module.exports = function (deployer) {
  deployer.deploy(HelloDefiAAVE2, process.env.LENDING_POOL_AAVE2_CONTRACT_ADDRESS);
};
