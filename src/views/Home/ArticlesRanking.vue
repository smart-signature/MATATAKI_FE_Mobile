<template>
    <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div v-infinite-scroll="loadMore" infinite-scroll-disabled="tabArticlesBusy">
            <ArticleCard :article="a" v-for="a in tabArticles" :key="a.id"/>
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
    tabArticles() {
      return this.articlesData[this.typeName].articles;
    },
    tabArticlesBusy() {
      return this.articlesData[this.typeName].busy;
    },
  },
  components: { ArticleCard },
  created() {},
  methods: {
    async getArticles(params, isEmptyArray) {
      await getArticles(params).then(({ data }) => {
        const articlesData = this.articlesData[this.typeName];
        // 清空数组 ps: 如果在 refresh 里面清空数组
        // 1.点击的时会先执行触摸刷新的方法 导致无法正常单击切换页面
        // 2.因为先执行触摸方法 清空了数组 会给页面造成影响
        if (isEmptyArray) articlesData.articles.length = 0;
        // Merge arrays with destruction
        articlesData.articles = [...articlesData.articles, ...data];
        articlesData.articles = articlesData.articles.filter(a => Date.parse(a.create_time) > Date.parse('2019-03-25T06:00:00'));
        if (data.length >= 0 && data.length < 20) this.isTheEndOfTheScroll = true;
        else articlesData.page += 1;
        articlesData.busy = false;
        // 列表最后一列小于二十显示加载完
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取文章发生错误');
        this.articlesData[this.typeName].busy = true;
        this.isTheEndOfTheScroll = true;
      });
    },
    async loadMore(isEmptyArray = false) {
      if (this.typeName === OrderBy.TimeLine) {
        this.typeName = 'TimeLine';
      } else if (this.typeName === OrderBy.SupportAmount) {
        this.typeName = 'SupportAmount';
      } else if (this.typeName === OrderBy.SupportTimes) {
        this.typeName = 'SupportTimes';
      }
      if (this.isTheEndOfTheScroll) return;
      this.articlesData[this.typeName].busy = true;
      // eslint-disable-next-line max-len
      await this.getArticles({ orderBy: this.orderType, page: this.articlesData[this.typeName].page }, isEmptyArray);
    },
    async refresh() {
      this.refreshing = true;
      this.isTheEndOfTheScroll = false; // 显示未加载完成
      this.articlesData[this.typeName].page = 1; // 重置分页索引
      await this.loadMore(true);
      this.refreshing = false;
    },
  },
  data() {
    return {
      refreshing: false,
      typeName: 'TimeLine', // 默认
      articlesData: {
        TimeLine: {
          articles: [],
          page: 1,
          busy: false,
        },
        SupportAmount: {
          articles: [],
          page: 1,
          busy: false,
        },
        SupportTimes: {
          articles: [],
          page: 1,
          busy: false,
        },
      },
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
