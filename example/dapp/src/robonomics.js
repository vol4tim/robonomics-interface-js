import { Robonomics } from "./robonomics-interface";
import AccountManager from "./robonomics-interface/accountManagerUi";
import keyring from "@polkadot/ui-keyring";

const robonomics = new Robonomics({
  endpoint: "ws://127.0.0.1:9944/"
  // endpoint: "wss://kusama.rpc.robonomics.network/"
});
robonomics.setAccountManager(new AccountManager(keyring));

export default robonomics;
