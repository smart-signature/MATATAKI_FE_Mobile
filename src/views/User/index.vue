<template>
  <div class="user">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title" v-if="isMe">个人主页</div>
    </za-nav-bar>
    <div class="usercard" >
      <!-- /img/camera.png -->
      <img style="position:absolute; z-index:1;left:40px;" width="50px"
        src="/img/camera.png" @click="editingavatar = true" v-if="editing"/>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="4" class="user-avatar">
        <!-- ../../assets/logo.png -->
          <img width="50px" class="userpic" :src="avatar" />
        </Col>
        <Col span="14">
          <div class="texts">
            <p v-if="!editing" class="username">{{nickname == "" ? username : nickname}}</p>
            <za-input v-if="editing" class="userinput" ref='inputFirst'
              v-model='newname'></za-input>
            <p class="userstatus">
              <a @click="jumpTo({ name: 'FollowList', params: { listtype: '关注' }})">
                关注：{{follows}}
              </a>
              <a style="margin-left:14px;" @click="jumpTo({ name: 'FollowList', params: { listtype: '粉丝' }})">
                粉丝：{{fans}}
              </a>
            </p>
          </div>
        </Col>
        <Col span="6">
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
                <Button class="rightbutton"
                  size="small" type="success" ghost @click="unfollow_user">
                  <div>取消关注</div>
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
    <div class="topcard" v-if="isMe">
      <Row type="flex" justify="center" class="code-row-bg">
          <Col span="11">
            <p class="centervalue">{{playerincome}} EOS</p>
            <p class="centertext">历史总收入</p>
          </Col>
          <Col span="1"><Divider type="vertical" style="height:33px;margin-top:10px;" /></Col>
          <Col span="11">
            <Button class="detail" ghost
              @click='jumpTo({ name: "Asset", params: { username }})'>
              <div style="margin-top:-2px">资产明细</div>
            </Button>
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

    <!-- ⬇头像编辑 -->
    <za-modal :visible.sync='editingavatar' title="编辑头像" :show-close='true'>
      <Avatar @setDone="setDone" />
    </za-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import {
  Follow, Unfollow, getUser, oldgetUser,
  setUserName, getAssets, getAvatarImage,
} from '@/api';
import ArticlesList from './ArticlesList.vue';
import Avatar from './AvatarUploader.vue';

export default {
  name: 'User',
  props: ['username'],
  components: { Avatar, ArticlesList },
  data() {
    return {
      playerincome: 0,
      editing: false,
      followed: false,
      follows: 0,
      fans: 0,
      nickname: '',
      newname: '',
      avatar: require('../../assets/logo.png'),
      editingavatar: false,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
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
    goBack() {
      this.$router.go(-1);
    },
    edit() {
      this.editing = !this.editing;
    },
    // clickCamera(){
    //   console.log("clicked.");
    // },
    jumpTo(params) {
      this.$router.push(params);
    },
    cancel() {
      this.editing = !this.editing;
    },
    save() {
      if (this.newname === this.nickname) {
        this.editing = !this.editing;
        return;
      }
      setUserName({ newname: this.newname }, ({ error, response }) => {
        if (!error) {
          if (response.status === 500) {
            this.$Notice.error({
              title: '昵称已存在，请重新设置',
            });
          } else {
            this.$Notice.success({
              title: '保存成功',
            });
          }
          this.nickname = this.newname;
        } else {
          console.log(response.status);
          this.$Notice.error({
            title: '保存失败',
          });
          this.newname = this.nickname === '' ? this.username : this.nickname;
        }
        this.refreshUser();
        this.editing = !this.editing;
      });
    },
    refreshUser() {
      if (this.username === null) this.username = this.currentUsername;
      const { username, currentUsername } = this;
      const setUser = (data) => {
        this.follows = data.follows;
        this.fans = data.fans;
        this.followed = data.is_follow;
        this.nickname = data.nickname;
        this.newname = this.nickname === '' ? this.username : this.nickname;
        this.setAvatarImage(data.avatar);
      };
      if (currentUsername !== null) {
        oldgetUser({ username }, ({ error, response }) => {
          console.log(response);
          const { data } = response;
          setUser(data);
        });
      } else {
        getUser({ username }).then((response) => {
          console.log(response);
          const { data } = response;
          setUser(data);
        });
      }
    },
    follow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({
          title: '账号信息无效，关注失败',
        });
        return;
      }
      Follow({
        followed: username, username: currentUsername,
      }, ({ error, response }) => {
        console.log(error);
        if (!error) {
          this.$Notice.success({ title: '关注成功' });
          this.followed = true;
        } else {
          this.$Notice.error({
            title: '关注失败',
          });
        }
        this.refreshUser();
      });
    },
    unfollow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({ title: '账号信息无效，取消关注失败' });
        return;
      }
      Unfollow({
        followed: username, username: currentUsername,
      }, ({ error, response }) => {
        if (!error) {
          this.$Notice.success({ title: '已取消关注' });
          this.followed = false;
        } else {
          this.$Notice.error({ title: '取消关注失败' });
        }
        this.refreshUser();
      });
    },
    // 获取历史总收入
    async getAssets() {
      await getAssets(this.username, 1).then((res) => {
        if (res.status === 200) {
          this.playerincome = (res.data.totalSignIncome + res.data.totalShareIncome) / 10000;
        }
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取历史收入错误请重试');
      });
    },
    async setAvatarImage(hash) {
      // 空hash 不去查询 显示默认Logo头像
      if (!hash) return this.avatar = require('../../assets/logo.png');
      const response = await getAvatarImage(hash);
      // console.log(response);
      try {
        this.avatar = `data:image/png;base64,${btoa(
          new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''),
        )}`;
      } catch (err) {
        console.log(err);
        this.avatar = require('../../assets/logo.png');
      }
    },
    // 设置头像完成 子组件与夫组件通信
    setDone(status) {
      console.log(status);
      this.editingavatar = status;
      this.refreshUser();
    },
  },
  created() {
    const { getAssets, refreshUser } = this;
    getAssets();
    refreshUser();
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
  margin: 16px 20px;
  /* display: inline-block; */
  border-radius: 3px;
  height: 99px;
}
.userpic{
  float: left;
}
.username{
  font-size: 22px;
  font-weight: bolder;
  text-align: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.userinput{
  font-size: 22px;
  font-weight: bolder;
  margin-top: -12px;
  height: 45px;
}
.userstatus{
  font-size: 14px;
  opacity: 0.4;
  text-align: left;
}
.texts{
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
  margin: 16px 20px;
  padding: 10px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 3px;
}
.centercard{
  background-color: #ffffff;
   margin: 16px 20px;

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

.user-avatar {
  overflow: hidden;
  border-radius: 3px;
}
.user-avatar img {
  height: 100%;
  object-fit: cover;
}
</style>
