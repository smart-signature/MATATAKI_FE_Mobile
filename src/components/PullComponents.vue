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
    // 返回的数据是对象还是数组
    isObj: {
      type: Object,
      default: () => ({
        type: 'Array',
        key: '',
      }),
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
        if (isEmptyArray) this.articles.length = 0;
        if (this.isObj.type === 'Array') {
          // 如果返回的数据是 Array 返回整个 data
          this.articles = [...this.articles, ...data];
          this.$emit('getListData', {
            data: this.articles,
            index: this.nowIndex,
          });
          if (data.length >= 0 && data.length < 20) this.isTheEndOfTheScroll = true;
        } else if (this.isObj.type === 'Object') {
          // 如果返回的是 Object 根据传进来的字段获取相应的 list
          const resData = data[this.isObj.key];
          this.articles = [...this.articles, ...resData];
          this.$emit('getListData', {
            data,
            list: this.articles,
            index: this.nowIndex,
          });
          if (resData.length >= 0 && resData.length < 20) this.isTheEndOfTheScroll = true;
        }
        this.page += 1;
        this.busy = false;
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
  margin: 20px 0;
  color: #999;
  font-size: 14px;
  text-align: center;
}
</style>
