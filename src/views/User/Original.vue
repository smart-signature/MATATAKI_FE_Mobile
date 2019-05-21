<template>
  <div class="original mw">
    <BaseHeader :pageinfo="{ left: 'back', title: userTitle, rightPage: 'home' }"/>
    <ArticlesList :listtype="'original'" :username='username' ref='ArticlesList'/>
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
      editing: false,
      user: '',
      userTitle: '',
    };
  },
  computed: {
    ...mapGetters(['currentUsername', 'isMe']),
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
  created() {
    const { isMe, username } = this;
    this.user = isMe(username) ? '我的用户页' : `${username} 的用户页`;
    this.userTitle = isMe(username) ? '我的原创文章' : `${username} 的原创文章`;
    document.title = `${this.user} - SmartSignature`;
  },
};
</script>
<style>
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
