import {
  web3Accounts,
  web3Enable,
  web3FromSource
} from "@polkadot/extension-dapp";
import { u8aToHex, u8aWrapBytes } from "@polkadot/util";
import AccountManager from "./accountManager";

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

let extensions = [];

export default class AccountManagerUi extends AccountManager {
  /**
   * @param {import('@polkadot/ui-keyring').Keyring} keyring
   * @param {import('@polkadot/api').ApiPromise} api
   */
  constructor(keyring, api = null) {
    super(keyring, api);
  }
  /**
   * @param {import('@polkadot/ui-keyring').Keyring} keyring
   * @param {Object} config
   */
  static async initPlugin(keyring, config = {}) {
    await onLoadExtensions();
    extensions = await web3Enable("robonomics");
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
    keyring.loadAll({ ...config }, injectedAccounts);
    AccountManager.setReady(true);
  }
  get extensions() {
    return extensions;
  }
  static checkInstalled(source) {
    return !!window?.injectedWeb3?.[source];
  }
  static checkAllow(source) {
    return extensions.findIndex((item) => item.name === source) >= 0;
  }
  async mixin() {
    if (this.account.meta.isInjected) {
      const injected = await web3FromSource(this.account.meta.source);
      this.api.setSigner(injected.signer);
      this.account.signMsg = async (data) => {
        return (
          await injected.signer.signRaw({
            address: this.account.address,
            data: u8aToHex(u8aWrapBytes(data)),
            type: "bytes"
          })
        ).signature;
      };
    } else {
      await super.mixin();
    }
  }
}
