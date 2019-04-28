/* eslint-disable no-shadow */
<template>
  <div class="article">
    <BaseHeader :pageinfo="{ title: `Smart Signature`, rightPage: 'home', needLogin: false, }">
      <img class="more" src="@/assets/more.svg" alt="more" slot="right" @click="opr = !opr" v-if="isMe">
      <div class="information" slot="info" @click="infoModa = true">
        <img src="@/assets/information.svg" alt="information">
        <span>攻略</span>
      </div>

    </BaseHeader>
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
          {{article.nickname || post.author}}
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
    <CommentsList class="comments" :signId="signId" :isRequest="isRequest" @stopAutoRequest="(status) => isRequest = status" />
    <footer class="footer">
      <div class="footer-block">
        <Tooltip content="本文收到的赞赏总额" placement="top-start">
          <div class="amount">
            <div>
              <img class="amount-img" src="@/assets/img/icon_amount.png" />
              {{computedTotalSupportedAmount}}
            </div>
            <div class="amount-text">赞赏总额</div>
          </div>
        </Tooltip>
        <Tooltip content="你可得到的最高回报=赞赏额*裂变系数">
          <div class="fission">
            <div>
              <img class="amount-img" src="@/assets/img/icon_fission.png" />
              {{getDisplayedFissionFactor}}
            </div>
            <div class="amount-text">裂变系数</div>
          </div>
        </Tooltip>
      </div>
      <div class="footer-block">
        <Tooltip content="赞赏的文章可以在赞赏列表中查看">
          <button class="button-support" v-if="isSupported===-1" @click="b4support">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-if="isSupported===0" disabled>赞赏中<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-else-if="isSupported===1" @click="visible3 = true">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-else-if="isSupported===2" disabled>已赞赏<img src="@/assets/img/icon_support.png"/></button>
        </Tooltip>
        <Tooltip content="先赞赏后分享，好友赞赏你可得更多" placement="top-end">
          <button class="button-share" :data-clipboard-text="getClipboard" @click="share">分享<img src="@/assets/img/icon_share.png" /></button>
        </Tooltip>
      </div>
    </footer>
    <!-- 赞赏对话框 zarm -->
    <za-modal
      :visible="visible3" @close="() => visible3 = false" radius=""
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

    <!-- 文章 Info -->
    <ArticleInfo :infoModa="infoModa" @changeInfo="(status) => infoModa = status" />

  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import Clipboard from 'clipboard';
import { mavonEditor } from 'mavon-editor';
import {
  getArticleDatafromIPFS,
  getArticleInfo,
  addReadAmount, sendComment,
  delArticle, getAuth,
} from '@/api';
import { support } from '@/api/signature';
import 'mavon-editor/dist/css/index.css';
import moment from 'moment';
import CommentsList from './CommentsList.vue';
import { sleep, isNDaysAgo } from '@/common/methods';
import ArticleInfo from './ArticleInfo.vue';

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();

const RewardStatus = { // 0=加载中,1=未打赏 2=已打赏, -1未登录
  NOT_LOGGINED: -1,
  LOADING: 0,
  NOT_REWARD_YET: 1,
  REWARDED: 2,
};

export default {
  async beforeRouteEnter(to, from, next) {
    const { hash } = to.params; // url 传进来的 hash 或者是 id
    let article = null; // 文章信息
    let post = null; // 文章内容

    // 获取文章内容 from ipfs
    const getArticleDatafromIPFSFunc = async (hash) => {
      await getArticleDatafromIPFS(hash).then(({ data }) => {
        post = data.data;
        next((vm) => { // 通过 `vm` 访问组件实例
          // console.info('article :', article, 'post :', post);
          vm.setArticle(article);
          vm.setPost(post);
          vm.$emit('updateHead');
        });
      }).catch((err) => {
        console.log(err, '获取文章内容失败请重试');
        next((vm) => {
          vm.$Message.error('获取文章内容失败请重试');
        });
      });
    };
    // 获取文章信息
    const getArticleInfoFunc = async (hashOrId) => {
      await getArticleInfo(hashOrId, ({ error, response }) => {
        if (error) {
          console.log(error, '获取文章信息失败请重试');
          next((vm) => {
            vm.$Message.error('获取文章信息失败请重试');
          });
        } else {
          article = response.data;
          getArticleDatafromIPFSFunc(response.data.hash);
        }
      });
    };
    getArticleInfoFunc(hash);
  },
  name: 'Article',
  props: ['hash'],
  components: { mavonEditor, CommentsList, ArticleInfo },
  data() {
    return {
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
      amount: '',
      comment: '',
      isSupported: RewardStatus.NOT_LOGGINED,
      totalSupportedAmount: 0,
      visible3: false,
      clipboard: null,
      articleCreateTime: '',
      opr: false,
      infoModa: false,
      isRequest: false,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    isLogined() {
      return this.currentUsername !== null;
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
    document.title = '正在加载文章 - Smart Signature';
    this.initClipboard(); // 分享按钮功能需要放在前面 保证功能的正常执行
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
        //  Twitter
        { n: 'twitter:card', c: post.desc },
        // { n: 'twitter:site', c: '@Smart Signature' },
        // { n: 'twitter:creator', c: '@article' }, // @username for the content creator / author.
        // 未來支持推特連接後， 可以顯示其推特帳號在推特 card 預覽裡
      ];
    },
  },
  watch: {
    article() {
      this.setisSupported();
      this.$emit('updateHead');
    },
    post() {
      this.$emit('updateHead');
    },
    currentUsername() {
      this.setisSupported();
    },
    isRequest(newVal) {
      // 监听是否请求默认为false被改变为true下面不执行，请求完毕又被改变为false执行下列方法
      if (!newVal) {
        this.getArticleInfo(this.hash);
      }
    },
  },
  methods: {
    ...mapActions(['idCheck']),
    // 分享功能
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
    // 得到文章信息 hash id, supportDialog 为 true 则只更新文章信息
    async getArticleInfo(hash, supportDialog = false) {
      await getArticleInfo(hash, ({ error, response }) => {
        if (error) {
          this.$Message.error('获取文章信息失败请重试');
          console.log(error);
        } else {
          this.setArticle(response.data, supportDialog);
          // 默认会执行获取文章方法，更新文章调用则不需要获取内容
          if (!supportDialog) {
            this.getArticleDatafromIPFS(response.data.hash);
          }
        }
      });
    },
    // 获取文章内容 from ipfs
    async getArticleDatafromIPFS(hash) {
      await getArticleDatafromIPFS(hash).then(({ data }) => {
        this.setPost(data.data);
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取文章内容失败请重试');
      });
    },
    // 设置文章
    async setArticle(article, supportDialog = false) {
      // console.log(article);
      await addReadAmount({ articlehash: article.hash }); // 增加文章阅读量
      this.article = article;
      this.articleCreateTime = article.create_time;
      this.totalSupportedAmount = article.value;
      this.signId = article.id;
      // 未登录下点击赞赏会自动登陆并且重新获取文章信息 如果没有打赏并且是点击赞赏 则显示赞赏框
      if (!article.support && supportDialog) {
        this.visible3 = true;
      }
    },
    // 设置文章内容
    setPost(post) {
      this.post = post;
    },
    handleChange(e) {
      // 小数点后三位 如果后面需要解除限制修改正则  {0,3}
      e.target.value = (e.target.value.match(/^\d*(\.?\d{0,3})/g)[0]) || null;
      this.amount = e.target.value;
    },
    setisSupported() {
      const { article, currentUsername } = this;
      if (currentUsername) {
        this.isSupported = article.support ? RewardStatus.REWARDED : RewardStatus.NOT_REWARD_YET;
      } else {
        this.isSupported = RewardStatus.NOT_LOGGINED;
      }
    },
    async b4support() {
      this.$Message.info('帐号检测中...');
      await this.idCheck().then(() => {
        this.getArticleInfo(this.hash, true);
        this.$Message.success('检测通过');
      }).catch((err) => {
        console.log(err);
        this.$Message.error('本功能需登录');
      });
    },
    async support() {
      const { article, comment } = this;
      // 檢查 amount
      const amount = parseFloat(this.amount);
      if (Number.isNaN(amount) || amount < 0.01) {
        this.$Message.warning('请输入正确的金额 最小赞赏金额为 0.01 EOS');
        return;
      }

      const signId = article.id;
      const referrer = this.getInvite;
      console.log('referrer :', referrer);

      try {
        this.isSupported = RewardStatus.LOADING;
        // 問用戶要 acceess token
        await getAuth();
        // 發轉帳 action 到合約
        await support({ amount, signId, referrer });
        try {
          // 發 comment 到後端
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
        this.isSupported = RewardStatus.REWARDED; // 按钮状态
        this.$Message.success('赞赏成功！');
        this.isRequest = true; // 自动请求
        this.visible3 = false; // 关闭dialog
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

<style src="./index.less" scoped lang="less"></style>
