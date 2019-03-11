<template>
  <div class="asset">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">{{username}} 的资产明细</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="assets">
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="true">
          <div class="content">
            <AssetCard :asset="a" v-for="a in assets" :key="a.timestamp"/>
          </div>
        </za-pull>
      </za-tab-pane>
    </za-tabs>
  </div>

  </div>
</template>

<script>
import { AssetCard } from '@/components/';
export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  data() {
    return {
      refreshing: false,
      assets: [{
        // sample
        quantity: '+ 10.2333 EOS',
        timestamp: Date.now(),
        },
        {
        // sample
        quantity: '+ 100.2333 EOS',
        timestamp: Date.now(),
        },
      ],
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
    // ...mapActions(['loginScatterAsync']),
    async getAssetsList() {
      // const articles = 'https://smartsignature.azurewebsites.net/api/article';
      const { data } = await axios.get(articles);
      this.assets = data;
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    async refresh() {
      this.refreshing = true;
      await this.getAssetsList();
      this.refreshing = false;
    },
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>


<style scoped>
.asset {
  text-align: left;
}
.assets {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
  font-weight: bold;
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
