<template>
  <div class="tag mw">
    <BaseHeader :pageinfo="{ title: '' }" :white="true" :customizeHeaderBc="tagBanner" />
    <div class="tag-banner" :style="{backgroundColor: tagBanner}">
      <div class="tag-banner-title">
        <img src="@/assets/img/icon_article_tag.svg" alt="tag" />
        <span>{{tagTitle}}</span>
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
import tagColor from '@/common/tagColor';
import { ArticleCard } from '@/components/';

export default {
  name: 'Tag',
  components: { ArticleCard },
  data() {
    return {
      tagTitle: '',
      tagBanner: '#000',
      tagList: [],
      params: {
        tagid: this.$route.query.id,
      },
      apiUrl: 'getPostByTagById',
    };
  },
  created() {
    this.tagBanner = tagColor()[this.$route.query.id] || '#000';
    this.tagTitle = this.$route.query.name;
  },
  methods: {
    getListData(res) {
      // console.log(res);
      this.tagList = res.list;
    },
  },
};
</script>

<style src="./index.less" scoped lang="less"></style>
