<template>
  <div class="my-Header">      
    <za-nav-bar>
      <div slot="left"><Icon type="ios-home" :size="24" @click="goHome" /></div>
      <div slot="title" @click="goHome">{{pageinfo.title}}</div>
      <div slot="right"><Icon type="ios-share-alt" :size="24" @click="" /></div>
    </za-nav-bar>
</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
  name: 'my-Header',
  props: ['pageinfo'],
  computed: {
  },
  created() {
    try {
      this.loginScatterAsync();
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
    goHome() {
      this.$router.push({ name: 'home' });
    },

  },
};
</script>

<style scoped>

</style>
