<template>
  <div class="articles">
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="true">
          <div class="content">
            <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
          </div>
        </za-pull>
      </za-tab-pane>
    </za-tabs>
  </div>
</template>

<script>
import axios from 'axios';
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  computed: {
    ...mapGetters(['currentUsername']),
  },
  components: { ArticleCard },
  created() {
    this.getArticlesList();
  },
  methods: {
    async getArticlesList() {
      const articles = 'https://smartsignature.azurewebsites.net/api/article';
      const { data } = await axios.get(articles);
      this.articles = data;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async refresh() {
      this.refreshing = true;
      await this.getArticlesList();
      this.refreshing = false;
    },
  },
  data() {
    return {
      refreshing: false,
      articles: [],
      activeNameSwipe: 'TimeLine',
      selectedLabelDefault: 'TimeLine',
      tabs: [
        {
          label: 'TimeLine',
        },
      ],
    };
  },
};
</script>

<style scoped>
.articles {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
  font-weight: bold;
}
.article {
  text-align: left;
}
.card {
  margin: 5px;
}
</style>
