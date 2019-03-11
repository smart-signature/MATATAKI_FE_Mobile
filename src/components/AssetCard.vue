<template>
  <div class="card article">
      <a :href="這裡要一個跳轉到這筆的詳細資料？">
      <h2 class="title">3.2333 EOS // 應該要有單位我想</h2>
      <p class="asset-infomation">{{friendlyDate}}</p>
    </a>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssetCard',
  props: ['article'],
  computed: {
    friendlyDate() {
      return moment(this.article.time).fromNow();
    },
  },
};
</script>

<style scoped>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
h2.title {
  font-size: 18px;
  font-weight: 600;
  color: rgb(35, 241, 0);
  /* line-height: 25px; */
}
.article-infomation {
  color: rgb(105,105,105);
}
</style>
