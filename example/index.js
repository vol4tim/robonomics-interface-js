import init from "./init";
import worker from "./worker";
import onblock from "./onblock";

(async function () {
  const robonomics = await init();
  await onblock(robonomics);
  await worker(robonomics);
})();
