<template>
  <div>
    <div v-if="tabs.length >= 2">
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
    </div>
    <div v-else>
      <div class="articles">
        <div :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
          <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="true">
            <div class="content">
              <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
            </div>
          </za-pull>
        </div>
      </div>
    </div>
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
  props: {
    listtype: {
      type: String,
      required: true
    },
  },
  components: { ArticleCard },
  created() {
    // alert("this is " + this.listtype + " list")
    this.getArticlesList();
    if(this.listtype == 'others'){
      this.tabs = [
        { label: '文章列表' },
        { label: '他打赏的' }
      ]
      this.activeNameSwipe = '文章列表';
    }else if(this.listtype == 'original'){
      this.activeNameSwipe = 'TimeLine';
    }else if(this.listtype == 'reward'){
      this.activeNameSwipe = 'TimeLine';
    }
  },
  methods: {
    async getArticlesList() {
      // const articles = 'https://smartsignature.azurewebsites.net/api/article';
      // const articles = 'http://localhost:7001/posts';
      const articles = 'https://api.smartsignature.io/posts'; // new backend api url
      const { data } = await axios.get(articles);
      if(this.listtype == 'others'){
        // do something...
      }
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
  font-weight: bold;
}
.userarticles{
  margin-top: -45px;
}
.article {
  text-align: left;
}
.card {
  margin: 5px;
}
</style>
