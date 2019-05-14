<template>
  <div class="draftbox">
    <BaseHeader :pageinfo="{ left: 'back', title: '草稿箱', rightPage: 'home', needLogin: false, }"/>
    <BasePull
    :loadingText="{ start: '更多...',
        end: '',
        noArticles: '无草稿', }"
    :params="params"
    :apiUrl="apiUrl"
    @getListData="getListData">
    <DraftBoxList :draftbox="item" :index="index"  v-for="(item, index) in draftBoxList" :key="index" @delId="delId"/>
  </BasePull>
  </div>
</template>

<script>
import { delDraft } from '@/api';
import DraftBoxList from './DraftBoxList.vue';

export default {
  name: 'DeaftBox',
  data() {
    return {
      params: {},
      apiUrl: 'drafts',
      draftBoxList: [],
      delModel: false,
    };
  },
  components: {
    DraftBoxList,
  },
  methods: {
    getListData(res) {
      // console.log(res);
      this.draftBoxList = res.data;
    },
    delId(data) {
      const { id, index } = data;
      if (!id) {
        console.log('没有id');
        return;
      }
      this.$Modal.confirm({
        title: '确定删除？',
        content: '<p>确定删除草稿箱文章？</p>',
        loading: true,
        onOk: () => {
          this.asyncSuccessDel(id, index);
        },
      });
    },
    // 删除草稿
    async asyncSuccessDel(id, index) {
      await delDraft({ id },
        ({ error, response }) => {
          // console.log(error, response);
          if (response.status !== 200 || error || !response) return console.log('自动删除草稿失败,请手动删除');
          this.draftBoxList.splice(index, 1); // 前端手动删除一下数据
          this.$Modal.remove();
        });
    },
  },
  mounted() {
  },
};
</script>
<style scoped lang="less">
.draftbox{
  background-color: #F7F7F7;
  padding-bottom: 20px;
  padding-top: 45px;
  min-height: 100%;
}
</style>
