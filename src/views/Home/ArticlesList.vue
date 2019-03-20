<template>
  <div class="articles">
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <za-pull :on-refresh="refresh" :refreshing="refreshing">
          <div class="content" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
            <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
          </div>
          <p class="loading-stat">{{displayAboutScroll}}</p>
        </za-pull>
      </za-tab-pane>
    </za-tabs>
  </div>
</template>

<script>
import axios from 'axios';
import { getArticlesList } from '@/api/';
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';

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
    this.getArticlesList();
  },
  methods: {
    async getArticlesList(page) {
      this.busy = true;
      const { data } = await getArticlesList({ page });
      this.articles = data;
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
      refreshing: false,
      articles: [],
      busy: false,
      page: 1,
      isTheEndOfTheScroll: false,
      activeNameSwipe: 'TimeLine',
      selectedLabelDefault: 'TimeLine',
      tabs: [
        {
          label: 'TimeLine',
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
