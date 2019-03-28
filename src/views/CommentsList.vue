<template>
  <div class="comments">
    <Header
      :pageinfo="{ left:'back', title: '打赏队列', rightPage: 'home', needLogin: false, }" />
    <div class="tl">
      <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
          <CommentCard :comment="a" v-for="a in comments" :key="a.timestamp"/>
        </div>
        <p class="loading-stat">{{displayAboutScroll}}</p>
      </za-pull>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { CommentCard, Header } from '@/components/';
import { getArticleData, getSignId, getSharesbysignid } from '../api';
import {
  getSignInfo, getSharesInfo, getContractActions,
} from '../api/signature';
// import request from 'request'; // for test

export default {
  name: 'Comments',
  props: ['post', 'sign', 'hash'],
  components: { CommentCard, Header },
  computed: {
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有comments已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  async created() {
    const { copyPost, copySign, hash } = this;
    if (copyPost === undefined || copySign === undefined) {
      this.getArticleData(hash);
      this.getSign(hash);
    } else {
      this.setDocumentTitle(this.copyPost);
      this.getSharesbysignid(this.copySign.id);
    }

    // test code
    // const apiServer = 'https://api.smartsignature.io';
    // request.get({
    //   uri: `${apiServer}/shares`,
    //   rejectUnauthorized: false,
    //   json: true,
    //   headers: { Accept: '*/*' },
    //   dataType: 'json',
    // }, (error, response, body) => {
    //     console.log('all shares : ', body);
    // });
  },
  data() {
    return {
      comments: [
        // { // sample
        //   author: '画夜夜的鹿角角',
        //   timestamp: Date.now(),
        //   quantity: '10.2333 EOS',
        //   message: '这些天遍历了一下各社交app。。回头又感受下一罐。。就四个字：吹爆纯银大大！！真TM是个鬼才。。',
        // },
      // { // sample
      //  quantity: '100.2333 EOS',
      //  timestamp: Date.now() + 1,
      // type: 'test income',
      // },
      ],
      refreshing: false,
      busy: false,
      page: 1,
      isTheEndOfTheScroll: false,
      copyPost: this.post,
      copySign: this.sign,
    };
  },
  methods: {
    async getArticleData(hash) {
      const { data } = await getArticleData(hash);
      console.info('post :', data);
      this.copyPost = data.data;
      this.setDocumentTitle(this.copyPost);
    },
    async getSign(hash) {
      const { data } = await axios.get(`https://api.smartsignature.io/post/${hash}`);
      const signs = await getSignInfo(data.id);
      this.copySign = signs[0];
      console.log('sign :', this.copySign); // fix: ReferenceError: sign is not defined
      this.getSharesbysignid(this.copySign.id);
    },
    getSharesbysignid(signId) {
      getSharesbysignid({
        signid: signId,
      }, (error, response, body) => {
        console.log('shares : ', body);
        /*
        amount: 2000
        author: "minakokojima"
​​        comment: ""
​​        create_time: "2019-03-26T01:04:21.000Z"
​​        sign_id: 173
      */
        this.comments = body.map(a => ({
          author: a.author,
          timestamp: a.create_time,
          quantity: `${parseFloat(a.amount) / 10000} EOS`,
          message: a.comment,
        }));
      });
    },
    setDocumentTitle(post) {
      document.title = `${post.title} by ${post.author} - Smart Signature`;
    },
    loadMore() {
      if (this.isTheEndOfTheScroll) return;
      this.busy = true;
      this.page += 1;
      /*
      getArticlesList({ page: this.page }).then(({ data }) => {
        console.info(`Page ${this.page} data length: ${data.length}`);
        if (data.length === 0) {
          this.busy = true;
          this.isTheEndOfTheScroll = true;
        } else {
          this.articles = [...this.articles, ...data]; // Merge arrays with destruction
          this.articles = this.articles.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
          this.busy = false;
        }
      }); */
    },
    async refresh() {
      this.refreshing = true;
      // await this.getArticlesList();
      this.refreshing = false;
    },
  },
};
</script>


<style scoped>
</style>
