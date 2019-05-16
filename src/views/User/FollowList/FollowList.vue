<template>
  <div class="mw draftbox">
    <BaseHeader :pageinfo="{ title: '列表', rightPage: 'home', needLogin: false, }" />
    <za-tabs v-model="activeIndex" @change="changeTabs">
      <za-tab-pane :label="item.label" :name="index" v-for="(item, index) in tabsData" :key="index">
        <BasePull
          class="draftbox-list"
          :loadingText = "{
            start: '😄 勤奋地加载更多精彩内容 😄',
            end: `🎉 哇，你真勤奋，所有关注/粉丝已经加载完了～ 🎉`,
            noArticles: `无关注/粉丝`,
          }"
          :params="item.params"
          :apiUrl="item.apiUrl"
          :activeIndex="activeIndex"
          :nowIndex="index"
          :isObj="{ type: 'Object', key: 'list' }"
          @getListData="getListData"
          >
            <list :list="item" v-for="(item, index) in item.articles" :key="index"/>
        </BasePull>
      </za-tab-pane>
    </za-tabs>
  </div>
</template>

<script>
import list from './list.vue';
import { getAvatarImage } from '@/api';

export default {
  name: 'DeaftBox',
  props: ['username', 'listtype'],
  components: { list },
  data() {
    return {
      tabsData: [
        {
          label: '关注',
          params: {
            user: this.username,
          },
          apiUrl: 'follows',
          articles: [],
        },
        {
          label: '粉丝',
          params: {
            user: this.username,
          },
          apiUrl: 'fans',
          articles: [],
        },
      ],
      activeIndex: 0,
      activeIndexName: this.listtype,
    };
  },
  created() {
    if (this.activeIndexName === '关注') this.activeIndex = 0;
    else if (this.activeIndexName === '粉丝') this.activeIndex = 1;
    else this.activeIndex = 0;
  },
  methods: {
    changeTabs(tab) {
      this.activeIndex = tab.name;
    },
    getListData(res) {
      res.data.list.map(i => i.avatar = getAvatarImage(i.avatar));
      this.tabsData[res.index].articles = res.data.list;
    },
  },
};
</script>
<style scoped>
.draftbox {
  padding-bottom: 20px;
  padding-top: 45px;
}
.draftbox-list {
  margin: 10px 0 0;
}
</style>
