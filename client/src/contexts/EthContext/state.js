const actions = {
  init: "INIT",
};

const initialState = {
  factoryArtifact: null,
  web3: null,
  accounts: null,
  networkID: null,
  factory: null,
  clone: null,
  priceFeed: null,
  protocolDataProvider: null,
  erc20Abi: null,
  wrongNetworkId: false
};

const reducer = (state, action) => {
  const { type, data } = action;
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
