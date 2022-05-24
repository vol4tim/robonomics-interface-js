import { cidToHex } from "../utils";

export default class Launch {
  /**
   * @param {import('../index').Robonomics} robonomics
   */
  constructor(robonomics) {
    this.robonomics = robonomics;
  }

  // extrinsics
  send(address, param) {
    if (param.slice(0, 2) === "Qm") {
      param = cidToHex(param);
    }
    return this.robonomics.api.tx.launch.launch(address, param);
  }

  // events
  async on(filter = {}, cb) {
    return this.robonomics.on(
      { ...filter, section: "launch", method: "NewLaunch" },
      (result) => {
        cb(
          result.map((item) => {
            return {
              success: item.success,
              account: item.data[0].toHuman(),
              robot: item.data[1].toHuman(),
              parameter: item.data[2].toHuman()
            };
          })
        );
      }
    );
  }
}
