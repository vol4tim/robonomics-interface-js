import Base from "./base";

export default class Account extends Base {
  async getBalance(account, cb) {
    if (!cb) {
      const { data } = await this.api.query.system.account(account);
      return data;
    }
    return this.api.query.system.account(account, ({ data }) => {
      cb(data);
    });
  }
  async listenBalance(account, cb) {
    const listener = await this.getBalance(account, (r) => {
      const transferrable = r.free.sub(r.miscFrozen);
      cb(transferrable);
    });
    return listener;
  }
}
