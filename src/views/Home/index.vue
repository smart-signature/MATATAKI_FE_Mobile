<template>
  <div class="home mw">
    <!-- 首页头部 -->
    <home-head
      :nav="navList"
      :now-index="nowIndex"
      @toggleNav="toggleNav"
      @login="showSidebar = true"
    />

    <!-- 首页内容 -->
    <div
      v-for="(item, index) in content"
      v-show="nowIndex === index"
      :key="index"
      class="home-content"
    >
      <!-- 首页内容导航 -->
      <home-nav
        :nav-menu="item.navMenu"
        :active-index="item.activeIndex"
        @toggleNavMenu="index => (item.activeIndex = index)"
      />

      <homeSlide
        v-show="isShowSlide"
        :recommend="item.recommend"
        :slide-index="index"
        :now-index="nowIndex"
      />

      <div class="now-title" :class="!isShowSlide && 'nav-hide'">{{ contentTitle }}</div>

      <BasePull
        v-for="(itemList, indexList) in item.navMenu"
        v-show="item.activeIndex === indexList"
        :key="indexList"
        :params="itemList.params"
        :api-url="itemList.apiUrl"
        :active-index="item.activeIndex"
        :now-index="indexList"
        :is-obj="{ type: 'Object', key: 'data' }"
        :auto-request-time="item.autoRequestTime"
        @getListData="getListData"
      >
        <template v-if="itemList.articles.length === 0">
          <ContentLoader
            v-for="itemLoader in [0, 1, 2]"
            :key="itemLoader"
            :height="80"
            :speed="2"
            primary-color="#f3f3f3"
            secondary-color="#ecebeb"
          >
            <rect x="20" y="20" rx="4" ry="4" width="120" height="60" />
            <rect x="150" y="20" rx="0" ry="0" width="235" height="30" />
            <rect x="150" y="60" rx="0" ry="0" width="235" height="20" />
          </ContentLoader>
        </template>
        <template v-else>
          <ArticleCard
            v-for="(itemArticle, indexArticle) in itemList.articles"
            :key="indexArticle"
            :now-index="nowIndex"
            :article="itemArticle"
          />
        </template>
      </BasePull>
    </div>

    <Sidebar v-model="showSidebar"></Sidebar>
  </div>
</template>

<script>
import { ContentLoader } from "vue-content-loader";
import homeHead from "./components/homeHead.vue";
import homeNav from "./components/homeNav.vue";
import homeSlide from "./components/homeSlide.vue";
import Sidebar from "./Sidebar.vue";
import { ArticleCard } from "@/components/";

import { backendAPI } from "@/api";

export default {
  name: "Home",
  components: {
    homeHead,
    homeNav,
    homeSlide,
    ArticleCard,
    ContentLoader,
    Sidebar
  },
  data() {
    return {
      showSidebar: false,
      navList: ["文章", "商品"], // head data
      nowIndex: 0,
      // 防止数据嵌套太多 把内容提取出来
      content: [
        {
          navMenu: [
            {
              label: "最新",
              title: "最新文章",
              params: {
                channel: 1
              },
              apiUrl: "homeTimeRanking",
              articles: []
            },
            {
              label: "最热",
              title: "最热文章",
              params: {
                channel: 1
              },
              apiUrl: "homeSupportsRanking",
              articles: []
            },
            {
              label: "EOS",
              title: "最多EOS",
              params: {
                channel: 1,
                symbol: "eos"
              },
              apiUrl: "homeAmountRankingEOS",
              articles: []
            },
            {
              label: "ONT",
              title: "最多ONT",
              params: {
                channel: 1,
                symbol: "ont"
              },
              apiUrl: "homeAmountRankingONT",
              articles: []
            }
          ],
          autoRequestTime: 0,
          activeIndex: 0,
          recommend: {
            title: "推荐文章",
            list: []
          }
        },
        {
          navMenu: [
            {
              label: "最新",
              title: "最新商品",
              params: {
                channel: 2
              },
              apiUrl: "homeTimeRanking",
              articles: []
            },
            {
              label: "最热",
              title: "最热商品",
              params: {
                channel: 2
              },
              apiUrl: "homeSupportsRanking",
              articles: []
            }
          ],
          autoRequestTime: 0,
          activeIndex: 0,
          recommend: {
            title: "推荐商品",
            list: []
          }
        }
      ]
    };
  },
  computed: {
    // 内容标题
    contentTitle() {
      const index = this.content[this.nowIndex].activeIndex;
      return this.content[this.nowIndex].navMenu[index].title;
    },
    // 是否显示推荐文章或者商品
    isShowSlide() {
      return this.content[this.nowIndex].activeIndex === 0;
    },
    isHaveArticle() {
      const index = this.content[this.nowIndex].activeIndex;
      const status = this.content[this.nowIndex].navMenu[index].articles.length;
      console.log(status);
      return status;
    }
  },
  created() {
    document.title = "首页 - SmartSignature";
    this.postsRecommend(1);
    this.postsRecommend(2);
  },
  mounted() {},
  methods: {
    toggleNav(index) {
      this.nowIndex = index;
      if (this.content[this.nowIndex].autoRequestTime === 0 && this.nowIndex === 1)
        this.content[this.nowIndex].autoRequestTime += Date.now();
    },
    // 获取文章列表数据
    getListData(res) {
      console.log(this.nowIndex, res.index);
      this.content[this.nowIndex].navMenu[res.index].articles = res.list;
    },
    // 获取推荐文章或者商品
    async postsRecommend(channel) {
      console.log(channel);
      await backendAPI
        .postsRecommend(channel)
        .then(res => {
          console.log(res);
          if (res.status === 200 && res.data.code === 0) {
            if (channel === 1) this.content[0].recommend.list = res.data.data;
            else if (channel === 2) this.content[1].recommend.list = res.data.data;
          } else {
            console.log("获取推荐失败");
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<style scoped lang="less" src="./index.less"></style>
