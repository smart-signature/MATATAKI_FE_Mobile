<template>
  <div class="card user">
      <h1>{{username}} 的文章</h1>
      <div class="income" v-if="playerincome">
        <h1>签名收入：{{playerincome.sign_income/1000}} EOS</h1>
        <h1>分享收入：{{playerincome.share_income/1000}} EOS</h1>
      </div>
      
      <h2 class="is-me" v-if="username === currentUsername">是你的用户页</h2>
      <za-button block theme="primary" @click="$router.go(-1)">Go Back</za-button>
      <br/>
      <za-button block theme="primary" @click="withdraw">Withdraw</za-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import API from '../api/scatter.js';

export default {
  name: 'User',
  props: ['username'],
  data() {
    return {
      playerincome: null
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
  },
  methods: {
    withdraw() {
      API.withdraw();
    },
    async getPlayerIncome() {
      return API.getPlayerIncome(this.username);
    },
    // ...mapActions(["loginScatterAsync"]),
    // loginWithWallet() {
    //   this.loginScatterAsync();
    // }
  },
  async created() {
    const playerincome = await this.getPlayerIncome();
    this.playerincome = playerincome[0];
  },
};
</script>
