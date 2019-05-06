/* eslint-disable no-shadow */
<template>
  <div class="user">
    <BaseHeader :pageinfo="{ title: `个人主页`, rightPage: 'home', needLogin: false, }" />
    <div class="usercard" >
      <div class="user-avatar">
        <img class="userpic" :src="avatar" @error="() => { this.avatar = require('../../assets/logo.png');}" />
        <img class="camera" src="/img/camera.png" @click="editingavatar = true" v-if="editing" />
      </div>

      <div class="texts">
        <p v-if="!editing" class="username" :class="[!email ? 'username-email' : '']">{{nickname === "" ? username : nickname}}</p>
        <p v-if="email" class="email">{{email}}</p>
        <input class="userinput" :class="[!email ? 'username-email' : '']" v-if="editing" v-model='newname' />
        <p class="userstatus">
          <a @click="jumpTo({ name: 'FollowList', params: { listtype: '关注' }})">
            关注：{{follows}}
          </a>
          <a @click="jumpTo({ name: 'FollowList', params: {  listtype: '粉丝'  }})">
            粉丝：{{fans}}
          </a>
        </p>
      </div>
      <div class="user-button">
        <template v-if="editing">
          <a href="javascript:;" class="rightbutton" :class="[editing ? 'editing-button' : '']" @click="save">完成</a>
        </template>
      <template v-else>
        <template v-if="isMe">
          <a href="javascript:;" class="rightbutton" @click="edit">编辑</a>
        </template>
        <template v-else>
          <template v-if="!followed">
            <a href="javascript:;" class="rightbutton" @click="follow_user">关注</a>
          </template>
          <template v-else>
            <a href="javascript:;" class="rightbutton" @click="unfollow_user">取消关注</a>
          </template>
        </template>
      </template>
    </div>

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
      <za-cell is-link has-arrow @click='jumpTo({ name: "DraftBox", params: { username }})'>
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
      email: '',
      avatar: require('../../assets/logo.png'),
      editingavatar: false,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
  },
  methods: {
    ...mapActions('scatter', [
      'logout',
    ]),
    logoutScatterAsync() { return this.logout(); },
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
    async save() {
      if (this.newname === this.nickname) {
        this.editing = !this.editing;
        return;
      }
      // 中文 字母 数字 1-12
      const reg = /^[\u4E00-\u9FA5A-Za-z0-9]{1,12}$/;
      if (!reg.test(this.newname)) {
        // this.$Message.error('昵称长度为1-12位，中文、英文、数字但不包括下划线等符号');
        this.$toasted.show('<p style="margin: 8px 0;line-height: 1.5;">昵称长度为1-12位，中文、英文、数字但不包括下划线等符号</p>', {
          position: 'top-center',
          duration: 1500,
          fitToScreen: true,
        });
        return;
      }
      try {
        const response = await setUserName({ newname: this.newname });
        this.$Notice.success({ title: '保存成功' });
        this.nickname = this.newname;
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          if (error.response.status === 500) {
            this.$Notice.error({ title: '昵称已存在，请重新设置' });
            this.nickname = this.newname;
          } else {
            this.$Notice.error({
              title: '保存失败',
              desc: '昵称长度为1-12位，中文、英文、数字但不包括下划线等符号',
            });
            this.newname = this.nickname === '' ? this.username : this.nickname;
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
      this.refreshUser();
      this.editing = !this.editing;
    },
    refreshUser() {
      if (this.username === null) this.username = this.currentUsername;
      const { username, currentUsername } = this;
      const setUser = (data) => {
        this.nickname = data.nickname;
        this.email = data.email;
        this.newname = this.nickname === '' ? this.username : this.nickname;
        this.setAvatarImage(data.avatar);
        this.follows = data.follows;
        this.fans = data.fans;
        this.followed = data.is_follow;
      };

      // todo(minakokojima): deprecate oldgetUser
      if (currentUsername !== null) {
        if (currentUsername.length > 12) return;
        oldgetUser({ username }, ({ error, response }) => {
          console.log(error, response);
          if (!error) {
            if (response.status !== 200) throw error;
            const { data } = response;
            setUser(data);
          } else throw error;
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
      if (!currentUsername || !username || currentUsername.length > 12) {
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
      if (!currentUsername || !username || currentUsername.length > 12) {
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
    setAvatarImage(hash) {
      // 空hash 显示默认Logo头像
      // eslint-disable-next-line global-require
      if (!hash) this.avatar = require('../../assets/logo.png');
      else this.avatar = getAvatarImage(hash);
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

<style lang="less" scoped src="./index.less"></style>
