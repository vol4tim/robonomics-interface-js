<template>
  <template v-if="isReady">
    {{ block }}
    <account />
    <hr />
    <datalog />
    <hr />
    <launch />
  </template>
  <template v-else>...</template>
</template>

<script>
import Account from "./components/Account.vue";
import Datalog from "./components/Datalog.vue";
import Launch from "./components/Launch.vue";

export default {
  name: "App",
  components: {
    Account,
    Datalog,
    Launch
  },
  data() {
    return {
      isReady: false,
      block: undefined
    };
  },
  async created() {
    this.$robonomicsReady(() => {
      this.isReady = true;
      this.$robonomics.events.onBlock((number) => {
        this.block = number;
      });
    });
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
