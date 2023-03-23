export default async function (robonomics) {
  // Saves the random number to datalog
  const logger = async function () {
    const tx = robonomics.datalog.write(Math.random());
    const resultTx = await robonomics.accountManager.signAndSend(tx);
    console.log("saved datalog", resultTx.blockNumber, resultTx.txIndex);
  };

  // Subscribe to new events in launch module
  let interval;
  const unsubscribe = await robonomics.launch.on({}, (result) => {
    for (const item of result) {
      const data = {
        account: item.data[0].toHuman(),
        robot: item.data[1].toHuman(),
        parameter: item.data[2].toHuman()
      };
      // Start the process if field robot matches account
      if (data.robot === robonomics.accountManager.account.address) {
        if (data.parameter) {
          console.log(`Run as ${data.account}`);
          // Run logger function every 3 seconds
          const worker = async function () {
            await logger();
            if (interval === null) {
              return;
            }
            interval = setTimeout(() => {
              worker();
            }, 5000);
          };
          worker();
        } else {
          console.log(`Stop as ${data.account}`);
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
