<template>
  <div class="card user">
      <h1>{{username}} 的文章</h1>
      <h2 class="is-me" v-if="username === currentUsername">是你的用户页</h2>
      <za-button block theme="primary" @click="$router.go(-1)">Go Back</za-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'User',
  props: ['username'],
  computed: {
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
  },
  methods: {
    // ...mapActions(["loginScatterAsync"]),
    // loginWithWallet() {
    //   this.loginScatterAsync();
    // }
  },
  created() {
  },
};
</script>
