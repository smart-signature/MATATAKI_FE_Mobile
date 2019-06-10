<template>
  <div class="new-post">
    <BaseHeader
      :isCenter="false"
      :pageinfo="{ title: editorText, rightPage: 'home' }"
      :customizeBackFunc="true"
      :customizeHomeFunc="true"
      :customizeHeaderBc="'#fff'"
      @headerBackFunc="headerBackFunc"
      @headerHomeFunc="headerHomeFunc">
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
      :boxShadow="false"
      :autofocus="false"
      :style="mavonStyle"
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
        <img-upload :imgUploadDone="imgUploadDone" class="cover-upload" @doneImageUpload="doneImageUpload" v-show="!cover">
          <img slot="uploadButton" class="cover-add" src="@/assets/img/icon_add.svg" alt="add">
        </img-upload>
        <div class="cover-right" v-show="cover">
          <img class="cover-right-img" :src="coverEditor" alt="cover" />
          <img class="cover-right-remove" @click.prevent="removeCover" src="@/assets/img/icon_remove.svg" alt="remove">
        </div>
      </div>
    </div>
    <div class="radio" v-if="isShowEditorMode">
      <RadioGroup v-model="saveType" vertical class="save-type">
        <Radio size="large" label="public">公开发布</Radio>
        <Radio size="large" label="draft">保存到草稿箱</Radio>
      </RadioGroup>
    </div>

     <div class="is-original">
      <Checkbox size="large" v-model="isOriginal">&nbsp;确认为原创</Checkbox>
    </div>
    <modal-prompt
      :showModal="showModal"
      :modalText="modalText"
      @changeInfo="changeInfo"
      @modalCancel="modalCancel" />
    <BaseModalForSignIn :showModal="showSignInModal" @changeInfo="changeInfo2" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { sendPost } from '@/api/ipfs';
import { mavonEditor } from 'mavon-editor';
import {
  defaultImagesUploader, backendAPI, createDraft,
  getArticleDatafromIPFS, getArticleInfo,
  getDraft, updateDraft, delDraft, getMyPost,
  getAvatarImage,
} from '@/api';

import 'mavon-editor/dist/css/index.css'; // editor css
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import { sleep } from '@/common/methods';
import debounce from 'lodash/debounce';
import { toolbars } from './toolbars'; // 编辑器配置
import imgUpload from '@/components/imgUpload/index.vue'; // 图片上传
import modalPrompt from './components/modalPrompt.vue'; // 弹出框提示


export default {
  name: 'NewPost',
  components: {
    mavonEditor,
    VueSlider,
    imgUpload,
    modalPrompt,
  },
  created() {
    const { id } = this.$route.params;
    const { from, hash } = this.$route.query;
    // console.log(id, from);
    if (id === 'create' && !from) { // 发布文章 from 为 undefined
      // console.log('发布文章');
    } else if (from === 'edit') {
      // console.log('编辑文章');
      this.editorMode = 'edit';
      // this.setArticleData(hash);
      this.setArticleDataById(hash, id);
    } else if (from === 'draft') {
      // console.log('草稿箱');
      this.editorMode = 'draft';
      this.saveType = 'draft';
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
    screenWidth: (document.body.clientWidth || document.documentElement.clientWidth),
    mavonStyle: {
      // 367 其他元素高度剩余的总高度
      minHeight: `${(document.body.clientHeight || document.documentElement.clientHeight) - 367}px`,
    },
    fissionNum: 2,
    cover: '',
    signature: '',
    signId: '',
    id: '',
    editorMode: 'create', // 默认是创建文章
    saveType: 'public', // 发布文章模式， 公开 || 草稿
    isOriginal: false, // 是否原创
    imgUploadDone: 0,
    showModal: false, // 弹框显示
    showSignInModal: false,
    modalText: {
      text: ['文章尚未保存，是否退出？'], // 退出
      button: ['再想想', '退出'],
    },
    modalMode: null, // header 判断点击的 back 还是 home
  }),
  computed: {
    ...mapGetters(['currentUserInfo', 'isLogined']),
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
    coverEditor() {
      return getAvatarImage(this.cover);
    },
  },
  methods: {
    ...mapActions(['getSignatureOfArticle']),
    // 通过ID拿数据
    async setArticleDataById(hash, id) {
      const articleData = await getArticleDatafromIPFS(hash);
      try { // 获取文章信息
        const { data } = await getMyPost(id);
        if (data.code === 0) {
          this.fissionNum = data.data.fission_factor / 1000;
          this.signature = data.data.sign;
          this.cover = data.data.cover;
          this.signId = data.data.id;
          this.isOriginal = Boolean(data.data.is_original);
        } else {
          this.$Notice.error({ title: data.message });
          this.$router.push({ name: 'home' });
        }
      } catch (error) {
        console.error(error);
        this.$Notice.error({ title: '获取文章信息发生错误' });
        this.$router.push({ name: 'home' });
      }
      // 设置文章内容
      const { data } = articleData.data;
      this.title = data.title;
      this.markdownData = data.content;
    },
    // 设置文章数据 by hash
    /* async setArticleData(hash) {
      const articleData = await getArticleDatafromIPFS(hash);
      try { // 获取文章信息
        const { data } = await getArticleInfo(hash);
        this.fissionNum = data.fission_factor / 1000;
        this.signature = data.sign;
        this.cover = data.cover;
        this.signId = data.id;
        this.isOriginal = Boolean(data.is_original);
      } catch (error) {
        console.log(error);
        this.$Message.error('获取文章信息发生错误');
      }
      // 设置文章内容
      const { data } = articleData.data;
      this.title = data.title;
      this.markdownData = data.content;
    }, */
    // 得到草稿箱内容 by id
    async getDraft(id) {
      const { data } = await getDraft({ id });
      this.fissionNum = data.fission_factor ? data.fission_factor / 1000 : 2;
      this.cover = data.cover;
      this.title = data.title;
      this.markdownData = data.content;
      this.id = id;
      this.isOriginal = Boolean(data.is_original);
    },
    // 错误提示
    failed(error) {
      console.error('发送失败', error);
      this.$Notice.error({ title: '发送失败', desc: error });
    },
    // 跳转页面
    jumpToArticle(hash) { this.$router.push({ name: 'Article', params: { hash } }); },
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
    async publishArticle(article) {
      const { failed, success } = this;
      try {
        const { author, hash } = article;
        const signature = await this.getSignatureOfArticle({ author, hash });
        const response = await backendAPI.publishArticle(article, signature);
        if (response.data.code !== 0) {
          throw new Error(response.data.message);
        }
        success(response.data.data);
        console.log(response);
        return 'success';
      } catch (error) {
        console.error(error);
        failed(error);
        throw error;
      }
    },
    // 创建草稿
    async createDraft(data) {
      const response = await createDraft(data);
      if (response.data.msg !== 'success') this.failed('失败请重试');
      this.$Notice.success({ title: '草稿保存成功' });
      this.$router.go(-1);
    },
    // 编辑文章
    async editArticle(data) {
      const { author, hash } = data;
      const signature = await this.getSignatureOfArticle({ author, hash });
      const response = await backendAPI.editArticle(data, signature);
      if (response.status === 200 && response.data.code === 0) this.success(response.data.data);
      else this.failed('失败请重试');
    },
    // 删除草稿
    async delDraft(id) {
      if (!id) {
        this.failed('自动删除草稿失败,请手动删除');
        return;
      }
      try {
        const response = await delDraft({ id });
        if (response.status !== 200) this.failed('自动删除草稿失败,请手动删除');
      } catch (error) {
        this.failed('自动删除草稿失败,请手动删除');
      }
    },
    // 更新草稿
    async updateDraft(data) {
      try {
        const response = await updateDraft(data);
        if (response.data.msg !== 'success') this.failed('失败请重试');
        this.$Notice.success({ title: '草稿更新成功' });
        this.$router.go(-1);
      } catch (error) {
        this.failed('失败请重试');
      }
    },
    // 发布||修改按钮
    async sendThePost() {
      if (this.title === '' || this.markdownData === '') { // 标题或内容为空时
        this.$Message.error('标题或正文不能为空');
        return;
      }
      if (this.fissionFactor === '') this.fissionFactor = 2; // 用户不填写裂变系数则默认为2


      const {
        currentUserInfo,
        title,
        markdownData: content,
        fissionFactor,
        cover,
        editorMode, saveType,
      } = this;
      const { name: author } = currentUserInfo;
      const isOriginal = Number(this.isOriginal);
      console.log('sendThePost mode :', editorMode, saveType);
      if (editorMode === 'create' && saveType === 'public') { // 发布文章
        if (!this.isLogined) {
          this.$Message.warning('本功能需登录');
          this.showSignInModal = true;
          return;
        }
        const { hash } = await this.sendPost({ title, author, content });
        console.log('sendPost result :', hash);
        this.publishArticle({
          author, title, hash, fissionFactor, cover, isOriginal,
        });
      } else if (editorMode === 'create' && saveType === 'draft') { // 发布到草稿箱
        this.createDraft({
          title, content, fissionFactor, cover, isOriginal,
        });
      } else if (editorMode === 'edit') { // 编辑文章
        const { hash } = await this.sendPost({ title, author, content });
        this.editArticle({
          signId: this.signId,
          author,
          title,
          hash,
          fissionFactor,
          signature: this.signature,
          cover,
          isOriginal,
        });
      } else if (editorMode === 'draft' && saveType === 'public') { // 草稿箱编辑 发布
        const { hash } = await this.sendPost({ title, author, content });
        this.publishArticle({
          author, title, hash, fissionFactor, cover, isOriginal,
        }).then(() => {
          this.delDraft(this.id);
        }).catch(() => {
          console.log('发布错误');
        });
      } else if (editorMode === 'draft' && saveType === 'draft') { // 草稿箱编辑 更新
        await this.updateDraft({
          id: this.id, title, content, fissionFactor, cover, isOriginal,
        });
      }
    },
    $imgAdd(pos, imgfile) {
      // 想要更换默认的 uploader， 请在 src/api/imagesUploader.js 修改 currentImagesUploader
      // 不要在页面组件写具体实现，谢谢合作 - Frank
      // 想要更换默认的 uploader， 请在 src/api/imagesUploader.js 修改 currentImagesUploader
      // 不要在页面组件写具体实现，谢谢合作 - Frank
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        canvas.toBlob((blob) => {
          defaultImagesUploader(blob)
            .then(({ data }) => {
              const { url } = data.data;
              this.$refs.md.$img2Url(pos, url);
            });
        }, 'image/jpeg', 0.3);
      };
      image.src = imgfile.miniurl;
    },
    setToolBar(val) {
      if (val > 750) this.toolbars = Object.assign(toolbars.pc, toolbars.public);
      else this.toolbars = Object.assign(toolbars.mobile, toolbars.public);
    },
    resize() {
      window.onresize = debounce(() => {
        const clientHeight = (document.body.clientHeight || document.documentElement.clientHeight);
        const clientWidth = (document.body.clientWidth || document.documentElement.clientWidth);
        this.screenWidth = clientWidth;
        this.mavonStyle = {
          minHeight: `${clientHeight - 367}px`,
        };
      }, 150);
    },
    // 上传完成
    doneImageUpload(res) {
      this.imgUploadDone += Date.now();
      this.cover = res.hash;
    },
    // 删除cover
    removeCover() {
      this.cover = '';
    },
    // head 返回
    headerBackFunc() {
      this.showModal = true;
      this.modalMode = 'back';
    },
    // head 返回首页
    headerHomeFunc() {
      this.showModal = true;
      this.modalMode = 'home';
    },
    // 关闭modal
    changeInfo(status) {
      this.showModal = status;
    },
    changeInfo2(status) {
      this.showSignInModal = status;
    },
    // modal 同意
    modalCancel() {
      this.showModal = false;
      if (this.modalMode === 'back') this.$router.go(-1);
      else if (this.modalMode === 'home') this.$router.push({ name: 'home' });
      else this.$router.go(-1);
    },
  },
  watch: {
    screenWidth(val) {
      this.setToolBar(val);
    },
    mavonStyle(newVal) {
      console.log(newVal);

      this.mavonStyle = newVal;
    },
    fissionNum() {
      this.fissionFactor = this.fissionNum * 1000;
    },
  },
};
</script>

<style scoped lang="less" src="./Publish.less"></style>

<style lang="less">
/* 全局覆盖组件样式 */
.v-note-wrapper .v-note-op{
  border: none !important;
}
.content-input-wrapper{
  padding: 8px 10px 15px 10px !important;
}
// 外层容器
.editor {
  margin-top: 68px;
}
// 工具栏
.editor .v-note-op {
  position: fixed;
  top: 113px;
  left: 0;
  right: 0;
  border-top: 1px solid #eee !important;
  border-bottom: 1px solid #eee !important;
  box-sizing: border-box;
}
// 内容
.editor .v-note-panel {
  padding-top: 40px;
  border-top: none !important;
  border-right: none !important;
  border-left: none !important;
  border-bottom: 1px solid #eee !important;
}
// 工具栏按钮 去掉样式
.editor [type=button]{
  -webkit-appearance: none;
}
// 工具栏样式下拉阴影
.editor .op-image.popup-dropdown,
.editor .op-header.popup-dropdown{
  box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 4px 0px !important;
}

.editor .v-show-content.scroll-style {
  background-color: #fff !important;
}
.editor .v-note-edit.divarea-wrapper.scroll-style {
  background-color: #f8f9fa;
}
.editor .auto-textarea-input.no-border.no-resize {
  background-color: #f8f9fa;
}
.editor .v-note-op .v-left-item, .editor .v-note-op .v-right-item{
  flex: none !important;
  display: flex;
  align-items: center;
}
.editor .v-note-op .v-right-item{
  max-width: auto !important;
}
.op-icon-divider {
  height: 18px !important;
}
.editor .op-icon {
  margin-left: 3px !important;
  margin-right: 3px !important;
}
@media screen and (max-width: 750px) {
  .editor .op-icon {
    margin-left: 1px !important;
    margin-right: 1px !important;
  }
}
</style>
