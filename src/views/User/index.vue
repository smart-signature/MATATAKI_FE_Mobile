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
        <p class="userstatu">关注：{{follows}} 粉丝：{{fans}}</p>
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
            <p class="centervalue">{{mySignIncome}} EOS</p>
            <p class="centertext">创作收益</p>
          </Col>
          <Col span="1"><Divider type="vertical" style="height:33px;margin-top:10px;" /></Col>
          <Col span="11">
            <p class="centervalue">{{myShareIncome}} EOS</p>
            <p class="centertext">赞赏收益</p>
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
        share_income: 0
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
        API.authSignature((username, publickey, sign) => {
          console.log(username, publickey, sign);
          // 2. post到服务端 获得accessToken并保存
          auth({ username, publickey, sign }, (error, response, body) => {
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
      // 4. 使用accessToken 示例。 请求修改某些和用户数据相关的api时，需要按照oauth2规范，在header里带上 accessToken， 以表示有权调用
      // const accessToken = localStorage.getItem("ACCESS_TOKEN");
      // request({
      //   uri: "some api url that need auth",
      //   // uri: "http://localhost:7001/follow",
      //   // uri: "http://localhost:7001/unfollow",
      //   rejectUnauthorized: false,
      //   json: true,
      //   headers: { Accept: '*/*', "x-access-token": accessToken },
      //   dataType: 'json',
      //   method: 'POST',
      //   form: {
      //     username:"joetothemoon",
      //     followed:"tengavinwood",
      //   },
      // }, function(err,resp, body){
      //    console.log(body);
      // });
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
      alert('save');
      this.editing = !this.editing;
    },
    refresh_user() {
      getUser({
        username: this.username,
      }, (error, response, body) => {
        this.follows = body.follows;
        this.fans = body.fans;
        this.followed = body.is_follow;
      });
    },
    follow_user() {
      // alert('follow');
      const { username, currentUsername } = this;
      Follow({
        followed: username, username: currentUsername,
      }, (error, response, body) => {
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
      Unfollow({
        followed: username, username: currentUsername,
      }, (error, response, body) => {
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
    ...mapActions(['logoutScatterAsync']),
    // loginWithWallet() {
    //   this.loginScatterAsync();
    // }
  },
  async created() {
    const playerincome = await getPlayerIncome(this.username);
    this.playerincome = isEmptyArray(playerincome) ? playerincome[0] : this.playerincome;
    this.refresh_user();
    const user = this.isMe ? '我' : this.username;
    document.title = `${user}的个人主页 - SmartSignature`;
    await this.authDemo();
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
</style>
