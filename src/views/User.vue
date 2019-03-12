<template>
  <div class="user">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title" v-if="username === currentUsername">个人主页</div>
      <div slot="right" v-if="username === currentUsername">我的</div>
    </za-nav-bar>
    <div class="usercard">
      <img width="50px" class="userpic" src="../assets/logo.png" />
      <img style="position:absolute; z-index:1;left:20px;" width="50px" src="/img/camera.png" v-if="editing"/>
      <div class="texts">
        <p class="username">{{username}}</p>
        <p class="userstatu">关注：13 粉丝：20.8w</p>
      </div>
      <Button class="rightbutton" size="small" type="success" ghost @click="edit">
        <div>编辑</div>
      </Button>
    </div>
    <div class="centercard">
      <Row type="flex" justify="center" class="code-row-bg">
          <Col span="5">
            <router-link :to="{ name: 'Asset', params: { username }}">
              <p class="centervalue">{{playerincome.sign_income/1000}}</p>
              <p class="centertext">支持收入</p>
            </router-link>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <router-link :to="{ name: 'Asset', params: { username }}">
              <p class="centervalue">{{playerincome.share_income/1000}}</p>
              <p class="centertext">转发收入</p>
            </router-link>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <p class="centervalue">8000</p>
            <p class="centertext">收藏夹子</p>
          </Col>
          <Col span="1"><Divider type="vertical" /></Col>
          <Col span="5">
            <p class="centervalue">89</p>
            <p class="centertext">最近浏览</p>
          </Col>
      </Row>
    </div>
    <ArticlesList ref="ArticlesList"/>
    <!-- <div class="usercard">
      <h1>{{username}} 的文章 // 這部分似乎是個歷史遺留</h1>
      <div class="income" v-if="playerincome">
        <h1>签名收入：{{playerincome.sign_income/1000}} EOS</h1>
        <h1>分享收入：{{playerincome.share_income/1000}} EOS</h1>
      </div>
      <h2 class="is-me" v-if="username === currentUsername">是你的用户页</h2>
      <za-button block theme="primary" @click="$router.go(-1)">Go Back</za-button>
      <br/>
      <za-button block theme="primary" @click="withdraw">Withdraw</za-button>
    </div> -->
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import API from '../api/scatter.js';
import ArticlesList from './Home/ArticlesList.vue';

export default {
  name: 'User',
  props: ['username'],
  components: { ArticlesList },
  data() {
    return {
      playerincome: null,
      editing: false,
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
    goBack() {
      this.$router.go(-1);
    },
    edit(){
      console.log("editing");
      this.editing = !this.editing;
    }
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
a {
  color: #000;
  text-decoration: none; /* no underline */
}
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
  font-weight: bold;
  opacity: 0.4;
}
</style>
