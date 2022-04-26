import init from "./init";
import onblock from "./onblock";
// import worker from "./worker";
import liability from "./liability";

(async function () {
  const robonomics = await init();
  await onblock(robonomics);
  // await worker(robonomics);
  await liability(robonomics);
})();
