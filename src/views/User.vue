<template>
  <div class="user">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title" v-if="username === currentUsername">个人主页</div>
    </za-nav-bar>
    <div class="usercard" >
      <img width="50px" class="userpic" src="../assets/logo.png" />
      <img style="position:absolute; z-index:1;left:20px;" width="50px" src="/img/camera.png" v-if="editing"/>
      <div class="texts">
        <p class="username">{{username}}</p>
        <p class="userstatu">关注：13 粉丝：20.8w</p>
      </div>

      <Button v-if="username === currentUsername" class="rightbutton" size="small" type="success" ghost @click="edit">
        <div>编辑</div>
      </Button>
      <Button v-else class="rightbutton" size="small" type="success" ghost @click="follow">
        <div>关注</div>
      </Button>

    </div>
    <div class="centercard" v-if="username === currentUsername">
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
      </Row>
    </div>
    <ArticlesList v-if="username !== currentUsername" ref="ArticlesList"/>
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
    edit() {
      console.log("editing");
      this.editing = !this.editing;
    },
    follow() {
      alert("follow");
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
