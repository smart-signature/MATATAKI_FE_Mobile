<template>
  <div class="comments">
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
        </i-col>
      </Row>
    </footer>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { Header } from '@/components/';
import axios from 'axios';
import { mavonEditor } from 'mavon-editor';
import { getArticleData, getSignId } from '../api';
import {
  support, getSignInfo, getSharesInfo, getContractActions,
} from '../api/signature.js';
import 'mavon-editor/dist/css/index.css';

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();

const RewardStatus = {
  //0=加载中,1=未打赏 2=已打赏
  LOADING: 0,
  NOT_REWARD_YET: 1,
  REWARDED: 2,
}

export default {
  name: 'Comments',
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
  },
  async created() {
    document.title = '正在加载 - Smart Signature';
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
    isSupported: RewardStatus.LOADING,
    isTotalSupportAmountVisible: false,  //正在加载和加载完毕的文本切换
    totalSupportedAmount: 0.0000,
    visible3: false,
    v3: '',
    v5: '',
  }),
  watch: {
    post({ author, title }) {
      // 当文章从 IPFS fetched 到， post 会更新，我们要更新网页 title
      document.title = `${title} by ${author} - Smart Signature`;
    },
    currentUsername() {
      this.setisSupported()
    }
  },
  methods: {
    ...mapActions([
      'connectScatterAsync',
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
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
  },
};
</script>


<style scoped>
</style>
