<template>
  <div>
    Account:
    <select v-model="account">
      <option
        v-for="(account, key) in accounts"
        :key="key"
        :value="account.address"
      >
        {{ account.meta.isTesting ? "dev" : "" }} {{ account.meta.name }}
      </option>
    </select>
    <br />
    {{ account }} | {{ balancePrint }}
  </div>
</template>

<script>
import AccountManager from "robonomics-interface/dist/accountManagerUi";
import robonomics from "../robonomics";
import { formatBalance } from "@polkadot/util";

export default {
  data() {
    return {
      account: null,
      accounts: [],
      unsubscribe: null,
      balance: ""
    };
  },
  async created() {
    await AccountManager.initPlugin(robonomics.accountManager.keyring, {
      isDevelopment: true
    });
    this.accounts = robonomics.accountManager.getAccounts();
    if (this.accounts.length) {
      this.account = this.accounts[0].address;
    }
  },
  computed: {
    balancePrint() {
      return formatBalance(this.balance, {
        decimals: robonomics.api.registry.chainDecimals[0],
        withUnit: robonomics.api.registry.chainTokens[0]
      });
    }
  },
  watch: {
    async account(address) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      await robonomics.accountManager.selectAccountByAddress(address);
      this.unsubscribe = await robonomics.account.getBalance(address, r => {
        this.balance = r.free.sub(r.feeFrozen);
      });
    }
  }
};
</script>
