<template>
  <div class="login">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon>
      </div>
      <div slot="title">登录 SmartSignature</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="logined-already card" v-if="scatterAccount">
      <za-icon theme="success" type="warning-round-fill" style="font-size: 14rem;"/>
      <h1 class="title">你已经登录啦～</h1>
      <p class="info">你当前登录的账户为
        <br>
        {{currentUsername}}
      </p>
      <za-button block theme="warning" @click="logoutScatterAsync()">退出当前账户 {{currentUsername}}</za-button>
      <za-button block theme="primary" @click="$router.go(-1)">返回上一页</za-button>
    </div>
    <div class="login-methods card" v-else>
      <za-button
        block
        theme="primary"
        :disabled="!isScatterConnected"
        @click="loginWithWallet"
      >{{ isScatterConnected ? '使用钱包登录' : '没有检测到钱包' }}</za-button>
      <p class="disclaimer">未注册的账号登录时将自动注册，注册则代表您已经同意用户协议和隐私政策</p>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  name: "Login Page",
  computed: {
    ...mapState(["isScatterConnected", "scatterAccount"]),
    ...mapGetters(["currentUsername"])
  },
  methods: {
    ...mapActions([
      "connectScatterAsync",
      "suggestNetworkAsync",
      "loginScatterAsync",
      "logoutScatterAsync"
    ]),
    async loginWithWallet() {
      try {
        await this.connectScatterAsync();
        // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
        const suggestNetworkResult = await this.suggestNetworkAsync();
        await this.loginScatterAsync();
      } catch (e) {
        console.warn("Unable to connect wallets");
      }
    }
  }
};
</script>

<style scoped>
p.disclaimer {
  font-size: 12px;
  font-weight: 400;
  color: #666;
}
p.info {
  font-size: 24px;
  font-weight: 400;
  color: #666;
}
.za-button {
  margin-bottom: 10px;
}
</style>
