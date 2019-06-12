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
    id: {
      type: String,
    },
  },
  components: {
    ArticleCard,
  },
  computed: {

  },
  created() {
    const { listtype } = this;
    this.getUsername(this.id).then((username) => {
      if (listtype === 'others') {
        this.tabsData = [
          {
            label: '文章列表',
            params: { author: username },
            apiUrl: 'homeTimeRanking',
            articles: [],
          },
          {
            label: '他赞赏的',
            params: { user: username },
            apiUrl: 'userArticlesSupportedList',
            articles: [],
          },
        ];
      } else if (listtype === 'original') {
        this.apiUrl = 'homeTimeRanking';
        this.params = { author: username };
      } else if (listtype === 'reward') {
        this.apiUrl = 'userArticlesSupportedList';
        this.params = { user: username };
      }
    });
  },
  methods: {
    getListData(res) {
      this.articles = res.list;
    },
    getListDataTab(res) {
      this.tabsData[res.index].articles = res.list;
    },
    async getUsername(id) {
      const { data: { data } } = await this.$backendAPI.getUser({ id });
      return data.username;
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
