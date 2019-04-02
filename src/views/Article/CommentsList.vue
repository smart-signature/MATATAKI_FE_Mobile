<template>
  <div class="comments">
    <BaseHeader
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
import { CommentCard } from '@/components/';
import { getArticleData, getSharesbysignid } from '@/api/';
import { apiServer } from '@/api/backend';
// import { getSignInfo } from '@/api/signature';

export default {
  name: 'Comments',
  props: ['signId', 'hash'],
  components: { CommentCard },
  computed: {
    sortedComments() {
      // console.log(this.assets);
      // if need change to asc, swap a & b
      return this.comments.slice(0) // 使用slice创建数组副本 消除副作用
        .sort((a, b) => (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime());
    },
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有 comments 已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  created() {
    const { copySignId, hash } = this;
    if (copySignId === undefined) {
      this.setSign(hash);
    }
    this.setArticleData(hash);
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
      copyPost: null,
      copySignId: this.signId,
    };
  },
  methods: {
    async setArticleData(hash) {
      const { data } = await getArticleData(hash);
      this.copyPost = data.data;
      console.info('post :', this.copyPost);
    },
    async setSign(hash) {
      const { data } = await axios.get(`${apiServer}/post/${hash}`);
      // const signs = await getSignInfo(data.id);
      // eslint-disable-next-line prefer-destructuring
      // this.copySign = signs[0];
      this.copySignId = data.id;
      // this.copySign.id = data.id;
      // console.log('sign :', this.copySign); // fix: ReferenceError: sign is not defined
      await this.getArticlesList(this.copySignId, this.page);
      this.page += 1;
    },
    async getArticlesList(signId, page) {
      await getSharesbysignid(signId, page)
        .then((response) => {
          console.log('shares : ', response.data);
          const { data } = response;
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
        });
    },
    loadMore() {
      if (this.copySignId === undefined) return; // 默认会加载一次 如果没有id 后面不执行， 由上面的方法调用一次
      if (this.isTheEndOfTheScroll) return;
      this.busy = true;
      this.getArticlesList(this.copySignId, this.page);
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
