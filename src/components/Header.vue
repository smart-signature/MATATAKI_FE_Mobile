<template>
  <div class="my-Header">
    <za-nav-bar>
      <div slot="left">
          <za-icon v-if="pageinfo.left==='back'"
            theme="primary" type="arrow-left" @click="goBack"/>
          <router-link v-else :to="{ name: 'home' }">
            <Icon type="ios-home" :size="24" />
          </router-link>
      </div>
      <div slot="title">
        <!--<router-link tag="my-Header" :to="{ name: 'home' }">-->
          {{pageinfo.title}}
        <!--</router-link>-->
      </div>
      <div slot="right">
        <router-link :to="{ name: pageinfo.rightPage }">
          <!--<Icon type="ios-share-alt" :size="24" />-->
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
    if (this.isScatterConnected) this.loginScatterAsync();
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    goBack() {
      this.$router.go(-1);
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
</style>
