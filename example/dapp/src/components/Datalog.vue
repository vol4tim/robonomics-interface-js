<template>
  <div>
    <h3>Datalog</h3>
    <input v-model="account" />
    <button @click="read(account)">read</button>
    <div class="log">
      <div v-for="(item, key) in log" :key="key">
        {{ item }}
      </div>
    </div>
    <input v-model="data" />
    <button @click="send">Send</button>
    <div>{{ result }}</div>
    <div>{{ error }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      log: [],
      data: "",
      result: null,
      error: null,
      unsubscribe: null,
      account: null
    };
  },
  async created() {
    if (this.$robonomics.accountManager.account) {
      this.account = this.$robonomics.accountManager.account.address;
      this.read(this.account);
    }
    this.unsubscribe = this.$robonomics.accountManager.onChange((account) => {
      this.account = account.address;
      this.read(this.account);
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async read(address) {
      const log = await this.$robonomics.datalog.read(address);
      this.log = log.map((item) => {
        return item.toHuman();
      });
    },
    async send() {
      this.error = "";
      this.result = "";
      try {
        const tx = this.$robonomics.datalog.write(this.data);
        const resultTx = await this.$robonomics.accountManager.signAndSend(tx);
        console.log("saved", resultTx);
        this.result = `${resultTx.blockNumber}-${resultTx.txIndex}`;
        this.read(this.account);
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>

<style scoped>
.log {
  padding: 10px;
  width: 500px;
  margin: 0 auto;
}
.log div {
  border: 1px solid #eee;
  padding: 5px;
}
</style>
