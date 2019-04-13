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
    </div>
    <mavon-editor ref=md v-model="markdownData" @imgAdd="$imgAdd" :toolbars="toolbars" :subfield="false" :boxShadow="false" placeholder="请输入 Markdown 格式的文字开始编辑"/>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import API from '@/api/scatter';
import { mavonEditor } from 'mavon-editor';
import {
  defaultImagesUploader, publishArticle,
} from '../api';

import 'mavon-editor/dist/css/index.css'; // editor css

export default {
  name: 'NewPost',
  components: {
    'mavon-editor': mavonEditor,
  },
  created() {
    if (this.currentUsername) {
      return;
    }
    this.suggestNetworkAsync()
      .then((added) => {
        console.log('Suggest network result: ', added);
        this.loginScatterAsync();
      });
  },
  mounted() {
    this.resize();
    this.setToolBar(this.screenWidth);
  },
  data: () => ({
    title: '',
    author: '',
    markdownData: '',
    fissionFactor: 2000,
    toolbars: {},
    screenWidth: document.body.clientWidth,
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
          desc: '3秒后跳转到你发表的文章',
        });

        setTimeout(() => { jumpToArticle(hash); }, 3 * 1000);
      };

      try {
        const { data } = await sendPost({
          title, author, content, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code !== 200) failed('1st step : send post to ipfs failed');
        publishArticle({
          author, title, hash, fissionFactor,
        })
          .then((response) => {
            if (response.data.msg !== 'success') failed('失败请重试');
            success(hash);
          }, (error) => { failed(error); });
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
