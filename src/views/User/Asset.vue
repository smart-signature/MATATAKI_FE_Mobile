<template>
  <div class="assetpage">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">资产明细</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="topcard">
      <div class="toptext1">待提现</div><br/>
      <div class="topremain">47000</div>
      <div style="position:absolute;right:40px;top:90px;">
        <Button class="rightbutton">
          <div style="margin-top:-2px;">提现</div>
        </Button>
      </div>
      <Divider style="margin-top:10px;margin-bottom:10px;"/>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="6">
          <p class="toptext2">写作收入</p>
          <p class="toptext3">+23000</p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">转发收入</p>
          <p class="toptext3">+24000</p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">打赏支出</p>
          <p class="toptext3">-70000</p>
        </Col>
      </Row>
    </div>
    <div class="detailtext">明细</div>
    <div class="assets">
    <!-- <za-tabs v-model="activeNameSwipe" @change="handleClick"> -->
      <!-- <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label"> -->
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="true">
          <div class="content">
            <AssetCard :asset="a" v-for="a in assets" :key="a.timestamp"/>
          </div>
        </za-pull>
      <!-- </za-tab-pane> -->
    <!-- </za-tabs> -->
    </div>
  </div>
</template>

<script>
import { AssetCard } from '@/components/';
import { getPlayerBills } from '../../api/signature.js';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  async created() {
    await this.refresh();
  },
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
        type: 'share income',
        timestamp: Date.now() + 1,
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
      console.log('Connecting to EOS fetch data...');
      const actions = await getPlayerBills(this.username);
      // console.log(actions.map(a => a.action_trace));
      const _actions = actions.filter(a => a.action_trace.act.account === 'signature.bp'
          && a.action_trace.act.name === 'bill');
      // console.log(_actions);
      this.assets = _actions.map(a => ({
        quantity: a.action_trace.act.data.quantity,
        type: a.action_trace.act.data.type,
        timestamp: a.action_trace.block_time,
      }));
      // console.log(this.assets);
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
.assetpage {
  text-align: left;
}
.assets {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
  font-weight: bold;
}
.topcard{
  background-color: #ffffff;
  margin: 20px;
  padding: 20px;
  padding-bottom: 15px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
.toptext1{
  color: rgba(0, 0, 0, 1);
  font-size: 12px;
  opacity: 0.4;
  float: left;
}
.topremain{
  color: rgba(0, 0, 0, 1);
  font-size: 22px;
  font-weight: bolder;
  float: top;
}
.toptext2{
  text-align: center;
  color: rgba(0, 0, 0, 1);
  font-size: 12px;
}
.toptext3{
  padding-top: 7px;
  text-align: center;
  color: rgba(0, 0, 0, 1);
  font-size: 14px;
  font-weight: bold;
}
.rightbutton{
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255,255,255,1);
  float: right;
  margin-top: 20px;
  width: 80px;
  height: 25px;
}
.detailtext{
  font-size: 13px;
  margin-left: 20px;
  font-weight: bold;
}
</style>
