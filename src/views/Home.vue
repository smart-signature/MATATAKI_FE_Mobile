<template>
  <div class="home">
    <div class="head">
      <h1 class="title">-SmartSignature-</h1>
      <h2 class="subtitle">首个EOS去中心化智能签名项目</h2>
    </div>
    <div class="my-banner">
      <div class="my-stat">
        <p>MINAKOKOJIMA</p>
        <p class="my-balance">
          1234.1234
          <span class="coin-symbol">EOS</span>
        </p>
      </div>
      <cube-button :inline="true" style="float: right">玩法介绍</cube-button>
    </div>
    <div class="articles">
      <cube-tab-bar
        v-model="selectedLabelDefault"
        :data="tabs" showSlider
        @click="clickHandler"
        @change="changeHandler"
      ></cube-tab-bar>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "home",
  components: {
    // HelloWorld
  },
  data() {
    return {
      selectedLabelDefault: "文章列表",
      tabs: [
        {
          label: "文章列表",
        },
        {
          label: "最多支持",
        },
        {
          label: "最多分享",
        }
      ]
    };
  },
  methods: {
    clickHandler(label) {
      // if you clicked home tab, then print 'Home'
      console.log(label);
    },
    changeHandler(label) {
      // if you clicked different tab, this methods can be emitted
    }
  }
};
</script>

<style scoped>
.head {
  background: #478970;
  color: #fff;
  height: 375px;
  text-align: center;
  align-content: center;
  align-items: center;
}
h1.title {
  font-size: 22px;
  font-family: BodoniSvtyTwoSCITCTT-Book;
  font-weight: normal;
  color: rgba(255, 255, 255, 1);
  line-height: 27px;
  letter-spacing: 2px;
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
  max-width: 335px;
  margin: -32px 20px;
  height: 76px;
  padding: 16px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 5px 5px 0px rgba(213, 213, 213, 0.5);
  border-radius: 4px;
}
.my-stat {
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
  background: rgba(240, 240, 240, 1);
}
</style>
