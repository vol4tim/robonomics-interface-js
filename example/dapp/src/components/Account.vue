<template>
  <div>
    Account:
    <template v-if="isReady">
      <select v-model="account">
        <option
          v-for="(account, key) in accounts"
          :key="key"
          :value="account.address"
        >
          {{ account.meta.isTesting ? "dev" : "" }} {{ account.meta.name }} |
          {{ account.meta?.source }}
        </option>
      </select>
      <br />
      {{ account }} | {{ balancePrint }}
    </template>
    <button v-else @click="connect">connect</button>
    <p>{{ error }}</p>
  </div>
</template>

<script>
import { formatBalance } from "@polkadot/util";

export default {
  data() {
    return {
      isReady: false,
      account: null,
      accounts: [],
      unsubscribe: null,
      balance: "",
      error: ""
    };
  },
  created() {
    this.connect();
    this.$robonomics.accountManager.onReady(() => {
      this.isReady = true;
    });
  },
  computed: {
    balancePrint() {
      return formatBalance(this.balance, {
        decimals: this.$robonomics.api.registry.chainDecimals[0],
        withUnit: this.$robonomics.api.registry.chainTokens[0]
      });
    }
  },
  watch: {
    async account(address) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      await this.$robonomics.accountManager.setSender(address);
      this.unsubscribe = await this.$robonomics.account.getBalance(
        address,
        (r) => {
          this.balance = r.free.sub(r.feeFrozen);
        }
      );
    }
  },
  methods: {
    async connect() {
      this.error = "";
      try {
        await this.$robonomics.accountManager.initPlugin({
          isDevelopment: true
        });
        this.accounts = this.$robonomics.accountManager.getAccounts();
        if (this.accounts.length) {
          this.account = this.accounts[0].address;
        }
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>
