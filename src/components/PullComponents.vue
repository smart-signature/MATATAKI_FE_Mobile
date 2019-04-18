<template>
    <!-- 负责刷新 -->
    <za-pull :on-refresh="refresh" :refreshing="refreshing">
      <!-- 负责滚动 -->
        <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
          <slot></slot>
        </div>
        <p v-if="articles.length !== 0" class="loading-stat">{{displayAboutScroll}}</p>
        <p v-else class="loading-stat">{{loadingText.noArticles}}</p>
    </za-pull>
</template>

<script>
import { apiServer } from '@/api/backend';
import axios from 'axios';

export default {
  name: 'PullComponents',
  props: {
    // 加载完的文字提示
    loadingText: {
      type: Object,
      default: () => ({
        start: '😄 勤奋地加载更多精彩内容 😄',
        end: '🎉 哇，你真勤奋，所有文章已经加载完了～ 🎉',
        noArticles: '无文章',
      }),
    },
    // 传进来的params
    params: {
      type: Object,
    },
    // api 地址
    apiUrl: {
      type: String,
      required: true,
    },
    // 当前聚焦索引
    activeIndex: {
      type: Number,
      default: 0,
    },
    // 当前索引
    nowIndex: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    displayAboutScroll() {
      return this.isTheEndOfTheScroll ? this.loadingText.end : this.loadingText.start;
    },
  },
  watch: {
    activeIndex(nweVal) {
      this.activeIndexCopy = nweVal;
      if (this.articles.length === 0) this.loadMore();
    },
  },
  created() { },
  methods: {
    // 滚动 isEmptyArray 是否清空数组
    async loadMore(isEmptyArray = false) {
      if (this.nowIndex !== this.activeIndexCopy || this.isTheEndOfTheScroll) return;
      this.busy = true;
      const params = this.params || {};
      params.page = this.page;
      axios.get(`${apiServer}/${this.apiUrl}`, { params }).then(({ data }) => {
        // 清空数组 ps: 如果在 refresh 里面清空数组
        // 1.点击的时会先执行触摸刷新的方法 导致无法正常单击切换页面
        // 2.因为先执行触摸方法 清空了数组 会给页面造成影响
        if (isEmptyArray) this.articles.length = 0;
        // Merge arrays with destruction
        this.articles = [...this.articles, ...data];
        this.$emit('getListData', {
          data: this.articles,
          index: this.nowIndex,
        });
        if (data.length >= 0 && data.length < 20) this.isTheEndOfTheScroll = true;
        else this.page += 1;
        this.busy = false;
        // 列表最后一列小于二十显示加载完
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取文章发生错误');
        this.busy = true;
        this.isTheEndOfTheScroll = true;
      });
    },
    // 刷新
    async refresh() {
      this.refreshing = true;
      this.isTheEndOfTheScroll = false; // 显示未加载完成
      this.page = 1; // 重置分页索引
      await this.loadMore(true);
      this.refreshing = false;
    },
  },
  data() {
    return {
      refreshing: false, // 刷新
      page: 1, // 分页
      busy: false, // 是否加载完成
      articles: [],
      isTheEndOfTheScroll: false,
      activeIndexCopy: this.activeIndex,
    };
  },
};
</script>

<style scoped>
/* 加载更多提示 */
.loading-stat {
  margin: 10px;
  color: #999;
  font-size: 13px;
}
</style>
