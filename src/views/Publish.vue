<template>
  <div class="new-post">
    <BaseHeader :pageinfo="{ title: `发布文章`, rightPage: 'home',
                   needLogin: false, }">
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认发布</Button>
      </div>
    </BaseHeader>
    <!--<za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon>
      </div>
      <div slot="title">发布文章</div>
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认发布</Button>
      </div>
    </za-nav-bar>-->
    <div class="edit-content">
      <Form label-position="left" :label-width="100">
        <FormItem label="标题">
          <Input v-model="title" placeholder="请输入你的文章标题..." size="large" clearable />
        </FormItem>
        <!-- <FormItem label="署名">
          <Input v-model="author" placeholder="写上你的大名..." clearable />
        </FormItem> -->
        <FormItem label="裂变系数">
          <div class="fission-num-Input">
            {{ fissionNum }}
          </div>
          <div class="fission-num-slider">
            <vue-slider class="fission-num-slider2" :min="1" :max="2" :interval="0.1" v-model="fissionNum"></vue-slider>
          </div>
        </FormItem>
        <FormItem label="图文封面">
          <div style="text-align: left">
            <ImgUpload @setDone="setDone"></ImgUpload>
          </div>
        </FormItem>
      </Form>
    </div>
    <mavon-editor ref=md v-model="markdownData" style="max-height: 300px;z-index: 2;"
      @imgAdd="$imgAdd" :toolbars="toolbars" :subfield="false" :boxShadow="false"
      placeholder="请输入 Markdown 格式的文字开始编辑"/>
    <div class="radio">
      <div class="radio-item">
        <input type="radio" id="public"
               name="contact" value="public" v-model="saveType">
        <label for="public" class="radio-label">公开发布</label>
      </div>
      <div class="radio-item">
        <input type="radio" id="draft"
               name="contact" value="draft" v-model="saveType">
        <label for="draft" class="radio-label">保存到草稿箱</label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import { mavonEditor } from 'mavon-editor';
import {
  defaultImagesUploader, publishArticle, oldpublishArticle,
} from '../api';

import 'mavon-editor/dist/css/index.css'; // editor css
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import ImgUpload from '@/components/ImgUpload';

export default {
  name: 'NewPost',
  components: {
    'mavon-editor': mavonEditor,
    VueSlider,
    ImgUpload,
  },
  created() {
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
    fissionNum: 2,
    cover: '',
    saveType: 'public',
  }),
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
    }),
    ...mapGetters(['currentUsername']),
  },
  methods: {
    ...mapActions('scatter', [
      'login',
    ]),
    loginScatterAsync() { return this.login(); },
    setDone(fileHash) {
      this.cover = fileHash;
    },
    ...mapActions(['idCheck']),
    async sendThePost() {
      try {
        this.$Message.info('帐号检测中...');
        await this.idCheck().then(() => { this.$Message.success('检测通过'); });
      } catch (err) {
        this.$Message.error('本功能需登录');
        return;
      }

      if (this.title === '' || this.markdownData === '') { // 标题或内容为空时
        this.$Message.error('标题或正文不能为空');
        return;
      }
      if (this.fissionFactor === '') this.fissionFactor = 2; // 用户不填写裂变系数则默认为2

      const {
        title, markdownData: content, currentUsername: author, fissionFactor, cover,
      } = this;
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
        await oldpublishArticle({
          author, title, hash, fissionFactor, cover,
        }).then((response) => {
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
  .new-post {
    padding-top: 45px;
  }
  .radio-label {
    margin-left: 5px;
  }
  .radio-item {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  .radio {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
  }
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
