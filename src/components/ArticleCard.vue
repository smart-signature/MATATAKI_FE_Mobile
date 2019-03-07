<template>
  <div class="card article">
    <a :href="article.articleUrl">
      <h2 class="title">{{article.title}}</h2>
      <p class="article-infomation">{{friendlyDate}} by {{article.author}}</p>
    </a>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ArticleCard',
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
  color: rgb(76,76,76);
  /* line-height: 25px; */
}
.article-infomation {
  color: rgb(105,105,105);
}
</style>
