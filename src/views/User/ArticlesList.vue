<template>
  <div>
    <div v-if="tabsData.length >= 2">
      <Tabs :value="activeIndex">
        <TabPane v-for="(item, index) in tabsData" :key="index" :label="item.label">
          <BasePull
            :params="item.params"
            :api-url="item.apiUrl"
            :active-index="activeIndex"
            :now-index="index"
            :loading-text="loadingText"
            :is-obj="{ type: 'Object', key: 'data' }"
            @getListData="getListDataTab"
          >
            <ArticleCard v-for="(item, index) in item.articles" :key="index" :article="item" />
          </BasePull>
        </TabPane>
      </Tabs>
    </div>
    <div v-else>
      <BasePull
        :params="params"
        :api-url="apiUrl"
        :loading-text="loadingText"
        :is-obj="{ type: 'Object', key: 'data' }"
        @getListData="getListData"
      >
        <ArticleCard v-for="(item, index) in articles" :key="index" :article="item" />
      </BasePull>
    </div>
  </div>
</template>

<script>
import { ArticleCard } from "@/components/";

export const TimeLine = "最新发布";
export default {
  name: "ArticlesList",
  components: { ArticleCard },
  props: {
    listtype: {
      type: String,
      required: true
    },
    id: {
      type: String
    }
  },
  data() {
    return {
      tabsData: [],
      params: {},
      apiUrl: "",
      articles: [],
      activeIndex: 0,
      loadingText: {
        nomore: "",
        noresults: "无文章"
      }
    };
  },
  computed: {},
  created() {
    const { id, listtype } = this;
    if (listtype === "others") {
      this.tabsData = [
        {
          label: "文章列表",
          params: { author: id },
          apiUrl: "homeTimeRanking",
          articles: []
        },
        {
          label: "他赞赏的",
          params: { user: id },
          apiUrl: "userArticlesSupportedList",
          articles: []
        }
      ];
    } else if (listtype === "original") {
      this.apiUrl = "homeTimeRanking";
      this.params = { author: id };
    } else if (listtype === "reward") {
      this.apiUrl = "userArticlesSupportedList";
      this.params = { user: id };
    }
  },
  methods: {
    getListData({ list }) {
      this.articles = list;
    },
    getListDataTab({ index, list }) {
      this.tabsData[index].articles = list;
    },
    async getUsername(id) {
      const {
        data: { data }
      } = await this.$backendAPI.getUser({ id });
      return data.username;
    }
  }
};
</script>

<style lang="less">
a {
  color: black;
}
</style>
