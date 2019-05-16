<template>
  <BasePull
    :loadingText="{
      start: '',
      end: '',
      noArticles: '暂无赞赏评论',
    }"
    :params="params"
    :apiUrl="apiUrl"
    :isRefresh="false"
    :autoRequestTime="autoRequestTime"
    :needAccessToken="true"
    @getListData="getListData"
    >
      <CommentCard :comment="item" v-for="(item, index) in articles" :key="index"/>
  </BasePull>
</template>

<script>
import { CommentCard } from '@/components/';
import { mapGetters } from 'vuex';

export default {
  props: ['signId', 'isRequest'],
  components: {
    CommentCard,
  },
  watch: {
    signId(newVal) {
      this.params = {
        signid: newVal,
      };
    },
    isRequest(newVal) {
      if (newVal) {
        this.timer = setInterval(() => {
          if (this.autoRequestTime >= 30) {
            clearInterval(this.timer);
            this.$emit('stopAutoRequest', false);
          }
          this.autoRequestTime += 1;
        }, 500);
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
      apiUrl: 'shares',
      articles: [],
      autoRequestTime: 0,
      timer: null,
    };
  },
  methods: {
    getListData(res) {
      if (this.isRequest && res.data.length !== 0 && res.data[0].author === this.currentUserInfo.name) {
        this.$emit('stopAutoRequest', false);
      }
      this.articles = res.data;
    },
  },
};
</script>
