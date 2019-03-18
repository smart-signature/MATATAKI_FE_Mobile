<template>
  <div class="user">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title" v-if="isMe">个人主页</div>
    </za-nav-bar>
    <div class="usercard" >
      <img width="50px" class="userpic" src="../../assets/logo.png" />
      <img style="position:absolute; z-index:1;left:20px;"
           width="50px" src="/img/camera.png" v-if="editing"/>
      <div class="texts">
        <p class="username">{{username}}</p>
        <p class="userstatu">关注：13 粉丝：20.8w</p>
      </div>
      <div v-if="editing">
        <Button class="rightbutton" size="small" type="success"
                ghost @click="save">
          <div>完成</div>
        </Button>
      </div>
      <div v-else>
        <Button v-if="isMe"
                class="rightbutton" size="small" type="success" ghost @click="edit">
          <div>编辑</div>
        </Button>
        <Button v-else
                class="rightbutton" size="small" type="success" ghost @click="follow">
          <div>关注</div>
        </Button>
      </div>
    </div>
    <div class="topcard" v-if="isMe">
      <Row type="flex" justify="center" class="code-row-bg">
          <Col span="11">
            <!-- TODO(minakokojima): 'sign_income' of null
            <p class="centervalue">{{playerincome.sign_income/1000}}</p>
            -->
            <p class="centervalue">{{0}}</p>
            <p class="centertext">支持收入</p>
          </Col>
          <Col span="1"><Divider type="vertical" style="height:33px;margin-top:10px;" /></Col>
          <Col span="11">
            <p class="centervalue">{{personalIncome}}</p>
            <p class="centertext">转发收入</p>
          </Col>
      </Row>
    </div>
    <!-- todo(minakokojima): 顯示該作者發表的文章。-->
    <!-- <ArticlesList ref="ArticlesList"/> -->
    <div class="centercard" v-if="isMe">
      <za-cell is-link has-arrow @click='jumpTo({ name: "Asset", params: { username }})'>
          资产明细
        <!-- <za-icon type='right' slot='icon'/> -->
      </za-cell>
      <za-cell is-link has-arrow @click='() => {}'>
        原创文章
      </za-cell>
      <za-cell is-link has-arrow @click='() => {}'>
        打赏文章
      </za-cell>
    </div>
    <div class="centercard" v-if="isMe">
      <za-cell is-link has-arrow @click='() => {}'>
        规则介绍
      </za-cell>
      <za-cell is-link has-arrow @click='() => {}'>
        用户协议
      </za-cell>
      <za-cell is-link has-arrow @click='() => {}'>
        隐私政策
      </za-cell>
    </div>
    <div class="bottomcard" v-if="isMe">
      <Button class="bottombutton" long @click="logoutScatterAsync">退出登录</Button>
    </div>
    <ArticlesList :listtype="'others'" ref='ArticlesList' v-if="!isMe"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getPlayerIncome } from '@/api/signature';
import ArticlesList from './ArticlesList.vue';
import API from '@/api/scatter.js';

export default {
  name: 'User',
  props: ['username'],
  components: { ArticlesList },
  data() {
    return {
      playerincome: {
        share_income: 0
      },
      editing: false,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    personalIncome() {
      return this.playerincome.share_income / 1000 
    },
    ifLogined() {
      return this.currentUsername !== null;
    },
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    edit() {
      console.log('editing');
      this.editing = !this.editing;
    },
    jumpTo(params) {
      this.$router.push(params)
    },
    cancel() {
      this.editing = !this.editing;
    },
    save() {
      alert('save');
      this.editing = !this.editing;
    },
    follow() {
      alert('follow');
    },
    ...mapActions(["logoutScatterAsync"]),
    // loginWithWallet() {
    //   this.loginScatterAsync();
    // }
  },
  async created() {
    const playerincome = await getPlayerIncome(this.username);
    console.info(playerincome)
    this.playerincome = playerincome.length != 0 ? playerincome[0] : {
        share_income: 0
    };
    const user = this.isMe ? '我' : this.username;
    document.title = `${user} 的用户页 - SmartSignature`;
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
  padding-bottom: 20px;
}
.usercard{
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  background-color: #ffffff;
  padding: 20px;
  margin: 20px;
  /* display: inline-block; */
  border-radius: 8px;
  height: 99px;
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
  padding-left: 11px;
}
.rightbutton{
  float: right;
  margin-top: 6px;
  width: 62px;
  height: 19px;
  vertical-align: middle;
}
.topcard{
  background-color: #ffffff;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
.centercard{
  background-color: #ffffff;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
.bottomcard{
  background-color: #ffffff;
  margin-left: 20px;
  margin-right: 20px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
.bottombutton{
  height: 55px;
  font-size: 14px;
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
