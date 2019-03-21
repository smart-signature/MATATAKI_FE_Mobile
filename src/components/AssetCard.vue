<template>
  <div class="card asset">
    <a>
      <h2 class="asset-quantity"
        :style='asset.quantity.replace(" EOS","") > 0 ? { color: "#f50" } : { color: "#87d068" } '>
        {{(asset.quantity.substring(0,1) !== '-' ? '+': '') + asset.quantity}}</h2>
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
      let time = new Date(this.asset.timestamp)
      return moment(time.getTime()+time.getTimezoneOffset()*60000).fromNow();//moment(this.asset.timestamp).fromNow();
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
.asset-infomation {
  color: rgb(105,105,105);
}
</style>
