/* eslint-disable */
<template>
  <div class="login">

  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'Login Page',
  computed: {
  },
  created() {
    const { protocol, host } = window.location;
    const clientID = '7e015d8ce32370079895'; // 範例值
    const clientSecret = '2b976af0e6b6ceea2b1554aa31d1fe94ea692cd9';
    const redirectUri = 'http://localhost:8080/oauth/redirect'; // 範例值

    const { code } = this.$route.query;
    if (!code) {
      // 跳轉
      window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}`;
    } else {
      this.setUserConfig({ idProvider: 'GitHub' });
      this.idCheckandgetAuth({ code }).then(() => {
        this.$route.push('home');
      });
    }
  },
  methods: {
    ...mapActions(['idCheckandgetAuth']),
    ...mapMutations(['setUserConfig']),
  },
};
</script>

<style scoped>
</style>
