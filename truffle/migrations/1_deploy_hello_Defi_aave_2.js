require('dotenv').config();
const PriceFeedConsumer = artifacts.require("PriceFeedConsumer");
const FeesCollector = artifacts.require("FeesCollector");
const HelloDefiAAVE2Factory = artifacts.require("HelloDefiAAVE2Factory");


module.exports = async function (deployer) {
  await deployer.deploy(PriceFeedConsumer, process.env.DAI_AGGREGATOR_V3_CHAIN_LINK_CONTRACT_ADDRESS, process.env.LINK_AGGREGATOR_V3_CHAIN_LINK_CONTRACT_ADDRESS);
  await deployer.deploy(FeesCollector);

  await deployer.deploy(
    HelloDefiAAVE2Factory, 
    process.env.LENDING_POOL_AAVE2_CONTRACT_ADDRESS, 
    process.env.PROTOCOL_DATA_PROVIDER_AAVE2_CONTRACT_ADDRESS, 
    PriceFeedConsumer.address,   
    FeesCollector.address
  );
};