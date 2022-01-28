export default class Launch {
  constructor(robonomics) {
    this.robonomics = robonomics;
  }

  // extrinsics
  send(address, param) {
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
