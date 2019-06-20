<template>
  <van-popup v-model="sidebarShow" position="left" class="sidebar">
    <div class="container">
      <div class="account">
        <div class="avatar-container">
          <img :src="account.avatar" alt="avatar" class="avatar">
          <img src="@/assets/newimg/setting.svg" alt="setting" class="setting">
        </div>
        <p class="account-name">{{account.name}}</p>
        <p class="wallet-info">EOS钱包余额：{{account.balance}}</p>
      </div>
      <div class="follow-info">
        <div class="follow">
          <p>864</p>
          <p>关注</p>
        </div>
        <div class="fans">
          <p>121</p>
          <p>粉丝</p>
        </div>
      </div>
      <div class="cell-container">
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/shouye-zhanghu.svg" alt="home" class="left-img">
            <span class="left-text">我的账户</span>
          </div>
          <div class="cell-right"><span>已绑定2个账户</span></div>
        </div>
      </div>
      <div class="cell-container">
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/yuanchuang.svg" alt="article" class="left-img">
            <span class="left-text">原创文章</span>
          </div>
          <div class="cell-right"><span>100篇</span></div>
        </div>
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/zanshang.svg" alt="article" class="left-img">
            <span class="left-text">赞赏文章</span>
          </div>
          <div class="cell-right"><span>1篇</span></div>
        </div>
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/caogaoxiang.svg" alt="article" class="left-img">
            <span class="left-text">草稿箱</span>
          </div>
          <div class="cell-right"><span>1篇</span></div>
        </div>
      </div>
      <div class="cell-container">
        <div class="cell active">
          <div class="cell-left">
            <img src="@/assets/newimg/goumaijilu.svg" alt="article" class="left-img">
            <span class="left-text">购买记录</span>
          </div>
          <div class="cell-right"><span></span></div>
        </div>
      </div>
      <div class="cell-container">
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/gonglue.svg" alt="article" class="left-img">
            <span class="left-text">投资攻略</span>
          </div>
          <div class="cell-right"><span></span></div>
        </div>
        <div class="cell">
          <div class="cell-left">
            <img src="@/assets/newimg/telegram.svg" alt="article" class="left-img">
            <span class="left-text">加入电报</span>
          </div>
          <div class="cell-right"><span></span></div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'Sidebar',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      sidebarShow: false,
      account: {
        avatar: 'https://www.rollingstone.com/wp-content/uploads/2018/06/rs-196217-169526716.jpg',
        name: 'Penny',
        balance: 1,
      },
      followed: false,
      follows: 0,
      fans: 0,
      name: '',
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
  watch: {
    value(val) {
      this.sidebarShow = val;
    },
    sidebarShow(val) {
      this.$emit('input', val);
    },
  },
  methods: {
    async refreshUser() {
      const { isMe, id } = this;
      const setUser = ({
        avatar, email, fans, follows, is_follow, nickname, introduction, username, accounts, articles, supports, drafts,
      }) => {
        this.email = email;
        this.fans = fans;
        this.follows = follows;
        this.introduction = introduction;
        this.followed = is_follow;
        this.name = nickname || username;
        this.setAvatarImage(avatar);
        this.stats = {
          accounts, articles, supports, drafts,
        };
      };

      const { getMyUserData, getUser } = this.$backendAPI;
      const { data: { data } } = await (isMe(id) ? getMyUserData() : getUser({ id }));
      // console.debug(data);
      setUser(data);
    },
  },
  computed: {
    ...mapGetters(['currentUserInfo', 'displayName', 'isLogined', 'isMe']),
  },
  created() {
    this.refreshUser();
  },
};
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  width: 75%;
  max-width: 280px;
  background-color: #F1F1F1;
  color: #000000;
  .container {
    .account {
      padding: 20px;
      .avatar-container {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .avatar {
        border-radius: 50%;
        width: 60px;
        height: 60px;
        background-color: #ffffff;
      }
      .setting {
        width: 20px;
      }
      .account-name {
        font-size: 20px;
        color: #000000;
        font-weight: 700;
        line-height: 28px;
        margin-bottom: 5px;
        text-align: left;
      }
      .wallet-info {
        font-size: 14px;
        line-height: 20px;
        text-align: left;
      }
    }
    .follow-info {
      width: 100%;
      background-color: #ffffff;
      padding: 10px;
      box-sizing: border-box;
      .follow, .fans {
        display: inline-block;
        width: 50%;
        color: #000000;
        text-align: center;
        p:first-of-type {
          font-size: 20px;
          line-height: 28px;
          font-weight: 700;
        }
        p:last-of-type {
          font-size: 12px;
          line-height: 17px;
        }
      }
    }
  }
  .cell-container {
    margin-top: 10px;
  }
  .cell {
    &:hover {
      background-color: #cccccc;
    }
    background-color: #ffffff;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .cell-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .left-img {
        margin-right: 10px;
      }
      .left-text {
        color: #000000;
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
      }
    }
    .cell-right {
      span {
        color: #B2B2B2;
        font-size: 12px;
        line-height: 17px;
      }
    }
  }
  .cell.active {
    .left-text {
      color: #1C9CFE;
    }
  }
}
</style>
