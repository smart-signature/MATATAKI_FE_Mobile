<template>
  <div class="card user">
    <div class="not-login-yet" v-if="!ifLogined">你还没有登录
      <za-button>使用钱包登录</za-button>
    </div>
    <div class="is-logined" v-else>
      <h1>欢迎回来 {{currentUsername}}</h1>
      <za-button block theme="primary" @click="$router.go(-1)">Go Back</za-button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'User',
  computed: {
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
  },
  methods: {
    ...mapActions(['loginScatterAsync']),
    loginWithWallet() {
      this.loginScatterAsync();
    },
  },
};
</script>
