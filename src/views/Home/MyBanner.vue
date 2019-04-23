<template>
  <div class="my-banner">
    <template v-if="isLogined">
      <div class="banner-text">
         <img :src="avatar" @error="() => { this.avatar = require('../../assets/logo.png'); }" class="round_icon">
         <div>
            <p class="username">{{displayName}}</p>
            <p class="my-balance">
              {{displayBalance}}
              <span class="coin-symbol">EOS</span>
            </p>
         </div>
      </div>
      <a class="my-user-page" href="javascript:;" @click="toUserPage(currentUserInfo.name)">我的主页</a>
    </template>
    <template v-else>
      <div>
        <p class="login-notification">即刻登录</p>
        <p class="login-notification">开始智能签名之旅 </p>
      </div>
      <a class="my-user-page" href="javascript:;" @click="loginWithWallet">立即登录</a>
    </template>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import {
  getUser,
  oldgetUser,
  getAssets,
  getAvatarImage,
} from '@/api';

export default {
  name: 'My-Banner',
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
    }),
    ...mapGetters(['currentUserInfo', 'isLogined']),
    displayBalance() {
      return this.currentUserInfo.balance.slice(0, -4);
    },
    displayName() {
      const { currentUserInfo, nickname } = this;
      return nickname !== '' ? nickname
        : currentUserInfo.name.length <= 12 ? currentUserInfo.name
          : currentUserInfo.name.slice(0, 12);
    },
    displayTokenSymbol() {
      return this.currentUserInfo.balance.slice(-4);
    },
  },
  data() {
    return {
      avatar: require('../../assets/logo.png'),
      nickname: '',
    };
  },
  created() {
    const { isLogined, refresh_user } = this;
    if (isLogined) { refresh_user(); }
  },
  methods: {
    ...mapActions('scatter', [
      'connect',
      'login',
    ]),
    connectScatterAsync() { return this.connect(); },
    loginScatterAsync() { return this.login(); },
    toUserPage(username) {
      this.$router.push({ name: 'User', params: { username } });
    },
    async loginWithWallet() {
      if (!this.isScatterConnected) {
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
        return;
      }
      try {
        // await this.connectScatterAsync();
        await this.loginScatterAsync();
      } catch (e) {
        console.warn('Unable to connect wallets');
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
      }
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async getAvatarImage(hash) {
      // 空hash 显示默认Logo头像
      // eslint-disable-next-line global-require
      if (!hash) this.avatar = require('../../assets/logo.png');
      else this.avatar = getAvatarImage(hash);
    },
    refresh_user() {
      const { name: username } = this.currentUserInfo;
      console.log(username);
      getUser({ username }).then((response) => {
        const { data } = response;
        console.log(data);
        this.nickname = data.nickname;
        this.getAvatarImage(data.avatar);
      });
    },
  },
  mounted() {
  },
  watch: {
    isLogined() {
      if (this.isLogined) {
        this.refresh_user();
      }
    },
  },
};
</script>

<style lang="less" scoped>
.my-banner {
  margin: 0 auto;
  max-width: 335px;
  padding: 22px 16px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 0 10px 0px rgba(0,0,0, 0.1);
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}
.banner-text {
  display: flex;
  align-items: center;
  .round_icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  .username {
    font-size: 14px;
    font-weight: bold;
    font-family:PingFangSC-Regular;
    color:rgba(0,0,0,1);
    letter-spacing:1px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin-left: 8px;
  }

  .my-balance {
    font-size: 14px;
    font-family: PingFang SC, STHeitiSC-Light, Helvetica-Light, arial, sans-serif;
    font-weight: 600;
    color: rgba(0, 0, 0, 1);
    line-height: 22px;
    letter-spacing: 1px;
    margin-left: 8px;
  }
}

.my-user-page {
    background-color: #000;
    color: #fff;
    padding: 8px 20px;
    border-radius: 3px;
    font-size: 14px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    letter-spacing:1px;
    min-width: 100px;
}

.login-notification {
  font-size: 14px;
  font-family: PingFang SC, STHeitiSC-Light, Helvetica-Light, arial, sans-serif;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  text-align: left;
}
</style>
