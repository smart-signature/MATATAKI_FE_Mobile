<template>
  <div class="original">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">{{userTitle}}</div>
    </za-nav-bar>
    <ArticlesList :listtype="'reward'" :username='username' ref='ArticlesList'/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getPlayerIncome } from '../../api/signature';
import ArticlesList from './ArticlesList.vue';
import API from '../../api/scatter';

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
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
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
  async created() {
    const playerincome = await getPlayerIncome(this.username);
    this.playerincome = playerincome[0] || 0;
    this.user = this.isMe ? '我的用户页' : `${this.username} 的用户页`;
    this.userTitle = this.isMe ? '我赞助的文章' : `${this.username} 赞助的文章`;
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
}
</style>
