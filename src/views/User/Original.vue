<template>
  <div class="original mw">
    <BaseHeader
            :pageinfo="{ left: 'back', title: userTitle, rightPage: 'home',
                   needLogin: false, }"/>
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
    ...mapGetters(['currentUsername']),
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
  created() {
    this.user = this.isMe ? '我的用户页' : `${this.username} 的用户页`;
    this.userTitle = this.isMe ? '我的原创文章' : `${this.username} 的原创文章`;
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
}
</style>
