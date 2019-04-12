/* eslint-disable no-shadow */
<template>
  <div class="article">
    <BaseHeader
      :pageinfo="{ left:'notback', title: 'Smart Signature', rightPage: 'home',
      needLogin: true, }"/>
    <header class="ta_header">
      <h1 dir="auto">{{post.title}}</h1>
      <p>
      <Avatar
        icon="ios-person" class="avatar-size" size="small" />
      <router-link
        class="author"
        :to="{ name: 'User', params: { username:post.author }}">
        Author: {{post.author}}
      </router-link>
      {{articleCreateTime}} | {{article.read || 0}}阅读</p>
      <p class="break_all">IPFS Hash: {{article.hash}}</p>
    </header>
    <mavon-editor v-show="false" style="display: none;"/>
    <div class="markdown-body" v-html="compiledMarkdown"></div>
    <div class="commentslist-title">赞赏队列 ({{article.ups || 0}})</div>

    <div class="comments">
      <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
          <CommentCard :comment="a" v-for="a in sortedComments" :key="a.timestamp"/>
        </div>
        <p class="loading-stat">{{displayAboutScroll}}</p>
      </za-pull>
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
          <button v-if="isSupported===-1" class="button-support" @click="share">赞赏<img src="@/assets/img/icon_support.png" /></button>
          <button v-if="isSupported===0" class="button-support" disabled>赞赏中<img src="@/assets/img/icon_support.png" /></button>
          <button v-else-if="isSupported===1"
            class="button-support" @click="visible3=true" >赞赏<img src="@/assets/img/icon_support.png" /></button>
          <button v-else-if="isSupported===2" class="button-support" disabled>已赞赏<img src="@/assets/img/icon_support.png" /></button>

          <button class="button-share"
            :data-clipboard-text="getClipboard"
            @click="share">分享<img src="@/assets/img/icon_share.png" /></button>
      </div>
    </footer>
    <za-modal :visible="visible3" @close="handleClose" radius="" @maskClick="visible3 = false" :showClose="true">
        <div slot="title" style="textAlign: center;">赞赏此文章</div>
        <div class="support-input">
        <za-input
          auto-height="" v-model="comment" type="textarea"
          rows="4"
          placeholder="输入推荐语…">
        </za-input>
        </div>
        <div class="support-input">
          <input class="support-input__amount" placeholder="请输入 EOS" v-model="amount" type="text"  @input="handleChange" />
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
} from '@/api';
import { support } from '@/api/signature';
import 'mavon-editor/dist/css/index.css';
import moment from 'moment';
// import CommentsList from './CommentsList.vue';
import { CommentCard } from '@/components/';

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
      console.log(this.article);
      const { currentUsername } = this;
      const { protocol, host } = window.location;
      const articleUrl = `${protocol}//${host}/article/${this.article.id}`;
      const shareLink = this.isLogined
        ? `${articleUrl}?invite=${currentUsername}`
        : articleUrl;
      return `《${this.article.title}》by ${this.article.username} \n${shareLink}\n赞赏好文，分享有收益 ！`;
    },
    getDisplayedFissionFactor() {
      return this.article.fission_factor / 1000;
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
      // no need to save inviter
      // we can use computed
      let { invite } = this.$route.query;
      if (!invite) {
        invite = null;
      }
      return invite;
    },
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有 comments 已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
    sortedComments() {
      // if need change to asc, swap a & b
      return this.comments.slice(0) // 使用slice创建数组副本 消除副作用
        .sort((a, b) => (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime());
    },
  },
  /*
    created
    实例已经创建完成之后被调用。在这一步，实例已完成以下的配置：
    数据观测(data observer)，属性和方法的运算， watch/event 事件回调。
    然而，挂载阶段还没开始，$el 属性目前不可见。
  */
  created() {
    document.title = '正在加载文章 - Smart Signature';
    this.initClipboard(); // 分享按钮功能需要放在前面 保证功能的正常执行

    const { hash } = this;
    this.getArticleInInfo(hash);

    // Setup
    this.isTotalSupportAmountVisible = true;
    this.setisSupported();
  },
  mounted() {
  },
  beforeDestroy() {
    // 组件销毁之前 销毁clipboard
    this.clipboard.destroy();
  },
  data: () => ({
    isTheEndOfTheScroll: false,
    signId: null,
    comments: [],
    refreshing: false,
    busy: false,
    page: 1,
    post: {
      author: 'Loading...',
      title: 'Loading...',
      content: '**Please wait for the connection to IPFS**',
    },
    article: {
      author: 'Loading...',
      // NO MORE Cannot read property 'fission_factor' of null
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
  }),
  watch: {
    post({ author, title }) {
      // 当文章从 IPFS fetched 到， post 会更新，我们要更新网页 title
      document.title = `${title} by ${author} - Smart Signature`;
    },
    currentUsername() {
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
    async getArticleInInfo(hashOrId) {
      // 如果是id查询查询hash然后查询文章 否则直接用hash查询文章
      const reg = /^[0-9]*$/;
      if (reg.test(hashOrId)) {
        await getArticleInHash(hashOrId).then((res) => {
          if (res.status === 200) {
            const { hash } = res.data;
            this.setArticleData(hash);
            this.setArticleInfo(hash);
            addReadAmount({ articlehash: hash }); // 增加文章阅读量
          }
        }).catch((err) => {
          console.log(err);
          this.$Message.error('发生错误请重试');
        });
      } else {
        this.setArticleData(hashOrId);
        this.setArticleInfo(hashOrId);
        addReadAmount({ articlehash: hashOrId }); // 增加文章阅读量
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
      // amount
      const { article, comment } = this;

      const amount = parseFloat(this.amount);
      if (Number.isNaN(amount) || amount < 0.01) {
        this.$Message.warning('请输入正确的金额 最小赞赏金额为 0.01 EOS');
        return;
      }

      console.log('final amount :', amount);
      console.log('final comment :', comment);

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
          // eslint-disable-next-line camelcase
          await sendComment({ comment, sign_id: signId },
            (error, response) => {
              console.log(response.statusCode);
              if (response.statusCode !== 200) throw new Error(error);
              if (error) throw new Error(error);
            });
        } catch (error) {
          console.log('Resend comment...');
          // eslint-disable-next-line camelcase
          await sendComment({ comment, sign_id: signId },
            (error, response) => {
              console.log(response.statusCode);
              if (response.statusCode !== 200) throw new Error(error);
              if (error) throw new Error(error);
            });
        }
        this.isSupported = RewardStatus.REWARDED;
        this.$Message.success('赞赏成功！');
        // tricky speed up
        // 前端手动加一下钱 立马调接口获取不到 value 值
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
    async share() { // 只是為了 await
      try {
        await this.loginCheck();
      } catch (error) {
        // console.log(error);
        this.$Message.error('失败');
      }
    },
    async loginCheck() { // https://juejin.im/post/5a2df151f265da4304068fc1
      const { isScatterConnected, isScatterLoggingIn } = this;
      try { // 錢包登录
      // 開了網頁之後，才開 Scatter ，這時候沒有做 connectScatterAsync 就登录不能
      // 昨天沒加檢查已連而已 - Roger that
        console.log('scatter status', isScatterConnected);
        if (!isScatterConnected) {
          await this.connectScatterAsync();
        }
        if (isScatterConnected && !isScatterLoggingIn) {
          await this.loginScatterAsync()
            .then(() => {
              this.$Message.success('自动登录成功');
              this.setisSupported();
            });
        }
      } catch (error) {
        const errMeg = 'Unable to log-in to wallet';
        console.warn(errMeg); // 一句滿意的英文 log
        console.warn('Reason :', error); // 一份可愛的理由
        this.$Modal.error({ // 親切的用戶提示
          title: '无法与你的钱包建立链接並登录',
          content: '请检查钱包是否打开并解锁',
        });
        throw errMeg; // 歡喜的 throw
      }
    },
    async getArticlesList(signId, page) {
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
          }
          this.setisSupported();
        });
    },
    loadMore() {
      if (this.signId === null || this.signId === undefined) return; // 默认会加载一次 如果没有id 后面不执行， 由上面的方法调用一次
      if (this.isTheEndOfTheScroll) return;
      this.busy = true;
      this.getArticlesList(this.signId, this.page);
      this.page += 1;
    },
    async refresh() {
      this.refreshing = true;
      this.comments.length = 0;
      await this.getArticlesList(this.signId, 1);
      this.refreshing = false;
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
</style>
<style src="./index.css" scoped></style>
