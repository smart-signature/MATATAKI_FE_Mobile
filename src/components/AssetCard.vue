<template>
  <div class="card asset">
    <a>
      <h2 class="asset-quantity"
        :style='{ color: `${assetColor}` }'>
        {{(asset.quantity.substring(0,1) !== '-' ? '+': '') + asset.quantity}}</h2>
      <p class="asset-information">{{friendlyDate}}</p>
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
      const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.asset.timestamp);
      return moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1))
        .fromNow();
      // moment(this.asset.timestamp).fromNow();
    },
    assetColor() {
      const asset = this.asset.quantity.replace(' EOS', '');
      // eslint-disable-next-line no-nested-ternary
      return asset > 0 ? '#f50' : (asset < 0 ? '#87d068' : '#a7aab7');
    },
  },
  created() {
    // console.log(this.asset.quantity);
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
.asset-information {
  color: rgb(105,105,105);
}
</style>
