import { cidToHex } from "../utils";
import Base from "./base";

export default class Launch extends Base {
  // extrinsics
  send(address, param) {
    if (param.slice(0, 2) === "Qm") {
      param = cidToHex(param);
    }
    return this.api.tx.launch.launch(address, param);
  }

  // events
  async on(filter = {}, cb) {
    return this.events.on({ ...filter, section: "launch" }, (result) => {
      cb(
        result.map((item) => {
          return {
            ...item,
            account: item.data[0].toHuman(),
            robot: item.data[1].toHuman(),
            parameter: item.data[2].toHuman()
          };
        })
      );
    });
  }
}
