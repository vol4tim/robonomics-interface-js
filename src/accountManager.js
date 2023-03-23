import { u8aToHex } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";

let isReady = false;
export default class AccountManager {
  constructor(keyring, api) {
    this.api = undefined;
    this.account = undefined;
    this.subscription = undefined;
    this.rws = undefined;

    this.keyring = keyring;
    this.setApi(api);
    this.listeners = [];
  }
  setApi(api) {
    if (api && api.registry.chainSS58) {
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
  get isReady() {
    return isReady;
  }
  setReady(status) {
    isReady = status;
  }
  onReady(cb) {
    if (isReady) {
      cb();
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
        address: encodeAddress(pair.address, this.api?.registry.chainSS58)
      };
    });
  }
  onChange(cb) {
    this.listeners.push(cb);
    return () => {
      const i = this.listeners.indexOf(cb);
      this.listeners.splice(i, 1);
    };
  }
  async beforeSetSender() {}
  async afterSetSender() {
    this.account.signMsg = async (data) => {
      if (!this.account) {
        return Promise.reject(new Error("not account"));
      }
      return Promise.resolve(u8aToHex(this.account.sign(data)));
    };
  }
  async setSender(address, props) {
    await this.beforeSetSender(address, props);
    const account = this.keyring.getPair(address);
    this.account = {
      ...account,
      address: encodeAddress(account.address, this.api?.registry.chainSS58),
      signMsg: async () => {
        return "0x";
      }
    };
    await this.afterSetSender(address, props);
    for (const cb of this.listeners) {
      cb(this.account);
    }
    return this.account;
  }
  async useSubscription(subscription = false, sender = false, props) {
    this.subscription = subscription;
    if (subscription && sender) {
      await this.setSender(sender, props);
    }
  }
  async signAndSend(tx, options = {}) {
    if (!this.account) {
      throw new Error("No account selected");
    }
    if (this.subscription && this.rws) {
      if (!this.rws.isSubscription(this.subscription)) {
        throw new Error(`Not subscription for ${this.subscription}`);
      }
      const devices = await this.rws.getDevices(this.subscription);
      if (
        !devices.map((item) => item.toString()).includes(this.account.address)
      ) {
        throw new Error(
          `Not device ${this.account.address} for ${this.subscription}`
        );
      }
      tx = this.rws.call(this.subscription, tx);
    }
    return new Promise((resolve, reject) => {
      if (!this.account) {
        return reject(new Error("not account"));
      }
      tx.signAndSend(
        this.account.meta.isInjected ? this.account.address : this.account,
        options,
        (result) => {
          if (result.status.isInBlock) {
            result.events.forEach(async (events) => {
              const {
                event: { method, section },
                phase
              } = events;
              if (section === "system" && method === "ExtrinsicFailed") {
                let message = "Error";
                if (result.dispatchError?.isModule) {
                  const mod = result.dispatchError.asModule;
                  const { docs, name, section } =
                    mod.registry.findMetaError(mod);
                  console.log(name, section, docs);
                  message = docs.join(", ");
                }
                return reject(new Error(message));
              } else if (
                section === "system" &&
                method === "ExtrinsicSuccess"
              ) {
                if (!this.api) {
                  return reject(new Error("not api"));
                }
                const block = await this.api.rpc.chain.getBlock(
                  result.status.asInBlock.toString()
                );
                resolve({
                  block: result.status.asInBlock.toString(),
                  blockNumber: block.block.header.number.toNumber(),
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
