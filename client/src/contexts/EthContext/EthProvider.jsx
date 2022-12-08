import React, { useReducer, useCallback, useEffect } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";  

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const init = useCallback(
    async (artifacts) => {
      if (artifacts) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        let contracts, wrongNetworkId;
        try {
          contracts = {}
          for (const [contractName, artifact] of Object.entries(artifacts)) {
            if (contractName === "HelloDefiAAVE2") {
              continue;
            }
            let address = artifact.networks[networkID]?.address;
            if (contractName === "IProtocolDataProviderAAVE2") {
              address = process.env.REACT_APP_PROTOCOL_DATA_PROVIDER_AAVE2_CONTRACT_ADDRESS;
            } else {
              wrongNetworkId = artifact.networks[networkID] === undefined;
            }
            if (!wrongNetworkId) {  
              const contract = new web3.eth.Contract(artifact.abi, address);
              contracts[contractName] = contract;
            }
          }
          if (contracts["HelloDefiAAVE2Factory"]) {
            const cloneAddress = await contracts.HelloDefiAAVE2Factory.methods.userContracts(accounts[0]).call({from: accounts[0]});
            if (cloneAddress !== ZERO_ADDRESS) {
              console.log("artifact", artifacts)
              console.log("contracts", contracts)
              contracts.HelloDefiAAVE2 = new web3.eth.Contract(artifacts.HelloDefiAAVE2.abi, cloneAddress);
            }
          }

        } catch (err) {
          console.error(err);
        }
        dispatch({
          type: actions.init,
          data: { artifacts, contracts, web3, accounts, networkID, wrongNetworkId }
        });
      }
    }, []);

  
    const tryInit = async () => {
      try {
        const artifacts = {
          HelloDefiAAVE2Factory: require("../../contracts/HelloDefiAAVE2Factory.json"),
          HelloDefiAAVE2: require("../../contracts/HelloDefiAAVE2.json"),
          IERC20Metadata: require("../../contracts/IERC20Metadata.json"),
          PriceFeedConsumer: require("../../contracts/PriceFeedConsumer.json"),
          IProtocolDataProviderAAVE2: require("../../contracts/IProtocolDataProviderAAVE2.json"),
        }
        
        init(artifacts);
      } catch (err) {
        console.error(err);
      }
    };

  useEffect(() => {
    const events = ["chainChanged", "accountsChanged"];
    const handleChange = () => {
      init(state.artifacts, state.contracts);
    };

    events.forEach(e => window.ethereum.on(e, handleChange));
    return () => {
      events.forEach(e => window.ethereum.removeListener(e, handleChange));
    };
  }, [init, state.artifacts, state.contracts]);

  const refreshContext = () => {    
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
      refreshContext,
      disconnect,
    }}>
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
