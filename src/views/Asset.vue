<template>
  <div class="asset-page">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">{{username}} 的资产明细</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="my-assets">
      <Row type="flex" justify="center" class="row1">
        <i-col span="16"><span class="title-bar">待提现余额</span><br>
          {{playerincome.sign_income + playerincome.share_income}}
          <span class="EOS-symbol">EOS</span></i-col>
        <i-col span="8">
          <Button class="withdraw" ghost type="text" @click="withdraw">立即提现</Button>
        </i-col>
      </Row>
      <br>
      <Row type="flex" justify="center" class="row2">
        <i-col span="5"><span class="title-bar">写作历史收入</span><br>
          <span class="income">{{130.56}}</span></i-col>
        <i-col span="1"><Divider type="vertical" /></i-col>
        <i-col span="5"><span class="title-bar">转发历史收入</span><br>
          <span class="income">{{200.78}}</span></i-col>
        <i-col span="1"><Divider type="vertical" /></i-col>
        <i-col span="5"><span class="title-bar">打赏历史支出</span><br>
          <span class="income2">{{30000}}</span></i-col>
      </Row>
    </div>
    <div class="assets">
    <!--<za-tabs v-model="activeNameSwipe" @change="handleClick">-->
    <!--<za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">-->
      <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="true">
        <div class="content">
          <AssetCard :asset="a" v-for="a in assets" :key="a.timestamp"/>
        </div>
      </za-pull>
    <!--</za-tab-pane>-->
    <!--</za-tabs>-->
  </div>

  </div>
</template>

<script>
import { AssetCard } from '@/components/';
import { getPlayerBills, getPlayerIncome, } from '../api/signature.js';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  async created() {
    await getPlayerIncome(this.username);
    await this.refresh();
  },
  data() {
    return {
      assets: [
        { // sample  
          quantity: '10.2333 EOS',
          timestamp: Date.now(),
          type: 'test income',
        },
        { // sample
          quantity: '100.2333 EOS',
          timestamp: Date.now()+1,
          type: 'test income',
        },
      ],
      activeNameSwipe: '全部',
      selectedLabelDefault: '全部',
      tabs: [
        { label: '全部', },
        { label: '支持收入', },
        { label: '转发收入', },
      ],
      playerincome: {
          share_income: '0.0000 EOS',
          sign_income: '0.0000 EOS',
      },
      refreshing: false,
    };
  },
  methods: {
    // ...mapActions(['loginScatterAsync']),
    async getAssetsList() {
      console.log('Connecting to EOS fetch data...');
      const actions = await getPlayerBills(this.username);
      // console.log(actions.map(a => a.action_trace));
      const _actions = actions.filter(a => a.action_trace.act.account === 'signature.bp'
          && a.action_trace.act.name === 'bill'
      );
      // console.log(_actions);
      this.assets = _actions.map(a => { 
        return {
          quantity: a.action_trace.act.data.quantity,
          type: a.action_trace.act.data.type,
          timestamp: a.action_trace.block_time,
        }
      });
      // console.log(this.assets);
    },
    async getPlayerIncome(name){
      console.log('Connecting to EOS fetch data...');
      const playerincome = await getPlayerIncome(name);
      if ( playerincome === null )
        thsi.playerincome = {
          share_income: '0.0000 EOS',
          sign_income: '0.0000 EOS',
        };
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
    async withdraw(name) {
      console.log('Connecting to EOS fetch data...');
    },

  },
};
</script>


<style scoped>
.asset-page {
  background:rgba(247,247,247,1);
  opacity:1;
}

.my-assets {
  margin: auto;
  margin-top: 13px;
  text-align: center;
  max-height: 128px;
  /* margin: -32px 20px 0 20px; */
  /*padding: 8px;*/
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 5px 5px 0px rgba(213, 213, 213, 0.5);
  border-radius: 4px;
}
.row1 {
  font: 12px;
  /*text-align: left;*/
}
.row2 {
  text-align: center;
}
.title-bar {
  white-space: nowrap;
  font-size: 12px;
  font-family: PingFangSC-Semibold;
  line-height: 0px;
  color: rgba(152,152,152,1);
  opacity: 1;
}
.income {
  color: #FF3030;
  font-size: 16px;
  font-family: PingFangSC-Semibold;
}
.income2 {
  color:  #07BB3D;
  font-size: 16px;
  font-family: PingFangSC-Semibold;
}
.asset {
  text-align: left;
}
.assets {
  /* background: rgba(240, 240, 240, 1); */
  margin-top: -100px;
  padding-top: 100px;
  font-weight: bold;
}

Button.withdraw, Button.withdraw:focus, Button.withdraw:hover {
  color: #FFF;
  background-color: #000;
  border-radius: 2px;
  font-size:16px;
  letter-spacing: 2px;
  max-width: 94px;
  max-height: 35px;
  margin-right: 18px;
}
</style>
