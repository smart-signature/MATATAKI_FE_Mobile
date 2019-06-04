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
        <div class="user-block-list" @click="jumpTo({ name: 'Original', params: { username }})">
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
          <p class="username"
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
        </div>
      </div>
      <ArticlesList ref="ArticlesList" :listtype="'others'" :username="username" />
    </template>
  </div>
</template>

<script>
// 这个页面被改完了 还有一堆没有的方法待删除 -- 希望修改的时候改干净吧 :(
import { mapGetters } from 'vuex';
import {
  Follow, Unfollow, getUser,
  getAvatarImage,
  uploadAvatar, getMyUserData,
} from '@/api';
import ArticlesList from './ArticlesList.vue';
import { isNull } from '@/common/methods';

export default {
  name: 'User',
  props: ['username'],
  components: { ArticlesList },
  data() {
    return {
      followed: false,
      follows: 0,
      fans: 0,
      nickname: '',
      newname: '',
      email: '',
      avatar: '',
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
    jumpTo(params) {
      this.$router.push(params);
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
        this.$toast.fail({
          duration: 1000,
          message: '关注失败',
        });
        return;
      }
      try {
        await Follow({ followed: username, username: currentUsername });
        this.$toast.success({
          duration: 1000,
          message: '关注成功',
        });
        this.followed = true;
      } catch (error) {
        this.$toast.fail({
          duration: 1000,
          message: '关注失败',
        });
      }
      this.refreshUser();
    },
    async unfollow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$toast.fail({
          duration: 1000,
          message: '取消关注失败',
        });
        return;
      }
      try {
        await Unfollow({ followed: username, username: currentUsername });
        this.$toast.success({
          duration: 1000,
          message: '取消关注',
        });
        this.followed = false;
      } catch (error) {
        this.$toast.fail({
          duration: 1000,
          message: '取消关注失败',
        });
      }
      this.refreshUser();
    },
    setAvatarImage(hash) {
      if (hash) this.avatar = getAvatarImage(hash);
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
