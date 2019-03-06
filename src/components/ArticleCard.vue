<template>
  <div class="card article">
    <h2 class="title">{{article.title}}</h2>
    <p>by {{article.author}}</p>
  </div>
</template>

<script>
export default {
  name: "ArticleCard",
  props: ["article"]
};
</script>
