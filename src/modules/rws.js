import Base from "./base";

export default class Rws extends Base {
  subscription = false;

  // consts
  getAuctionCost() {
    return this.api.consts.rws.auctionCost;
  }
  getMinimalBid() {
    return this.api.consts.rws.minimalBid;
  }

  // queries
  async getAuctionQueue() {
    return await this.api.query.rws.auctionQueue();
  }
  async getUnspendBondValue() {
    return await this.api.query.rws.unspendBondValue();
  }
  async getAuction(index) {
    return await this.api.query.rws.auction(index);
  }
  async getLedger(account) {
    return await this.api.query.rws.ledger(account);
  }
  async getDevices(account) {
    return await this.api.query.rws.devices(account);
  }

  // extrinsics
  bid(index, amount) {
    return this.api.tx.rws.bid(index, amount);
  }
  setDevices(devices) {
    return this.api.tx.rws.setDevices(devices);
  }
  call(subscription, tx) {
    return this.api.tx.rws.call(subscription, tx);
  }

  // helpers
  async getFreeAuctions() {
    const auctions = [];
    const auctionQueue = await this.getAuctionQueue();
    for (const index of auctionQueue) {
      const auction = await this.getAuction(index);
      if (auction.value.winner.isNone) {
        auctions.push(index.toNumber());
      }
    }
    return auctions;
  }
  async getFirtsFreeAuction() {
    const auctionQueue = await this.getAuctionQueue();
    for (const index of auctionQueue) {
      const auction = await this.getAuction(index);
      if (auction.value.winner.isNone) {
        return index.toNumber();
      }
    }
  }
  async isSubscription(address) {
    const ledger = await this.getLedger(address);
    return !ledger.isNone;
  }
}
