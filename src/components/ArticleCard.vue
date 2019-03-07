<template>
  <div class="card article">
    <a :href="article.articleUrl">
      <h2 class="title">{{article.title}}</h2>
      <p>by {{article.author}}</p>
    </a>
  </div>
</template>

<script>
export default {
  name: "ArticleCard",
  props: ["article"]
};
</script>

<style scoped>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
</style>
