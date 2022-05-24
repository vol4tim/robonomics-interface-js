import { utils } from "../../src";

/**
 * @param {import('../../src').Robonomics} robonomics
 */
export default async function (robonomics) {
  const accounts = robonomics.accountManager.getAccounts();
  const lighthouse = accounts[0];
  const promisee = accounts[1];
  const promisor = accounts[2];
  robonomics.accountManager.selectAccountByAddress(lighthouse.address);

  /* events */
  await robonomics.liability.on({}, (result) => {
    console.log("events", result);
  });

  /* create liability */
  async function create() {
    const technics = utils.cidToHex(
      "QmRKoW3xXgf4QHYt3PE2aBkpkyGE8jAaFoeX8B6J75swVM"
    );
    const price = 10;
    const tx = robonomics.liability.create(
      technics,
      price,
      promisee.address,
      promisor.address,
      robonomics.liability.signData(promisee, technics, price),
      robonomics.liability.signData(promisor, technics, price)
    );
    const resultTx = await robonomics.accountManager.signAndSend(tx);
    console.log("saved liability", resultTx.blockNumber, resultTx.txIndex);
  }
  await create();

  /* get info liability */
  const latestIndex = await robonomics.liability.getLatestIndex();
  console.log("latestIndex", latestIndex);
  const agreement = await robonomics.liability.getAgreement(latestIndex);
  console.log("agreement", agreement);

  /* finalize liability */
  async function finalize() {
    const payload = utils.cidToHex(
      "QmRKoW3xXgf4QHYt3PE2aBkpkyGE8jAaFoeX8B6J75swVM"
    );
    const index = latestIndex;
    const tx = robonomics.liability.finalize(
      index,
      payload,
      promisor.address,
      robonomics.liability.signReport(promisor, index, payload)
    );
    const resultTx = await robonomics.accountManager.signAndSend(tx);
    console.log("saved report", resultTx.blockNumber, resultTx.txIndex);
  }
  await finalize();

  /* get report */
  const report = await robonomics.liability.getReport(latestIndex);
  console.log("report", report);
}
