<template>
  <div class="Editor">
    <mavon-editor v-model="markdownvalue" ref=md @imgAdd="$imgAdd"/>
  </div>
</template>

<script>
// 看起來沒必要拉一個這個 vue 出來
// 總之東西先搬進這裡，之後等編輯頁面設計好之後再搬
export default {
  name: 'Editor',
  data() {
    return { markdownvalue: 'markdown编辑器' };
  },
  methods: {
    $imgAdd(pos, file) {
      // 在这里上传图片
    },
  },
  created() {
    // window.mavonvue = this;
  },
};
</script>

<style scoped>
.Editor {
        margin: auto;
        width: 80%;
        height: 580px;
}
</style>
