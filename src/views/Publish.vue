<template>
  <div class="new-post">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon>
      </div>
      <div slot="title">发布文章</div>
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认发布</Button>
      </div>
    </za-nav-bar>
    <div class="edit-content">
      <Form label-position="left" :label-width="100">
        <FormItem label="标题">
          <Input v-model="title" placeholder="请输入你的文章标题..." size="large" clearable />
        </FormItem>
        <!-- <FormItem label="署名">
          <Input v-model="author" placeholder="写上你的大名..." clearable />
        </FormItem> -->
        <FormItem label="裂变系数">
          <Input value="2" disabled placeholder="输入文章分享裂变系数" clearable />
        </FormItem>
      </Form>
      <mavon-editor ref=md v-model="markdownData" @imgAdd="$imgAdd" :boxShadow="false"
                    placeholder="左边输入 Markdown 格式的文字开始编辑，右边即时预览"/>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import API from '@/api/scatter';
import { mavonEditor } from 'mavon-editor';
import { publishArticle, defaultImagesUploader, auth } from '../api';

import 'mavon-editor/dist/css/index.css'; // editor css

export default {
  name: 'NewPost',
  components: {
    'mavon-editor': mavonEditor,
  },
  async created() {
    if (this.currentUsername) {
      return;
    }
    await this.suggestNetworkAsync();
    await this.loginScatterAsync();
  },
  data: () => ({
    title: '',
    author: '',
    markdownData: '',
    fissionFactor: 2000,
  }),
  computed: {
    ...mapGetters(['currentUsername']),
    ...mapState(['isScatterConnected', 'scatterAccount']),
  },
  methods: {
    ...mapActions([
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    async sendThePost() {
      if (!this.isScatterConnected) {
        try {
          await this.connectScatterAsync();
        } catch (error) {
          this.$Message.error('钱包需打开并解锁');
          return;
        }
      }
      if (this.currentUsername === null) {
        try {
          await this.loginScatterAsync();
        } catch (error) {
          this.$Message.error('登录失败，钱包需打开并解锁');
          return;
        }
      }
      if (this.title === '' || this.markdownData === '') { // 标题或内容为空时
        this.$Message.error('标题或正文不能为空');
        // async 函数返回一个 Promise 对象。
        return;
      }
      // 用户不填写裂变系数则默认为2
      if (this.fissionFactor === '') this.fissionFactor = 2;

      const {
        title, markdownData, currentUsername, fissionFactor,
      } = this;
      const author = currentUsername;
      const content = markdownData;

      const success = (hash) => {
        this.$Notice.success({
          title: '发送成功',
          desc: '3秒后跳转到你发表的文章',
        });
        const jumpToArticle = () => this.$router.push({
          name: 'Article', params: { hash },
        });
        setTimeout(jumpToArticle, 3 * 1000);
      };
      const failed = error => this.$Notice.error({ title: '发送失败', desc: error });

      try {
        const { data } = await sendPost({
          title, author, content, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code !== 200) failed('1st step : send post to ipfs failed');
        // eslint-disable-next-line no-unused-vars
        API.getSignature(author, hash, (err, signature, publicKey, username) => { // username未使用
          console.log('签名成功后调', signature, publicKey);
          if (err) failed('2nd step failed');
          publishArticle({
            author, title, hash, publicKey, signature, username: currentUsername, fissionFactor,
          })
          .then( (response) => {
            if (response.data.msg !== 'success') failed(error);
            success(hash);
          })
          .catch( (error) => {
            failed(error);
            console.log(error);
          });
        });
      } catch (error) {
        console.error(error);
        failed(error);
      }
    },
    $imgAdd(pos, imgfile) {
      // 想要更换默认的 uploader， 请在 src/api/imagesUploader.js 修改 currentImagesUploader
      // 不要在页面组件写具体实现，谢谢合作 - Frank
      defaultImagesUploader(imgfile)
        .then(({ data }) => {
          const { url } = data.data;
          this.$refs.md.$img2Url(pos, url);
        });
    },
  },
};
</script>

<style scoped>
  .edit-content {
    margin: 10px;
  }

  textarea,
  #editor div {
    display: inline-block;
    width: 49%;
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    padding: 0 20px;
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
  /* 编辑器层级大于modal 改变编辑器层级 */
  .v-note-wrapper{
    z-index: 1000;
  }
</style>
