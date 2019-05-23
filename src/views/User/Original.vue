<template>
  <div class="original mw">
    <BaseHeader :pageinfo="{ title: userTitle }"/>
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
      userTitle: '',
    };
  },
  computed: {
    ...mapGetters(['currentUsername', 'isMe']),
  },
  watch: {
    isMe() {
      this.toggleTitle();
    },
  },
  methods: {
    toggleTitle() {
      const { isMe, username } = this;
      this.userTitle = isMe(username) ? '我的原创文章' : '他的原创文章';
    },
  },
  created() {
    this.toggleTitle();
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
