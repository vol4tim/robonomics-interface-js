import Base from "./base";

export default class Liability extends Base {
  // queries
  async getLatestIndex() {
    const index = await this.api.query.liability.latestIndex();
    return index.isEmpty ? 0 : index.value.toNumber() - 1;
  }
  async getAgreement(index) {
    const agreement = await this.api.query.liability.agreementOf(index);
    if (agreement.isEmpty) {
      return false;
    }
    return agreement.toHuman();
  }
  async getReport(index) {
    const agreement = await this.api.query.liability.reportOf(index);
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
    return this.api.tx.liability.create({
      technics: this.toIpfsType(technics),
      economics: this.toEconomicsType(price),
      promisee: promisee,
      promisor: promisor,
      promiseeSignature: promisee_signature,
      promisorSignature: promisor_signature
    });
  }
  finalize(index, payload, sender, signature) {
    return this.api.tx.liability.finalize({
      index,
      sender,
      payload: this.toIpfsType(payload),
      signature: signature
    });
  }

  // events
  async on(filter = {}, cb) {
    return this.events.on({ ...filter, section: "liability" }, cb);
  }

  // helpers
  toIpfsType(hash) {
    return this.api.createType("IPFS", {
      hash
    });
  }
  toEconomicsType(price) {
    return this.api.createType("SimpleMarket", {
      price
    });
  }
  getDataLiability(hash, price) {
    const technics = this.toIpfsType(hash);
    const economics = this.toEconomicsType(price);
    const data = this.api
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
    const data = this.api.createType("(u32,IPFS)", [index, payload]).toU8a();
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
