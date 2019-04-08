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
      <img style="position:absolute; z-index:1;left:40px;"
           width="50px" src="/img/camera.png" v-if="editing"/>
      <div class="texts">
        <p class="username">{{username}}</p>
        <!-- <p class="userstatu"><a @click="jumpTo({ name: 'Followlist' })">关注：{{follows}}</a><a style="margin-left:14px;"@click="jumpTo({ name: 'Fanslist' })"> 粉丝：{{fans}}</a></p> -->
        <p class="userstatu">
          <span>关注：{{follows}}</span>
          <span style="margin-left:14px;">粉丝：{{fans}}</span>
        </p>
      </div>
      <div v-if="editing">
        <Button class="rightbutton" size="small" type="success"
                ghost @click="save">
          <div>完成</div>
        </Button>
      </div>
      <div v-else>
        <div v-if="isMe">
          <Button class="rightbutton" size="small" type="success" ghost @click="edit">
            <div>编辑</div>
          </Button>
        </div>
        <div v-else>
          <div v-if="!followed">
            <Button class="rightbutton" size="small" type="success" ghost @click="follow_user">
              <div>关注</div>
            </Button>
          </div>
          <div v-else>
            <Button class="rightbutton" size="small" type="success" ghost @click="unfollow_user">
              <div>取消关注</div>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div class="topcard" v-if="isMe">
      <Row type="flex" justify="center" class="code-row-bg">
          <Col span="11">
            <p class="centervalue">{{mySignIncome + myShareIncome}} EOS</p>
            <p class="centertext">历史总收入</p>
          </Col>
          <Col span="1"><Divider type="vertical" style="height:33px;margin-top:10px;" /></Col>
          <Col span="11">
            <Button class="detail" ghost @click='jumpTo({ name: "Asset", params: { username }})'><div style="margin-top:-2px">资产明细</div></Button>
            <!-- <p class="centervalue">{{myShareIncome}} EOS</p>
            <p class="centertext">赞赏收益</p> -->
          </Col>
      </Row>
    </div>
    <!-- todo(minakokojima): 顯示該作者發表的文章。-->
    <!-- <ArticlesList ref="ArticlesList"/> -->
    <div class="centercard" v-if="isMe">
      <za-cell is-link has-arrow>
        草稿箱
        <!-- <za-icon type='right' slot='icon'/> @click='jumpTo({ name: "DraftBox" })'-->
      </za-cell>
      <za-cell is-link has-arrow @click='jumpTo({ name: "Original", params: { username }})'>
        我的文章
      </za-cell>
      <za-cell is-link has-arrow @click='jumpTo({ name: "Reward", params: { username }})'>
        赞赏文章
      </za-cell>
    </div>
    <div class="centercard" v-if="isMe">
      <za-cell is-link has-arrow @click='jumpTo({ name: "About" })'>
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
    <ArticlesList :listtype="'others'" ref='ArticlesList' :username='username' v-if="!isMe"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getPlayerIncome } from '@/api/signature';
import {
  Follow, Unfollow, getUser, auth,
} from '../../api';
import ArticlesList from './ArticlesList.vue';
import API from '@/api/scatter';
import { isEmptyArray } from '@/common/methods';

export default {
  name: 'User',
  props: ['username'],
  components: { ArticlesList },
  data() {
    return {
      playerincome: {
        sign_income: 0,
        share_income: 0,
      },
      editing: false,
      followed: false,
      follows: 0,
      fans: 0,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    mySignIncome() {
      return this.playerincome.sign_income / 10000;
    },
    myShareIncome() {
      return this.playerincome.share_income / 10000;
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
    ...mapActions(['logoutScatterAsync']),
    async authDemo() { // 示例代码。。请随便改。。。
      // 1. 取得签名
      let accessvalid = false;
      const nowtime = new Date().getTime();
      if (localStorage.getItem('ACCESS_TOKEN') != null) {
        const accesstime = localStorage.getItem('ACCESS_TIME');
        if (accesstime != null) {
          if (nowtime - accesstime < 604800000) {
            accessvalid = true;
          }
        }
      }
      if (!accessvalid) {
        API.authSignature(({ username, publicKey, signature }) => {
          console.log(username, publicKey, signature);
          // 2. post到服务端 获得accessToken并保存
          auth({ username, publicKey, sign: signature }, (error, response, body) => {
            console.log(body);
            if (!error) {
              // 3. save accessToken
              const accessToken = body;
              localStorage.setItem('ACCESS_TOKEN', accessToken);
              localStorage.setItem('ACCESS_TIME', nowtime);
            }
          });
        });
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    edit() {
      console.log('editing');
      this.editing = !this.editing;
    },
    jumpTo(params) {
      this.$router.push(params);
    },
    cancel() {
      this.editing = !this.editing;
    },
    save() {
      this.$Message.success('保存');
      this.editing = !this.editing;
    },
    refresh_user() {
      const { username } = this;
      getUser({ username }, (error, response, body) => {
        this.follows = body.follows;
        this.fans = body.fans;
        this.followed = body.is_follow;
      });
    },
    follow_user() {
      // alert('follow');
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({
          title: '账号信息无效，关注失败',
        });
        return;
      }
      Follow({
        followed: username, username: currentUsername,
      // eslint-disable-next-line no-unused-vars
      }, (error, response, body) => { // body 未使用
        console.log(response);
        if (!error) {
          this.$Notice.success({
            title: '关注成功',
          });
          this.followed = true;
        } else {
          this.$Notice.error({
            title: '关注失败',
          });
        }
        this.refresh_user();
      });
    },
    unfollow_user() {
      // alert('follow');
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({
          title: '账号信息无效，取消关注失败',
        });
        return;
      }
      Unfollow({
        followed: username, username: currentUsername,
      // eslint-disable-next-line no-unused-vars
      }, (error, response, body) => { // response body 未使用
        if (!error) {
          this.$Notice.success({
            title: '已取消关注',
          });
          this.followed = false;
        } else {
          this.$Notice.error({
            title: '取消关注失败',
          });
        }
        this.refresh_user();
      });
    },
  },
  async created() {
    const playerincome = await getPlayerIncome(this.username);
    this.playerincome = isEmptyArray(playerincome) ? playerincome[0] : this.playerincome;
    this.refresh_user();
    const user = this.isMe ? '我' : this.username;
    document.title = `${user}的个人主页 - SmartSignature`;
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
  float:left;
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
Button.detail, Button.detail:focus, Button.detail:hover {
  background-color: rgba(0, 0, 0, 1);
  border-radius: 2px;
  color: rgba(255,255,255,1);
  /* float: right; */
  font-size: 12px;
  margin-top: 12px;
  width: 80px;
  height: 25px;
  letter-spacing: 2px;
  max-width: 94px;
  max-height: 35px;
  text-align: center;
  padding-left: 12px;
  /* margin-right: 0px; */
}
</style>
