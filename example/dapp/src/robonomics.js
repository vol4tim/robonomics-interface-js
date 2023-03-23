import keyring from "@polkadot/ui-keyring";
import { Robonomics } from "../../../src";
import AccountManager from "./accountManagerUi";

export async function instance() {
  try {
    return Robonomics.getInstance();
  } catch (_) {
    //
  }
  return await Robonomics.createInstance({
    endpoint: "ws://127.0.0.1:9944"
  });
}

export default {
  install: async (app) => {
    let isReady = false;
    let cbReady;
    app.config.globalProperties.$robonomicsReady = (cb) => {
      if (isReady) {
        cb();
        return;
      }
      cbReady = cb;
    };
    app.config.globalProperties.$robonomics = await instance();
    app.config.globalProperties.$robonomics.setAccountManager(
      new AccountManager(keyring)
    );

    isReady = true;
    if (cbReady) {
      cbReady();
    }
  }
};
