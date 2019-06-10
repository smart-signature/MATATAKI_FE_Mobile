<template>
  <div class="tag mw">
    <BaseHeader :pageinfo="{ title: '' }" :white="true" :customizeHeaderBc="tagBanner" />
    <div class="tag-banner" :style="{backgroundColor: tagBanner}">
      <div class="tag-banner-title">
        <img src="@/assets/img/icon_article_tag.svg" alt="tag" />
        <span>深剖区块链</span>
      </div>
    </div>
    <p class="tag-title">最新</p>
    <BasePull
    class="tag-article"
    :loadingText="{
      nomore: '',
      noresults: '无草稿', }"
    :params="params"
    :isObj="{type: 'Object', key: 'data'}"
    :apiUrl="apiUrl"
    @getListData="getListData">
      <ArticleCard :article="item" v-for="(item, index) in tagList" :key="index"/>
    </BasePull>
  </div>
</template>

<script>
import tagColor from "@/common/tagColor";
import { ArticleCard } from '@/components/';

export default {
  name: 'Tag',
  props: ['id'],
  components: { ArticleCard },
  data(){
    return {
      tagBanner: '#eee',
      tagList: [],
      params: {},
      apiUrl: 'homeTimeRanking',
    }
  },
  created() {
    this.tagBanner = tagColor()[this.id]
  },
  methods: {
    getListData(res) {
      console.log(res)
      this.tagList = res.list;
    }
  }
}
</script>

<style src="./index.less" scoped lang="less"></style>