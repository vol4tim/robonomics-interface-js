<template>
  <div>
    <h3>Launch</h3>
    <input v-model="robot" />
    <input type="checkbox" v-model="status" />
    <button @click="send">Send</button>
    <div>{{ result }}</div>
    <div>{{ error }}</div>

    <DatalogEvents v-if="robot" :address="robot" />
  </div>
</template>

<script>
import robonomics from "../robonomics";
import DatalogEvents from "./DatalogEvents.vue";

export default {
  components: { DatalogEvents },
  data() {
    return {
      robot: "",
      result: null,
      error: null,
      status: true,
      unsubscribe: null
    };
  },
  computed: {
    parameter() {
      return "0x" + (this.status ? "1" : "0").padStart(64, 0);
    }
  },
  async created() {
    this.unsubscribe = await robonomics.launch.on({}, (item) => {
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
        const tx = robonomics.launch.send(this.robot, this.parameter);
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
