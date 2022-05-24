import { u8aToHex } from "@polkadot/util";

export default class Liability {
  /**
   * @param {import('../index').Robonomics} robonomics
   */
  constructor(robonomics) {
    this.robonomics = robonomics;
  }

  // queries
  async getLatestIndex() {
    const index = await this.robonomics.api.query.liability.latestIndex();
    return index.isEmpty ? 0 : index.value.toNumber() - 1;
  }
  async getAgreement(index) {
    const agreement = await this.robonomics.api.query.liability.agreementOf(
      index
    );
    if (agreement.isEmpty) {
      return false;
    }
    return agreement.toHuman();
  }
  async getReport(index) {
    const agreement = await this.robonomics.api.query.liability.reportOf(index);
    if (agreement.isEmpty) {
      return false;
    }
    return agreement.toHuman();
  }

  // extrinsics
  create(
    technics,
    price,
    promisee,
    promisor,
    promisee_signature,
    promisor_signature
  ) {
    return this.robonomics.api.tx.liability.create({
      technics: this.toIpfsType(technics),
      economics: this.toEconomicsType(price),
      promisee: promisee,
      promisor: promisor,
      promisee_signature: {
        Sr25519: u8aToHex(promisee_signature)
      },
      promisor_signature: { Sr25519: u8aToHex(promisor_signature) }
    });
  }
  finalize(index, payload, sender, signature) {
    return this.robonomics.api.tx.liability.finalize({
      index,
      sender,
      payload: this.toIpfsType(payload),
      signature: {
        Sr25519: u8aToHex(signature)
      }
    });
  }

  // events
  async on(filter = {}, cb) {
    return this.robonomics.on({ ...filter, section: "liability" }, (result) => {
      cb(
        result.map((item) => {
          let data = item.data;
          if (item.event === "NewLiability") {
            data = {
              index: item.data[0].toNumber(),
              technical: item.data[1].hash_.toHex(),
              economical: item.data[2].price.toNumber(),
              promisee: item.data[3].toString(),
              promisor: item.data[4].toString()
            };
          } else if (item.event === "NewReport") {
            data = {
              index: item.data[1].index.toNumber(),
              sender: item.data[1].sender.toString(),
              payload: item.data[1].payload.hash_.toHex(),
              signature: item.data[1].signature.toHuman()
            };
          }
          return {
            event: item.event,
            success: item.success,
            data: data
          };
        })
      );
    });
  }

  // helpers
  toIpfsType(hash) {
    return this.robonomics.api.createType("IPFS", {
      hash
    });
  }
  toEconomicsType(price) {
    return this.robonomics.api.createType("SimpleMarket", {
      price
    });
  }
  getDataLiability(hash, price) {
    const technics = this.toIpfsType(hash);
    const economics = this.toEconomicsType(price);
    const data = this.robonomics.api
      .createType("(IPFS,SimpleMarket)", [technics, economics])
      .toU8a();
    return {
      technics,
      economics,
      data
    };
  }
  getDataReport(index, hash) {
    const payload = this.toIpfsType(hash);
    const data = this.robonomics.api
      .createType("(u32,IPFS)", [index, payload])
      .toU8a();
    return {
      index,
      payload,
      data
    };
  }
  signData(account, hash, price) {
    const { data } = this.getDataLiability(hash, price);
    return account.sign(data);
  }
  signReport(account, index, payload) {
    const { data } = this.getDataReport(index, payload);
    return account.sign(data);
  }
}
