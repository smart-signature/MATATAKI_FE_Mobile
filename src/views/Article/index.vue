/* eslint-disable no-shadow */
<template>
  <div class="article">
    <BaseHeader :pageinfo="{ title: `文章详情`, needLogin: false, }">
      <img class="more" src="@/assets/more.svg" alt="more" slot="right" @click="opr = !opr" v-if="isMe">
      <div class="information" slot="info" @click="infoModa = true">
        <img src="@/assets/information.svg" alt="information">
        <span>攻略</span>
      </div>

    </BaseHeader>
    <transition name="fade" mode="out-in">
      <div class="dropdown" v-show="opr">
        <div class="dropdown-item" @click="$router.push({name: 'Publish', params: { id: article.id }, query: { from: 'edit', hash: article.hash }})">编辑</div>
        <div class="dropdown-item" @click="delArticleButton">删除</div>
      </div>
    </transition>
    <ContentLoader v-if="articleLoading">
        <circle cx="36.98272" cy="24.082720000000002" r="11.98272" />
        <rect x="54" y="14.8" rx="0" ry="0" width="63.8" height="7.0666" />
        <rect x="54" y="25.8" rx="0" ry="0" width="30.83" height="5.759600000000001" />
        <rect x="26" y="47.8" rx="0" ry="0" width="334.43" height="120" />
    </ContentLoader>
    <template v-else>
      <header class="ta_header">
        <div class="avatar-info">
          <div class="avatar" @click="() => $router.push({ name: 'User', params: { username:article.author }})">
            <img :src="articleAvatar" @error="() => { this.avatar = require('../../assets/logo.png'); }" class="avatar-size" alt="avatar">
          </div>
          <div class="avatar-right">
            <p class="author" @click="() => $router.push({ name: 'User', params: { username:article.author }})">
              {{article.nickname || post.author}}
            </p>
            <p class="other">
              <img src="@/assets/img/icon_date.svg" class="avatar-date" alt="avatar">
              {{articleCreateTimeComputed}}
              <img src="@/assets/img/icon_read.svg" class="avatar-read" alt="avatar">
              {{article.read || 0}}阅读
            </p>
          </div>
        </div>
        <h1>{{post.title}}</h1>
      </header>
      <mavon-editor v-show="false" style="display: none;"/>
      <div class="markdown-body" v-html="compiledMarkdown"></div>
    </template>

    <div class="ipfs-hash">
        <img src="@/assets/img/icon_copy.svg" class="copy-hash" alt="hash" :data-clipboard-text="getCopyIpfsHash">
        <span >
          IPFS Hash: {{article.hash || 'Loading...'}}
        </span>
    </div>

    <div class="decoration">
      <a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a>
      <span class="is-original">
        本文发布于智能签名<br />
        <template v-if="is_original">
          未经授权禁止转载
        </template>
      </span>
    </div>

    <div class="comments-list">
      <div class="commentslist-title">
        <span>
          赞赏队列 {{article.ups || 0}}
        </span>
      </div>
      <CommentsList class="comments" :signId="signId" :isRequest="isRequest" @stopAutoRequest="(status) => isRequest = status" />
    </div>


    <footer class="footer">
      <div class="footer-block">
          <div class="amount">
            <Dropdown trigger="click" @on-click="toggleAmount">
              <div>
                <div
                  :class="totalSupportedAmount.showName === 'eos' ? 'eos' : 'ont'"
                  class="amount-img"></div>
                {{totalSupportedAmount.show}}
                <Icon type="ios-arrow-up" />
              </div>
              <DropdownMenu slot="list">
                <DropdownItem name="eos" class="amount-icon">
                  <img src="@/assets/img/icon_eos_article.svg" alt="eos">
                  {{totalSupportedAmount.eos}}
                </DropdownItem>
                <DropdownItem name="ont" class="amount-icon">
                  <img src="@/assets/img/icon_ont_article.svg" alt="ont">
                  {{totalSupportedAmount.ont}}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Tooltip content="本文收到的赞赏总额" placement="top-start">
              <div class="amount-text">赞赏总额</div>
            </Tooltip>
          </div>
        <Tooltip content="最高回报=赞赏额*裂变系数">
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
        <Tooltip content="赞赏获收益">
          <button class="button-support" v-if="isSupported===-1" @click="b4support">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-if="isSupported===0" disabled>赞赏中<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-else-if="isSupported===1" @click="visible3 = true">赞赏<img src="@/assets/img/icon_support.png"/></button>
          <button class="button-support" v-else-if="isSupported===2" disabled>已赞赏<img src="@/assets/img/icon_support.png"/></button>
        </Tooltip>
        <Tooltip content="先赞赏后分享" placement="top-end">
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
            :placeholder="displayPlaceholder" v-model="amount" type="text"  @input="handleChange"/>
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
  delArticle, getAuth, getUser,
  reportShare, getAvatarImage,
} from '@/api';
import { support } from '@/api/signature';
import 'mavon-editor/dist/css/index.css';
import moment from 'moment';
import { ContentLoader } from 'vue-content-loader';
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
  name: 'Article',
  props: ['hash'],
  components: {
    CommentsList, ArticleInfo, ContentLoader, mavonEditor,
  },
  beforeDestroy() {
    this.clipboard.destroy(); // 组件销毁之前 销毁clipboard
  },
  data() {
    return {
      signId: null,
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
      // eslint-disable-next-line global-require
      articleAvatar: require('../../assets/logo.png'),
      amount: '',
      comment: '',
      isSupported: RewardStatus.NOT_LOGGINED,
      totalSupportedAmount: {
        show: 0, // 用于默认数据显示
        showName: 'eos', // 用于默认数据显示
        eos: 0,
        ont: 0,
      },
      visible3: false,
      clipboard: null,
      articleCreateTime: '',
      opr: false,
      infoModa: false,
      isRequest: false,
      articleLoading: true, // 文章加载状态
      is_original: false,
    };
  },
  computed: {
    ...mapGetters(['currentUserInfo', 'currentUsername', 'isLogined']),
    displayPlaceholder() {
      return `请输入 ${this.currentUserInfo.balance.slice(-4)} 赞赏金额`;
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
    getCopyIpfsHash() {
      return `您的Hash地址为: ${this.article.hash}`;
    },
    getDisplayedFissionFactor() {
      return this.article.fission_factor / 1000;
    },
    getUrl() {
      const { article } = this;
      const { protocol, host } = window.location;
      return `${protocol}//${host}/article/${article.id}`;
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
      // console.log('isme', this.article, this.currentUsername);
      return this.article.author === this.currentUsername;
    },
  },
  created() {
    document.title = '正在加载文章 - Smart Signature';
    this.initClipboard(); // 分享按钮功能需要放在前面 保证功能的正常执行
    this.copyHash(); // 复制 hash
    this.getArticleInfo(this.hash); // 得到文章信息
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
    // Meta tags // 做ssr 再使用
    // meta() {
    // const { article, getUrl, post } = this;
    // return [
    // Open Graph
    // { p: 'og:url', c: getUrl },
    // { p: 'og:site_name', c: 'Smart Signature' },
    // { p: 'og:type', c: 'article' },
    // { p: 'og:title', c: post.title },
    // { p: 'og:description', c: post.desc },
    // { p: 'article:author', c: post.author },
    // { p: 'article:published_time', c: article.create_time },
    // { p: 'og:image', c: 'https://example.com/image.jpg' },
    //  Twitter
    // { n: 'twitter:card', c: post.desc },
    // { n: 'twitter:site', c: '@Smart Signature' },
    // { n: 'twitter:creator', c: '@article' }, // @username for the content creator / author.
    // 未來支持推特連接後， 可以顯示其推特帳號在推特 card 預覽裡
    // ];
    // },
    script() {
      return [
        {
          type: 'text/javascript',
          id: 'pocket-btn-js', // id 不知道作用 生成的 script 有id就带着好了
          src: 'https://widgets.getpocket.com/v1/j/btn.js?v=1',
        },
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
    ...mapActions(['idCheckandgetAuth', 'recordShare']),
    // 分享功能
    initClipboard() {
      this.clipboard = new Clipboard('.button-share');
      this.clipboard.on('success', (e) => {
        this.$toasted.show('复制成功', {
          position: 'top-center',
          duration: 1000,
          fitToScreen: true,
        });
        e.clearSelection();
      });
      this.clipboard.on('error', () => {
        this.$Message.error('该浏览器不支持自动复制');
      });
    },
    // 复制hash
    copyHash() {
      this.clipboard = new Clipboard('.copy-hash');
      this.clipboard.on('success', (e) => {
        this.$toasted.show('复制成功', {
          position: 'top-center',
          duration: 1000,
          fitToScreen: true,
        });
        e.clearSelection();
      });
      this.clipboard.on('error', () => {
        this.$Message.error('该浏览器不支持自动复制');
      });
    },
    // 得到文章信息 hash id, supportDialog 为 true 则只更新文章信息
    async getArticleInfo(hash, supportDialog = false) {
      try {
        const response = await getArticleInfo(hash);
        this.setArticle(response.data, supportDialog);
        // 默认会执行获取文章方法，更新文章调用则不需要获取内容
        if (!supportDialog) {
          this.getArticleDatafromIPFS(response.data.hash);
          this.getUser(response.data.author);
        }
      } catch (error) {
        this.$Message.error('获取文章信息失败请重试');
        console.log(error);
      }
    },
    // 获取文章内容 from ipfs
    async getArticleDatafromIPFS(hash) {
      await getArticleDatafromIPFS(hash).then(({ data }) => {
        console.log(data);
        this.setPost(data.data);
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取文章内容失败请重试');
      });
    },
    // 设置文章
    async setArticle(article, supportDialog = false) {
      try {
        await addReadAmount({ articlehash: article.hash }); // 增加文章阅读量
      } catch (error) {
        console.error('addReadAmount :', error);
      }
      this.article = article;
      this.articleCreateTime = article.create_time;
      this.totalSupportedAmount.show = article.value ? (article.value / 10000).toFixed(4) : 0; // 用于默认显示
      this.totalSupportedAmount.eos = article.value ? (article.value / 10000).toFixed(4) : 0;
      this.totalSupportedAmount.ont = article.ontvalue;
      this.signId = article.id;
      this.articleLoading = false; // 文章加载状态隐藏
      this.is_original = Boolean(article.is_original);
      // 未登录下点击赞赏会自动登陆并且重新获取文章信息 如果没有打赏并且是点击赞赏 则显示赞赏框
      if (!article.support && supportDialog) {
        this.visible3 = true;
      }
    },
    // 设置文章内容
    setPost(post) {
      this.post = post;
      this.articleLoading = false; // 文章加载状态隐藏
    },
    handleChange(e) {
      const { blockchain } = this.currentUserInfo;
      if (blockchain === 'EOS') {
        // 小数点后三位 如果后面需要解除限制修改正则  {0,3}
        e.target.value = (e.target.value.match(/^\d*(\.?\d{0,3})/g)[0]) || null;
      } else if (blockchain === 'ONT') {
        e.target.value = (e.target.value.match(/^\d*/g)[0]) || null;
      }
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
      try {
        // this.$Message.info('帐号检测中...');
        const { blockchin } = this.currentUserInfo;
        // console.log(this.currentUserInfo);
        const usingBlockchain = {
          EOS: blockchin === 'EOS',
          ONT: blockchin === 'ONT',
        };
        await this.idCheckandgetAuth(
          usingBlockchain,
        );
        // this.$Message.success('检测通过');
        this.getArticleInfo(this.hash, true);
      } catch (error) {
        console.log(error);
        this.$Message.error('本功能需登录');
      }
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
        // 發轉帳 action 到合約
        // 1. EOS 照舊
        // 2. ONT 用新流程
        const { currentUserInfo, recordShare } = this;
        const { blockchain, name: username } = currentUserInfo;
        const makeShare = async () => {
          if (blockchain === 'EOS') return support({ amount, signId, referrer });
          if (blockchain === 'ONT') {
            const sponsor = referrer;
            const share = await recordShare({ amount, signId, sponsor });
            return reportShare({ amount, signId, sponsor });
          }
        };
        const backendResult = await makeShare();
        // console.log('F');
        try { // 發 comment 到後端
          console.log('Send comment...');
          const response = await sendComment({ comment, signId });
          console.log(response);
          if (response.status !== 200) throw new Error(error);
        } catch (error) {
          console.error(error);
          console.log('Resend comment...');
          const response = await sendComment({ comment, signId });
          console.log(response);
          if (response.status !== 200) throw new Error(error);
        }
        this.isSupported = RewardStatus.REWARDED; // 按钮状态
        this.$Message.success('赞赏成功！');
        this.isRequest = true; // 自动请求
        this.visible3 = false; // 关闭dialog
      } catch (error) {
        console.error(JSON.stringify(error));
        this.$Message.error('赞赏失败，可能是由于网络故障或账户余额不足。\n请检查网络或账户余额');
        this.isSupported = RewardStatus.NOT_REWARD_YET;
      }
    },
    share() {
      try {
        this.idCheckandgetAuth();
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
        try {
          const response = await delArticle({ id });
          if (response.status !== 200) return fail(error);
          delSuccess();
        } catch (error) {
          return fail(error);
        }
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
    // 获取用户 得到头像
    async getUser(username) {
      const response = await getUser({ username }, this.currentUsername);
      if (response.status !== 200) throw new Error('getUser error');
      if (!response.data.avatar) return;
      this.articleAvatar = getAvatarImage(response.data.avatar);
    },
    // 切换赞赏总额显示
    toggleAmount(name) {
      if (name === 'eos') {
        this.totalSupportedAmount.show = this.totalSupportedAmount.eos;
        this.totalSupportedAmount.showName = 'eos';
      } else if (name === 'ont') {
        this.totalSupportedAmount.show = this.totalSupportedAmount.ont;
        this.totalSupportedAmount.showName = 'ont';
      }
    },
  },
};
</script>

<style src="./index.less" scoped lang="less"></style>
