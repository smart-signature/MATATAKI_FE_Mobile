<template>
  <div class="original mw">
    <BaseHeader :pageinfo="{ left: 'back', title: userTitle, rightPage: 'home' }"/>
    <ArticlesList :listtype="'reward'" :username='username' ref='ArticlesList'/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import ArticlesList from './ArticlesList.vue';

export default {
  name: 'Original',
  props: ['username'],
  components: { ArticlesList },
  data() {
    return {
      playerincome: null,
      editing: false,
      user: '',
      userTitle: '',
    };
  },
  computed: {
    ...mapGetters(['isMe']),
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
  created() {
    const { isMe, username } = this;
    this.user = isMe(username) ? '我的用户页' : `${username} 的用户页`;
    this.userTitle = isMe(username) ? '我赞赏的文章' : `${username} 赞赏的文章`;
    document.title = `${this.user} - SmartSignature`;
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
