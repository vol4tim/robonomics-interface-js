import {
  web3Accounts,
  web3Enable,
  web3FromSource
} from "@polkadot/extension-dapp";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { AccountManager } from "../../../src";

function onLoadExtensions() {
  return new Promise(function (resolve, reject) {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      clearInterval(interval);
      return reject(new Error("Not fount polkadot.extension"));
    }, 3000);
    const interval = setInterval(() => {
      if (Object.keys(window.injectedWeb3).length > 0) {
        clearTimeout(timeout);
        clearInterval(interval);
        return resolve();
      }
    }, 100);
  });
}

export default class AccountManagerUi extends AccountManager {
  async initPlugin(config = {}) {
    await onLoadExtensions();
    const extensions = await web3Enable("robonomics");
    if (extensions.length === 0) {
      throw new Error(
        "Allow the browser extension to interact with dapp and try again."
      );
    }
    const accounts = await web3Accounts();
    const injectedAccounts = accounts.map(({ address, meta }) => ({
      address,
      meta
    }));
    await cryptoWaitReady();
    this.keyring.loadAll({ ...config }, injectedAccounts);
    this.setReady(true);
  }
  async afterSetSender() {
    if (
      this.api &&
      this.account &&
      this.account.meta.isInjected &&
      this.account.meta.source
    ) {
      const injected = await web3FromSource(this.account.meta.source);
      this.api.setSigner(injected.signer);
    }
  }
}
