import Base from "./base";

export default class Datalog extends Base {
  // consts
  maxId() {
    const windowSize = this.api.consts.datalog.windowSize;
    return windowSize.toNumber() - 1;
  }

  // queries
  async getIndex(address) {
    const index = await this.api.query.datalog.datalogIndex(address);
    return {
      start: index.start.toNumber(),
      end: index.end.toNumber()
    };
  }
  async readByIndex(address, index) {
    return await this.api.query.datalog.datalogItem([address, index]);
  }

  // extrinsics
  write(data) {
    return this.api.tx.datalog.record(data);
  }

  // events
  async on(filter = {}, cb) {
    return this.events.on({ ...filter, section: "datalog" }, cb);
  }

  // helpers
  async getLastId(address) {
    let id = null;
    let full = false;
    const index = await this.getIndex(address);
    if (index.start != index.end) {
      id = index.end - 1;
      const max = this.maxId();
      if (id < 0) {
        id = max;
      }
      if (index.start > 0 || index.end === max) {
        full = true;
      }
    }
    return { id, full };
  }
  async read(address, start = 0, end = null) {
    const log = [];
    if (!end) {
      const id = await this.getLastId(address);
      if (id.full && id.id !== null) {
        return (await this.read(address, id.id + 1, this.maxId())).concat(
          await this.read(address, 0, id.id)
        );
      } else {
        end = id.id;
      }
    }
    if (end !== null && end >= 0) {
      for (let index = start; index <= end; index++) {
        const data = await this.readByIndex(address, index);
        log.push(data);
      }
    }
    return log;
  }
}
