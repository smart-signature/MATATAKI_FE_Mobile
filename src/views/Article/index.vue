/* eslint-disable no-shadow */
<template>
  <div class="article">
    <Header
      :pageinfo="{ left:'notback', title: 'Smart Signature', rightPage: 'home',
                   needLogin: true, }"/>
    <div class="tl_page">
      <main class="ta">
        <header class="ta_header">
          <h1 dir="auto">{{post.title}}</h1>
          <address dir="auto">
            <router-link :to="{ name: 'User',
                                params: { username:post.author }}">
              <a> Author: {{post.author}}</a>
            </router-link>
            <br/>
            <span class="break_all">IPFS Hash: {{hash}}</span>
            <br/>
            <span>阅读次数：{{readamount}}</span>
          </address>
        </header>
        <mavon-editor v-show="false" style="display: none;"/>
        <div class="markdown-body" v-html="compiledMarkdown"></div>
      </main>
    </div>
    <footer class="footer-article">
      <Divider />
      <Row justify="center" style="padding: 0 20px">
          <i-col span="11" v-if="!isTotalSupportAmountVisible">正在从链上加载本文收到的赞赏</i-col>
          <i-col span="11" v-else-if="isTotalSupportAmountVisible">
            <router-link :to="{ name: 'Comments', params: { post, sign, hash }}">
              本文收到赞赏 {{computedTotalSupportedAmount}} 个EOS
            </router-link>
          </i-col>
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
              auto-height="" v-model="v3" type="textarea"
              placeholder="输入推荐语…" @change="handleCommentChange">
            </za-input></Row>
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
    </footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { Header } from '@/components/';
import Clipboard from 'clipboard';
import { mavonEditor } from 'mavon-editor';
import {
  getArticleData, getArticleInfo, getAuth,
  getSharesbysignid, addReadAmount, sendComment,
} from '@/api';
import { getSignInfo, support } from '@/api/signature';
import 'mavon-editor/dist/css/index.css';

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();

const RewardStatus = { // 0=加载中,1=未打赏 2=已打赏
  LOADING: 0,
  NOT_REWARD_YET: 1,
  REWARDED: 2,
};

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
      const { protocol, host } = window.location;
      const articleUrl = `${protocol}//${host}/article/${this.hash}`;
      const shareLink = this.isLogined
        ? `${articleUrl}?invite=${currentUsername}`
        : articleUrl;
      return `我在智能签名上发现了一篇好文章！${shareLink} 赞赏好文，分享有收益 ！`;
    },
    getDisplayedFissionFactor() {
      return this.sign.fission_factor / 1000;
    },
    computedTotalSupportedAmount: {
      // getter
      get() {
        let totalSupportedAmount = 0.0000;
        for (let index = 0; index < this.shares.length; index += 1) {
          const element = this.shares[index].amount;
          totalSupportedAmount += parseFloat(element) / 10000;
        }
        return totalSupportedAmount.toFixed(4);
      },
      /* // countTotalSupportedAmount, old version, dont del
        const { actions } = await getContractActions();
        // console.log(actions.map(a => a.action_trace));
        const actions2 = actions.filter(a => a.action_trace.act.account === 'eosio.token'
          && a.action_trace.act.name === 'transfer'
          && a.action_trace.act.data.memo.indexOf(`support ${signid}`) !== -1);
        // console.log(actions2);
        const actions3 = actions2.map(a => ({
          quantity: a.action_trace.act.data.quantity.replace(' EOS', ''),
        }));
        console.log(actions3);
      */
    },
    getInvite() {
      // no need to save inviter
      // we can use computed
      let { invite } = this.$route.query;
      if (!invite) {
        invite = null;
      }
      return invite;
    },
  },
  /*
    created
    实例已经创建完成之后被调用。在这一步，实例已完成以下的配置：
    数据观测(data observer)，属性和方法的运算， watch/event 事件回调。
    然而，挂载阶段还没开始，$el 属性目前不可见。
  */
  async created() {
    document.title = '正在加载文章 - Smart Signature';
    this.initClipboard(); // 分享按钮功能需要放在前面 保证功能的正常执行
    this.getArticleData();

    const { data } = await getArticleInfo(this.hash);
    console.log('Article info :', data);

    const signs = await getSignInfo(data.id);
    // eslint-disable-next-line prefer-destructuring
    this.sign = signs[0];
    console.log('sign :', this.sign); // fix: ReferenceError: sign is not defined

    this.readamount = data.read;

    const signid = this.sign.id;
    const shares = localStorage.getItem(`sign id : ${signid}'s shares`);
    // eslint-disable-next-line no-shadow
    const setShares = ({ signid }) => {
      getSharesbysignid({ signid })
        .then((response) => {
          // eslint-disable-next-line no-shadow
          const shares = response.data;
          console.log('shares : ', shares);
          localStorage.setItem(`sign id : ${signid}'s shares`, JSON.stringify(shares));
          this.shares = shares; // for watch
        });
    };

    // Use cache or do first time downloading
    if (shares) {
      this.shares = JSON.parse(shares);
    } else { // first time need await
      await setShares({ signid });
    }

    // Setup
    this.isTotalSupportAmountVisible = true;
    this.setisSupported();

    // Update to latest data
    setShares({ signid });

    addReadAmount({ articlehash: this.hash });
  },
  beforeDestroy() {
    // 组件销毁之前 销毁clipboard
    this.clipboard.destroy();
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
    shares: [],
    amount: 0.0000,
    comment: '',
    isSupported: RewardStatus.LOADING,
    isTotalSupportAmountVisible: false, // 正在加载和加载完毕的文本切换
    totalSupportedAmount: 0.0000,
    visible3: false,
    v3: '',
    v5: '',
    readamount: 0,
    clipboard: null,
  }),
  watch: {
    post({ author, title }) {
      // 当文章从 IPFS fetched 到， post 会更新，我们要更新网页 title
      document.title = `${title} by ${author} - Smart Signature`;
    },
    sign({ author }) {
      this.post.author = author;
    },
    currentUsername() {
      this.setisSupported(this.shares);
    },
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    initClipboard() {
      this.clipboard = new Clipboard('.button-share');
      this.clipboard.on('success', (e) => {
        this.$Modal.info({
          title: '提示',
          content: '复制成功',
        });
        e.clearSelection();
      });
      this.clipboard.on('error', () => {
        this.$Modal.error({
          title: '提示',
          content: '该浏览器不支持自动复制',
        });
      });
    },
    async getArticleData() {
      const { data } = await getArticleData(this.hash);
      this.post = data.data;
      console.info('post :', this.post);
    },
    handleClose() {
      this.visible3 = false;
    },
    handleCommentChange(v) {
      this.comment = v;
      console.log('comment :', this.comment);
    },
    handleChange(v) {
      this.amount = v;
      console.log('amount :', this.amount);
    },
    setisSupported() {
      const { shares } = this;
      if (this.scatterAccount !== null && shares !== []) {
        const share = shares.find(element => element.author === this.currentUsername);
        if (share !== undefined) {
          console.log('Current user\'s share :', share);
          this.isSupported = RewardStatus.REWARDED;
        } else {
          this.isSupported = RewardStatus.NOT_REWARD_YET;
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
      const { comment, sign } = this;
      const amount = parseFloat(this.amount);
      if (Number.isNaN(amount) || amount < 100 ) { // amount / 10000
        this.$Message.warning('请输入正确的金额 最小赞赏金额为 0.01 EOS');
        return;
      }

      console.log('final amount :', amount);
      console.log('final comment :', comment);      
      
      await getAuth();

      // eslint-disable-next-line camelcase
      const sign_id = sign.id;
      const referrer = this.getInvite;
      console.log('referrer :', referrer);
      this.isSupported = RewardStatus.LOADING;
      try {
        await support({ amount, sign_id, referrer });
        console.log('Send comment...');
        await sendComment({ comment, sign_id },
          (error, response) => {
            console.log(response);
            if (error) throw new Error(error);
          });
        this.isSupported = RewardStatus.REWARDED;
        this.$Message.success('赞赏成功！');
        // tricky speed up
        this.totalSupportedAmount += parseFloat(amount);
      } catch (error) {
        console.log(JSON.stringify(error));
        this.$Message.error('赞赏失败，可能是由于网络故障或账户余额不足。\n请检查网络或账户余额。');
        this.isSupported = RewardStatus.NOT_REWARD_YET;
      }
    },
    async share() {
      try {
        if (!this.isScatterConnected) await this.connectScatterAsync();
        console.info(this.isScatterConnected);
        // await this.suggestNetworkAsync();
        if (!this.isScatterConnected) throw new Error('no');
        await this.loginScatterAsync();
      } catch (e) {
        console.warn('Unable to connect wallets');
        this.$Modal.error({
          title: '无法与你的钱包建立链接',
          content: '请检查钱包是否打开并解锁',
        });
      }
    },
  },
};
</script>


<style scoped>
.break_all {
  word-break: break-all;
}
.markdown-body {
  padding: 20px;
  font-family: -apple-system,SF UI Text,Arial,
              PingFang SC,Hiragino Sans GB,
              Microsoft YaHei,WenQuanYi Micro Hei,sans-serif;
  color: #2f2f2f;
}
.footer-article {
  margin-bottom: 20px;
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
