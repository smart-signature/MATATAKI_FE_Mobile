/* eslint-disable no-shadow */
<template>
  <div class="article">
    <BaseHeader :pageinfo="{ title: `Smart Signature`, rightPage: 'home',
                   needLogin: false, }">
      <div slot="right" @click="opr = !opr" v-if="isMe">
        <img src="@/assets/more.svg" alt="more">
      </div>
    </BaseHeader>
    <!--<za-nav-bar>
      <div slot="left">
        <router-link :to="{ name: 'home' }">
            <Icon type="ios-home" :size="24" />
        </router-link>
      </div>
      <div slot="title">Smart Signature</div>
      <div slot="right" @click="opr = !opr" v-if="isMe">
        <img src="@/assets/more.svg" alt="more">
      </div>
    </za-nav-bar>-->
    <transition name="fade" mode="out-in">
      <div class="dropdown" v-show="opr">
        <div class="dropdown-item" @click="$router.push({name: 'Edit', params: { id: article.id }, query: { hash: hash }})">编辑</div>
        <div class="dropdown-item" @click="delArticleButton">删除</div>
      </div>
    </transition>
    <header class="ta_header">
      <h1 dir="auto">{{post.title}}</h1>
      <p>
        <Avatar icon="ios-person" class="avatar-size" size="small" />
        <router-link class="author"
          :to="{ name: 'User', params: { username:post.author }}">
          Author: {{post.author}}
        </router-link>
        {{articleCreateTime}} | {{article.read || 0}}阅读
      </p>
      <p class="break_all">IPFS Hash: {{article.hash}}</p>
      <!--<Button v-if="isMe"
        @click="delArticleButton" class="del-acticle" type="error"
        icon="md-close" size="small">删除</Button>-->
      <p><br/><a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a></p>
    </header>
    <mavon-editor v-show="false" style="display: none;"/>
    <div class="markdown-body" v-html="compiledMarkdown"></div>
    <div class="commentslist-title">赞赏队列 ({{article.ups || 0}})</div>
    <div class="comments">
    <!-- <za-pull :on-refresh="refresh" :refreshing="refreshing"> -->
      <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
        <CommentCard :comment="a" v-for="a in sortedComments" :key="a.timestamp"/>
      </div>
      <p class="loading-stat">{{displayAboutScroll}}</p>
    <!-- </za-pull> -->
    </div>

    <footer class="footer">
      <div class="footer-block">
        <div class="amount">
          <div>
            <img class="amount-img" src="@/assets/img/icon_amount.png" />
            {{computedTotalSupportedAmount}}
          </div>
          <div class="amount-text">赞赏总额</div>
        </div>
        <div class="fission">
          <div>
            <img class="amount-img" src="@/assets/img/icon_fission.png" />
            {{getDisplayedFissionFactor}}
          </div>
          <div class="amount-text">裂变系数</div>
        </div>
      </div>
      <div class="footer-block">
          <button class="button-support"
            v-if="isSupported===-1"
            @click="share">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support"
            v-if="isSupported===0"
            disabled>赞赏中<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support"
            v-else-if="isSupported===1"
            @click="visible3=true">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support"
            v-else-if="isSupported===2"
            disabled>已赞赏<img src="@/assets/img/icon_support.png"/></button>

          <button class="button-share"
            :data-clipboard-text="getClipboard"
            @click="share">分享<img src="@/assets/img/icon_share.png" /></button>
      </div>
    </footer>
    <!-- 赞赏对话框 zarm -->
    <za-modal
      :visible="visible3" @close="handleClose" radius=""
      @maskClick="visible3 = false" :showClose="true">
        <div slot="title" style="textAlign: center;">赞赏此文章</div>
        <div class="support-input">
        <za-input
          auto-height="" v-model="comment" type="textarea"
          rows="4"
          placeholder="输入推荐语…">
        </za-input>
        </div>
        <div class="support-input">
          <input class="support-input__amount"
            placeholder="请输入 EOS" v-model="amount" type="text"  @input="handleChange"/>
        </div>
        <button class="support-button" @click="support">赞赏</button>
    </za-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Clipboard from 'clipboard';
import { mavonEditor } from 'mavon-editor';
import {
  getArticleData, getArticleInfo, getSharesbysignid,
  addReadAmount, sendComment, getArticleInHash,
  delArticle,
} from '@/api';
import { support } from '@/api/signature';
import 'mavon-editor/dist/css/index.css';
import moment from 'moment';
// import CommentsList from './CommentsList.vue';
import { CommentCard } from '@/components/';
import { sleep } from '@/common/methods';

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();

const RewardStatus = { // 0=加载中,1=未打赏 2=已打赏, -1未登录
  NOT_LOGGINED: -1,
  LOADING: 0,
  NOT_REWARD_YET: 1,
  REWARDED: 2,
};

export default {
  name: 'Article',
  props: ['hash'],
  components: { mavonEditor, CommentCard },
  computed: {
    ...mapGetters(['currentUsername']),
    ...mapState(['isScatterConnected', 'isScatterLoggingIn', 'scatterAccount']),
    isLogined() {
      return this.scatterAccount !== null;
    },
    compiledMarkdown() {
      return markdownIt.render(this.post.content);
    },
    getClipboard() {
      const { article, currentUsername } = this;
      const { protocol, host } = window.location;
      // console.debug(this.article);
      const articleUrl = `${protocol}//${host}/article/${article.id}`;
      const shareLink = this.isLogined
        ? `${articleUrl}?invite=${currentUsername}`
        : articleUrl;
      return `《${article.title}》by ${article.username} \n${shareLink}\n赞赏好文，分享有收益 ！`;
    },
    getDisplayedFissionFactor() {
      return this.article.fission_factor / 1000;
    },
    getUrl() {
      const { article } = this;
      const { protocol, host } = window.location;
      return `${protocol}//${host}/article/${article.id}`;
    },
    computedTotalSupportedAmount() {
      // 如果为 0 个EOS 显示为 0 比 0.0000 适合
      return this.totalSupportedAmount ? (this.totalSupportedAmount / 10000).toFixed(4) : 0;
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
      const { invite } = this.$route.query;
      return !invite ? null : invite;
    },
    displayAboutScroll() {
      return this.isTheEndOfTheScroll
        ? '🎉 哇，你真勤奋，所有 comments 已经加载完了～ 🎉'
        : '😄 勤奋地加载更多精彩内容 😄';
    },
    sortedComments() {
      // if need change to asc, swap a & b
      return this.comments.slice(0) // 使用slice创建数组副本 消除副作用
        .sort((a, b) => (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime());
    },
    isMe() {
      console.log('isme', this.article, this.currentUsername);
      return this.article.author === this.currentUsername;
    },
  },
  created() {
    const { getArticle, hash, initClipboard } = this;
    document.title = '正在加载文章 - Smart Signature';
    initClipboard(); // 分享按钮功能需要放在前面 保证功能的正常执行

    getArticle(hash);
  },
  mounted() {
    !(function (d, i) {
      if (!d.getElementById(i)) {
        const j = d.createElement('script');
        j.id = i;
        j.src = 'https://widgets.getpocket.com/v1/j/btn.js?v=1';
        const w = d.getElementById(i);
        d.body.appendChild(j);
      }
    }(document, 'pocket-btn-js'));
  },
  beforeDestroy() {
    this.clipboard.destroy(); // 组件销毁之前 销毁clipboard
  },
  data: () => ({
    isTheEndOfTheScroll: false,
    signId: null,
    comments: [],
    // refreshing: false,
    busy: false,
    page: 1,
    post: {
      author: 'Loading...',
      title: 'Loading...',
      content: '**Please wait for the connection to IPFS**',
    },
    article: {
      author: 'Loading...',
      create_time: '',
      fission_factor: 0,
    },
    shares: [],
    amount: '',
    comment: '',
    isSupported: RewardStatus.LOADING,
    isTotalSupportAmountVisible: false, // 正在加载和加载完毕的文本切换
    totalSupportedAmount: 0,
    visible3: false,
    clipboard: null,
    articleCreateTime: ' 月 日',
    opr: false,
  }),
  head: {
    title() {
      const { post } = this;
      return {
        inner: `${post.title} by ${post.author}`,
        separator: '-',
        complement: 'Smart Signature',
      };
    },
    // Meta tags
    meta() {
      const { article, getUrl, post } = this;
      return [
        // Open Graph
        { p: 'og:url', c: getUrl },
        { p: 'og:site_name', c: 'Smart Signature' },
        { p: 'og:type', c: 'article' },
        { p: 'og:title', c: post.title },
        { p: 'og:description', c: post.desc },
        { p: 'article:author', c: post.author },
        { p: 'article:published_time', c: article.create_time },
        { p: 'og:image', c: 'https://example.com/image.jpg' },
      ];
    },
  },
  watch: {
    article() {
      this.$emit('updateHead');
    },
    post() {
      this.$emit('updateHead');
    },
    currentUsername() {
      this.setisSupported();
    },
    shares() {
      this.setisSupported();
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
    // 通过id 获取hash值
    async getArticle(hashOrId) {
      const { setArticleData, setArticleInfo } = this;
      const setArticle = (hash) => {
        setArticleData(hash);
        setArticleInfo(hash);
        addReadAmount({ articlehash: hash }); // 增加文章阅读量
        this.isTotalSupportAmountVisible = true;
      };

      // 如果是id查询查询hash然后查询文章 否则直接用hash查询文章
      const reg = /^[0-9]*$/;
      if (reg.test(hashOrId)) {
        await getArticleInHash(hashOrId).then((res) => {
          if (res.status === 200) {
            const { hash } = res.data;
            setArticle(hash);
          }
        }).catch((err) => {
          console.log(err);
          this.$Message.error('发生错误请重试');
        });
      } else {
        setArticle(hashOrId);
      }
    },
    async setArticleData(hash) {
      const { data } = await getArticleData(hash);
      this.post = data.data;
      console.info('post :', this.post);
    },
    async setArticleInfo(hash) {
      const { data } = await getArticleInfo(hash);
      this.article = data;
      console.info('Article info :', this.article);
      const { article, page } = this;
      this.articleCreateTime = moment(article.create_time).format('MMMDo');
      this.totalSupportedAmount = article.value;
      this.signId = article.id;
      // console.debug(this.signId);
      await this.getArticlesList(article.id, page);
      this.page += 1;
    },
    handleClose() {
      this.visible3 = false;
    },
    handleChange(e) {
      // 小数点后三位 如果后面需要解除限制修改正则  {0,3}
      e.target.value = (e.target.value.match(/^\d*(\.?\d{0,3})/g)[0]) || null;
      this.amount = e.target.value;
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
      } else {
        this.isSupported = RewardStatus.NOT_LOGGINED;
      }
    },
    async support() {
      const { article, comment } = this;
      // amount
      const amount = parseFloat(this.amount);
      if (Number.isNaN(amount) || amount < 0.01) {
        this.$Message.warning('请输入正确的金额 最小赞赏金额为 0.01 EOS');
        return;
      }
      console.info('final amount :', amount, ', comment :', comment);

      this.visible3 = false;
      try {
        await this.loginCheck();
      } catch (error) {
        this.$Message.error('本功能需登录');
        return;
      }

      const signId = article.id;
      const referrer = this.getInvite;
      console.log('referrer :', referrer);

      try {
        this.isSupported = RewardStatus.LOADING;
        await support({ amount, signId, referrer });
        try {
          console.log('Send comment...');
          await sendComment({ comment, signId },
            ({ error, response }) => {
              console.log(error, response);
              if (response.status !== 200 || error) throw new Error(error); // wrong way
            });
        } catch (error) { // wrong way
          console.error(error);
          console.log('Resend comment...');
          await sendComment({ comment, signId },
            ({ error, response }) => {
              console.log(error, response);
              if (response.status !== 200 || error) throw new Error(error); // wrong way
            });
        }
        this.isSupported = RewardStatus.REWARDED;
        this.$Message.success('赞赏成功！');
        // tricky speed up, 前端手动加一下钱 立马调接口获取不到 value 值
        this.totalSupportedAmount += parseFloat(amount * 10000);
        // 手动添加一个赞赏
        const time = new Date(Date.now());
        const timeNow = time.getTime() + time.getTimezoneOffset()
                   * 60000;

        this.comments.push({
          author: this.scatterAccount.name,
          timestamp: timeNow,
          quantity: `${amount} EOS`,
          message: comment,
        });
      } catch (error) {
        console.log(JSON.stringify(error));
        this.$Message.error('赞赏失败，可能是由于网络故障或账户余额不足。\n请检查网络或账户余额');
        this.isSupported = RewardStatus.NOT_REWARD_YET;
      }
    },
    share() {
      try {
        this.loginCheck();
      } catch (error) {
        // console.log(error);
        // this.$Message.error('失败');
      }
    },
    async loginCheck() { // https://juejin.im/post/5a2df151f265da4304068fc1
      const { isScatterConnected, isScatterLoggingIn, loginScatterAsync } = this;
      try { // 錢包登录
        // 開了網頁之後，才開 Scatter ，這時候沒有做 connectScatterAsync 就登录不能
        console.log('scatter status', isScatterConnected);
        if (!isScatterConnected) { await this.connectScatterAsync(); }
        if (isScatterConnected && !isScatterLoggingIn) {
          await loginScatterAsync().then(() => {
            this.$Message.success('自动登录成功');
          });
        }
      } catch (error) {
        const errMeg = 'Unable to log-in to wallet,';
        console.warn(errMeg, 'reason :', error); // 一份可愛的錯誤報告
        this.$Modal.error({ // 親切的用戶提示
          title: '无法与你的钱包建立链接並登录',
          content: '请检查钱包是否打开并解锁',
        });
        throw errMeg; // 歡喜的 throw
      }
    },
    async getArticlesList(signId, page) {
      this.busy = true;
      await getSharesbysignid(signId, page)
        .then((response) => {
          console.log('shares : ', response.data);
          const { data } = response;
          this.shares = data;
          if (data.length === 0) {
            this.busy = true;
            this.isTheEndOfTheScroll = true;
          } else {
            data.map((a) => {
              this.comments.push({
                author: a.author,
                timestamp: a.create_time,
                quantity: `${parseFloat(a.amount) / 10000} EOS`,
                message: a.comment,
              });
              return true;
            });
            // 列表最后一列小于二十显示加载完
            if (data.length > 0 && data.length < 20) this.isTheEndOfTheScroll = true;
            this.busy = false;
            this.page += 1;
          }
        });
    },
    async loadMore() {
      const {
        getArticlesList, isTheEndOfTheScroll, page, signId,
      } = this;
      // 默认会加载一次 如果没有id 后面不执行， 由上面的方法调用一次
      if (!signId) return;
      if (isTheEndOfTheScroll) return;
      await getArticlesList(signId, page);
    },
    // async refresh() {
    //   this.refreshing = true;
    //   this.comments.length = 0;
    //   await this.getArticlesList(this.signId, 1);
    //   this.refreshing = false;
    // },
    // 删除文章
    delArticleButton() {
      if (this.article.author !== this.currentUsername) {
        this.$Message.error('您无权删除他人文章');
        return;
      }
      const jumpTo = name => this.$router.push({ name });
      const delSuccess = async () => {
        this.$Modal.remove();
        this.$Notice.success({
          title: '删除成功',
          desc: '三秒后自动跳转到首页',
        });
        await sleep(3000);
        jumpTo('home');
      };
      const fail = (err) => {
        this.$Modal.remove();
        this.$Message.error('删除错误');
        console.log('error', err);
      };
      const delArticleFunc = async (id) => {
        if (!id) return fail('没有id');
        await delArticle({ id },
          ({ error, response }) => {
            console.log(error, response);
            if (response.status !== 200 || error || !response) return fail(error);
            delSuccess();
          });
      };
      this.$Modal.confirm({
        title: '提示',
        content: '<p>该文章已上传至 IPFS 永久保存, 本次操作仅删除智能签名中的显示。</p>',
        loading: true,
        onOk: () => {
          delArticleFunc(this.article.id);
        },
      });
    },
  },
};
</script>

<style scoped>
.break_all {
  word-break: break-all;
}
.footer-article {
  margin-bottom: 20px;
}
.article {
  text-align: left;
  max-width: 750px;
  margin: 0 auto;
  position: relative;
}
.ta .tac .iframe_wrap,
.ta .tac iframe,
.ta .tac img,
.ta .tac video {
  max-width: 100%;
  vertical-align: top;
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

.ta a[href] {
  color: inherit;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.44);
  text-decoration: none;
  border-bottom: 0.1em solid rgba(0, 0, 0, 0.7);
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

.markdown-body.tac {
    margin: 20px;
}


/* dialog */
/* 改变层级 但高于普通元素的层级 */
.za-modal {
  z-index: 99;
}
.za-modal .za-modal-dialog{
  background-color: #000!important;
}
.support-input {
    margin: 16px 0;
    border: 1px solid #dadada;
    padding: 8px;
    border-radius: 3px;
}
.support-input__amount {
    width: 100%;
    border: none;
    outline: none;
}
.support-button {
    display: block;
    width: 100%;
    border: none;
    outline: none;
    background: #478970;
    color: #fff;
    line-height: 46px;
    border-radius: 3px;
}
.dropdown {
    position: absolute;
    background-color: #434343;
    color: #fff;
    top: 40px;
    right: 16px;
    cursor: pointer;
}
.dropdown-item {
    padding: 8px 20px;
    font-size: 14px;
}
.dropdown-item:hover {
    background-color: #2f2f2f;
}
a:link {
    color: black;
}
a:visited {
    color: black;
}
a:hover a:active {
    color: black;
}
a:active {
    color: black;
}
</style>
<style src="./index.css" scoped></style>
