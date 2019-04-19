<template>
  <PullComponents
    :loadingText="{
      start: '😄 勤奋地加载更多精彩内容 😄',
      end: '🎉 哇，你真勤奋，所有评论已经加载完了～ 🎉',
      noArticles: '无评论',
    }"
    :params="params"
    :apiUrl="apiUrl"
    :isRefresh="false"
    @getListData="getListData"
    >
      <CommentCard :comment="item" v-for="(item, index) in articles" :key="index"/>
  </PullComponents>
</template>

<script>
import PullComponents from '@/components/PullComponents.vue';
import { CommentCard } from '@/components/';

export default {
  props: ['signId'],
  components: {
    PullComponents,
    CommentCard,
  },
  watch: {
    signId(newVal) {
      this.params = {
        signid: newVal,
      };
    },
  },
  created() {},
  data() {
    return {
      params: {
        signid: this.signId,
      },
      apiUrl: 'shares',
      articles: [],
    };
  },
  methods: {
    getListData(res) {
      console.log(res);
      this.articles = res.data;
    },
  },
};
</script>
