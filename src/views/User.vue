<template>
  <div class="user">
    <div class="usercard">
      <img width="50px" class="userpic" src="../assets/logo.png" />
      <div class="texts">
        <p class="username">{{username}}</p>
        <p class="userstatu">关注：13 粉丝：20.8w</p>
      </div>
      <Button class="rightbutton" size="small" type="success" ghost>
        <div>编辑</div>
      </Button>
    </div>
    <div class="centercard">
      <Row type="flex" justify="center" class="code-row-bg">
          <Col span="5">
            <p class="centervalue">89</p>
            <p class="centertext">支持收入</p>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <p class="centervalue">25</p>
            <p class="centertext">转发收入</p>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <p class="centervalue">8</p>
            <p class="centertext">收藏夹子</p>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <p class="centervalue">89</p>
            <p class="centertext">最近浏览</p>
          </Col>
      </Row>
    </div>
    <div class="usercard">
      <h1>{{username}} 的文章</h1>
      <div class="income" v-if="playerincome">
        <h1>签名收入：{{playerincome.sign_income/1000}} EOS</h1>
        <h1>分享收入：{{playerincome.share_income/1000}} EOS</h1>
      </div>
      <h2 class="is-me" v-if="username === currentUsername">是你的用户页</h2>
      <za-button block theme="primary" @click="$router.go(-1)">Go Back</za-button>
      <br/>
      <za-button block theme="primary" @click="withdraw">Withdraw</za-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import API from '../api/scatter.js';

export default {
  name: 'User',
  props: ['username'],
  data() {
    return {
      playerincome: null,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
  },
  methods: {
    withdraw() {
      API.withdraw();
    },
    async getPlayerIncome() {
      return API.getPlayerIncome(this.username);
    },
    // ...mapActions(["loginScatterAsync"]),
    // loginWithWallet() {
    //   this.loginScatterAsync();
    // }
  },
  async created() {
    const playerincome = await this.getPlayerIncome();
    this.playerincome = playerincome[0] || 0;
  },
};
</script>
<style>
.user{
  background-color: #F7F7F7;
}
.usercard{
  padding: 20px;
  display: inline-block;
  width: 100%;
}
.userpic{
  float: left;
}
.username{
  font-size: 22px;
  font-weight: bolder;
}
.userstatu{
  font-size: 14px;
  opacity: 0.4;
}
.texts{
  float: left;
  padding-left: 15px;
}
.rightbutton{
  float: right;
  width: 44px;
  height: 19px;
  vertical-align: middle;
}
.centercard{
  background-color: #ffffff;
  margin-left: 20px;
  margin-right: 20px;
  padding: 10px;
  float: center;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
.centervalue{
  font-size: 22px;
  font-weight: bolder;
}
.centertext{
  font-size: 14px;
  opacity: 0.4;
}
</style>