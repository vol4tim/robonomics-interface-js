<template>
  <template v-if="isReady">
    <Account />
    <hr />
    <Datalog />
    <hr />
    <Launch />
    <hr />
    <Liability />
  </template>
  <template v-else>...</template>
</template>

<script>
import Account from "./components/Account.vue";
import Datalog from "./components/Datalog.vue";
import Launch from "./components/Launch.vue";
import Liability from "./components/Liability.vue";
import robonomics from "./robonomics";

export default {
  name: "App",
  components: {
    Account,
    Datalog,
    Launch,
    Liability
  },
  data() {
    return {
      isReady: false
    };
  },
  async created() {
    await robonomics.run();
    this.isReady = true;
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
