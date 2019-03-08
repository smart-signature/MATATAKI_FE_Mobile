<template>
  <mavon-editor v-model="markdownvalue" ref=md @imgAdd="$imgAdd"></mavon-editor>
</template>

<script>
// 看起來沒必要拉一個這個 vue 出來
// 總之東西先搬進這裡，之後等編輯頁面設計好之後再搬
export default {
  name: 'mavonEditor'
  data:{
    markdownvalue: "markdown编辑器",
  },
  methods: {
    $imgAdd: function (pos, file) {
      //在这里上传图片
    },
  },
  created(){
    // window.mavonvue = this;
  },
};
</script>

<style scoped>

</style>
