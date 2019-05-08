<template>
  <div class="header" :class="isCenter && 'mw'">
    <div class="header-left" slot="left">
      <img src="@/assets/img/icon_back.svg" alt="home" @click="goBack" class="back-icon">
      <img src="@/assets/img/icon_home.svg" alt="home" @click="goHome" class="home-icon">
    </div>
    <p slot="title" class="title"> {{pageinfo.title}} </p>
    <div class="header-right" slot="right">
      <slot name='info'></slot>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { mapState, mapActions, mapGetters } from 'vuex'; // mapGetters 未使用
import {
  getAuth,
} from '@/api';

export default {
  name: 'BaseHeader',
  props: {
    pageinfo: {
      type: Object,
    },
    isCenter: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
      isScatterLoggingIn: state => state.isLoggingIn,
    }),
  },
  // 依據 https://blog.csdn.net/m0_37728716/article/details/81289317
  // 從 crearted 改成 mounted
  // 這極有可能是這幾天錢包登陸老是有問題的原因
  // 依據 https://github.com/vuejs/vue/issues/7333
  // 已確認此 Header.vue 的 crearted 內容不會被執行
  mounted() {
    // console.log('Does this page need to log in?:', this.pageinfo.needLogin);
  },
  methods: {
    ...mapGetters(['isLogined']),
    ...mapActions('scatter', [
      'connect',
      'login',
    ]),
    loginScatterAsync() { return this.login(); },
    goBack() {
      this.$router.go(-1);
    },
    goHome() {
      this.$router.push({ name: 'home' });
    },
  },
  watch: {
    isLogined(newState) {
      if (newState) this.$Message.success('自动登录成功');
    },
    /*
    isScatterConnected(newState) {
      const { pageinfo, isScatterLoggingIn } = this;
      if (pageinfo.needLogin !== undefined && pageinfo.needLogin) {
        if (newState && !isScatterLoggingIn) {
          console.log('auto log in');
          this.loginScatterAsync()
            .then((id) => {
              this.$Message.success('自动登录成功');
            })
            .catch(() => {
              console.log('Unable to log in wallet');
              this.$Message.error('自动登录失败，钱包需打开并解锁...');
            });
        }
      }
    }, */
  },
};
</script>

<style scoped>
.header {
  background-color: transparent;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}
.header-left {
  position: absolute;
  left: 20px;
    display: flex;
  align-items: center;
}
.title {
  text-align: center;
  font-size:16px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  letter-spacing:1px;
  color: #676767;
}
.header-right{
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
}
.back-icon {
  width: 16px;
}

.home-icon {
  width: 22px;
  margin-left: 6px;
}

</style>
