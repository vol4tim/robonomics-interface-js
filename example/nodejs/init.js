import { Robonomics, AccountManager } from "../../dist";
import { Keyring } from "@polkadot/keyring";

export default async function () {
  const robonomics = new Robonomics({
    endpoint: "ws://127.0.0.1:9944/"
  });
  robonomics.setAccountManager(
    new AccountManager(new Keyring({ type: "sr25519" }))
  );

  await robonomics.run();
  console.log("Robonomics started");

  robonomics.accountManager.keyring.addFromUri("//Alice");
  robonomics.accountManager.keyring.addFromUri("//Bob");
  robonomics.accountManager.keyring.addFromUri("//Eve");
  const accounts = robonomics.accountManager.getAccounts();
  robonomics.accountManager.selectAccountByAddress(accounts[0].address);

  return robonomics;
}
