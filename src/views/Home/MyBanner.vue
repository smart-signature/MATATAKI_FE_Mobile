<template>
    <div class="my-banner">
      <div class="my-stat">
        <div class="logined" v-if="isLogined">
          <p @click="toUserPage(currentUsername)" class="username">{{currentUsername}}</p>
          <p class="my-balance">
            {{eosBalance}}
            <span class="coin-symbol">EOS</span>
          </p>
        </div>
        <div class="not-login-yet" v-else>
          <p>欢迎来到 Smart Signature</p>
          <za-button
            block
            theme="primary"
            :disabled="!isScatterConnected"
            @click="$router.push({name: 'Login'})"
          >{{ isScatterConnected ? '使用钱包登录' : '没有检测到钱包' }}</za-button>
        </div>
      </div>
      <za-button theme='warning' style="float: right" block bordered @click="$router.push({name: 'About'})">玩法介绍</za-button>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'My Banner',
  computed: {
    ...mapState(['scatterAccount', 'balances', 'isScatterConnected']),
    ...mapGetters(['currentUsername']),
    eosBalance() {
      return this.balances.eos.slice(0, -4);
    },
    isLogined() {
      return this.scatterAccount !== null;
    },
  },
  created() {

  },
  methods: {
    ...mapActions(['loginScatterAsync']),
    toUserPage(username) {
      this.$router.push({ name: 'User', params: { username } });
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  data: () => ({}),
};
</script>

<style scoped>
.my-banner {
  margin: auto;
  /*margin-top: -32px;*/
  text-align: center;
  max-width: 335px;
  /* margin: -32px 20px 0 20px; */
  height: 220px;
  padding: 8px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 5px 5px 0px rgba(213, 213, 213, 0.5);
  border-radius: 4px;
}
.my-stat {
  text-align: left;
  /* float: left; */
}
.coin-symbol {
  color: #999999;
}
.my-balance {
  font-size: 16px;
  font-family: PingFang SC, STHeitiSC-Light, Helvetica-Light, arial, sans-serif;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  line-height: 22px;
  letter-spacing: 1px;
}
</style>
