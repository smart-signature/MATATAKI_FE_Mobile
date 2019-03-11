<template>
  <div class="asset">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">资产明细</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="assets">
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
</template>

<script>

export default {
  name: 'Asset',
  data() {
    return {
      refreshing: false,
      articles: [],
      activeNameSwipe: '全部',
      selectedLabelDefault: '全部',
      tabs: [
        {
          label: '全部',
        },
        {
          label: '支持收入',
        },
        {
          label: '转发收入',
        },
      ],
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>


<style scoped>
.about {
  background: #f7f7f7;
  margin: auto;
  text-align: center;
}

.about-card {
  margin: 10px;
  text-align: center;
  /* max-width: 335px; */
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
  padding: 18px;
}
.q-and-a {
  color: rgba(0, 0, 0, 1);
  text-align: left;
}
h1.question {
  font-size: 15px;
  font-weight: 500;
}
p.answer {
  font-size: 12px;
  font-weight: 400;
}
</style>
