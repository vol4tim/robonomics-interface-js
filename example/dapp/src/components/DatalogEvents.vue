<template>
  <div>
    <h3>Datalog Events {{ address }}</h3>
    <div class="log">
      <div v-for="(item, key) in log" :key="key">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
import robonomics from "../robonomics";

export default {
  props: ["address"],
  data() {
    return {
      log: [],
      unsubscribe: null
    };
  },
  async created() {
    this.subscribe();
  },
  watch: {
    address() {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.subscribe();
    }
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  },
  methods: {
    async subscribe() {
      this.log = [];
      this.unsubscribe = await robonomics.datalog.on({}, result => {
        for (const item of result) {
          if (item.account.toString() === this.address) {
            this.log.push({
              moment: item.moment.toHuman(),
              data: item.data.toHuman()
            });
          }
        }
      });
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
