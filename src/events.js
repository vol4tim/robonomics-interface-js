export default class Events {
  constructor(api) {
    this.api = api;
  }

  async onBlock(cb) {
    return await this.api.rpc.chain.subscribeNewHeads((header) => {
      cb(header.number.toNumber());
    });
  }

  async on(filter = {}, cb) {
    return await this.api.query.system.events((events) => {
      const results = [];
      events.forEach((record) => {
        const { event, phase } = record;
        if (phase.isNone) {
          return;
        }
        const index = Number(phase.value.toString());
        if (
          event.section !== "system" &&
          (!filter.section ||
            event.section === filter.section ||
            filter.section.includes(event.section)) &&
          (!filter.method ||
            event.method === filter.method ||
            filter.method.includes(event.method))
        ) {
          results.push({
            phase: index,
            section: event.section,
            method: event.method,
            success: undefined,
            data: event.data
          });
        }
        if (event.section === "system") {
          results.forEach((item, indexResult) => {
            if (item.phase === index) {
              if (event.method === "ExtrinsicSuccess") {
                results[indexResult].success = true;
              } else if (event.method === "ExtrinsicFailed") {
                results[indexResult].success = false;
              }
            }
          });
        }
      });
      if (results.length) {
        cb(results);
      }
    });
  }
}
