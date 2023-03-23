export default {
  name: undefined,
  endpoint: "wss://kusama.rpc.robonomics.network/",
  types: {
    IPFS: {
      hash: "H256"
    },
    SimpleMarket: { price: "Compact<Balance>" }
  },
  rpc: {}
};
