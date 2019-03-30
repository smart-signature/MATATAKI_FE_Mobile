<template>
    <div class="WangEditor" >
        <div ref="editor" style="text-align:left"></div>
        <button v-on:click="getContent">查看内容</button>
    </div>
</template>

<script>
import E from 'wangeditor';

export default {
  name: 'WangEditor',
  data() {
    return {
      editorContent: '',
    };
  },
  methods: {
    getContent() {
      // eslint-disable-next-line no-alert
      alert(this.editorContent); // 暂时没替换这个alert 因为未使用 并且频闭掉eslint
    },
  },
  mounted() {
    const editor = new E(this.$refs.editor);
    editor.customConfig.onchange = (html) => {
      this.editorContent = html;
    };
    editor.create();
  },
};
</script>

<style scoped>
.WangEditor {
        margin: auto;
        width: 100%;
        height: 580px;
}
</style>
