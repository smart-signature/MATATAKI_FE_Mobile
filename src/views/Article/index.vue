/* eslint-disable no-shadow */
<template>
  <div class="article" @click.stop="opr = false">
    <BaseHeader :pageinfo="{ title: '文章详情' }">
      <div slot="right" class="more" @click.stop="opr = !opr" v-if="isMe(article.author)">
        <img  src="@/assets/more.svg" alt="more">
        <transition name="fade" mode="out-in">
          <div class="dropdown" v-show="opr">
            <div
              class="dropdown-item"
              @click="$router.push({name: 'Publish', params: { id: article.id }, query: { from: 'edit', hash: article.hash }})">编辑</div>
            <div class="dropdown-item" @click="transferModal = true">转让</div>
            <div class="dropdown-item" @click="delArticleButton">删除</div>
          </div>
        </transition>
      </div>
      <div class="information" slot="info" @click="infoModa = true">
        <img src="@/assets/information.svg" alt="information">
        <span>攻略</span>
      </div>
    </BaseHeader>

    <ContentLoader v-if="articleLoading" class="content-loader" :height="300">
   		<circle cx="36" cy="24" r="12" /> 
      <rect x="54" y="14" rx="0" ry="0" width="64" height="10" /> 
      <rect x="54" y="26" rx="0" ry="0" width="30" height="8" /> 
      <rect x="27" y="46" rx="0" ry="0" width="334" height="240" />
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

      <!-- don't tag hide -->
      <div class="tag-review" v-if="article.tags !== undefined && article.tags.length !== 0">
        <tag-card v-for="(item, index) in article.tags" :key="index" :tagCard="item" :tagMode="false" />
      </div>

      <div class="ipfs-hash">
        <img
          @click="copyText(getCopyIpfsHash)"
          src="@/assets/img/icon_copy.svg" class="copy-hash" alt="hash">
        <span >
          IPFS Hash: {{article.hash || 'Loading...'}}
        </span>
      </div>

      <div class="decoration">
        <a data-pocket-label="pocket" data-pocket-count="horizontal" class="pocket-btn" data-lang="en"></a>
        <span class="is-original">
          本文发布于智能签名<br />
          <template v-if="isOriginal">
            未经授权禁止转载
          </template>
        </span>
      </div>
    </template>

    <div class="comments-list">
      <div class="commentslist-title">
        <span>赞赏队列 {{article.ups || 0}}</span>
      </div>
      <div class="product" v-if="article.product">
        <div class="product-list" v-for="(item, index) in article.product" :key="index">
          <span>《{{item.title}}》--key: {{item.digital_copy}}</span>
          <img
            src="@/assets/img/icon_copy.svg"
            class="copy-product-info"
            alt="hash"
            @click="copyText('《' + item.title + '》--key:'+ item.digital_copy)">
        </div>
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
                &nbsp;
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
            <div class="amount-text">赞赏总额</div>
          </div>
          <div class="fission">
            <div>
              <div class="amount-img fission"></div>
              {{getDisplayedFissionFactor}}
            </div>
            <div class="amount-text">裂变系数</div>
          </div>
    </div>
    <div class="footer-block">
      <button class="button-support" v-if="isSupported===-1" @click="b4support">赞赏<img src="@/assets/img/icon_support.png"/></button>
      <button class="button-support" v-if="isSupported===0" disabled>赞赏中<img src="@/assets/img/icon_support.png"/></button>
      <button class="button-support" v-else-if="isSupported===1" @click="supportButton">赞赏<img src="@/assets/img/icon_support.png"/></button>
      <button class="button-support" v-else-if="isSupported===2" disabled>已赞赏<img src="@/assets/img/icon_support.png"/></button>
      <button class="button-share" @click="widgetModal = true">分享<img src="@/assets/img/icon_share.png" /></button>
    </div>
    </footer>

    <van-dialog
      v-model="supportModal"
      title="赞赏"
      show-cancel-button
      class="ffff"
      :before-close="support"
      @cancel="supportModal = false"
      :closeOnClickOverlay='true'
    >
      <van-field
        v-model="comment"
        type="textarea"
        placeholder="输入推荐语…"
        rows="4"
        autosize
      />
      <van-field v-model="amount" @input="handleChange(amount)" :placeholder="displayPlaceholder" />
    </van-dialog>

    <!-- 文章 Info -->
    <ArticleInfo :infoModa="infoModa" @changeInfo="(status) => infoModa = status" />
    <BaseModalForSignIn :showModal="showModal" @changeInfo="changeInfo" />
    <Widget @changeWidgetModal="(status)=> widgetModal = status" :widgetModal="widgetModal" :id="article.id" :getClipboard="getClipboard" />
    <article-transfer @changeTransferModal="(status)=> transferModal = status" :transferModal="transferModal" :articleId="article.id" :from="'article'" />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { mavonEditor } from 'mavon-editor';
import {
  getArticleDatafromIPFS,
  getArticleInfo,
  addReadAmount, sendComment,
  delArticle,
  getAvatarImage,
} from '@/api';
import 'mavon-editor/dist/css/index.css';
import moment from 'moment';
import { ContentLoader } from 'vue-content-loader';
import { xssFilter } from '@/common/xss';
import { sleep, isNDaysAgo } from '@/common/methods';
import { ontAddressVerify } from '@/common/reg';
import { precision } from '@/common/precisionConversion';

import CommentsList from './CommentsList.vue';
import ArticleInfo from './ArticleInfo.vue';
import Widget from './Widget';
import articleTransfer from '@/components/articleTransfer';
import tagCard from "@/components/tagCard/index";


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
    CommentsList,
    ArticleInfo,
    ContentLoader,
    mavonEditor,
    Widget,
    tagCard,
    articleTransfer
  },
  data() {
    return {
      post: {
        author: '',
        title: '',
        content: '',
      },
      article: {
        author: '',
        createTime: '',
        fission_factor: 0,
        id: null,
      },
      // eslint-disable-next-line global-require
      articleAvatar: require('../../assets/logo.png'),
      amount: '',
      comment: '',
      totalSupportedAmount: {
        show: 0, // 用于默认数据显示
        showName: 'eos', // 用于默认数据显示
        eos: 0,
        ont: 0,
      },
      showModal: false,
      supportModal: false,
      opr: false,
      infoModa: false,
      isRequest: false,
      articleLoading: true, // 文章加载状态
      isOriginal: false,
      widgetModal: false, // 分享 widget dialog
      transferModal: false, // 转让
    };
  },
  computed: {
    ...mapGetters(['currentUserInfo', 'isLogined', 'isMe']),
    displayPlaceholder() {
      // 报错 临时处理一下先
      // return `请输入 ${this.currentUserInfo.balance.slice(-4)} 赞赏金额`;
      return `请输入赞赏金额`;
    },
    compiledMarkdown() {
      return markdownIt.render(xssFilter(this.post.content));
    },
    getClipboard() {
      const { article, currentUserInfo } = this;
      const { protocol, host } = window.location;
      // console.debug(this.article);
      const articleUrl = `${protocol}//${host}/article/${article.id}`;
      const shareLink = this.isLogined
        ? `${articleUrl}?invite=${currentUserInfo.name}`
        : articleUrl;
      return `《${article.title}》by ${article.username} \n${shareLink}\n赞赏好文，分享有收益 ！`;
    },
    getCopyIpfsHash() {
      return `${this.article.hash}`;
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
    // 这里发现有问题 应该是下面直接设置了属性报错 后续需要修改
    // errorinfo - vue.js:634 [Vue warn]: Computed property "isSupported" was assigned to but it has no setter.
    isSupported() {
      const { article, isLogined } = this;
      let isSupported = false;
      if (isLogined) isSupported = article.support ? RewardStatus.REWARDED : RewardStatus.NOT_REWARD_YET;
      else isSupported = RewardStatus.NOT_LOGGINED;
      return isSupported;
    },
    signId() {
      return this.article.id;
    },
    articleCreateTimeComputed() {
      const { create_time: createTime } = this.article;
      const time = moment(createTime);
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
    },
  },
  created() {
    document.title = '正在加载文章 - Smart Signature';
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
        {
          type: 'text/javascript',
          src: '//cdn.embedly.com/widgets/platform.js',
        },
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
    isLogined(newState) {
      if (newState) this.getArticleInfo(this.hash, false);
    },
    isRequest(newVal) {
      // 监听是否请求默认为false被改变为true下面不执行，请求完毕又被改变为false执行下列方法
      if (!newVal) {
        this.getArticleInfo(this.hash);
      }
    },
  },
  methods: {
    ...mapActions(['makeShare']),
    changeInfo(status) {
      this.showModal = status;
    },
    // 复制hash
    copyText(getCopyIpfsHash) {
      this.$copyText(getCopyIpfsHash).then(() => {
        this.$toast.success({
          duration: 1000,
          message: '复制成功',
        });
      }, () => {
        this.$toast.fail({
          duration: 1000,
          message: '复制失败',
        });
      });
    },
    // 得到文章信息 hash id, supportDialog 为 true 则只更新文章信息
    async getArticleInfo(hash, supportDialog = false) {
      await getArticleInfo(hash).then((res) => {
        if (res.status === 200 && res.data.code === 0) {
          this.setArticle(res.data.data, supportDialog);
          // 默认会执行获取文章方法，更新文章调用则不需要获取内容
          if (!supportDialog) {
            this.getArticleDatafromIPFS(res.data.data.hash);
            this.setAvatar(res.data.data.author);
          }
        } else {
          this.$toast({
            duration: 1000,
            message: res.data.message,
          });
        }
      }).catch((err) => {
        console.log(err);
        this.$toast({
          duration: 1000,
          message: '获取文章信息失败',
        });
      });
    },
    // 获取文章内容 from ipfs
    async getArticleDatafromIPFS(hash) {
      await getArticleDatafromIPFS(hash).then(({ data }) => {
        // console.log(data);
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
      this.article.CreateTime = article.create_time;
      this.totalSupportedAmount.show = article.value ? precision(article.value, 'eos') : 0; // 用于默认显示
      this.totalSupportedAmount.eos = article.value ? precision(article.value, 'eos') : 0; // eos
      this.totalSupportedAmount.ont = precision(article.ontvalue, 'ont'); // ont

      this.articleLoading = false; // 文章加载状态隐藏
      this.isOriginal = Boolean(article.is_original);
      // 未登录下点击赞赏会自动登陆并且重新获取文章信息 如果没有打赏并且是点击赞赏 则显示赞赏框
      if (!article.support && supportDialog) {
        this.supportModal = true;
      }
    },
    // 设置文章内容
    setPost(post) {
      this.post = post;
      this.articleLoading = false; // 文章加载状态隐藏
    },
    handleChange(amount) {
      let amountValue = amount;
      const { idProvider } = this.currentUserInfo;
      if (idProvider === 'EOS') {
        // 小数点后三位 如果后面需要解除限制修改正则  {0,3}
        amountValue = (amountValue.match(/^\d*(\.?\d{0,3})/g)[0]) || null;
      } else if (idProvider === 'ONT') {
        amountValue = (amountValue.match(/^\d*/g)[0]) || null;
      }
      this.amount = amountValue;
    },
    b4support() {
      if (!this.isLogined) {
        this.showModal = true;
      }
    },
    // 根据 idProvider 查询商品数据
    findBlockchain(articlePrices, idProvider) {
      const findBlockchain = (arr, symbol) => arr.filter(i => i.symbol === symbol);
      return findBlockchain(articlePrices, idProvider);
    },
    // 赞赏按钮
    supportButton() {
      // 如果是商品 判断库存是否充足
      if (this.article.channel_id === 2) {
        const { currentUserInfo, findBlockchain, article } = this;
        const { idProvider } = currentUserInfo;
        const filterBlockchain = findBlockchain(article.prices, idProvider);
        const { stock_quantity: stockQuantity } = filterBlockchain[0];
        if (stockQuantity <= 0) {
          return this.$toast({
            duration: 1000,
            message: '库存不足',
          });
        }
      }
      // 如果是商品 判断库存是否充足 end
      this.supportModal = true;
      return true;
    },


    async support(action, done) {
      if (action !== 'confirm') return done();
      const { article, comment, signId } = this;
      const { idProvider } = this.currentUserInfo;
      if (idProvider === 'GitHub') return;
      // 默认 ‘’ 转成了 NAN
      const amount = this.amount === '' ? 0 : parseFloat(this.amount);
      // 检查金额是否符合
      let checkPricesMatch = true;

      // 检查价格
      const checkPrices = (prices, range, message) => {
        if (prices < range) {
          this.$toast({
            duration: 1000,
            message,
          });
          return false;
        }
        return true;
      };
      // 文章赞赏金额
      const minimumAmount = (idProvider) => {
        if (idProvider === 'EOS') return 0.01;
        if (idProvider === 'ONT') return 1;
      };
      checkPricesMatch = checkPrices(
        amount,
        minimumAmount(idProvider),
        `请输入正确的金额 最小赞赏金额为 ${minimumAmount(idProvider)} ${idProvider}`,
      );
      if (!checkPricesMatch) return done(false);

      // 检查商品价格
      const checkCommodityPrices = () => {
        const filterBlockchain = this.findBlockchain(article.prices, idProvider);
        if (filterBlockchain.length !== 0) {
          const { symbol, price, decimals } = filterBlockchain[0];
          // exponentiation operator (**)
          if (symbol === 'EOS') checkPricesMatch = checkPrices(amount, (price / (10 ** decimals)), '赞赏金额不能小于商品价格');
          else if (symbol === 'ONT') checkPricesMatch = checkPrices(amount, (price / (10 ** decimals)), '赞赏金额不能小于商品价格');
        }
      };

      // 文章是商品判断价格
      if (article.channel_id === 2) checkCommodityPrices();
      if (!checkPricesMatch) return done(false);


      let sponsor = this.getInvite;
      // console.log('sponsor :', sponsor);

      try {
        this.isSupported = RewardStatus.LOADING;


        // 如果是ONT true 如果是 EOS或者其他 false
        const isOntAddressVerify = ontAddressVerify(sponsor);
        // 如果是EOS账户赞赏 但是邀请人是ONT用户 则认为没有邀请
        if (idProvider === 'EOS' && isOntAddressVerify) sponsor = null;
        // 如果是ONT账户赞赏 但是邀请人EOS账户 则认为没有邀请
        else if (idProvider === 'ONT' && !isOntAddressVerify) sponsor = null;

        await this.makeShare({ amount, signId, sponsor });

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
        this.$toast.success({
          duration: 1000,
          message: '赞赏成功！',
        });
        this.isRequest = true; // 自动请求
        this.supportModal = false; // 关闭dialog
        done();
      } catch (error) {
        console.error(error);
        this.isSupported = RewardStatus.NOT_REWARD_YET;
        this.$toast({
          duration: 1000,
          message: '赞赏失败，可能是由于网络故障或账户余额不足等原因。',
        });
        done(false);
      }
    },
    // 删除文章
    delArticleButton() {
      if (this.article.author !== this.v) {
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
    async setAvatar(username) {
      let { data } = await this.$backendAPI.getUser({ uid: username });
      data = data.data;
      if (data.avatar) this.articleAvatar = getAvatarImage(data.avatar);
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
<style>
/* 覆盖赞赏框宽度 */
.article .van-dialog {
  max-width: 350px;
}
</style>
