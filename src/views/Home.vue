<template>
  <div class="home">
    <div class="head">
      <h1 class="title">-SmartSignature-</h1>
      <h2 class="subtitle">首个EOS去中心化智能签名项目</h2>
    </div>
    <div class="my-banner">
      <div class="my-stat">
        <div class="logined" v-if="isLogined">
          <p @click="$router.push({ name: 'User' })" class="username">{{currentUsername}}</p>
          <p class="my-balance">
            1234.1234
            <span class="coin-symbol">EOS</span>
          </p>
        </div>
        <div class="not-login-yet" v-else>
          <p>欢迎来到 Smart Signature</p>
          <za-button bordered @click="$router.push({name: 'Login'})">使用钱包登录</za-button>
        </div>
      </div>
      <za-button bordered style="float: right" @click="$router.push({name: 'About'})">玩法介绍</za-button>
    </div>
    <div class="articles">
      <za-tabs v-model="activeNameSwipe" @change="handleClick">
        <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
          <div class="content">{{tab.label}}</div>
        </za-tab-pane>
      </za-tabs>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import { mapState, mapActions, mapGetters } from "vuex";

export default {
  name: "home",
  computed: {
    ...mapState(["scatterAccount"]),
    ...mapGetters(["currentUsername"]),
    isLogined() {
      return this.scatterAccount !== null;
    }
  },
  methods: {
    ...mapActions(["loginScatterAsync"]),
    handleClick(tab, event) {
      console.log(tab, event);
    }
  },
  data() {
    return {
      activeNameSwipe: "文章列表",
      selectedLabelDefault: "文章列表",
      tabs: [
        {
          label: "文章列表"
        },
        {
          label: "最多支持"
        },
        {
          label: "最多分享"
        }
      ]
    };
  }
};
</script>

<style scoped>
.head {
  background: #478970;
  color: #fff;
  padding-top: 10px;
  height: 155px;
  text-align: center;
  align-items: center;
  vertical-align: middle;
}
h1.title {
  font-size: 22px;
  /* padding-top: 101px; */
  font-family: BodoniSvtyTwoSCITCTT-Book;
  font-weight: normal;
  width: 100%;
  color: rgba(255, 255, 255, 1);
  line-height: 27px;
  letter-spacing: 2px;
}
.username {
  font-weight: bold;
}
h2.subtitle {
  font-size: 13px;
  font-family: PingFangSC-Light;
  font-weight: 300;
  color: rgba(255, 255, 255, 1);
  line-height: 18px;
  letter-spacing: 1px;
}
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
  float: left;
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
.articles {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
}
</style>
