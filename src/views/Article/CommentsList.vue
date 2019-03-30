<template>
  <div class="comments">
    <Header
      :pageinfo="{ left:'back', title: '赞赏队列', rightPage: 'home', needLogin: false, }" />
    <div class="tl">
      <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
          <CommentCard :comment="a" v-for="a in sortedComments" :key="a.timestamp"/>
        </div>
        <p class="loading-stat">{{displayAboutScroll}}</p>
      </za-pull>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { CommentCard, Header } from '@/components/';
import { getArticleData, getSharesbysignid } from '@/api/';
import { getSignInfo } from '@/api/signature';

export default {
  name: 'Comments',
  props: ['post', 'sign', 'hash'],
  components: { CommentCard, Header },
  computed: {
    sortedComments() {
      // console.log(this.assets);
      // if need change to asc, swap a & b
      return this.comments.slice(0) // 使用slice创建数组副本 消除副作用
        .sort((a, b) => (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime());
    },
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有comments已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  created() {
    const { copyPost, copySign, hash } = this;
    if (copyPost === undefined || copySign === undefined) {
      this.setArticleData(hash);
      this.setSign(hash);
    } else {
      this.getSharesbysignid(this.copySign.id);
    }
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
    async setArticleData(hash) {
      const { data } = await getArticleData(hash);
      this.copyPost = data.data;
      console.info('post :', this.copyPost);
    },
    async setSign(hash) {
      const { data } = await axios.get(`https://api.smartsignature.io/post/${hash}`);
      const signs = await getSignInfo(data.id);
      // eslint-disable-next-line prefer-destructuring
      this.copySign = signs[0];
      console.log('sign :', this.copySign); // fix: ReferenceError: sign is not defined
      await this.getSharesbysignid(this.copySign.id);
    },
    async getSharesbysignid(signId) {
      await getSharesbysignid({ signid: signId })
        .then((response) => {
          console.log('shares : ', response.data);
          this.comments = response.data.map(a => ({
            author: a.author,
            timestamp: a.create_time,
            quantity: `${parseFloat(a.amount) / 10000} EOS`,
            message: a.comment,
          }));
        });
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
          this.articles = this.articles.filter(
            a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00')
          );
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
  watch: {
    copyPost({ author, title }) { // for set DocumentTitle
      document.title = `${title} by ${author} - Smart Signature`;
    },
  },
};
</script>


<style scoped>
</style>
