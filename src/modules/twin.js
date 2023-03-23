import Base from "./base";

export default class Twin extends Base {
  // queries
  async getTotal() {
    return Number((await this.api.query.digitalTwin.total()).toString());
  }
  async getOwner(id) {
    return (await this.api.query.digitalTwin.owner(id)).toString();
  }
  async getTwin(id) {
    return (await this.api.query.digitalTwin.digitalTwin(id)).toJSON();
  }

  // extrinsics
  create() {
    return this.api.tx.digitalTwin.create();
  }
  setSource(id, topic, source) {
    return this.api.tx.digitalTwin.setSource(id, topic, source);
  }

  // events
  async on(filter = {}, cb) {
    return this.events.on({ ...filter, section: "digitalTwin" }, cb);
  }

  // helpers
  async findIdTwin(address) {
    const total = await this.getTotal();
    for (let id = 0; id < total; id++) {
      const owner = await this.getOwner(id);
      if (owner === address) {
        return id;
      }
    }
    return false;
  }
  async getTwinByOwner(address) {
    const id = await this.findIdTwin(address);
    if (id !== false) {
      return await this.getTwin(id);
    }
    return false;
  }
}
