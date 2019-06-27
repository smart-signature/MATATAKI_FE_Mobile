/* eslint-disable no-shadow */
<template>
  <div class="user mw" style="white-space:nowrap;">
    <template v-if="isMe(id)">
      <BaseHeader :pageinfo="{ title: '个人中心' }">
        <div slot="right" class="help-button" @click="jumpTo({ name: 'Help' })">
          <img src="@/assets/img/icon_user_settings.svg" alt="settings" />
        </div>
      </BaseHeader>
      <div class="usercard">
        <div class="user-avatar">
          <img v-if="avatar" v-lazy="avatar" :src="avatar" />
        </div>
        <div class="texts">
          <p class="user-info">
            <span class="nmae">{{ name }}</span>
            <router-link class="edit-button" :to="{ name: 'UserEdit', params: { id } }"
              >编辑</router-link
            >
          </p>
          <p class="userstatus">
            <router-link :to="{ name: 'FollowList', params: { listtype: '关注' } }"
              >关注：{{ follows }}</router-link
            >
            <router-link :to="{ name: 'FollowList', params: { listtype: '粉丝' } }"
              >粉丝：{{ fans }}</router-link
            >
          </p>
        </div>
      </div>

      <div class="user-block">
        <div class="user-block-list" @click="jumpTo({ name: 'Asset', params: { id } })">
          <span class="user-block-list-title">账户资产</span>
          <span class="user-block-list-des">
            已绑定{{ stats.accounts }}个账户
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看" />
          </span>
        </div>
      </div>

      <div class="user-block">
        <div class="user-block-list" @click="jumpTo({ name: 'Original', params: { id } })">
          <span class="user-block-list-title">原创文章</span>
          <span class="user-block-list-des">
            {{ stats.articles }}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看" />
          </span>
        </div>
        <div class="user-block-list" @click="jumpTo({ name: 'Reward', params: { id } })">
          <span class="user-block-list-title">赞赏文章</span>
          <span class="user-block-list-des">
            {{ stats.supports }}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看" />
          </span>
        </div>
        <div class="user-block-list" @click="jumpTo({ name: 'DraftBox', params: { id } })">
          <span class="user-block-list-title">草稿箱</span>
          <span class="user-block-list-des">
            {{ stats.drafts }}篇
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看" />
          </span>
        </div>
      </div>

      <div class="user-block">
        <div class="user-block-list" @click="jumpTo({ name: 'BuyHistory' })">
          <span class="user-block-list-title">购买记录</span>
          <span class="user-block-list-des">
            <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="查看" />
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <BaseHeader :pageinfo="{ title: '' }" style="background-color: #478970" :white="true">
        <div v-if="!isMe(id)" slot="right">
          <template v-if="!followed">
            <span class="darkBtn" @click="followUser">关注</span>
          </template>
          <template v-else>
            <span class="darkBtn" @click="unfollowUser">取消关注</span>
          </template>
        </div>
      </BaseHeader>
      <div class="otherUser">
        <div class="user-avatar">
          <img v-if="avatar" v-lazy="avatar" class="userpic" :src="avatar" />
        </div>
      </div>
      <div class="otherUsertextsOutter">
        <div class="otherUsertexts">
          <p class="name">{{ name }}</p>
          <p class="userstatus">
            <router-link :to="{ name: 'FollowList', params: { listtype: '关注' } }">
              <span class="statusNumber">{{ follows }}</span>
              <span class="statusKey">关注</span>
            </router-link>
            <router-link :to="{ name: 'FollowList', params: { listtype: '粉丝' } }">
              <span class="statusNumber">{{ fans }}</span>
              <span class="statusKey">粉丝</span>
            </router-link>
          </p>
          <p>简介：{{ introduction || "暂无" }}</p>
        </div>
      </div>
      <ArticlesList :id="id" ref="ArticlesList" :listtype="'others'" />
    </template>

    <BaseModalForSignIn
      :show-modal="showSignInModal"
      @changeInfo="stats => (showSignInModal = stats)"
    />
  </div>
</template>

<script>
// 这个页面被改完了 还有一堆没有的方法待删除 -- 希望修改的时候改干净吧 :(
import { mapGetters } from "vuex";
import ArticlesList from "./ArticlesList.vue";

export default {
  name: "User",
  components: { ArticlesList },
  props: ["id"],
  data() {
    return {
      followed: false,
      follows: 0,
      fans: 0,
      name: "",
      email: "",
      avatar: "",
      introduction: "",
      stats: {
        accounts: 0,
        articles: 0,
        supports: 0,
        drafts: 0
      },
      showSignInModal: false
    };
  },
  computed: {
    ...mapGetters(["currentUserInfo", "displayName", "isLogined", "isMe"])
  },
  watch: {
    isLogined() {
      this.refreshUser();
    }
  },
  created() {
    this.refreshUser();
    const { isMe, id } = this;
    const user = isMe(id) ? "我" : id;
    document.title = `${user}的个人主页 - SmartSignature`;
  },
  methods: {
    jumpTo(params) {
      this.$router.push(params);
    },
    async refreshUser() {
      const { isMe, id } = this;
      const setUser = ({
        avatar,
        email,
        fans,
        follows,
        is_follow,
        nickname,
        introduction,
        username,
        accounts,
        articles,
        supports,
        drafts
      }) => {
        this.email = email;
        this.fans = fans;
        this.follows = follows;
        this.introduction = introduction;
        this.followed = is_follow;
        this.name = nickname || username;
        this.setAvatarImage(avatar);
        this.stats = { accounts, articles, supports, drafts };
      };

      const { getMyUserData, getUser } = this.$backendAPI;
      const {
        data: { data }
      } = await (isMe(id) ? getMyUserData() : getUser({ id }));
      // console.debug(data);
      setUser(data);
    },
    checkb4FoUnfo() {
      if (!this.isLogined) {
        this.showSignInModal = true;
        return false;
      }
      return true;
    },
    async followUser() {
      // if (!this.checkb4FoUnfo()) return;
      try {
        await this.$backendAPI.follow({ id: this.id });
        this.$toast.success({ duration: 1000, message: "关注成功" });
        this.followed = true;
      } catch (error) {
        this.$toast.fail({ duration: 1000, message: "关注失败" });
        this.showSignInModal = this.$errorHandling.isNoToken(error);
      }
      this.refreshUser();
    },
    async unfollowUser() {
      if (!this.checkb4FoUnfo()) return;
      try {
        await this.$backendAPI.unfollow({ id: this.id });
        this.$toast.success({ duration: 1000, message: "取消关注" });
        this.followed = false;
      } catch (error) {
        this.$toast.fail({ duration: 1000, message: "取消关注失败" });
      }
      this.refreshUser();
    },
    setAvatarImage(hash) {
      if (hash) this.avatar = this.$backendAPI.getAvatarImage(hash);
    }
  }
};
</script>

<style lang="less" scoped src="./index.less"></style>
