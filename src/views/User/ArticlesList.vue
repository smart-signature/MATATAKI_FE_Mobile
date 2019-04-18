<template>
  <div>
    <div v-if="tabsData.length >= 2">
      <za-tabs v-model="activeIndex" @change="changeTabs">
        <za-tab-pane :label="item.label" :name="index" v-for="(item, index) in tabsData" :key="index">
          <PullComponents
            :params="item.params"
            :apiUrl="item.apiUrl"
            :activeIndex="activeIndex"
            :nowIndex="index"
            @getListData="getListDataTab"
            >
              <ArticleCard :article="item" v-for="(item, index) in item.articles" :key="index"/>
          </PullComponents>
        </za-tab-pane>
      </za-tabs>
    </div>
    <div v-else>
        <PullComponents
        :params="params"
        :apiUrl="apiUrl"
        @getListData="getListData"
        >
          <ArticleCard :article="item" v-for="(item, index) in articles" :key="index"/>
      </PullComponents>
      </div>
  </div>
</template>

<script>
import PullComponents from '@/components/PullComponents.vue';
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
    PullComponents,
  },
  created() {
    if (this.listtype === 'others') {
      this.tabsData = [
        {
          label: '文章列表',
          params: {
            author: this.username,
          },
          apiUrl: 'posts',
          articles: [],
        },
        {
          label: '他赞赏的',
          params: {
            user: this.username,
          },
          apiUrl: 'supports',
          articles: [],
        },
      ];
    } else if (this.listtype === 'original') {
      this.apiUrl = 'posts';
      this.params = {
        author: this.username,
      };
    } else if (this.listtype === 'reward') {
      this.apiUrl = 'supports';
      this.params = {
        user: this.username,
      };
    }
  },
  methods: {
    changeTabs(tab) {
      this.activeIndex = tab.name;
    },
    getListData(res) {
      this.articles = res.data;
    },
    getListDataTab(res) {
      this.tabsData[res.index].articles = res.data;
    },
  },
  data() {
    return {
      tabsData: [],
      params: {},
      apiUrl: '',
      articles: [],
      activeIndex: 0,
    };
  },
};
</script>
