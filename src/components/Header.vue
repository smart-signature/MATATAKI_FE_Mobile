<template>
  <div class="my-Header">
    <za-nav-bar>
      <div slot="left">
        <router-link tag="my-Header" :to="{ name: 'home' }">
          <Icon type="ios-home" :size="24" />
        </router-link>
      </div>
      <div slot="title">
        <router-link tag="my-Header" :to="{ name: 'home' }">
          {{pageinfo.title}}
        </router-link>
      </div>
      <div slot="right">
        <router-link tag="my-Header" :to="{ name: pageinfo.rightPage }">
          <Icon type="ios-share-alt" :size="24" />
        </router-link>
      </div>
    </za-nav-bar>
</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'my-Header',
  props: ['pageinfo'],
  computed: {
    ...mapState(['isScatterConnected']),
  },
  // 依據 https://blog.csdn.net/m0_37728716/article/details/81289317
  // 從 crearted 改成 mounted
  // 這極有可能是這幾天錢包登陸老是有問題的原因
  // 依據 https://github.com/vuejs/vue/issues/7333
  mounted() {
    try {
      if (this.isScatterConnected) this.loginScatterAsync();
    } catch (error) {
      console.error('login faild');
      this.$Modal.error({
        title: '无法与你的钱包建立链接',
        content: '请检查钱包是否打开并解锁',
      });
    }
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
  },
};
</script>

<style scoped>

</style>
