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
         <Row>
            <Col span="14"><p class="login-notification">登录即可分享和发布文章！ 看好文，上智能签名！</p></Col>
            <Col span="10">
              <Button class="login-btn" ghost type="text"
              @click="loginWithWallet"
              style="float: right">立即登录</Button>
            </Col>
          </Row>
        </div>
      </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'My-Banner',
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
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
      'logoutScatterAsync']),
    toUserPage(username) {
      this.$router.push({ name: 'User', params: { username } });
    },
    async loginWithWallet() {
      if (!this.isScatterConnected) {
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
        return;
      }
      try {
        // await this.connectScatterAsync();
        // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
        await this.suggestNetworkAsync();
        await this.loginScatterAsync();
      } catch (e) {
        console.warn('Unable to connect wallets');
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
      }
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
  margin-top: -32px;
  text-align: center;
  max-width: 335px;
  /* margin: -32px 20px 0 20px; */
  height: 110px;
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

.login-notification {
  font-size: 14px;
  font-weight:bold;
  /* line-height:10px; */
  color:rgba(39,39,39,1);
}
.login-btn, .login-btn:focus, .login-btn:hover {
  color: #FFF;
  background-color: #000;
  border-radius: 2px;
  font-size:16px;
  letter-spacing: 2px;
}
</style>
