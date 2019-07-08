<template>
  <div>
    <div>
      <div class="tabs">
        <div
          v-for="(item, index) in tabsData"
          :key="index"
          class="tabs-item"
          :class="activeIndex === index && 'active'"
          @click="toggleTabs(index)"
        >
          {{ item.label }}
        </div>
      </div>
      <div v-for="(item, index) in tabsData" v-show="activeIndex === index" :key="index">
        <BasePull
          :params="item.params"
          :api-url="item.apiUrl"
          :active-index="activeIndex"
          :now-index="index"
          :loading-text="item.loadingText"
          :is-obj="{ type: 'Object', key: 'data' }"
          @getListData="getListDataTab"
        >
          <ArticleCard
            v-for="(item, index) in item.articles"
            :key="index"
            :class="listtype !== 'others' && 'card-margin'"
            :article="item"
            :now-index="activeIndex"
          />
        </BasePull>
      </div>
    </div>
    <!-- <Tabs :value="activeIndex">
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
          <ArticleCard
            v-for="(item, index) in item.articles"
            :key="index"
            class="card-margin"
            :article="item"
          />
        </BasePull>
      </TabPane>
    </Tabs> -->
  </div>
</template>

<script>
import { ArticleCard } from '@/components/';

export default {
  name: 'ArticlesList',
  components: { ArticleCard },
  props: {
    listtype: {
      type: String,
      required: true
    },
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tabsData: [],
      activeIndex: 0
    };
  },
  computed: {},
  created() {
    const { id, listtype } = this;
    if (listtype === 'others') {
      this.tabsData = [
        {
          label: '原创',
          params: { author: id },
          apiUrl: 'homeTimeRanking',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无文章'
          }
        },
        {
          label: '投资',
          params: { user: id },
          apiUrl: 'userArticlesSupportedList',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无投资'
          }
        }
      ];
    } else if (listtype === 'original') {
      this.tabsData = [
        {
          label: '文章',
          params: { author: id, channel: 1 },
          apiUrl: 'homeTimeRanking',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无文章'
          }
        },
        {
          label: '商品',
          params: { author: id, channel: 2 },
          apiUrl: 'homeTimeRanking',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无商品'
          }
        }
      ];
    } else if (listtype === 'reward') {
      this.tabsData = [
        {
          label: '文章',
          params: { user: id, channel: 1 },
          apiUrl: 'userArticlesSupportedList',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无文章'
          }
        },
        {
          label: '商品',
          params: { user: id, channel: 2 },
          apiUrl: 'userArticlesSupportedList',
          articles: [],
          loadingText: {
            nomore: '',
            noresults: '暂无商品'
          }
        }
      ];
    }
  },
  methods: {
    toggleTabs(i) {
      this.activeIndex = i;
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

<style lang="less" scoped>
.card-margin {
  margin: 0 0 10px 0;
}

.tabs {
  display: flex;
  align-items: center;
  padding: 0 20px;
  margin: 10px 0;

  &-item {
    font-size: 20px;
    font-weight: 400;
    color: rgba(178, 178, 178, 1);
    cursor: pointer;
    transform: all 0.3s;
    &.active {
      color: rgba(51, 51, 51, 1);
    }
    &:nth-last-child(1) {
      margin-left: 25px;
    }
  }
}
</style>
