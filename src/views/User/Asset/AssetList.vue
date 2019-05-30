<template>
  <BasePull
    :loadingText="{
        nomore: '',
        noresults: '无明细', }"
    :params="params"
    :apiUrl="apiUrl"
    :needAccessToken="needAccessToken"
    :isObj="isObj"
    @getListData="getListData">
      <AssetCard :asset="item" v-for="(item, index) in asset" :key="index" />
  </BasePull>
</template>

<script>
import { AssetCard } from '@/components/';

export default {
  name: 'AssetList',
  props: ['type'],
  components: { AssetCard },
  created() { },
  data() {
    return {
      params: {
        symbol: this.type,
      },
      apiUrl: 'tokens',
      asset: [],
      isObj: { type: 'newObject', key: 'data', keys: 'logs' },
      needAccessToken: true,
    };
  },
  computed: { },
  methods: {
    getListData(res) {
      const historyFilter = res.list.filter(i => i.amount !== 0); // 过滤金额为0
      this.asset = historyFilter;
      this.$emit('getOtherAsset', res);
    },
  },
};
</script>
