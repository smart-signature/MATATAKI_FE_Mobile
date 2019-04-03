<template>
  <div class="articles">
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="orderBy.TimeLine" :name="orderBy.TimeLine">
        <za-pull :on-refresh="refresh" :refreshing="refreshing">
          <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
            <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
          </div>
          <p class="loading-stat">{{displayAboutScroll}}</p>
        </za-pull>
      </za-tab-pane>
      <za-tab-pane :label="orderBy.SupportTimes" :name="orderBy.SupportTimes">
        <za-pull :on-refresh="refresh" :refreshing="refreshing">
          <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
            <ArticleCard :article="a" v-for="a in articlesBySupportTimes" :key="a.id"/>
          </div>
          <p class="loading-stat">{{displayAboutScroll}}</p>
        </za-pull>
      </za-tab-pane>
      <za-tab-pane :label="orderBy.SupportAmount" :name="orderBy.SupportAmount">
        <za-pull :on-refresh="refresh" :refreshing="refreshing">
          <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
            <ArticleCard :article="a" v-for="a in articlesBySupportAmount" :key="a.id"/>
          </div>
          <p class="loading-stat">{{displayAboutScroll}}</p>
        </za-pull>
      </za-tab-pane>
    </za-tabs>
  </div>
</template>

<script>
import { getArticlesList } from '@/api/';
import { OrderBy, getArticles } from '@/api/backend';
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';
import { Promise } from 'q';

export default {
  name: 'home',
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
    this.getRankings();
    // this.getArticlesList();
  },
  methods: {
    getRankings(page) {
      this.busy = true;
      getArticles({ orderBy: OrderBy.TimeLine }).then(({data}) => { this.articles = data });
      getArticles({ orderBy: OrderBy.SupportAmount }).then(({data}) => { this.articlesBySupportAmount = data });
      getArticles({ orderBy: OrderBy.SupportTimes }).then(({data}) => { this.articlesBySupportTimes = data });
      this.articles = this.articles.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
      this.busy = false;
    },
    async getArticlesList() {
      this.busy = true;
      const { data } = await getArticlesList({ page });
      this.articles = data;
      console.log(this.articles);
      this.articles = this.articles.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
      this.busy = false;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    loadMore() {
      if (this.isTheEndOfTheScroll) {
        return;
      }
      this.busy = true;
      this.page += 1;
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
      });
    },
    async refresh() {
      this.refreshing = true;
      await this.getArticlesList();
      this.refreshing = false;
    },
  },
  data() {
    return {
      orderBy: OrderBy, // <template> 只认 data 内的变量
      refreshing: false,
      articles: [],
      articlesBySupportAmount: [],
      articlesBySupportTimes: [],
      busy: false,
      page: 1,
      isTheEndOfTheScroll: false,
      activeNameSwipe: OrderBy.TimeLine,
      selectedLabelDefault: OrderBy.TimeLine,
      tabs: [
        {
          label: OrderBy.TimeLine,
        },
        {
          label: OrderBy.SupportAmount,
        },
        {
          label: OrderBy.SupportTimes,
        },
      ],
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
