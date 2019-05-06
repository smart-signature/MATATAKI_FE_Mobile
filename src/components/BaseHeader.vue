<template>
  <div class="BaseHeader">
    <za-nav-bar>
      <div slot="left">
        <img src="@/assets/back.svg" alt="home" @click="goBack" class="back-icon">
        <router-link :to="{ name: 'home' }">
          <img src="@/assets/home.svg" alt="home" class="home-icon">
        </router-link>
          <!--<za-icon v-if="pageinfo.left==='back'"
            theme="primary" type="arrow-left" @click="goBack"/>
          <router-link v-else :to="{ name: 'home' }">
            <Icon type="ios-home" :size="24" />
          </router-link>-->
      </div>
      <div slot="title" style="font-size: 16px;">
        <!--<router-link tag="my-Header" :to="{ name: 'home' }">-->
          {{pageinfo.title}}
        <!--</router-link>-->
      </div>
      <div class="right-slot" slot="right">
        <slot name='info'></slot>
        <slot name="right"></slot>
        <!--<router-link :to="{ name: pageinfo.rightPage }">
          &lt;!&ndash;<Icon type="ios-share-alt" :size="24" />&ndash;&gt;
        </router-link>-->
      </div>
    </za-nav-bar>
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
  props: ['pageinfo'],
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
  },
  watch: {
    isLogined(newState) {
      if (newState) this.$Message.success('自动登录成功');
    },
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
    },
  },
};
</script>

<style scoped>
a:link {
  color: black;
}
a:visited {
  color: black;
}
a:hover a:active {
  color: black;
}
a:active {
  color: black;
}
.back-icon {
  width: 16px;
}
.home-icon {
  width: 22px;
  margin-left: 14px;
}
.BaseHeader {
  border-bottom: 1px solid #eaeaea;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}
.right-slot{
  display: flex;
  align-items: center;
}
</style>
