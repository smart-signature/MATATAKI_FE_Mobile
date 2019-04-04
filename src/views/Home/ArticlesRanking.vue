<template>
    <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
            <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
        </div>
        <p class="loading-stat">{{displayAboutScroll}}</p>
    </za-pull>
</template>

<script>
import { OrderBy, getArticles } from '@/api/backend';
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';

export default {
  name: 'ArticlesRanking',
  props: {
    orderType: {
      type: String,
      default: OrderBy.TimeLine,
    },
  },
  computed: {
    ...mapGetters(['currentUsername']),
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有文章已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  components: { ArticleCard },
  created() {
    this.getArticles();
  },
  methods: {
    async getArticles(page) {
      this.busy = true;
      const { data } = await getArticles({ orderBy: this.orderType });
      this.articles = data.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
      this.busy = false;
    },
    loadMore() {
      if (this.isTheEndOfTheScroll) {
        return;
      }
      this.busy = true;
      this.page += 1;
      getArticles({ orderBy: this.orderType, page: this.page }).then(({ data }) => {
        console.info(`Page ${this.page} data length: ${data.length}`);
        if (data.length === 0) {
          this.busy = true;
          this.isTheEndOfTheScroll = true;
        } else {
          this.articles = [...this.articles, ...data]; // Merge arrays with destruction
          this.articles = this.articles.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
          this.busy = false;
        }
      });
    },
    async refresh() {
      this.refreshing = true;
      await this.getArticles();
      this.refreshing = false;
    },
  },
  data() {
    return {
      refreshing: false,
      articles: [],
      busy: false,
      page: 1,
      isTheEndOfTheScroll: false,
    };
  },
};
</script>

<style scoped>
.articles {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
  font-weight: bold;
}
.article {
  text-align: left;
}
.card {
  margin: 5px;
}
.loading-stat {
  margin: 10px;
  color: #999;
  font-size: 13px;
}
</style>
