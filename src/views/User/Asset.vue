<template>
  <div class="assetpage">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">{{username}}的资产明细</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="topcard">
      <div class="toptext1">待提现</div><br/>
      <div class="topremain">{{(playerincome.share_income + playerincome.sign_income) / 10000}}</div>
      <div style="position:absolute;right:40px;top:90px;">
          <Button class="withdraw" ghost @click="visible7 = true">提现</Button>
          <za-confirm
            :visible="visible7"
            title="提现确认" message="确定要提现吗？"
            :ok="handleOk" :cancel="handleCancel"></za-confirm>
      </div>
      <Divider style="margin-top:10px;margin-bottom:10px;"/>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="6">
          <p class="toptext2">创作收益</p>
          <p class="toptext3" :style='writereward >= 0 ? { color: "#f50" } : { color: "#87d068" }'>
            {{(writereward > 0 ? '+' : '') + writereward}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏收益</p>
          <p class="toptext3" :style='sharereward >= 0 ? { color: "#f50" } : { color: "#87d068" }'>
            {{(sharereward > 0 ? '+' : '') + sharereward}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏支出</p>
          <p class="toptext3" :style='sharecost > 0 ? { color: "#f50" } : { color: "#87d068" }'>
            {{sharecost}}
          </p>
        </Col>
      </Row>
    </div>
    <div class="detailtext">明细</div>
    <div class="assets">
    <!-- <za-tabs v-model="activeNameSwipe" @change="handleClick"> -->
      <!-- <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label"> -->
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="loading">
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
import {
  getPlayerBills, getPlayerIncome,
  withdraw,
} from '../../api/signature.js';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  async created() {
    await getPlayerIncome(this.username);
    await this.refresh();
    for (let index = 0; index < this.assets.length; index += 1) {
      const element = this.assets[index];
      if (element.type === 'share income') {
        this.sharereward += parseFloat(element.quantity.replace(' EOS', ''));
        // console.log(sharecost);
      } else if (element.type === 'sign income') {
        this.writereward += parseFloat(element.quantity.replace(' EOS', ''));
        // console.log(sharecost);
      } else if (element.type === 'support expenses') {
        this.sharecost += parseFloat(element.quantity.replace(' EOS', ''));
        // console.log(sharecost);
      }
    }
  },
  data() {
    return {
      assets: [
        // { // sample
        //  quantity: '10.2333 EOS',
        //  timestamp: Date.now(),
        //  type: 'test income',
        // },
        // { // sample
        //  quantity: '100.2333 EOS',
        //  timestamp: Date.now() + 1,
        // type: 'test income',
        // },
      ],
      activeNameSwipe: '全部',
      selectedLabelDefault: '全部',
      tabs: [
        { label: '全部' },
        { label: '支持收入' },
        { label: '转发收入' },
      ],
      playerincome: {
        share_income: 0.0000,
        sign_income: 0.0000,
      },
      loading: false,
      refreshing: false,
      writereward: 0,
      sharereward: 0,
      sharecost: 0,
      visible7: false,
    };
  },
  methods: {
    // ...mapActions(['loginScatterAsync']),
    async getAssetsList() {
      console.log('Connecting to EOS fetch data...');
      const actions = await getPlayerBills(this.username);
      // console.log(actions.map(a => a.action_trace));
      const actions2 = actions.filter(a => a.action_trace.act.account === 'signature.bp'
          && a.action_trace.act.name === 'bill'
          && a.action_trace.act.data.type !== 'test income');
      // console.log(_actions);
      this.assets = actions2.map(a => ({
        quantity: a.action_trace.act.data.quantity,
        type: a.action_trace.act.data.type,
        timestamp: a.action_trace.block_time,
      }));

      console.log(this.username, '\'s assets:', this.assets);
    },
    async getPlayerIncome(name) {
      console.log('Connecting to EOS fetch data...');
      const playerincome = await getPlayerIncome(name);
      if (playerincome === null) {
        this.playerincome = {
          share_income: 0.0000,
          sign_income: 0.0000,
        };
      }
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleCancel() {
      this.visible7 = false;
    },
    handleOk() {
      this.withdraw(this.username);
    },
    async refresh() {
      this.refreshing = true;
      this.loading = true;
      await this.getAssetsList();
      this.refreshing = false;
      this.loading = false;
    },
    goBack() {
      this.$router.go(-1);
    },
    async withdraw(name) {
      console.log('Connecting to EOS fetch data...');
      await withdraw(name).then(() => alert('提现成功!'));
    },
  },
};
</script>


<style scoped>
.assetpage {
  background:rgba(247,247,247,1);
  opacity:1;
  text-align: left;
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
.detailtext{
  font-size: 13px;
  margin-left: 20px;
  font-weight: bold;
}
Button.withdraw, Button.withdraw:focus, Button.withdraw:hover {
  background-color: rgba(0, 0, 0, 1);
  border-radius: 2px;
  color: rgba(255,255,255,1);
  float: right;
  font-size: 12px;
  margin-top: 20px;
  width: 80px;
  height: 25px;
  letter-spacing: 2px;
  max-width: 94px;
  max-height: 35px;
  margin-right: 18px;
}
</style>
