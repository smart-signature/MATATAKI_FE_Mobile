<template>
  <div class="my-banner">
    <div class="my-stat">
      <div class="logined" v-if="isLogined">
        <img :src="avatar" class="round_icon">
        <Button class="my-user-page"
          ghost type="text" @click="toUserPage(currentUserInfo.name)">我的主页</Button>
        <p class="username">{{displayName}}</p>
        <p class="my-balance">
          {{displayBalance}}
          <span class="coin-symbol">{{displayTokenSymbol}}</span>
        </p>
      </div>
      <div class="not-login-yet" v-else>
        <Row>
          <Col span="14">
            <p class="login-notification">
              即刻登录，
              <br>开始智能签名之旅
            </p>
          </Col>
          <Col span="10">
            <Button
              class="login-btn"
              ghost
              type="text"
              @click="loginWithWallet"
              style="float: right"
            >立即登录</Button>
          </Col>
        </Row>
      </div>
    </div>
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
    ...mapState(['isScatterConnected']),
    ...mapGetters(['currentUserInfo', 'isLogined']),
    displayBalance() {
      return this.currentUserInfo.balance.slice(0, -4);
    },
    displayName() {
      const { currentUserInfo, nickname } = this;
        return nickname !== '' ? nickname 
          : ( currentUserInfo.name.length <= 12 ) ? currentUserInfo.name
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
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
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
        // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
        await this.suggestNetworkAsync();
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
      if (!hash) return this.avatar = require('../../assets/logo.png');
      await getAvatarImage(hash)
        .then((response) => {
          this.avatar = `data:image/png;base64,${btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )}`;
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
          this.avatar = require('../../assets/logo.png');
        });
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

<style scoped>
.my-banner {
  margin: 0 auto;
  text-align: center;
  max-width: 335px;
  padding: 8px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 0 10px 0px rgba(0,0,0, 0.1);
  border-radius: 3px;
}

.my-stat {
  text-align: left;
  /* float: left; */
  margin-left: 12px;
  margin-top: 16px;
  margin-bottom: 19px;
}
.round_icon {
  float: left;

  width: 46px;
  height: 46px;
  display: flex;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
button.my-user-page {
  background-color: #000;
  float: right;
  margin-right: 18px;
}
.coin-symbol {
  color: #999999;
}
.username {
  margin-left: 54px;
  font-size: 14px;
  font-weight: bold;
  font-family:PingFangSC-Regular;
  color:rgba(0,0,0,1);
  letter-spacing:1px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.my-balance {
  margin-left: 54px;
  font-size: 16px;
  font-family: PingFang SC, STHeitiSC-Light, Helvetica-Light, arial, sans-serif;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  line-height: 22px;
  letter-spacing: 1px;
}

.login-notification {
  font-size: 14px;
  font-weight: bold;
  /* line-height:10px; */
  color: rgba(39, 39, 39, 1);
}
.login-btn,
.login-btn:focus,
.login-btn:hover {
  color: #fff;
  background-color: #000;
  border-radius: 2px;
  font-size: 16px;
  letter-spacing: 2px;
}
</style>
