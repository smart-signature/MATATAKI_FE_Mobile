<template>
  <div id="app">
    <navigation v-if="isRouterAlive" >
      <router-view />
    </navigation>
    <BackTop :bottom="80"></BackTop>
  </div>
</template>

<script>
import Konami from 'konami';
import { mapActions, mapMutations } from 'vuex';
import { version } from '../package.json';
import { accessTokenAPI } from '@/api';
import { sleep } from '@/common/methods';

export default {
  data() {
    return {
      isRouterAlive: true,
    };
  },
  provide() {
    return {
      reload: this.reload,
    };
  },
  methods: {
    ...mapActions(['signIn']),
    updateNotify(desc) {
      const btnCommonStyle = {
        type: 'default',
        size: 'large',
        style: 'margin: 0px 5px;',
      };
      this.$Message.info({
        render: h => h('span', [
          desc,
          h('Button', {
            attrs: {
              // icon: 'ios-refresh',
              ...btnCommonStyle,
            },
            on: {
              click: () => window.location.reload(),
            },
          }, '立即刷新'),
        ]),
        duration: 0,
      });
    },
    triggerEasterEgg() {
      // 当用户在键盘输入 ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA 时触发这个函数
      this.$Message.info('恭喜你找到了隐藏彩蛋！');
      this.$router.push({ name: 'EasterEgg' });
    },
    async reload() {
      this.isRouterAlive = false;
      await this.$nextTick();
      await sleep(300);
      this.isRouterAlive = true;
    },
  },
  created() { // https://juejin.im/post/5bfa4bb951882558ae3c171e
    console.info('Smart Signature version :', version);

    const { signIn, updateNotify } = this;
    // 根据本地存储的状态来自动登陆。失败之后再重试一次
    const data = {
      accessToken: accessTokenAPI.get(),
      idProvider: localStorage.getItem('idProvider'),
    };
    if (data.idProvider && data.accessToken) signIn(data).catch(() => signIn(data));

    window.updateNotify = updateNotify;
  },
  mounted() {
    // eslint-disable-next-line no-unused-vars
    const easterEgg = new Konami(() => { this.triggerEasterEgg(); });
  },
};
</script>

<style scoped>
#app {
  text-align: center;
  margin: auto;
  height: 100%;
}
</style>
