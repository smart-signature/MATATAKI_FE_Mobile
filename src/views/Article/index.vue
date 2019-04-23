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
          {{post.author}}
        </router-link>
        {{articleCreateTimeComputed}} | {{article.read || 0}}阅读
      </p>
      <p class="break_all">IPFS Hash: {{article.hash}}</p>
    </header>
    <mavon-editor v-show="false" style="display: none;"/>
    <div class="markdown-body" v-html="compiledMarkdown"></div>
    <div class="pocket">
      <a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a>
    </div>
    <div class="commentslist-title">赞赏队列 ({{article.ups || 0}})</div>
    <CommentsList class="comments" :signId="signId" />
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
            @click="b4support">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support"
            v-if="isSupported===0"
            disabled>赞赏中<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support"
            v-else-if="isSupported===1"
            @click="b4support">赞赏<img src="@/assets/img/icon_support.png"/></button>
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
import CommentsList from './CommentsList.vue';
import moment from 'moment';
import { sleep, isNDaysAgo } from '@/common/methods';

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
  components: { mavonEditor, CommentsList },
  computed: {
    ...mapState('scatter', {
      isScatterConnected: state => state.isConnected,
      isScatterLoggingIn: state => state.isLoggingIn,
      scatterAccount: state => state.account,
    }),
    ...mapGetters(['currentUsername']),
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
    articleCreateTimeComputed() {
      if (!this.articleCreateTime) return '';
      const time = moment(this.articleCreateTime);
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
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
    signId: null,
    comments: [],
    // refreshing: false,
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
    articleCreateTime: '',
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
    ...mapActions(['idCheck']),
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
      this.articleCreateTime = article.create_time;
      this.totalSupportedAmount = article.value;
      this.signId = article.id;
      // console.debug(this.signId);
      await this.getArticlesList(article.id, page);
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
    async b4support() {
      this.$Message.info('帐号检测中...');
      await this.idCheck().then(() => {
        this.$Message.success('检测通过');
        this.visible3 = true;
      }).catch(() => {
        this.$Message.error('本功能需登录');
        /*
        this.$Modal.error({
            title: '无法与你的钱包建立链接並登录',
            content: '请检查钱包是否打开并解锁',
        }); */
      });
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
      await this.b4support();

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
        this.idCheck();
      } catch (error) {
        // console.log(error);
        // this.$Message.error('失败');
      }
    },
    async getArticlesList(signId) {
      await getSharesbysignid(signId, 1)
        .then((response) => {
          console.log('shares : ', response.data);
          const { data } = response;
          this.shares = data;
        });
    },
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

<style src="./index.css" scoped></style>
