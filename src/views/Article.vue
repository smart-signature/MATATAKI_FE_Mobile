<template>
  <div class="article">
    <Header :pageinfo="{ title: 'Smart Signature',  }" />
    <div class="tl_page">
      <main class="ta">
        <header class="ta_header">
          <h1 dir="auto">{{post.title}}</h1>
          <address dir="auto">
            <router-link :to="{ name: 'User', params: { author: post.author }}">
              <a> Author: {{post.author}}</a>
            </router-link>
            <br/>
            <span>IPFS Hash: {{hash}}</span>
          </address>
        </header>
        <mavon-editor v-show="false" style="display: none;"/>
        <div class="markdown-body tac" v-html="compiledMarkdown"></div>
      </main>
    </div>
    <footer class="footer-article">
      <Divider />
      <Row justify="center">
          <i-col span="11">{{3500}}</i-col>
          <i-col span="2"><Divider type="vertical" /></i-col>
          <i-col span="11">裂变系数：{{getDisplayedFissionFactor}}</i-col>
      </Row>
      <Divider />
      <Row style="white-space:nowrap;">
        <i-col span="12">
          <za-button class="button-support" v-if="isSupported"
            size='xl' theme="primary"
            disabled>已打赏</za-button>
          <za-button class="button-support" v-else
            size='xl' theme="primary"
            @click="visible3 = true">打赏</za-button>
        </i-col>
        <za-modal :visible="visible3"
           @close="handleClose" radius="" @maskClick="visible3 = false" :showClose="true"
           style="background:rgba(243,243,243,1);">
            <Row><za-input
              auto-height="" v-model="v3" type="textarea" placeholder="输入推荐语…"></za-input></Row>
            <br/>
            <Row><za-input
              v-model="v5" type="price" placeholder="输入打赏 EOS" @change="handleChange">
            </za-input></Row>
            <br/>
            <Row><za-button class="button-support"
              size='xl' theme="primary"
              @click="support">打赏</za-button></Row>
            <!-- <Row><za-keyboard-picker
              :visible="visible7" type="number" @keyClick="handleChange1">
            </za-keyboard-picker></Row> -->
        </za-modal>
        <i-col span="12">
          <za-button class="button-share"
            size='xl' theme="primary"
            :data-clipboard-text="getClipboard"
            @click="share" ghost="true">分享</za-button>
        </i-col>
      </Row>
      <!-- <za-toast :visible.sync="toastvisible"
      @close="toastClose" :duration="1000">ok</za-toast> -->
    </footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState, } from 'vuex';
import { Header } from '@/components/';
import axios from 'axios';
import Clipboard from 'clipboard';
import { mavonEditor } from 'mavon-editor';
import { support, getSignInfo, getSharesInfo } from '../api/signature.js';
import 'mavon-editor/dist/css/index.css';
// markdownIt.set({ breaks: false });

import querystring from 'query-string';
// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();
const getValue = (v, key) => {
  if (key == 'delete') {
    return v.slice(0, -1);
  }
  return `${v}${key}`;
};

export default {
  name: 'Article',
  props: ['hash'],
  components: {
    Header,
    mavonEditor,
  },
  computed: {
    ...mapState(['scatterAccount']),
    ...mapGetters(['currentUsername']),
    isLogined() {
      return this.scatterAccount !== null;
    },
    updateTitle() {
      return false;
    },
    compiledMarkdown() {
      return markdownIt.render(this.post.content);
    },
    getClipboard() {
      const { currentUsername } = this;
      // todo(minakokojima): figure out what is the different between following variables.
      // alert(currentUsername);
      // alert(scatterAccount.name);

      return `https://${this.isLogined
        ? `${window.location.host}/article/${this.hash}?invite=${currentUsername}`
        : `${window.location.href}`}`;
    },
    getDisplayedFissionFactor() {
      return this.sign.fission_factor / 1000;
    },
  },
  data: () => ({
    post: {
      author: 'Loading...',
      title: 'Loading...',
      content: '**Please wait for connection to IPFS**',
      desc: '',
      board: '',
    },
    sign: {
      // NO MORE Cannot read property 'fission_factor' of null
      fission_factor: 0,
    },
    amount: 0.0000,
    isSupported: false,
    toastvisible: false,
    visible3: false,
    visible7: false,
    v3: '',
    v5: '',
  }),
  watch: {
    post({ author, title }) {
      document.title = `${title} by ${author} - Smart Signature`;
    },
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    async getArticleData() {
      const url = `https://api.smartsignature.io/ipfs/catJSON/${this.hash}`;
      const { data } = await axios.get(url);
      this.post = data.data;
      console.info(data);
    },
    handleClose() {
      this.visible3 = false;
    },
    handleChange(v) {
      this.amount = v;
      console.log('amount :', this.amount);
    },
    handleChange1(key) {
      if (['close', 'ok'].indexOf(key) > -1) {
        return;
      }
      this.v1 = getValue(this.v1, key);
      console.log(this.v1);
    },
    async setisSupported() {
      if (this.scatterAccount !== null) {
        const shares = await getSharesInfo(this.currentUsername);
        // const shares = await getSharesInfo('linklinkguan'); // for sign.id 78
        // console.log('shares :', shares);
        const share = shares.find(element => element.id === this.sign.id);
        if (share !== undefined) {
          console.log('share :', share);
          this.isSupported = true;
        }
      }
    },
    async support() {
      this.visible3 = false;
      const amount = parseFloat(this.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('请输入正确金额');
        return;
      }
      console.log('amount :', amount);
      try {
        const suggestNetworkResult = await this.suggestNetworkAsync();
      } catch (error) {
      }
      await this.connectScatterAsync();
      await this.loginScatterAsync();
      // fetch sign_id
      const url = `https://api.smartsignature.io/post/${this.hash}`;
      const { data } = await axios.get(url);
      const sign_id = data.id;
      // todo(minakokojima): use Regex to get referrer from the url. // Done (joe)
      const referrer = this.getRef();
      console.log('referrer :', referrer);
      await support({ amount, sign_id, referrer });
      await this.setisSupported();
    },
    share() {
      const clipboard = new Clipboard('.button-share');
      clipboard.on('success', (e) => {
        alert('复制成功');
        console.log(e);
        clipboard.destroy();
      });
      clipboard.on('error', (e) => {
        alert('该浏览器不支持自动复制');
        console.log(e);
        clipboard.destroy();
      });
    },
    toastClose(reason, event) {
      console.log(reason, event);
    },
    goHome() {
      this.$router.push({ name: 'home' });
    },
    goBack() {
      this.$router.go(-1);
    },
    getRef() {
      // no need to save inviter
      // let invite = localStorage.getItem('invite');
      let { invite } = querystring.parse(location.search.slice(1));

      if (!invite) {
        invite = null;
      }
      return invite;
    },
  },
  async created() {
    document.title = '正在加载文章 - Smart Signature';

    this.board = this.getClipboard;
    await this.getArticleData();
    const url = `https://api.smartsignature.io/post/${this.hash}`;
    const { data } = await axios.get(url);
    const signs = await getSignInfo(data.id);
    this.sign = signs[0];
    console.log('sign :', this.sign); // fix: ReferenceError: sign is not defined

    // Set post author
    this.post.author = this.sign.author;

    // Set isSupported
    await this.setisSupported();

    //
    const { invite } = querystring.parse(window.location.search.slice(1));
    if (invite) {
      localStorage.setItem('invite', invite);
    }
  },
};
</script>


<style scoped>
@import url(https://cdn.bootcss.com/github-markdown-css/2.10.0/github-markdown.min.css);
.ta address a[rel="author"]:empty + time:before,
.ta address.empty,
.ta time:empty:before {
  display: none;
}
.ta .tac blockquote,
.ta .tac p,
.ta .tac pre,
.ta_header {
  word-wrap: break-word;
}
.prompt,
.tl_blocks {
  right: 0;
  position: absolute;
}
body,
html {
  padding: 0;
  margin: 0;
}
textarea {
  resize: none;
}
.article {
  text-align: left;
  max-width: 732px;
  margin: 0 auto;
}
.ta .tac .iframe_wrap,
.ta .tac iframe,
.ta .tac img,
.ta .tac video {
  max-width: 100%;
  vertical-align: top;
}
.tl_page {
  position: relative;
  padding: 21px 0;
}
.tl_message {
  font-family: CustomSansSerif, "Lucida Grande", Arial, sans-serif;
  padding: 70px 0;
  color: #79828b;
  text-align: center;
}
.tl_message h1 {
  font-size: 120px;
  margin: 0;
}
.ta .ql-container {
  height: auto;
}
.prompt {
  left: 0;
  top: 0;
  bottom: 0;
}
.prompt .prompt_input_wrap {
  overflow: hidden;
}
.prompt .prompt_input {
  width: 100%;
  margin: 0;
  border: none;
  background-color: transparent;
  box-sizing: border-box;
}
.tl_blocks {
  text-align: right;
  left: 0;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.tl_blocks.shown {
  visibility: visible;
  opacity: 1;
}
@media (max-width: 960px) {
  .tl_blocks {
    text-align: center;
  }
}
.ta ::selection {
  background: #dbdbdb;
}
.ta ::-moz-selection {
  background: #dbdbdb;
}
.ta .cursor_wrapper {
  display: none;
  position: absolute;
  font-size: 1px;
  left: 50%;
  z-index: -1;
}
.ta .ta_header,
.ta .tac,
.ta .tac .ql-editor {
  font-family: CustomSerif, Georgia, Cambria, "Times New Roman", serif;
  font-weight: 400;
  font-style: normal;
  font-size: 18px;
  line-height: 1.58;
  padding: 0;
  margin: 0;
  color: rgba(0, 0, 0, 0.8);
}
.ta address,
.ta h1,
.ta h2 {
  font-family: CustomSansSerif, "Lucida Grande", Arial, sans-serif;
  font-style: normal;
}
.ta .ql-editor {
  height: 100%;
  overflow: visible;
  text-align: inherit;
}
.ta .tac,
.ta .tac .ql-editor * {
  white-space: pre-wrap;
}
.ta .tac.ql-container {
  white-space: normal;
}
.ta h1,
.ta h2 {
  font-weight: 700;
  font-size: 32px;
  margin: 21px 21px 12px;
  line-height: 34px;
}
.ta h2 {
  font-size: 24px;
  margin: -6px 21px 12px;
  color: rgba(0, 0, 0, 0.44);
}
.ta address,
.ta address a {
  color: #79828b;
}
.ta address {
  font-size: 15px;
  line-height: 18px;
  margin: 12px 21px;
}
.ta address time:before {
  content: "â€¢";
  padding: 0 7px;
}
.ta a[href] {
  color: inherit;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.44);
  text-decoration: none;
  border-bottom: 0.1em solid rgba(0, 0, 0, 0.7);
}
.ta address a[href] {
  border-bottom: none;
}
.ta .tac p {
  margin: 0 21px 12px;
}
.ta .tac code,
.ta .tac pre {
  font-family: Menlo, "Courier New", Courier, monospace;
  font-size: 16px;
  background: #f5f8fc;
}
.ta .tac code {
  padding: 1px 3px;
}
.ta .tac pre {
  margin: 14px 0;
  padding: 7px 21px;
  white-space: pre-wrap;
}
.ta .tac h3,
.ta .tac h4 {
  font-family: CustomSansSerif, "Lucida Grande", Arial, sans-serif;
  font-weight: 700;
  font-style: normal;
  font-size: 28px;
  margin: 18px 21px 9px;
}
.ta .tac aside,
.ta .tac blockquote {
  font-family: CustomSerif, Georgia, Cambria, "Times New Roman", serif;
  font-style: italic;
}
.ta .tac h4 {
  font-size: 24px;
  margin: 18px 21px 7px;
}
.ta .tac blockquote {
  margin: 18px 21px 16px 0;
  padding-left: 15px;
  position: relative;
  border-left: 3px solid #000;
}
.ta .tac aside {
  font-size: 21px;
  color: rgba(0, 0, 0, 0.6);
  margin: 18px 21px 16px;
  padding: 0 18px;
  text-align: center;
}
.ta .tac hr {
  width: 50%;
  margin: 30px auto;
  border: none;
  font-size: 2px;
  text-align: right;
}
.ta .tac hr:after {
  content: "";
  display: block;
  border-top: 1px solid #c9cdd1;
  margin: 0 3px;
  position: relative;
  top: 1px;
}
.ta .tac ol,
.ta .tac ul {
  padding: 0;
  margin: 21px;
  list-style: none;
  counter-reset: list;
}
.ta .tac ol li,
.ta .tac ul li {
  margin-left: 30px;
  margin-bottom: 14px;
  padding: 0;
  position: relative;
}
.ta .tac ol li:before,
.ta .tac ul li:before {
  position: absolute;
  display: inline-block;
  box-sizing: border-box;
  width: 78px;
  margin: 0 0 0 -78px;
  text-align: right;
}
.ta .tac ul li:before {
  padding: 1px 15px 0 0;
  content: "â€¢";
}
.ta .tac ol li:before {
  font-feature-settings: "liga" on, "lnum" on;
  -moz-font-feature-settings: "liga" on, "lnum" on;
  -webkit-font-feature-settings: "liga" on, "lnum" on;
  padding-right: 12px;
  counter-increment: list;
  content: counter(list) ".";
}
.ta .tac .iframe_wrap {
  position: relative;
}
.ta .tac .iframe_wrap iframe {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.ta .tac .figure_wrapper,
.ta .tac figure {
  position: relative;
}
.ta .tac figure {
  margin: 0 21px 16px;
  padding: 0;
  text-align: center;
}
.ta .tac figcaption,
.ta .tac figcaption .editable_input {
  font-family: CustomSansSerif, "Lucida Grande", Arial, sans-serif;
  font-size: 15px;
  color: #79828b;
  padding: 12px 21px 0;
  line-height: 18px;
  vertical-align: top;
  text-align: center;
}
.ta .tac figcaption .editable_input {
  width: 100%;
  border: none;
  padding: 0;
  margin: 0;
}
.ta .tac .figure_wrapper img,
.ta .tac .figure_wrapper video {
  opacity: 1;
  transition: opacity 0.15s ease;
  max-height: 690px;
}
.ta .tac .figure_wrapper.loading img,
.ta .tac .figure_wrapper.loading video {
  opacity: 0.3;
}
.ta .tac .figure_wrapper .file_progress {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 3px;
  background-color: rgba(255, 255, 255, 0.7);
  transition: opacity 0.15s ease;
  visibility: hidden;
  opacity: 0;
}
.ta .tac .figure_wrapper.loading .file_progress {
  visibility: visible;
  opacity: 1;
}
.ta .tac .figure_wrapper .file_progress_bar {
  height: 2px;
  background-color: #333;
  transition: width 0.1s linear;
  width: 0;
}
.ta .tac input.ql-image[type="file"] {
  display: none;
}
.tac h1,
.tac address {
  display: none !important;
}
.footer-article {
  font-size: 12px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: rgba(0,0,0,1);
  text-align: center;
  line-height: 10px;
  letter-spacing: 1px;
}

#button {
  font-family: CustomSansSerif, "Lucida Grande", Arial, sans-serif;
  font-weight: 600;
  font-style: normal;
  font-size: 17px;
  color: #000;
  text-decoration: none;
  border: 2px solid #333;
  border-radius: 16px;
  text-transform: uppercase;
  padding: 4px 12px;
  margin: 0 0 15px;
  background-color: #fff;
  cursor: pointer;
}
.tl_page {
  position: relative;
  padding: 21px 0;
}
</style>
