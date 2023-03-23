export default async function (robonomics) {
  const tx = robonomics.launch.send(
    robonomics.accountManager.account.address,
    "0x0000000000000000000000000000000000000000000000000000000000000001"
  );
  const resultTx = await robonomics.accountManager.signAndSend(tx);
  console.log("saved launch", resultTx.blockNumber, resultTx.txIndex);

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
