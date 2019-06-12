<template>
  <div class="original mw">
    <BaseHeader :pageinfo="{ left: 'back', title: pageTitle, rightPage: 'home' }"/>
    <ArticlesList :listtype="'reward'" :id='id' ref='ArticlesList'/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ArticlesList from './ArticlesList.vue';

export default {
  name: 'Original',
  props: ['id'],
  components: { ArticlesList },
  data() {
    return {
      playerincome: null,
      editing: false,
      user: '',
      pageTitle: '',
    };
  },
  computed: {
    ...mapGetters(['isMe']),
  },
  created() {
    const { isMe, id } = this;
    this.user = isMe(id) ? '我的用户页' : `${id} 的用户页`;
    this.pageTitle = isMe(id) ? '我赞赏的文章' : `${id} 赞赏的文章`;
    document.title = `${this.user} - SmartSignature`;
  },
  methods: {
    goBack() { this.$router.go(-1); },
  },
};
</script>
<style scoped>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
.original{
  background-color: #F7F7F7;
  padding-bottom: 20px;
  padding-top: 45px;
  min-height: 100%;
}
</style>
