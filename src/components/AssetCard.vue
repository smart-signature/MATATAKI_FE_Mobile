<template>
  <div class="card asset">
    <a>
      <h2 class="asset-quantity">+{{asset.quantity}}</h2>
      <p class="asset-infomation">{{friendlyDate}}</p>
    </a>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssetCard',
  props: ['asset'],
  computed: {
    friendlyDate() {
      return moment(this.asset.timestamp).fromNow();
    },
  },
};
</script>

<style scoped>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
h2.asset-quantity {
  font-size: 18px;
  font-weight: 600;
  color: #478970;
  /* line-height: 25px; */
}
.asset-infomation {
  color: rgb(105,105,105);
}
</style>
