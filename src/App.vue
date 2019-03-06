<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data: () => ({}),
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
  },
  async created() {
    try {
      await this.connectScatterAsync();
      // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
      const suggestNetworkResult = await this.suggestNetworkAsync();
      console.info(suggestNetworkResult);
      await this.loginScatterAsync();
    } catch (e) {
      console.warn('Unable to connect wallets');
    }
  },
};
</script>


<style>
body {
  background: #f7f7f7;
}
#app {
  margin: auto;
  text-align: center;
  font-family: PingFang SC, STHeitiSC-Light, Helvetica-Light, arial, sans-serif;
}
.card {
  margin: 10px;
  text-align: center;
  /* max-width: 335px; */
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
  padding: 18px;
}
/* #app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
} */
</style>
