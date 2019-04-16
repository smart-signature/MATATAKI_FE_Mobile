<template>
  <div>
    <div v-if="tabs.length >= 2">
      <div class="articles">
        <za-tabs v-model="activeNameSwipe">
          <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
            <ArticlesListOthers :listtype="tab.label" :username="username" />
          </za-tab-pane>
        </za-tabs>
      </div>
    </div>
    <div v-else>
      <div class="articles">
        <div :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
          <za-pull :on-refresh="refresh" :refreshing="refreshing">
            <div class="content">
              <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
                <ArticleCard :article="a" v-for="a in articles" :key="a.id"/>
              </div>
            </div>
            <div v-if="articles.length == 0" style="padding: 20px">
                无文章
            </div>
            <p v-else class="loading-stat">{{displayAboutScroll}}</p>
          </za-pull>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArticleCard } from '@/components/';
import { mapGetters } from 'vuex';
import ArticlesListOthers from './ArticlesListOthers.vue';
import { getArticlesList, getArticleSupports } from '@/api/index';

export const TimeLine = '最新发布';
export default {
  name: 'ArticlesList',
  computed: {
    ...mapGetters(['currentUsername']),
    displayAboutScroll() {
      return this.isTheEndOfTheScroll
        ? '🎉 哇，你真勤奋，所有 comments 已经加载完了～ 🎉'
        : '😄 勤奋地加载更多精彩内容 😄';
    },
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
  components: { ArticleCard, ArticlesListOthers },
  created() {
    // this.getArticlesList();
    if (this.listtype === 'others') {
      this.tabs = [
        { label: '文章列表' },
        { label: '他赞赏的' },
      ];
      this.activeNameSwipe = '文章列表';
    } else if (this.listtype === 'original') {
      this.activeNameSwipe = TimeLine;
    } else if (this.listtype === 'reward') {
      this.activeNameSwipe = TimeLine;
    }
  },
  methods: {
    async refresh() {
      this.refreshing = true;
      this.isTheEndOfTheScroll = false; // 显示未加载完成
      this.page = 1; // 重置分页索引
      await this.loadMore(true);
      this.refreshing = false;
    },
    async loadMore(isEmptyArray = false) {
      if (this.isTheEndOfTheScroll) return;
      this.busy = true;
      await this.getArticlesList(this.username, this.page, isEmptyArray);
    },
    async getArticlesList(username, page, isEmptyArray) {
      // 成功获取文章数据
      const getArticleData = (res) => {
        const { data } = res;
        if (isEmptyArray) this.articles.length = 0;
        this.articles = [...this.articles, ...data];
        if (data.length >= 0 && data.length < 20) this.isTheEndOfTheScroll = true;
        else this.page += 1;
        this.busy = false;
      };

      if (this.listtype === 'original') {
        await getArticlesList({ author: username, page }).then((res) => {
          if (res.status === 200) getArticleData(res);
        }).catch((err) => {
          console.log(err);
          this.$Message.error('获取文章发生错误');
        });
      } else if (this.listtype === 'reward') {
        await getArticleSupports({ user: username, page }).then((res) => {
          if (res.status === 200) getArticleData(res);
        }).catch((err) => {
          console.log(err);
          this.$Message.error('获取文章发生错误');
        });
      }
    },
  },
  data() {
    return {
      refreshing: false,
      articles: [],
      activeNameSwipe: TimeLine,
      selectedLabelDefault: TimeLine,
      tabs: [
        {
          label: TimeLine,
        },
      ],
      isTheEndOfTheScroll: false,
      page: 1,
      busy: false,
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
