<template>
  <div class="card asset">
    <a>
      <Row justify="center" >
        <i-col span="18">
           <h2 class="asset-quantity"
             :style='{ color: `${assetColor}` }'>{{assetAmount}} EOS</h2>
           <p class="asset-information">{{friendlyDate}}</p>
         </i-col>
         <!-- <i-col span="6" class="detailright"> -->
           <!-- {{(asset.article.title).length > 11 ? (asset.article.title).slice(0,11)+'...' : asset.article.title}} -->
           <!--<ArticleCard :article="asset.article" />-->
         <!-- </i-col> -->
      </Row>
    </a>
  </div>
</template>

<script>
import moment from 'moment';
// import { ArticleCard } from '@/components/';

export default {
  name: 'AssetCard',
  props: ['asset'],
  // components: { ArticleCard },
  computed: {
    friendlyDate() {
      const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.asset.create_time);
      return moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1))
        .fromNow();
    },
    assetAmount() {
      return this.asset.amount > 0 ? `+${this.asset.amount / 10000}` : this.asset.amount / 10000;
    },
    assetColor() {
      // eslint-disable-next-line no-nested-ternary
      return this.asset.amount > 0 ? '#f50' : (this.asset.amount < 0 ? '#87d068' : '#a7aab7');
    },
  },
  created() {
    console.log(this.asset);
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
.detailright{
  margin-top: -10px;
  width: 60px;
  height: 62px;
  float: right;
  background-color: #ecebeb;
  color: #777777;
  font-size: 11px;
  font-weight: normal;
  padding: 4px;
  margin-bottom: -10px;
}
</style>
