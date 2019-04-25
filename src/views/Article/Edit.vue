<template>
  <div class="new-post">
    <BaseHeader :pageinfo="{ title: `编辑文章`, rightPage: 'home',
                   needLogin: false, }">
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认修改</Button>
      </div>
    </BaseHeader>
    <!--<za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon>
      </div>
      <div slot="title">编辑文章</div>
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认修改</Button>
      </div>
    </za-nav-bar>-->
    <div class="edit-content">
      <Form label-position="left" :label-width="100">
        <FormItem label="标题">
          <Input v-model="title" placeholder="请输入你的文章标题..." size="large" clearable />
        </FormItem>
        <FormItem label="裂变系数">
          <Input v-model="fissionNum" placeholder="" size="large" clearable disabled/>
        </FormItem>
        <FormItem label="上传头图">
          <div style="text-align: left">
            <ImgUpload @setDone="setDone" :cover="cover"></ImgUpload>
          </div>
        </FormItem>
      </Form>
    </div>
    <mavon-editor ref=md v-model="markdownData" style="max-height: 300px;z-index: 2;"
      @imgAdd="$imgAdd" :toolbars="toolbars" :subfield="false" :boxShadow="false"
      placeholder="请输入 Markdown 格式的文字开始编辑"/>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import { mavonEditor } from 'mavon-editor';
import {
  defaultImagesUploader, editArticle, getArticleInfo, getArticleData,
} from '@/api';

import 'mavon-editor/dist/css/index.css'; // editor css
import ImgUpload from '@/components/ImgUpload';

export default {
  name: 'Edit',
  components: {
    'mavon-editor': mavonEditor,
    ImgUpload,
  },
  created() {
    if (this.currentUsername) {
      return;
    }
    this.loginScatterAsync();
  },
  async mounted() {
    this.resize();
    this.setToolBar(this.screenWidth);
    this.signId = this.$route.params.id;
    this.hash = this.$route.query.hash;
    this.setArticleData();
  },
  data: () => ({
    title: '',
    author: '',
    markdownData: '',
    fissionFactor: 2000,
    toolbars: {},
    screenWidth: document.body.clientWidth,
    fissionNum: 2,
    signId: null,
    signature: '',
    cover: '',
    originalCover: '',
  }),
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
      scatterAccount: state => state.account,
    }),
    ...mapGetters(['currentUsername']),
    isMe() {
      return this.author === this.currentUsername;
    },
  },
  methods: {
    ...mapActions('scatter', [
      'login',
    ]),
    setDone(fileHash) {
      this.cover = fileHash;
    },
    loginScatterAsync() { return this.login(); },
    async setArticleData() {
      await getArticleInfo(this.hash, ({ error, response }) => {
        if (error) {
          this.$Message.error('获取文章信息发生错误');
          console.log(error);
        } else {
          const d2 = response.data;
          this.fissionNum = d2.fission_factor / 1000;
          this.signature = d2.sign;
          this.cover = d2.cover;
          this.originalCover = d2.cover;
          console.log('data', d2);
        }
      });
      const articleData = await getArticleData(this.hash);
      const d1 = articleData.data.data;
      this.title = d1.title;
      this.markdownData = d1.content;
      this.author = d1.author;
    },
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
        title, markdownData, currentUsername, fissionFactor, signature, signId, cover,
      } = this;
      const author = currentUsername;
      const content = markdownData;
      const failed = (error) => {
        console.error('发送失败', error);
        this.$Notice.error({ title: '发送失败', desc: error });
      };
      const jumpToArticle = hash => this.$router.push({
        name: 'Article', params: { hash },
      });
      const success = async (hash) => {
        this.$Notice.success({
          title: '发送成功',
          desc: '3秒后跳转到你编辑的文章',
        });

        setTimeout(() => { jumpToArticle(hash); }, 3 * 1000);
      };
      try {
        const { data } = await sendPost({
          title, author, content, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code !== 200) failed('1st step : send post to ipfs failed');
        editArticle({
          signId, author, title, hash, fissionFactor, signature, cover,
        }, (res) => {
          const { response } = res;
          if (response.data.msg !== 'success') failed('失败请重试');
          success(hash);
        });
      } catch (error) {
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
    setToolBar(val) {
      if (val > 440) {
        this.toolbars = {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          underline: true, // 下划线
          strikethrough: true, // 中划线
          mark: true, // 标记
          superscript: true, // 上角标
          subscript: true, // 下角标
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          imagelink: true, // 图片链接
          code: true, // code
          table: true, // 表格
          fullscreen: true, // 全屏编辑
          readmodel: true, // 沉浸式阅读
          htmlcode: true, // 展示html源码
          help: true, // 帮助
          /* 1.3.5 */
          undo: true, // 上一步
          redo: true, // 下一步
          trash: true, // 清空
          save: true, // 保存（触发events中的save事件）
          /* 1.4.2 */
          navigation: true, // 导航目录
          /* 2.1.8 */
          alignleft: true, // 左对齐
          aligncenter: true, // 居中
          alignright: true, // 右对齐
          /* 2.2.1 */
          subfield: true, // 单双栏模式
          preview: true, // 预览
        };
      } else {
        this.toolbars = {
          bold: true, // 粗体
          italic: true, // 斜体
          // strikethrough: true, // 中划线
          quote: true, // 引用
          header: true, // 标题
          imagelink: true, // 图片链接
          fullscreen: true, // 全屏编辑
          undo: true, // 上一步
          preview: true, // 预览
        };
      }
    },
    resize() {
      window.onresize = () => {
        this.screenWidth = document.body.clientWidth;
      };
    },
  },
  watch: {
    screenWidth(val) {
      this.setToolBar(val);
    },
    fissionNum() {
      this.fissionFactor = this.fissionNum * 1000;
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

  .fission-num-Input{
    width: 16%;
    margin-bottom: 10px;
    border: 1px solid;
    border-radius: 5px;
    border-color: #dcdcdc;
    display: inline-table;
  }
  .fission-num-slider{
    display: inline-table;
    width: 70%;
    margin-left: 15px;
    margin-right: 10px;
  }
  .fission-num-slider2{
        padding: 0px 0px 2px 0px !important;
  }
</style>
