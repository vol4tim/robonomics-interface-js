export default {
  name: false,
  runImmediate: false,
  endpoint: "wss://kusama.rpc.robonomics.network/",
  types: {
    IPFS: {
      hash: "H256"
    },
    SimpleMarket: { price: "Compact<Balance>" }
  },
  rpc: {}
};
