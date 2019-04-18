<template>
  <za-tabs v-model="activeIndex" @change="changeTabs">
    <za-tab-pane :label="item.label" :name="index" v-for="(item, index) in tabsData" :key="index">
      <PullComponents
        :params="item.params"
        :apiUrl="item.apiUrl"
        :activeIndex="activeIndex"
        :nowIndex="index"
        @getListData="getListData"
        >
          <ArticleCard :article="item" v-for="(item, index) in item.articles" :key="index"/>
      </PullComponents>
    </za-tab-pane>
  </za-tabs>
</template>

<script>
import PullComponents from '@/components/PullComponents.vue';
import { ArticleCard } from '@/components/';

export default {
  name: 'ArticlesRankings',
  components: { PullComponents, ArticleCard },
  created() {},
  methods: {
    changeTabs(tab) {
      this.activeIndex = tab.name;
    },
    getListData(res) {
      this.tabsData[res.index].articles = res.data;
    },
  },
  data() {
    return {
      tabsData: [
        {
          label: '最新发布',
          params: {},
          apiUrl: 'posts',
          articles: [],
        },
        {
          label: '最多赞赏金额',
          params: {},
          apiUrl: 'getSupportAmountRanking',
          articles: [],
        },
        {
          label: '最多赞赏次数',
          params: {},
          apiUrl: 'getSupportTimesRanking',
          articles: [],
        },
      ],
      activeIndex: 0,
    };
  },
};
</script>

<style scoped></style>
