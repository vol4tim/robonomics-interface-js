import { encodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

export class ErrorAccount extends Error {
  constructor(status = null, ...params) {
    super(...params);
    this.status = status;
  }
}

let isReady = false;
let isError = undefined;
export default class AccountManager {
  /**
   * @param {import('@polkadot/keyring').Keyring} keyring
   * @param {import('@polkadot/api').ApiPromise} api
   */
  constructor(keyring, api = null) {
    this.keyring = keyring;
    this.setApi(api);
    this.account = null;
    this.subscription = false;
    this.rws = null;
    this.listeners = [];
    isReady = true;
  }
  async mixin() {
    this.account.signMsg = async function (data) {
      return Promise.resolve(u8aToHex(this.account.sign(data)));
    };
  }
  /**
   * @param {import('@polkadot/api').ApiPromise} api
   */
  setApi(api) {
    if (api) {
      this.keyring.setSS58Format(api.registry.chainSS58);
    }
    this.api = api;
  }
  setRws(rws) {
    this.rws = rws;
  }
  static isReady() {
    return isReady;
  }
  static setReady(status) {
    isReady = status;
  }
  static isError() {
    return isError;
  }
  get isReady() {
    return isReady;
  }
  setReady(status) {
    isReady = status;
  }
  onReady(cb) {
    if (isReady || isError) {
      cb(isError);
    } else {
      setTimeout(() => {
        this.onReady(cb);
      }, 1000);
    }
  }
  getAccounts() {
    const pairs = this.keyring.getPairs();
    return pairs.map((pair) => {
      return {
        ...pair,
        address: encodeAddress(pair.address, this.api.registry.chainSS58)
      };
    });
  }
  async selectAccountByAddress(address) {
    const account = this.keyring.getPair(address);
    this.account = {
      ...account,
      address: encodeAddress(account.address, this.api.registry.chainSS58)
    };
    await this.mixin();
    for (const cb of this.listeners) {
      cb(this.account);
    }
    return this.account;
  }
  onChange(cb) {
    this.listeners.push(cb);
    return () => {
      const i = this.listeners.indexOf(cb);
      this.listeners.splice(i, 1);
    };
  }
  useSubscription(address = false) {
    this.subscription = address;
  }
  async signAndSend(tx, options = {}) {
    if (this.account === null) {
      throw new ErrorAccount(3, "No account selected");
    }
    if (this.subscription) {
      if (!this.rws.isSubscription(this.subscription)) {
        throw new ErrorAccount(3, `Not subscription for ${this.subscription}`);
      }
      const devices = await this.rws.getDevices(this.subscription);
      if (!devices.includes(this.account.address)) {
        throw new ErrorAccount(
          3,
          `Not device ${this.account.address} for ${this.subscription}`
        );
      }
      tx = this.rws.call(this.subscription, tx);
    }
    return new Promise((resolve, reject) => {
      tx.signAndSend(
        this.account.meta.isInjected ? this.account.address : this.account,
        options,
        (result) => {
          if (result.status.isInBlock) {
            result.events.forEach(async (events) => {
              const {
                event: { data, method, section },
                phase
              } = events;
              if (section === "system" && method === "ExtrinsicFailed") {
                let message = "Error";
                if (data[0].isModule) {
                  const mod = data[0].asModule;
                  // const mod = result.dispatchError.asModule;
                  const { docs, name, section } =
                    mod.registry.findMetaError(mod);
                  console.log(name, section, docs);
                  message = docs.join(", ");
                }
                return reject(new ErrorAccount(4, message));
              } else if (
                section === "system" &&
                method === "ExtrinsicSuccess"
              ) {
                const block = await this.api.rpc.chain.getBlock(
                  result.status.asInBlock.toString()
                );
                resolve({
                  block: result.status.asInBlock.toString(),
                  blockNumber: block.block.header.number.toNumber(),
                  // const index = phase.value.toNumber();
                  txIndex: phase.asApplyExtrinsic.toHuman(),
                  tx: tx.hash.toString()
                });
              }
            });
          }
        }
      ).catch(reject);
    });
  }
}
