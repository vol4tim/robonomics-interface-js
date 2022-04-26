import { ApiPromise, WsProvider } from "@polkadot/api";
import Account from "./modules/account";
import Datalog from "./modules/datalog";
import Launch from "./modules/launch";
import Liability from "./modules/liability";
import Rws from "./modules/rws";
import Staking from "./modules/staking";
import { mergedeep } from "./utils";
import defaultConfig from "./config";

const instances = {};

/**
 * @typedef {import('./accountManager').default} AccountManager
 */

export default class Robonomics {
  constructor(config = {}) {
    this.config = mergedeep(defaultConfig, config);
    this.api = null;
    this.provider = null;
    /**
     * @type {AccountManager}
     */
    this.accountManager = null;
    this.isReady = false;

    // modules
    this.account = new Account(this);
    this.datalog = new Datalog(this);
    this.launch = new Launch(this);
    this.rws = new Rws(this);
    this.staking = new Staking(this);
    this.liability = new Liability(this);

    instances[config.name || config.endpoint] = this;
    if (config.runImmediate) {
      this.run();
    }
  }
  /**
   * @returns {Robonomics}
   */
  static getInstance(name = null) {
    if (name === null) {
      const instancesArray = Object.values(instances);
      if (instancesArray.length > 0) {
        return instancesArray[0];
      }
    }
    if (instances[name]) {
      return instances[name];
    }
    throw new Error(`Instance named ${name} not found`);
  }
  createProvider(endpoint) {
    this.provider = new WsProvider(endpoint);
  }
  async createApi(config) {
    this.api = await ApiPromise.create({
      provider: this.provider,
      ...config
    });
  }
  onReady(cb) {
    if (this.isReady) {
      cb();
    } else {
      setTimeout(() => {
        this.onReady(cb);
      }, 100);
    }
  }
  async run() {
    if (this.api) {
      return;
    }
    this.createProvider(this.config.endpoint);
    await this.createApi({ types: this.config.types, rpc: this.config.rpc });
    this.isReady = true;
    if (this.accountManager && this.accountManager.api === null) {
      this.accountManager.setApi(this.api);
    }
  }
  setAccountManager(accountManager) {
    if (this.api) {
      accountManager.setApi(this.api);
    }
    accountManager.setRws(this.rws);
    this.accountManager = accountManager;
  }
  async onBlock(cb) {
    return await this.api.rpc.chain.subscribeNewHeads((header) => {
      cb(header.number.toNumber());
    });
  }
  async on(filter = {}, cb) {
    return await this.api.query.system.events((events) => {
      let result = [];
      events.forEach((record) => {
        const { event, phase } = record;
        if (phase.isNull) {
          return;
        }
        const index = phase.value.toNumber();
        if (
          event.section !== "system" &&
          (!filter.section || event.section === filter.section) &&
          (!filter.method ||
            event.method === filter.method ||
            filter.method.includes(event.method))
        ) {
          result.push({
            phase: index,
            event: event.method,
            success: null,
            data: event.data
          });
        }

        if (event.section === "system") {
          result.forEach((item, indexResult) => {
            if (item.phase === index) {
              if (event.method === "ExtrinsicSuccess") {
                result[indexResult].success = true;
              } else if (event.method === "ExtrinsicFailed") {
                result[indexResult].success = false;
              }
            }
          });
        }
      });
      if (result.length) {
        cb(result);
      }
    });
  }
}
