<template>
  <BasePull
    :loadingText="{
      nomore: '',
      noresults: '暂无赞赏评论',
    }"
    :params="params"
    :apiUrl="apiUrl"
    :isRefresh="false"
    :autoRequestTime="autoRequestTime"
    :needAccessToken="true"
    :isObj="isObj"
    @getListData="getListData"
    >
      <CommentCard :comment="item" v-for="(item, index) in articles" :key="index" :type="type"/>
  </BasePull>
</template>

<script>
import { CommentCard } from '@/components/';
import { mapGetters } from 'vuex';

export default {
  props: ['signId', 'isRequest', 'type'],
  components: { CommentCard },
  watch: {
    signId(newVal) {
      this.params = {
        signid: newVal,
      };
    },
    isRequest(newVal) {
      if (newVal) {
        this.timer = setInterval(() => {
          if (this.autoRequestTime >= 2) {
            clearInterval(this.timer);
            this.$emit('stopAutoRequest', false);
          }
          this.autoRequestTime += 1;
        }, 2000);
      } else {
        clearInterval(this.timer);
      }
    },
  },
  created() {
  },
  computed: {
    ...mapGetters(['currentUserInfo']),
  },
  data() {
    return {
      params: {
        signid: this.signId,
      },
      apiUrl: 'commentsList',
      articles: [],
      autoRequestTime: 0,
      timer: null,
      isObj: {
        type: 'newObject',
        key: 'data',
        kes: null,
      },
    };
  },
  methods: {
    getListData(res) {
      if (this.isRequest && res.data.data.length !== 0 && res.data.data[0].author === this.currentUserInfo.name) {
        this.$emit('stopAutoRequest', false);
      }
      this.articles = res.list;
    },
  },
};
</script>
