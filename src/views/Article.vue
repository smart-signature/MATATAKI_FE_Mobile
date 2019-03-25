<template>
  <div class="article">
    <Header :pageinfo="pageinfo" />
    <div class="tl_page">
      <main class="ta">
        <header class="ta_header">
          <h1 dir="auto">{{post.title}}</h1>
          <address dir="auto">
            <router-link :to="{ name: 'User', params: { author: post.author, username:post.author }}">
              <a> Author: {{post.author}}</a>
            </router-link>
            <br/>
            <span>IPFS Hash: {{hash}}</span>
          </address>
        </header>
        <mavon-editor v-show="false" style="display: none;"/>
        <div class="markdown-body" v-html="compiledMarkdown"></div>
      </main>
    </div>
    <footer class="footer-article">
      <Divider />
      <Row justify="center">
          <i-col span="11" v-if="!isTotalSupportAmountVisible">正在从链上加载本文收到的赞赏</i-col>
          <i-col span="11" v-else-if="isTotalSupportAmountVisible">本文收到赞赏 {{getDisplayTotalSupportedAmount}} 个EOS</i-col>
          <i-col span="2"><Divider type="vertical" /></i-col>
          <i-col span="11">裂变系数：{{getDisplayedFissionFactor}}</i-col>
      </Row>
      <Divider />
      <Row style="white-space:nowrap;">
        <i-col span="11">
          <za-button v-if="isSupported===0" class="button-support"
            size='xl' theme="primary" disabled>加载中</za-button>
          <za-button v-else-if="isSupported===1" class="button-support"
            size='xl' theme="primary"
            @click="visible3=true" >赞赏</za-button>
          <za-button v-else-if="isSupported===2" class="button-support"
            size='xl' theme="primary" disabled>已赞赏</za-button>
        </i-col>
        <i-col span="2"><Divider type="vertical" style="opacity: 0;" /></i-col>
        <za-modal :visible="visible3"
           @close="handleClose" radius="" @maskClick="visible3 = false" :showClose="true"
           style="background:rgba(243,243,243,1);">
           <div slot="title" style="textAlign: center;">赞赏此文章</div>
            <Row><za-input
              auto-height="" v-model="v3" type="textarea" placeholder="输入推荐语…"></za-input></Row>
            <br/>
            <Row><za-input
              v-model="v5" type="price" placeholder="输入打赏 EOS" @change="handleChange">
            </za-input></Row>
            <br/>
            <Row><za-button class="button-support"
              size='xl' theme="primary"
              @click="support">赞赏</za-button></Row>
        </za-modal>
        <i-col span="11">
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
import { mapActions, mapGetters, mapState } from 'vuex';
import { Header } from '@/components/';
import axios from 'axios';
import Clipboard from 'clipboard';
import { mavonEditor } from 'mavon-editor';
import { getArticleData, getSignId } from '../api';
import {
  support, getSignInfo, getSharesInfo, getContractActions,
} from '../api/signature.js';
import 'mavon-editor/dist/css/index.css';
// markdownIt.set({ breaks: false });

import querystring from 'query-string';
// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();
const clipboard = new Clipboard('.button-share');

export default {
  name: 'Article',
  props: ['hash'],
  components: {
    Header,
    mavonEditor,
  },
  computed: {
    ...mapState(['isScatterConnected', 'scatterAccount']),
    ...mapGetters(['currentUsername']),
    isLogined() {
      return this.scatterAccount !== null;
    },
    compiledMarkdown() {
      return markdownIt.render(this.post.content);
    },
    getClipboard() {
      const { currentUsername } = this;
      const { protocol, host } = window.location
      const articleUrl = `${protocol}://${host}/article/${this.hash}`
      const shareLink = this.isLogined
        ? `${articleUrl}?invite=${currentUsername}`
        : articleUrl;
      return `我在智能签名上发现了一篇好文章！${shareLink} 赞赏好文，分享有收益 ！`;
    },
    getDisplayedFissionFactor() {
      return this.sign.fission_factor / 1000;
    },
    getDisplayTotalSupportedAmount() {
      return this.totalSupportedAmount.toFixed(4);
    },
    getInvite() {
      // no need to save inviter
      // we can use computed 
      let { invite } = this.$route.query
      if (!invite) {
        invite = null;
      }
      return invite;
    },
  },
  async created() {
    this.initClipboard()
    document.title = '正在加载文章 - Smart Signature';
    try {
      await this.getArticleData();
    } catch (error) {

    }

    const url = `https://api.smartsignature.io/post/${this.hash}`;
    const { data } = await axios.get(url);
    const signs = await getSignInfo(data.id);
    this.sign = signs[0];
    console.log('sign :', this.sign); // fix: ReferenceError: sign is not defined

    // Set post author
    this.post.author = this.sign.author;

    // Set isSupported
    await this.setisSupported();

    try {
      this.countTotalSupportedAmount(this.sign.id);
    } catch (error) {

    }

  },
  data: () => ({
    post: {
      author: 'Loading...',
      title: 'Loading...',
      content: '**Please wait for the connection to IPFS**',
      desc: '',
    },
    sign: {
      // NO MORE Cannot read property 'fission_factor' of null
      fission_factor: 0,
    },
    amount: 0.0000,
    isSupported: 0, //0=加载中,1=未打赏 2=已打赏
    isTotalSupportAmountVisible: false,  //正在加载和加载完毕的文本切换
    totalSupportedAmount: 0.0000,
    visible3: false,
    v3: '',
    v5: '',
    pageinfo: {
      title: 'Smart Signature',
      rightPage: 'home',
    },
  }),
  watch: {
    post({ author, title }) {
      // 当文章从 IPFS fetched 到， post 会更新，我们要更新网页 title
      document.title = `${title} by ${author} - Smart Signature`;
    },
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    initClipboard() {
      clipboard.on('success', (e) => {
        this.$Modal.info({
          title: '提示',
          content: '复制成功',
        });
        clipboard.destroy();
      });
      clipboard.on('error', (e) => {
        this.$Modal.error({
          title: '提示',
          content: '该浏览器不支持自动复制',
        });
        clipboard.destroy();
      });
    },
    async countTotalSupportedAmount(SignId) {
      const { actions } = await getContractActions();

      // console.log(actions.map(a => a.action_trace));
      const actions2 = actions.filter(a => a.action_trace.act.account === 'eosio.token'
          && a.action_trace.act.name === 'transfer'
          && a.action_trace.act.data.memo.indexOf(`support ${SignId}`) !== -1);

      // console.log(actions2);
      const actions3 = actions2.map(a => ({
        quantity: a.action_trace.act.data.quantity.replace(' EOS', ''),
      }));

      console.log(actions3);
      for (let index = 0; index < actions3.length; index += 1) {
        const element = actions3[index].quantity;
        this.totalSupportedAmount += parseFloat(element);
      }
        this.isTotalSupportAmountVisible = true;
    },
    async getArticleData() {
      const { data } = await getArticleData(this.hash);
      console.info('post :', data);
      this.post = data.data;
    },
    handleClose() {
      this.visible3 = false;
    },
    handleChange(v) {
      this.amount = v;
      console.log('amount :', this.amount);
    },
    async setisSupported() {
      if (this.scatterAccount !== null) {
        const shares = await getSharesInfo(this.currentUsername);
        // const shares = await getSharesInfo('linklinkguan'); // test for sign.id 78
        // console.log('shares :', shares);
        const share = shares.find(element => element.id === this.sign.id);
        if (share !== undefined) {
          console.log('share :', share);
          this.isSupported = 2;
        } else {
          this.isSupported = 1;//0=加载中,1=未打赏 2=已打赏
        }
      }
    },
    async support() {
      this.visible3 = false;
      try { // 錢包登录
        // 開了網頁之後，才開 Scatter ，這時候沒有做 connectScatterAsync 就登录不能
        // 昨天沒加檢查已連而已 - Roger that
        if (!this.isScatterConnected) await this.connectScatterAsync();
        await this.loginScatterAsync();
      } catch (error) {
        console.error(error);
        console.warn('Unable to connect wallets');
        this.$Modal.error({
          title: '无法与你的钱包建立链接並登录',
          content: '请检查钱包是否打开并解锁',
        });
        return;
      }
      // amount
      const amount = parseFloat(this.amount);
      if (isNaN(amount) || amount <= 0) {
        alert('请输入正确的金额');
        return;
      }
      console.log('amount :', amount);

      // fetch sign_id
      const { data } = await getSignId(this.hash);
      console.info(data);
      const sign_id = data.id;

      const referrer = this.getInvite;
      console.log('referrer :', referrer);
      this.isSupported = 0;//0=加载中,1=未打赏 2=已打赏
      try{ 
          await support({ amount, sign_id, referrer })
          this.isSupported = 2;
          alert('赞赏成功！');
          // tricky speed up
          this.totalSupportedAmount += parseFloat(amount);
        }catch(error){
          console.log(JSON.stringify(error));
          alert('赞赏失败，可能是由于网络故障或账户余额不足。\n请检查网络或账户余额。');
          this.isSupported = 1;
        };
    },
    async share() {
      try {
        if (!this.isScatterConnected) await this.connectScatterAsync();
        console.info(this.isScatterConnected);
        // await this.suggestNetworkAsync();
        if (!this.isScatterConnected) throw 'no' ;
        await this.loginScatterAsync();
      } catch (e) {
        console.warn('Unable to connect wallets');
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
        return ;
      }
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
    
  },
};
</script>


<style scoped>
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
  font-family: "Open Sans",sans-serif;
  font-weight: 400;
  font-style: normal;
  font-size: 18px;
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
.footer-article {
  font-size: 12px;
  font-family: PingFangSC-Regular, "Open Sans", sans-serif;
  font-weight: 400;
  color: rgba(0,0,0,1);
  text-align: center;
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
.markdown-body.tac {
    margin: 20px;
}
</style>
