<template>
  <za-pull :on-refresh="refresh" :refreshing="refreshing">
    <div class="content">
      <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busyTab">
        <ArticleCard :article="a" v-for="(a, index) in articlesTabs" :key="index"/>
      </div>
    </div>
    <p class="loading-stat">{{displayAboutScroll}}</p>
  </za-pull>
</template>

<script>
import { ArticleCard } from '@/components/';
import { getArticlesList, getArticleSupports } from '@/api/index';
import { mapGetters } from 'vuex';

// export const TimeLine = '最新发布';
export default {
  name: 'ArticlesListOthers',
  computed: {
    ...mapGetters(['currentUsername']),
    displayAboutScroll() {
      return this.isTheEndOfTheScroll
        ? '🎉 哇，你真勤奋，所有 comments 已经加载完了～ 🎉'
        : '😄 勤奋地加载更多精彩内容 😄';
    },
    articlesTabs() {
      return this.articlesTab[this.typeName].articles;
    },
    busyTab() {
      return this.articlesTab[this.typeName].busy;
    },
  },
  props: {
    listtype: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
  },
  components: { ArticleCard },
  created() {},
  methods: {
    async refresh() {
      this.refreshing = true;
      this.isTheEndOfTheScroll = false; // 显示未加载完成
      this.articlesTab[this.typeName].page = 1;
      await this.loadMore(true);
      this.refreshing = false;
    },
    async loadMore(isEmptyArray = false) {
      if (this.listtype === '文章列表') {
        this.typeName = 'original';
      } else if (this.listtype === '他赞赏的') {
        this.typeName = 'reward';
      }
      if (this.isTheEndOfTheScroll) return;
      this.articlesTab[this.typeName].busy = false;
      await this.getArticlesList(this.username, this.articlesTab[this.typeName].page, isEmptyArray);
    },
    async getArticlesList(username, page, isEmptyArray) {
      const getArticleDataOthers = (res) => {
        const { data } = res;
        const articlesTab = this.articlesTab[this.typeName];
        if (isEmptyArray) articlesTab.articles.length = 0;
        articlesTab.articles = [...articlesTab.articles, ...data];
        if (data.length >= 0 && data.length < 20) this.isTheEndOfTheScroll = true;
        else articlesTab.page += 1;
        articlesTab.busy = false;
      };
      console.log('line 61', this.typeName, this.listtype);

      if (this.typeName === 'original' && this.listtype === '文章列表') {
        await getArticlesList({ author: username, page }).then((res) => {
          if (res.status === 200) {
            getArticleDataOthers(res);
          }
        }).catch((err) => {
          console.log(err);
          this.$Message.error('获取文章发生错误');
        });
      } else if (this.typeName === 'reward' && this.listtype === '他赞赏的') {
        await getArticleSupports({ user: username, page }).then((res) => {
          if (res.status === 200) {
            getArticleDataOthers(res);
          }
        }).catch((err) => {
          console.log(err);
          this.$Message.error('获取文章发生错误');
        });
      }
    },
  },
  data() {
    return {
      refreshing: false,
      typeName: 'original', // 默认
      articlesTab: {
        original: {
          articles: [],
          page: 1,
          busy: false,
        },
        reward: {
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
  font-weight: bold;
}
.userarticles{
  margin-top: -45px;
}
.article {
  text-align: left;
}
.card {
  margin: 5px;
}
</style>
