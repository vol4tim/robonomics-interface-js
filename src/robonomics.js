import { ApiPromise, WsProvider } from "@polkadot/api";
import defaultConfig from "./config";
import Events from "./events";
import Account from "./modules/account";
import Datalog from "./modules/datalog";
import Launch from "./modules/launch";
import Liability from "./modules/liability";
import Rws from "./modules/rws";
import Twin from "./modules/twin";
import { mergedeep } from "./utils";

const instances = {};

export async function createInstance(inputConfig = {}) {
  const config = mergedeep(defaultConfig, inputConfig);
  if (!config.endpoint) {
    throw new Error("Not found endpoint");
  }
  const provider = new WsProvider(config.endpoint);
  const api = await ApiPromise.create({
    provider,
    types: config.types,
    rpc: config.rpc
  });
  const instance = new Robonomics(provider, api);
  instances[config.name || config.endpoint] = instance;
  return instance;
}

export function getInstance(name) {
  if (name === undefined) {
    const instancesArray = Object.values(instances);
    if (instancesArray.length > 0) {
      return instancesArray[0];
    }
    throw new Error(`Instance named ${name} not found`); //TODO
  }
  if (instances[name]) {
    return instances[name];
  }
  throw new Error(`Instance named ${name} not found`);
}

export default class Robonomics {
  constructor(provider, api) {
    this.accountManager = undefined;

    this.provider = provider;
    this.api = api;

    this.events = new Events(this.api);

    // modules
    this.account = new Account(this);
    this.datalog = new Datalog(this);
    this.launch = new Launch(this);
    this.rws = new Rws(this);
    this.liability = new Liability(this);
    this.twin = new Twin(this);
  }

  setAccountManager(accountManager) {
    accountManager.setApi(this.api);
    accountManager.setRws(this.rws);
    this.accountManager = accountManager;
  }

  static async createInstance(inputConfig = {}) {
    return await createInstance(inputConfig);
  }

  static getInstance(name) {
    return getInstance(name);
  }

  on(filter = {}, cb) {
    return this.events.on(filter, cb);
  }
}
