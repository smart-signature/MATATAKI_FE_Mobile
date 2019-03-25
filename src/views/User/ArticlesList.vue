<template>
  <div>
    <div v-if="tabs.length >= 2">
      <div class="articles">
        <za-tabs v-model="activeNameSwipe" @change="handleClick">
          <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
            <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="loading">
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
          <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="loading">
            <div class="content">
              <div v-if="articles.length == 0" style="padding: 20px">
                无文章
              </div>
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

export const TimeLine = '最新发布';
export default {
  name: 'home',
  computed: {
    ...mapGetters(['currentUsername']),
  },
  props: {
    listtype: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
  },
  components: { ArticleCard },
  created() {
    // alert("this is " + this.listtype + " list")
    this.getArticlesList();
    if (this.listtype == 'others') {
      this.tabs = [
        { label: '文章列表' },
        { label: '他赞赏的' },
      ];
      this.activeNameSwipe = '文章列表';
    } else if (this.listtype == 'original') {
      this.activeNameSwipe = TimeLine;
    } else if (this.listtype == 'reward') {
      this.activeNameSwipe = TimeLine;
    }
  },
  methods: {
    async getArticlesList() {
      // const articles = 'https://smartsignature.azurewebsites.net/api/article';
      // const articles = 'http://localhost:7001/posts';
      const articles = `https://api.smartsignature.io/posts?author=${this.username}`; // new backend api url
      const { data } = await axios.get(articles);
      if (this.listtype == 'original') {
        for (const dataid in data) {
          const onedata = data[dataid];
          if (onedata.author == this.username) {
            this.articles.push(onedata);
          }
        }
        // do something...
      } else {
        this.articles = data;
      }
      this.loading = false;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async refresh() {
      this.refreshing = true;
      this.loading = true;
      await this.getArticlesList();
      this.refreshing = false;
      this.loading = false;
    },
  },
  data() {
    return {
      refreshing: false,
      loading: false,
      articles: [],
      activeNameSwipe: TimeLine,
      selectedLabelDefault: TimeLine,
      tabs: [
        {
          label: TimeLine,
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
