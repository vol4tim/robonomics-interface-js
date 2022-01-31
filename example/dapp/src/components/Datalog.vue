<template>
  <div>
    <h3>Datalog</h3>
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
import robonomics from "../robonomics";

export default {
  data() {
    return {
      log: [],
      data: "",
      result: null,
      error: null,
      unsubscribe: null
    };
  },
  async created() {
    if (robonomics.accountManager.account) {
      this.read(robonomics.accountManager.account.address);
    }
    this.unsubscribe = robonomics.accountManager.onChange(account => {
      this.read(account.address);
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async read(address) {
      const log = await robonomics.datalog.read(address);
      this.log = log.map(item => {
        return item.toHuman();
      });
    },
    async send() {
      this.error = "";
      this.result = "";
      try {
        const tx = robonomics.datalog.write(this.data);
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved", resultTx);
        this.result = `${resultTx.blockNumber}-${resultTx.txIndex}`;
        this.read(robonomics.accountManager.account.address);
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
