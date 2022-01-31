import { Robonomics } from "robonomics-interface";
import AccountManager from "robonomics-interface/dist/accountManagerUi";
import keyring from "@polkadot/ui-keyring";

const robonomics = new Robonomics({
  endpoint: "ws://127.0.0.1:9944/"
});
robonomics.setAccountManager(new AccountManager(keyring));

export default robonomics;
