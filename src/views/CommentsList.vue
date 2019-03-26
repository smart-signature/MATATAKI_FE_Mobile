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
import { mapGetters, mapState } from 'vuex';
import { CommentCard, Header } from '@/components/';
import axios from 'axios';
import { mavonEditor } from 'mavon-editor';
import { getArticleData, getSignId } from '../api';
import {
  getSignInfo, getSharesInfo, getContractActions,
} from '../api/signature.js';
import 'mavon-editor/dist/css/index.css';

// MarkdownIt 实例
const markdownIt = mavonEditor.getMarkdownIt();

export default {
  name: 'Comments',
  props: ['post', 'sign'],
  components: {
    Header,
    mavonEditor,
  },
  computed: {
    compiledMarkdown() {
      return markdownIt.render(this.post.content);
    },
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有comments已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  async created() {
    document.title = `${this.post.title} by ${this.post.author} - Smart Signature`;
    console.log(this.post);
    console.log(this.sign);
    try {
      // await this.getArticleData();
    } catch (error) {

    }
    /*
    const url = `https://api.smartsignature.io/post/${this.hash}`;
    const { data } = await axios.get(url);
    const signs = await getSignInfo(data.id);
    this.sign = signs[0];
    console.log('sign :', this.sign); // fix: ReferenceError: sign is not defined
    */
    
    // Set isSupported
    // await this.setisSupported();
  },
  data: () => ({
    comments: [
        { // sample
          quantity: '10.2333 EOS',
          timestamp: Date.now(),
          message: 'test comment',
        },
        // { // sample
        //  quantity: '100.2333 EOS',
        //  timestamp: Date.now() + 1,
        // type: 'test income',
        // },
    ],
    amount: 0.0000,
    refreshing: false,
    busy: false,
    page: 1,
    isTheEndOfTheScroll: false,
  }),
  watch: {
    currentUsername() {
      this.setisSupported()
    }
  },
  methods: {
    async getArticleData() {
      const { data } = await getArticleData(this.hash);
      console.info('post :', data);
      this.post = data.data;
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
      });*/
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
