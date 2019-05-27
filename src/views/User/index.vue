/* eslint-disable no-shadow */
<template>
  <div class="user mw" style="white-space:nowrap;">
    <template v-if="isMe">
      <BaseHeader :pageinfo="{ title: '个人中心'}" >
          <div slot="right" class="help-button" @click="jumpTo({ name: 'Help' })">
            <img src="@/assets/img/icon_user_settings.svg" alt="settings">
          </div>
      </BaseHeader>
      <div class="usercard">
        <div class="user-avatar">
          <img v-if="avatar" :src="avatar" />
        </div>
        <div class="texts">
          <p class="user-info">
            <span class="username">{{displayName}}</span>
            <a href="javascript:;"
                    class="edit-button"
                    @click="jumpTo({ name: 'UserEdit', params: { username }})"
                  >编辑</a>
          </p>
          <p class="userstatus">
            <router-link :to="{ name: 'FollowList', params: { listtype: '关注' }}">关注：{{follows}}</router-link>
            <router-link :to="{ name: 'FollowList', params: { listtype: '粉丝' }}">粉丝：{{fans}}</router-link>
          </p>
        </div>
      </div>

      <div class="user-block">
        <div class="user-block-list" @click="jumpTo({ name: 'Asset', params: { username }})">
          <span class="user-block-list-title">账户资产</span>
          <span class="user-block-list-des">
            已绑定{{stats.accounts}}个账户
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看">
          </span>
        </div>
      </div>

      <div class="user-block">
        <div class="user-block-list" @click="jumpTo({ name: 'Reward', params: { username }})">
          <span class="user-block-list-title">原创文章</span>
          <span class="user-block-list-des">
            {{stats.articles}}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看">
          </span>
        </div>
        <div class="user-block-list" @click="jumpTo({ name: 'Reward', params: { username }})">
          <span class="user-block-list-title">赞赏文章</span>
          <span class="user-block-list-des">
            {{stats.supports}}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看">
          </span>
        </div>
        <div class="user-block-list" @click="jumpTo({ name: 'DraftBox', params: { username }})">
          <span class="user-block-list-title">草稿箱</span>
          <span class="user-block-list-des">
            {{stats.drafts}}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看">
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <BaseHeader :pageinfo="{ title: ''}" style="background-color: #478970" :white="true">
      <div slot="right" v-if="!isMe">
        <template v-if="!followed">
          <span class="darkBtn" @click="follow_user">关注</span>
        </template>
        <template v-else>
          <span class="darkBtn" @click="unfollow_user">取消关注</span>
        </template>
      </div>
      </BaseHeader>
      <div class="otherUser">
        <div class="user-avatar">
          <img class="userpic" :src="avatar" @error="() => { this.avatar = require('../../assets/logo.png');}" />
        </div>
      </div>
      <div class="otherUsertextsOutter">
        <div class="otherUsertexts">
          <p v-if="!editing" class="username"
            :class="[!email ? 'username-email' : '']"
          >{{nickname === "" ? username : nickname}}</p>
          <p class="userstatus">
            <router-link :to="{ name: 'FollowList', params: { listtype: '关注' }}">
              <span class="statusNumber">{{follows}}</span>
              <span class="statusKey">关注</span>
            </router-link>
            <router-link :to="{ name: 'FollowList', params: {  listtype: '粉丝'  }}">
              <span class="statusNumber">{{fans}}</span>
              <span class="statusKey">粉丝</span>
            </router-link>
          </p>
          <p>简介：{{introduction || '暂无'}}</p>
          <p v-if="email" class="email">{{email}}</p>
        </div>
      </div>
      <ArticlesList ref="ArticlesList" :listtype="'others'" :username="username" />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import {
  Follow, Unfollow, getUser,
  setUserName, getAvatarImage,
  uploadAvatar, getMyUserData,
} from '@/api';
import ArticlesList from './ArticlesList.vue';
import imgUpload from '@/components/imgUpload/index.vue';
import { isNull } from '@/common/methods';

export default {
  name: 'User',
  props: ['username'],
  components: { ArticlesList, imgUpload },
  data() {
    return {
      editing: false,
      followed: false,
      follows: 0,
      fans: 0,
      nickname: '',
      newname: '',
      email: '',
      avatar: '',
      imgUploadDone: 0, // 图片是否上传完成
      introduction: '',
      stats: {
        accounts: 0,
        articles: 0,
        supports: 0,
        drafts: 0,
      },
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
    displayName() {
      return isNull(this.nickname) ? this.username : this.nickname;
    },
  },
  created() {
    const { refreshUser } = this;
    refreshUser();
    const user = this.isMe ? '我' : this.username;
    document.title = `${user}的个人主页 - SmartSignature`;
  },
  methods: {
    edit() {
      this.editing = !this.editing;
    },
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
        this.vantToast({
          duration: 1000,
          message: '昵称长度为1-12位，中文、英文、数字但不包括下划线等符号',
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
    async refreshUser() {
      if (!this.username) this.username = this.currentUsername;
      const { username, currentUsername } = this;
      const setUser = ({
        avatar, email, fans, follows, is_follow, nickname, introduction, accounts, articles, supports, drafts,
      }) => {
        this.nickname = nickname;
        this.email = email;
        this.newname = isNull(this.nickname) ? this.username : this.nickname;
        this.setAvatarImage(avatar);
        this.follows = follows;
        this.fans = fans;
        this.followed = is_follow;
        this.introduction = introduction;
        this.stats = {
          accounts,
          articles,
          supports,
          drafts,
        };
      };
      try {
        if (this.isMe) {
          const response = await getMyUserData();
          if (response.status !== 200) throw new Error('getUser error');
          setUser(response.data.data);
        } else {
          const response = await getUser({ username }, currentUsername);
          if (response.status !== 200) throw new Error('getUser error');
          setUser(response.data);
        }
      } catch (error) {
        throw error;
      }
    },
    async follow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({ title: '账号信息无效，关注失败' });
        return;
      }
      try {
        await Follow({ followed: username, username: currentUsername });
        this.$Notice.success({ title: '关注成功' });
        this.followed = true;
      } catch (error) {
        this.$Notice.error({ title: '关注失败' });
      }
      this.refreshUser();
    },
    async unfollow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({ title: '账号信息无效，取消关注失败' });
        return;
      }
      try {
        await Unfollow({ followed: username, username: currentUsername });
        this.$Notice.success({ title: '已取消关注' });
        this.followed = false;
      } catch (error) {
        this.$Notice.error({ title: '取消关注失败' });
      }
      this.refreshUser();
    },
    setAvatarImage(hash) {
      // 空hash 显示默认Logo头像
      if (hash) this.avatar = getAvatarImage(hash);
    },
    // 完成上传
    async doneImageUpload(res) {
      const avatar = res.hash;
      try {
        // 更新图像
        const response = await uploadAvatar({ avatar });
        if (response.status !== 201) throw new Error('201');
        this.refreshUser();
        this.imgUploadDone += 1;
      } catch (error) {
        console.log(error);
        this.$Message.error('上传失败请重试');
      }
    },
  },
  watch: {
    isMe() {
      this.refreshUser();
    },
  },
};
</script>

<style lang="less" scoped src="./index.less"></style>
<style lang="less">
  a {
    color: black;
  }
  .centercard .Cell:first-child {
    &:after {
      border-top: none;
    }
  }
  .bottomcard .bottombutton {
    border: 0 solid transparent;
  }
</style>
