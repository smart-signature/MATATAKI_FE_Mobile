<template>
  <div id="app">
    <!-- 缓存组件 回到上一页 -->
    <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
    <!-- 缓存组件 回到上一页 end -->
    <BackTop :bottom="80"></BackTop>
  </div>
</template>

<script>
import Konami from 'konami';
import { mapActions } from 'vuex';
import { version } from '../package.json';
// import { getSign } from '@/api/signatureOntology';

export default {
  data: () => ({}),
  methods: {
    ...mapActions(['walletConnectionSetup']),
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
  },
  mounted() {
    const easterEgg = new Konami(() => { this.triggerEasterEgg(); });
  },
  computed: {
  },
  created() { // https://juejin.im/post/5bfa4bb951882558ae3c171e
    console.info('Smart Signature version :', version);

    const { updateNotify, walletConnectionSetup } = this;

    window.updateNotify = updateNotify;

    const usingBlockchain = { EOS: true, ONT: true };
    // walletConnectionSetup(usingBlockchain).then((meg) => {
    //   if (meg !== '') this.$Message.success(`${meg}登录成功！`);
    // });
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
