/**
 * @param {import('../../src').Robonomics} robonomics
 */
export default async function (robonomics) {
  const tx = robonomics.launch.send(
    robonomics.accountManager.account.address,
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
  const resultTx = await robonomics.accountManager.signAndSend(tx);
  console.log("saved", resultTx.blockNumber, resultTx.txIndex);
  // Subscribe to new events in launch module
  let interval;
  const unsubscribe = await robonomics.launch.on({}, (result) => {
    for (const item of result) {
      // Start the process if field robot matches account
      if (item.robot === robonomics.accountManager.account.address) {
        console.log(item.parameter);
        if (item.parameter) {
          console.log(`Run as ${item.account}`);
        } else {
          console.log(`Stop as ${item.account}`);
          clearTimeout(interval);
          interval = null;
        }
      }
    }
  });
  return () => {
    clearInterval(interval);
    interval = null;
    unsubscribe();
  };
}
