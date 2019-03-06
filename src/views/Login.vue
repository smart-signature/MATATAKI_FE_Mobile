<template>
  <div class="about">
    <h1>This is a page</h1>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Login Page',
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
  },
  async created() {
    try {
      await this.connectScatterAsync();
      // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
      const suggestNetworkResult = await this.suggestNetworkAsync();
      console.info(suggestNetworkResult);
      await this.loginScatterAsync();
    } catch (e) {
      console.warn('Unable to connect wallets');
    }
  },
};
</script>
