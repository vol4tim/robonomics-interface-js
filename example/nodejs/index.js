import init from "./init";
import launch from "./launch";
import onblock from "./onblock";
import worker from "./worker";

(async function () {
  const robonomics = await init();
  await onblock(robonomics);

  await worker(robonomics);
  await launch(robonomics);
})();
