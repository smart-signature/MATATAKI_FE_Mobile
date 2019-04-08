<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import { version } from '../package.json'

export default {
  data: () => ({}),
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    updateNotify(desc) {
      const btnCommonStyle = {
        type: 'default',
        size: 'large',
        style: 'margin: 0px 5px;',
      };
      this.$Message.info({
        render: h => h('span', [
          desc,
          h('Button', {
            attrs: {
              // icon: 'ios-refresh',
              ...btnCommonStyle,
            },
            on: {
              click: () => window.location.reload(),
            },
          }, '立即刷新'),
        ]),
        duration: 0,
      });
    },
  },
  computed: {
    ...mapState(['scatterAccount']),
  },
  created() { // https://juejin.im/post/5bfa4bb951882558ae3c171e
    window.updateNotify = this.updateNotify;
    console.info('Smart Signature version :', version);
    try {
      // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
      this.connectScatterAsync()
        .then(() => (
          this.suggestNetworkAsync()
            .then(added => (console.log('Suggest network result: ', added)))
        ));
      // if (!this.scatterAccount) await this.loginScatterAsync();
    } catch (e) {
      console.warn('Unable to connect wallets');
      this.$Message.error('钱包连接失败，钱包需打开并解锁');
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
  text-align: left;
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
