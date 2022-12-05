import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";  

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (factoryArtifact, cloneArtifact, IERC20Artifact, priceFeedArtifact) => {
      if (factoryArtifact && cloneArtifact && IERC20Artifact && priceFeedArtifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi: factoryAbi } = factoryArtifact;
        const { abi: cloneAbi } = cloneArtifact;
        const { abi: priceFeedAbi } = priceFeedArtifact;
        const {abi: erc20Abi} = IERC20Artifact;
        let factoryAddress, factory, wrongNetworkId, clone, priceFeed;
        try {
          wrongNetworkId = factoryArtifact.networks[networkID] === undefined;
          factoryAddress = factoryArtifact.networks[networkID]?.address;
          factory = factoryAddress !== undefined ? new web3.eth.Contract(factoryAbi, factoryAddress) : undefined;
          if (!wrongNetworkId) {
            const priceFeedAddress = priceFeedArtifact.networks[networkID].address;
            priceFeed = new web3.eth.Contract(priceFeedAbi, priceFeedAddress);
            const cloneAddress = await factory.methods.userContracts(accounts[0]).call({from: accounts[0]});
            if (cloneAddress !== ZERO_ADDRESS) {
              console.log("Get clone !" + cloneAddress);
              clone = new web3.eth.Contract(cloneAbi, cloneAddress);
            }
          }

        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { factoryArtifact, web3, accounts, networkID, factory, clone, priceFeed, erc20Abi, wrongNetworkId }
        });
      }
    }, []);

  
    const tryInit = async () => {
      try {
        const factoryArtifact = require("../../contracts/HelloDefiAAVE2Factory.json");
        const cloneArtifact = require("../../contracts/HelloDefiAAVE2.json");
        const IERC20Artifact = require("../../contracts/IERC20.json");
        const priceFeedArtifact = require("../../contracts/PriceFeedConsumer.json");
        init(factoryArtifact, cloneArtifact, IERC20Artifact, priceFeedArtifact);
      } catch (err) {
        console.error(err);
      }
    };

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifact);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifact]);

  const connect = () => {    
    tryInit();
  }

  const disconnect = () => {
    dispatch({
      type: actions.init,
      data: initialState
    });
  }


  return (
    <EthContext.Provider value={{
      state,
      dispatch,
      connect,
      disconnect
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
