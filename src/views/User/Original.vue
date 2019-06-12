<template>
  <div class="original mw">
    <BaseHeader :pageinfo="{ title: pageTitle }"/>
    <ArticlesList :listtype="'original'" :id='id' ref='ArticlesList'/>
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
      editing: false,
      userTitle: '',
    };
  },
  computed: {
    ...mapGetters(['isMe']),
  },
  watch: {
    isMe() {
      this.toggleTitle();
    },
  },
  methods: {
    toggleTitle() {
      const { isMe, id } = this;
      this.pageTitle = isMe(id) ? '我的原创文章' : '他的原创文章';
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
