<template>
  <div class="mw draftbox">
    <BaseHeader :pageinfo="{ title: '列表', rightPage: 'home' }" />
    <Tabs :value="activeIndex">
      <TabPane v-for="(item, index) in tabsData" :key="index" :label="item.label">
        <BasePull
          class="draftbox-list"
          :loading-text="loadingText"
          :params="item.params"
          :api-url="item.apiUrl"
          :active-index="activeIndex"
          :need-access-token="true"
          :now-index="index"
          :is-obj="{ type: 'newObject', key: 'data', keys: 'list' }"
          @getListData="getListData"
        >
          <list v-for="(item, index) in item.articles" :key="index" :list="item" :owner-id="id" />
        </BasePull>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import list from "./list.vue";

export default {
  name: "DeaftBox",
  components: { list },
  props: ["id", "listtype"],
  data() {
    return {
      tabsData: [
        {
          label: "关注",
          params: { uid: this.id },
          apiUrl: "followsList",
          articles: []
        },
        {
          label: "粉丝",
          params: { uid: this.id },
          apiUrl: "fansList",
          articles: []
        }
      ],
      activeIndex: 0,
      activeIndexName: this.listtype,
      loadingText: {
        nomore: "",
        noresults: "没有关注或粉丝"
      }
    };
  },
  computed: {},
  created() {
    if (this.activeIndexName === "关注") this.activeIndex = 0;
    else if (this.activeIndexName === "粉丝") this.activeIndex = 1;
    else this.activeIndex = 0;
  },
  methods: {
    getListData(res) {
      this.tabsData[res.index].articles = res.list;
    }
  }
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
