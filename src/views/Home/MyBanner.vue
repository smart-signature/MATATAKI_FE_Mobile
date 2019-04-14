<template>
  <div class="my-banner">
    <div class="my-stat">
      <div class="logined" v-if="isLogined">
        <img :src="avatar" class="round_icon">
        <Button class="my-user-page" ghost type="text" @click="toUserPage(currentUsername)">我的主页</Button>
        <p class="username">{{newname}}</p>
        <p class="my-balance">
          {{eosBalance}}
          <span class="coin-symbol">EOS</span>
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
  Follow,
  Unfollow,
  getUser,
  oldgetUser,
  setUserName,
  getAssets,
  getAvatarImage,
} from '@/api';

export default {
  name: 'My-Banner',
  computed: {
    ...mapState(['scatterAccount', 'balances', 'isScatterConnected']),
    ...mapGetters(['currentUsername']),
    eosBalance() {
      return this.balances.eos.slice(0, -4);
    },
    isLogined() {
      return this.scatterAccount !== null;
    },
  },
  data() {
    return {
      avatar: require('../../assets/logo.png'),
      newname: '',
    };
  },
  created() {},
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
      'logoutScatterAsync',
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
      const username = this.currentUsername;
      console.log(username);
      getUser({ username }).then((response) => {
        const { data } = response;
        console.log(data);
        this.newname = data.nickname === '' ? username : data.nickname;
        this.getAvatarImage(data.avatar);
      });
    },
  },
  mounted() {
    if (this.currentUsername) {
      this.refresh_user();
    }
  },
  watch: {
    currentUsername() {
      if (this.currentUsername) {
        this.refresh_user();
      }
    },
  },
};
</script>

<style scoped>
.my-banner {
  margin: auto;
  margin-top: -32px;
  text-align: center;
  max-width: 335px;
  max-height: 76px;
  /* margin: -32px 20px 0 20px; */
  padding: 8px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 5px 5px 0px rgba(213, 213, 213, 0.5);
  border-radius: 4px;
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

  width: 38px;
  height: 38px;
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
  margin-left: 12px;
  font-size: 12px;
  font-weight: bold;
}
.my-balance {
  margin-left: 12px;
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
