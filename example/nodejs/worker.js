/**
 * @param {import('../../src').Robonomics} robonomics
 */
export default async function (robonomics) {
  // Saves the random number to datalog
  const logger = async function () {
    const tx = robonomics.datalog.write(Math.random());
    const resultTx = await robonomics.accountManager.signAndSend(tx);
    console.log("saved", resultTx.blockNumber, resultTx.txIndex);
  };

  // Subscribe to new events in launch module
  let interval;
  const unsubscribe = await robonomics.launch.on({}, (result) => {
    for (const item of result) {
      // Start the process if field robot matches account
      if (item.robot === robonomics.accountManager.account.address) {
        if (item.parameter) {
          console.log(`Run as ${item.account}`);
          // Run logger function every 3 seconds
          const worker = async function () {
            await logger();
            if (interval === null) {
              return;
            }
            interval = setTimeout(() => {
              worker();
            }, 3000);
          };
          worker();
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
