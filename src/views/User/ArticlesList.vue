<template>
  <div>
    <div v-if="tabsData.length >= 2">
      <Tabs :value="activeIndex">
        <TabPane v-for="(item, index) in tabsData" :key="index" :label="item.label">
          <BasePull
            :params="item.params"
            :apiUrl="item.apiUrl"
            :activeIndex="activeIndex"
            :nowIndex="index"
            :loadingText="loadingText"
            :isObj="{type: 'Object', key: 'data'}"
            @getListData="getListDataTab"
            >
              <ArticleCard :article="item" v-for="(item, index) in item.articles" :key="index"/>
          </BasePull>
        </TabPane>
      </Tabs>
    </div>
    <div v-else>
      <BasePull
        :params="params"
        :apiUrl="apiUrl"
        :loadingText="loadingText"
        :isObj="{type: 'Object', key: 'data'}"
        @getListData="getListData"
        >
          <ArticleCard :article="item" v-for="(item, index) in articles" :key="index"/>
      </BasePull>
      </div>
  </div>
</template>

<script>
import { ArticleCard } from '@/components/';

export const TimeLine = '最新发布';
export default {
  name: 'ArticlesList',
  props: {
    listtype: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
  },
  components: {
    ArticleCard,
  },
  created() {
    const { listtype } = this;
    if (listtype === 'others') {
      this.tabsData = [
        {
          label: '文章列表',
          params: { author: this.username },
          apiUrl: '/posts/timeRanking',
          articles: [],
        },
        {
          label: '他赞赏的',
          params: { user: this.username },
          apiUrl: '/posts/supported',
          articles: [],
        },
      ];
    } else if (listtype === 'original') {
      this.apiUrl = '/posts/timeRanking';
      this.params = { author: this.username };
    } else if (listtype === 'reward') {
      this.apiUrl = '/posts/supported';
      this.params = { user: this.username };
    }
  },
  methods: {
    getListData(res) {
      this.articles = res.list;
    },
    getListDataTab(res) {
      this.tabsData[res.index].articles = res.list;
    },
  },
  data() {
    return {
      tabsData: [],
      params: {},
      apiUrl: '',
      articles: [],
      activeIndex: 0,
      loadingText: {
        nomore: '',
        noresults: '无文章',
      },
    };
  },
};
</script>

<style lang="less">
  a {
    color: black;
  }
</style>
