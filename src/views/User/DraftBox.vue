<template>
  <div class="draftbox mw">
    <BaseHeader :pageinfo="{ left: 'back', title: '我的草稿', rightPage: 'home' }" />
    <BasePull
      :loading-text="'无草稿'"
      :params="params"
      :api-url="apiUrl"
      :need-access-token="true"
      :is-obj="{ type: 'Object', key: 'data' }"
      @getListData="getListData"
    >
      <DraftBoxList
        v-for="(item, index) in draftBoxList"
        :key="index"
        :draftbox="item"
        :index="index"
        @delId="delId"
      />
    </BasePull>
  </div>
</template>

<script>
import DraftBoxList from "./DraftBoxList.vue";

export default {
  name: "DeaftBox",
  components: {
    DraftBoxList
  },
  data() {
    return {
      params: {},
      apiUrl: "draftboxList",
      draftBoxList: [],
      delModel: false
    };
  },
  mounted() {},
  methods: {
    getListData(res) {
      console.log(res);
      this.draftBoxList = res.list;
    },
    delId(data) {
      const { id, index } = data;
      if (!id) {
        console.log("没有id");
        return;
      }
      this.$Modal.confirm({
        title: "确定删除？",
        content: "<p>确定删除草稿箱文章？</p>",
        loading: true,
        onOk: () => {
          this.asyncSuccessDel(id, index);
        }
      });
    },
    // 删除草稿
    async asyncSuccessDel(id, index) {
      try {
        const response = await this.$backendAPI.delDraft({ id });
        if (response.status !== 200) return console.log("自动删除草稿失败,请手动删除");
        this.draftBoxList.splice(index, 1); // 前端手动删除一下数据
        this.$Modal.remove();
      } catch (error) {
        return console.log("自动删除草稿失败,请手动删除");
      }
    }
  }
};
</script>
<style scoped lang="less">
.draftbox {
  background-color: #f7f7f7;
  padding-bottom: 20px;
  padding-top: 45px;
  min-height: 100%;
}
</style>
