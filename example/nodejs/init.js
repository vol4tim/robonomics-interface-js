import { Keyring } from "@polkadot/keyring";
import { AccountManager, Robonomics } from "../../src";

export default async function () {
  const robonomics = await Robonomics.createInstance({
    endpoint: "ws://127.0.0.1:9944"
  });
  robonomics.setAccountManager(
    new AccountManager(new Keyring({ type: "sr25519" }))
  );

  robonomics.accountManager.keyring.addFromUri("//Alice");
  robonomics.accountManager.keyring.addFromUri("//Bob");
  robonomics.accountManager.keyring.addFromUri("//Eve");
  robonomics.accountManager.setReady(true);

  console.log("Robonomics started");

  const accounts = robonomics.accountManager.getAccounts();
  robonomics.accountManager.setSender(accounts[0].address);

  return robonomics;
}
