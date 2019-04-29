<template>
  <div class="new-post">
    <BaseHeader :pageinfo="{ title: editorText, rightPage: 'home', needLogin: false, }">
      <div slot="right">
        <span class="send-button" @click="sendThePost">{{sendBtnText}}</span>
      </div>
    </BaseHeader>
    <div class="edit-content">
    <input class="edit-title" v-model="title" placeholder="请输入你的文章标题..." size="large" clearable />

      <mavon-editor ref=md v-model="markdownData"
      class="editor"
      @imgAdd="$imgAdd"
      :toolbars="toolbars"
      :subfield="false"
      :boxShadow="false"
      :autofocus="false"
      placeholder="请输入 Markdown 格式的文字开始编辑"/>
      <div v-if="editorMode !== 'edit'" class="fission">
          <p>裂变系数</p>
          <div class="fission-num-slider" v-if="editorMode !== 'edit'">
            <vue-slider class="fission-num-slider2" :min="1" :max="2" :interval="0.1" v-model="fissionNum"></vue-slider>
          </div>
          <div class="fission-num-Input">
            {{ fissionNum }}
          </div>
      </div>
      <div class="cover">
        <p>图文封面</p>
        <ImgUpload class="cover-upload" @setDone="setDone" :cover="cover"></ImgUpload>
      </div>
    </div>

    <div class="radio" v-if="isShowEditorMode">
      <RadioGroup v-model="saveType" vertical class="save-type">
        <Radio size="large" label="public">公开发布</Radio>
        <Radio size="large" label="draft">保存到草稿箱</Radio>
      </RadioGroup>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import { mavonEditor } from 'mavon-editor';
import {
  defaultImagesUploader, oldpublishArticle, createDraft,
  editArticle, getArticleDatafromIPFS, getArticleInfo,
  getDraft, updateDraft, delDraft,
} from '@/api/index';

import 'mavon-editor/dist/css/index.css'; // editor css
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import ImgUpload from '@/components/ImgUpload';
import { sleep } from '@/common/methods';

export default {
  name: 'NewPost',
  components: {
    'mavon-editor': mavonEditor,
    VueSlider,
    ImgUpload,
  },
  created() {
    const { id } = this.$route.params;
    const { from, hash } = this.$route.query;
    // console.log(id, from);
    if (id === 'create' && !from) { // 发布文章 from 为 undefined
      console.log('发布文章');
    } else if (from === 'edit') {
      console.log('编辑文章');
      this.editorMode = 'edit';
      this.setArticleData(hash);
    } else if (from === 'draft') {
      console.log('草稿箱');
      this.editorMode = 'draft';
      this.getDraft(id);
    } else {
      this.editorMode = 'create'; // 当作发布文章处理
    }
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
    signature: '',
    signId: '',
    id: '',
    editorMode: 'create', // 默认是创建文章
    saveType: 'public', // 发布文章模式， 公开 || 草稿
  }),
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
    }),
    ...mapGetters(['currentUsername']),
    isShowEditorMode() {
      // 创建和草稿的时候是否可以显示编辑器模式（单选按钮显示
      return !!(this.editorMode === 'create' || this.editorMode === 'draft');
    },
    editorText() {
      let text = '文章';
      if (this.editorMode === 'create') { // 发布文章
        text = '文章发布';
      } if (this.editorMode === 'edit') { // 编辑文章
        text = '编辑文章';
      } else if (this.editorMode === 'draft') { // 草稿箱
        text = '编辑草稿';
      }
      return text;
    },
    sendBtnText() {
      let text = '发布';
      if (this.editorMode === 'create') { // 发布文章
        text = '发布';
      } if (this.editorMode === 'edit') { // 编辑文章
        text = '修改';
      } else if (this.editorMode === 'draft' && this.saveType === 'public') { // 草稿箱  发布
        text = '发布';
      } else if (this.editorMode === 'draft' && this.saveType === 'draft') { // 草稿箱 修改
        text = '修改';
      }
      return text;
    },
  },
  methods: {
    setDone(fileHash) {
      this.cover = fileHash;
    },
    ...mapActions(['idCheck']),
    // 设置文章数据 by hash
    async setArticleData(hash) {
      const articleData = await getArticleDatafromIPFS(hash);
      // 获取文章信息
      getArticleInfo(hash, ({ error, response }) => {
        if (error) {
          this.$Message.error('获取文章信息发生错误');
          console.log(error);
        } else {
          const { data } = response;
          this.fissionNum = data.fission_factor / 1000;
          this.signature = data.sign;
          this.cover = data.cover;
          this.signId = data.id;
        }
      });
      // 设置文章内容
      const { data } = articleData.data;
      this.title = data.title;
      this.markdownData = data.content;
    },
    // 得到草稿箱内容 by id
    async getDraft(id) {
      await getDraft({ id }, ({ response }) => {
        const { data } = response;
        this.fissionNum = data.fission_factor ? data.fission_factor / 1000 : 2;
        this.cover = data.cover;
        this.title = data.title;
        this.markdownData = data.content;
        this.id = id;
      });
    },
    // 错误提示
    failed(error) {
      console.error('发送失败', error);
      this.$Notice.error({ title: '发送失败', desc: error });
    },
    // 跳转页面
    jumpToArticle(hash) {
      this.$router.push({
        name: 'Article', params: { hash },
      });
    },
    // 成功提示
    async success(hash) {
      this.$Notice.success({
        title: '发送成功',
        desc: '3秒后跳转到你发表的文章',
      });

      await sleep(3000); // 休眠三秒
      this.jumpToArticle(hash);
    },
    // 发送文章到ipfs
    async sendPost({ title, author, content }) {
      const { data } = await sendPost({
        title, author, content, desc: 'whatever',
      });
      if (data.code !== 200) this.failed('1st step : send post to ipfs failed');
      return data;
    },
    // 发布文章
    async oldpublishArticle(data) {
      await oldpublishArticle(data).then((response) => {
        if (response.data.msg !== 'success') this.failed('失败请重试');
        this.success(data.hash);
        return true;
      }).catch((err) => {
        console.log(err);
        this.failed('失败请重试');
        return false;
      });
    },
    // 创建草稿
    async createDraft(data) {
      await createDraft(data, (response) => {
        if (response.response.data.msg !== 'success') this.failed('失败请重试');
        this.$Notice.success({ title: '草稿保存成功' });
        this.$router.go(-1);
      });
    },
    // 编辑文章
    async editArticle(data) {
      await editArticle(data, (res) => {
        const { response } = res;
        console.log(res);
        if (response.data.msg !== 'success') this.failed('失败请重试');
        this.success(data.hash);
      });
    },
    // 删除草稿
    async delDraft(id) {
      if (!id) {
        this.failed('自动删除草稿失败,请手动删除');
        return;
      }
      await delDraft({ id },
        ({ error, response }) => {
          console.log(error, response);
          if (response.status !== 200 || error || !response) this.failed('自动删除草稿失败,请手动删除');
        });
    },
    // 更新草稿
    updateDraft(data) {
      updateDraft(data, (response) => {
        if (response.response.data.msg !== 'success') this.failed('失败请重试');
        this.$Notice.success({ title: '草稿更新成功' });
        this.$router.go(-1);
      });
    },


    // 发布||修改按钮
    async sendThePost() {
      // this.$Message.info('帐号检测中...');
      await this.idCheck()
        .then(() => {
          // this.$Message.success('检测通过');
        })
        .catch((err) => {
          this.$Message.error('本功能需登录');
          console.log(err);
        });

      if (this.title === '' || this.markdownData === '') { // 标题或内容为空时
        this.$Message.error('标题或正文不能为空');
        return;
      }
      if (this.fissionFactor === '') this.fissionFactor = 2; // 用户不填写裂变系数则默认为2

      const {
        title,
        markdownData: content,
        currentUsername: author,
        fissionFactor,
        cover,
      } = this;
      console.log(this.editorMode, this.saveType);

      if (this.editorMode === 'create' && this.saveType === 'public') { // 发布文章
        const { hash } = await this.sendPost({ title, author, content });
        this.oldpublishArticle({
          author, title, hash, fissionFactor, cover,
        });
      } else if (this.editorMode === 'create' && this.saveType === 'draft') { // 发布到草稿箱
        this.createDraft({
          title, content, fissionFactor, cover,
        });
      } else if (this.editorMode === 'edit') { // 编辑文章
        const { hash } = await this.sendPost({ title, author, content });
        this.editArticle({
          signId: this.signId,
          author,
          title,
          hash,
          fissionFactor,
          signature: this.signature,
          cover,
        });
      } else if (this.editorMode === 'draft' && this.saveType === 'public') { // 草稿箱编辑 发布
        const { hash } = await this.sendPost({ title, author, content });
        const status = await this.oldpublishArticle({
          author, title, hash, fissionFactor, cover,
        });
        if (status) { // 发布成功删除文章
          this.delDraft(this.id);
        }
      } else if (this.editorMode === 'draft' && this.saveType === 'draft') { // 草稿箱编辑 更新
        await this.updateDraft({
          id: this.signId, title, content, fissionFactor, cover,
        });
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
          quote: true, // 引用
          ol: true, // 有序列表
          ul: true, // 无序列表
          link: true, // 链接
          imagelink: true, // 图片链接
          code: true, // code
          table: true, // 表格
          htmlcode: true, // 展示html源码
          help: true, // 帮助
          preview: true, // 预览
          subfield: true,
          navigation: true,
        };
      } else {
        this.toolbars = {
          bold: true, // 粗体
          italic: true, // 斜体
          header: true, // 标题
          imagelink: true, // 图片链接
          preview: true, // 预览
          help: true,
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

<style scoped lang="less">
  .send-button{
    font-size: 14px;
    font-family: PingFangSC-Medium;
    font-weight: bolder;
    color: #7D7D7D;
    cursor: pointer;
  }
  .new-post {
    padding-top: 45px;
    min-height: 100%;
    background: #fff;
  }

  .radio {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
  }
  .edit-content {
    /* margin: 10px; */
  }

  /* 编辑器层级大于modal 改变编辑器层级 */
  .v-note-wrapper{
    z-index: 9;
  }
  .fission{
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 18px 20px;
    font-size: 14px;
    border-bottom: 1px solid #eaeaea;
    p {
      font-weight: bold;
    }
    .fission-num-slider{
      max-width: 130px;
      width: 70%;
      margin: 0 20px 0 10px;
      z-index: 99;
    }
    .fission-num-Input{
      font-size: 16px;
    }
  }

  .cover {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 8px 20px;
    font-size: 14px;
    border-bottom: 1px solid #eaeaea;
     p {
      font-weight: bold;
    }
    .cover-upload{
      margin-left: 10px;
    }
  }
  .radio{
    display: flex;
    justify-content: center;
    background-color: #fff;
    padding: 8px 20px;
    font-size: 14px;
    border-bottom: 1px solid #eaeaea;
    .save-type {
      float: left;
      text-align: left;
    }
  }


  .edit-title {
    width: 100%;
    padding: 14px 10px;
    border: none;
    outline: none;
    border-radius: 0;
    background: transparent;
    background-color: #fff;
    color: #000;
    border-bottom: 1px solid #ddd;
    font-size: 26px;
    font-weight: bold;
  }
  @media screen and (max-width: 576px) {
    .edit-title {
      font-size: 18px;
    }
  }
</style>

<style>
.v-note-wrapper .v-note-op{
  border: none !important;
}
.content-input-wrapper{
  padding: 8px 10px 15px 10px !important;
}
</style>
