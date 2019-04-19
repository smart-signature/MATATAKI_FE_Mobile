<template>
  <PullComponents
    :loadingText="{ start: '😄 勤奋地加载更多精彩内容 😄',
        end: '🎉 哇，你真勤奋，所有明细已经加载完了～ 🎉',
        noArticles: '无明细', }"
    :params="params"
    :apiUrl="apiUrl"
    :isObj="{ type: 'Object', key: 'history' }"
    @getListData="getListData">
      <AssetCard :asset="item" v-for="(item, index) in asset" :key="index" />
  </PullComponents>
</template>

<script>
import PullComponents from '@/components/PullComponents.vue';
import { AssetCard } from '@/components/';

export default {
  name: 'AssetList',
  props: ['username'],
  components: { PullComponents, AssetCard },
  created() {
  },
  data() {
    return {
      params: {
        user: this.username,
      },
      apiUrl: 'assets',
      asset: [],
    };
  },
  computed: { },
  methods: {
    getListData(res) {
      // console.log(res);
      const historyFilter = res.list.filter(i => i.amount !== 0); // 过滤金额为0
      this.asset = historyFilter;
      this.$emit('getOtherAsset', res);
    },
  },
};
</script>
