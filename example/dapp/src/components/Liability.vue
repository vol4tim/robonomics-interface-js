<template>
  <div>
    <h3>Liability</h3>
    <input v-model="technics" />
    <input type="checkbox" v-model="status" />
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
      technics: "",
      result: null,
      error: null,
      status: true,
      unsubscribe: null
    };
  },
  async created() {
    this.unsubscribe = await robonomics.liability.on({}, (item) => {
      console.log(item);
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async send() {
      this.error = "";
      this.result = "";
      try {
        const tx = robonomics.liability.send(this.robot, this.status);
        const resultTx = await robonomics.accountManager.signAndSend(tx);
        console.log("saved", resultTx);
        this.result = `${resultTx.blockNumber}-${resultTx.txIndex}`;
        this.status = !this.status;
      } catch (error) {
        console.log(error);
        this.error = error.message;
      }
    }
  }
};
</script>
