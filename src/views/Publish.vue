<template>
  <div class="new-post">
    <za-nav-bar>
        <div slot="left"><za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon></div>
        <div slot="title">发布文章</div>
        <div slot="right"><Button type="text" size="large" @click="sendThePost">确认发布</Button></div>
    </za-nav-bar>
    <Input v-model="title" placeholder="标题" size="large" clearable  />
    <Input v-model="author" placeholder="署名" clearable />
    <mavon-editor v-model="markdownData" @imgAdd="uploadImage"
    placeholder="左边输入 Markdown 格式的文字开始编辑，右边即时预览" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { sendPost } from '@/api/ipfs';
import API from '@/api/scatter.js';
import { publishOnChain } from '@/api/signature';
import { publishArticle } from '@/api/backend';
import { mavonEditor } from 'mavon-editor';
// MarkdownIt 实例
const mdit = mavonEditor.getMarkdownIt();

export default {
  name: 'New-Post',
  components: {
    'mavon-editor': mavonEditor,
  },
  data: () => ({
    title: '',
    author: '',
    markdownData: '',
  }),
  computed: {
    ...mapGetters(['currentUsername']),
    compiledMarkdown() {
      return mdit.render(this.markdownData);
    },
  },
  methods: {
    async sendThePost() {
      const {
        title, author, markdownData, currentUsername,
      } = this;
      try {
        const { data } = await sendPost({
          title, author, content: markdownData, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code === 200) {
          alert('發布到鏈上... (這裡需要进度条)');
          console.log('Push action to signature.bp...');
          const { transaction_id } = await publishOnChain({ hash });
          const data = await publishArticle({
            hash, title, author, transactionId: transaction_id, accountName: currentUsername,
          });
          this.$Notice.success({
            title: '发送成功',
            desc: '3秒后跳转到你发表的文章',
          });
          const signature = API.getArbitrarySignatureAsync({ publicKey: API.getPublicKey(), data: hash });
          const jumpToArticle = () => this.$router.push({ name: 'Article', params: { hash } });
          setTimeout(jumpToArticle, 3 * 1000);
        } else {
          this.$Notice.error({
            title: '发送失败',
          });
        }
      } catch (error) {
        console.error(error);
        this.$Notice.error({
          title: '发送失败',
        });
      }
    },
    uploadImage(filename, imgfile) {
      console.info(filename);
      console.info(imgfile);
    },
    test() {
      publishOnChain({ hash: 'QmfJsZmbsFcaNEBejP6HcXQEXycVXKfFwbMM3eju4VdsN3' });
      // transferEOS({amount: 0, memo: '', });
    },

  },
};
</script>

<style scoped>
.new-post {
    max-width: 90%;
    margin: 0 auto;
}
textarea, #editor div {
  display: inline-block;
  width: 49%;
  height: 100%;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}

.ivu-input-wrapper {
    margin-bottom: 10px;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
</style>
