<template>
  <div class="mw buy">
    <BaseHeader :pageinfo="{ title: '购买记录'}"  />
    <BasePull
      :params="params"
      :apiUrl="apiUrl"
      :loadingText="{
        nomore: '',
        noresults: '暂无购买记录', }"
      :isObj="{type: 'Object', key: 'data'}"
      @getListData="getListData"
      :needAccessToken="true"
      >
        <buyCard :buy="item" v-for="(item, index) in buyList" :key="index"/>
    </BasePull>
  </div>
</template>

<script>
import buyCard from './buyCard.vue';

export default {
  name: 'BuyHistory',
  components: {
    buyCard,
  },
  data() {
    return {
      buyList: [],
      params: '',
      apiUrl: 'buyHistory',
    };
  },
  created() {
  },
  methods: {
    getListData(res) {
      this.buyList = res.list;
    },
  },
};
</script>


<style lang="less" scoped src="./index.less"></style>
