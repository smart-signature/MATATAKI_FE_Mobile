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
    const { code, from } = this.$route.query;
    const clientID = '889e6eafa77e2e87a08c';
    const scope = 'read:public_repo,read:user'
    const redirectUri = `http://localhost:8080/login/github/?from=${from}`; // 範例值
    if (!code) {
      // 跳轉
      window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&scope=${scope}`;
    } else {
      this.setUserConfig({ idProvider: 'GitHub' });
      this.idCheckandgetAuth({ code }).catch(() => {})
      .then(() => {
        // console.debug(from);
        this.$router.push(from);
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
