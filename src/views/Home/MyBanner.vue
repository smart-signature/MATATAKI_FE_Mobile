<template>
  <div class="my-banner">
    <template v-if="isLogined">
      <div class="banner-text">
        <div class="round_icon">
           <img :src="avatar" @error="() => { this.avatar = require('../../assets/logo.png'); }">
        </div>
         <div>
            <p class="username">{{displayName}}</p>
            <p class="my-balance">
              {{displayBalance}}
              <span class="coin-symbol">{{displayBalanceSymbol}}</span>
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
      <a class="my-user-page" href="javascript:;" @click="modal1 = true">立即登录</a>
    </template>
    <Modal v-model="modal1"
      title="选择登录钱包类型"
      @on-ok="ok"
      @on-cancel="cancel">
      <RadioGroup v-model="userConfig.blockchin">
        <Radio label="EOS">
          <img class="amount-img" src="@/assets/img/icon_amount.png" />
          <span>EOS</span>
        </Radio>
        <Radio label="ONT">
          <span>ONT</span>
        </Radio>
      </RadioGroup>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import {
  getUser,
  getAssets,
  getAvatarImage,
} from '@/api';

export default {
  name: 'My-Banner',
  computed: {
    ...mapGetters(['currentUserInfo', 'isLogined']),
    displayBalance() {
      return this.currentUserInfo.balance.slice(0, -4);
    },
    displayBalanceSymbol() {
      return this.currentUserInfo.balance.slice(-4);
    },
    displayName() {
      const { currentUserInfo, nickname } = this;
      const { name } = currentUserInfo;
      return nickname || (name.length <= 12 ? name : name.slice(0, 12));
    },
    displayTokenSymbol() {
      return this.currentUserInfo.balance.slice(-4);
    },
  },
  data() {
    return {
      modal1: false,
      userConfig: {
        blockchin: 'EOS',
      },
      avatar: require('../../assets/logo.png'),
      nickname: '',
    };
  },
  created() {
    const { isLogined, refresh_user } = this;
    if (isLogined) { refresh_user(); }
  },
  methods: {
    ...mapActions(['idCheckandgetAuth']),
    toUserPage(username) {
      this.$router.push({ name: 'User', params: { username } });
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
    async refresh_user() {
      const { name: username } = this.currentUserInfo;
      console.log(username);
      const { data } = await getUser({ username });
      console.log(data);
      this.nickname = data.nickname;
      this.getAvatarImage(data.avatar);
    },
    async ok() {
      this.modal1 = false;
      const { blockchin } = this.userConfig;
      const usingBlockchain = {
        EOS: blockchin === 'EOS',
        ONT: blockchin === 'ONT',
      };
      await this.idCheckandgetAuth(usingBlockchain);
      await this.refresh_user();
    },
    cancel() {
      this.modal1 = false;
      this.$Modal.remove();
    },
    // login() {
    //   this.modal1 = true;
    //   this.idCheckandgetAuth() && this.refresh_user();
    // },
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
  overflow: hidden;
  flex: 1;
  margin-right: 10px;
  .round_icon {
    flex: 0 0 50px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
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
