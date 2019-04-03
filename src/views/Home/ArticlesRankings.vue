<template>
  <div class="articles">
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <ArticlesRanking :orderType="tab.label" />
      </za-tab-pane>
    </za-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ArticlesRanking from './ArticlesRanking';
import { getArticlesList } from '@/api/';
import { OrderBy, getArticles } from '@/api/backend';

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
  components: { ArticlesRanking },
  created() {
  },
  methods: {
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  data() {
    return {
      orderBy: OrderBy, // <template> 只认 data 内的变量
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
