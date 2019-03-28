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
      <div class="topremain">{{playerincome.toFixed(4)}}</div>
      <div style="position:absolute;right:40px;top:90px;">
          <Button class="withdraw" ghost @click="visible = true">提现</Button>
          <za-confirm
            :visible="visible"
            title="提现确认" message="确定要提现吗？"
            :ok="handleOk" :cancel="() => { visible = false }"></za-confirm>
      </div>
      <Divider style="margin-top:10px;margin-bottom:10px;"/>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="6">
          <p class="toptext2">创作收益</p>
          <p class="toptext3" :style='writereward > 0 ? { color: "#f50" } : (writereward < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{getDisplayAmount(writereward)}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏收益</p>
          <p class="toptext3" :style='sharereward > 0 ? { color: "#f50" } : (sharereward < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{getDisplayAmount(sharereward)}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏支出</p>
          <p class="toptext3" :style='sharecost > 0 ? { color: "#f50" } : (sharecost < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{getDisplayAmount(sharecost)}}
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
            <AssetCard :asset="a" v-for="a in sortedAssets" :key="a.timestamp"/>
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
import { isEmptyArray } from '@/common/methods';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  async created() {
    await this.refresh();
    this.sharecost = this.getPlayerTotalCost();
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
      playerincome: 0.0000,
      loading: false,
      refreshing: false,
      writereward: 0,
      sharereward: 0,
      sharecost: 0,
      visible: false,
    };
  },
  computed: {
    sortedAssets() {
      console.log(this.assets)
      // if need change to asc, swap a & b
      return this.assets.sort((a, b) => (new Date(b.timestamp)).getTime() - (new Date(a.timestamp)).getTime());
    },
  },
  methods: {
    // ...mapActions(['loginScatterAsync']),
    async getAssetsList() {
      console.log('Connecting to EOS fetch assets...');
      const actions = await getPlayerBills(this.username);
      // console.log(actions.map(a => a.action_trace));
      const actions2 = actions.filter(a => a.action_trace.act.account === 'signature.bp'
          && a.action_trace.act.name === 'bill'
          && a.action_trace.act.data.type !== 'test income');
      // console.log("actions>??",actions2);
      return actions2.map(a => ({
        quantity: a.action_trace.act.data.quantity,
        type: a.action_trace.act.data.type,
        timestamp: a.action_trace.block_time,
      }));
    },
    getDisplayAmount(amount) {
      return (amount > 0 ? '+' : '') + parseFloat(amount).toFixed(4);
    },
    getPlayerTotalCost() {
      console.log('assets::', JSON.stringify(this.assets));
      const temp = this.assets.reduce((acc, asset) => {
        if (asset.type === 'support expenses') return parseFloat(asset.quantity.substr(0, asset.quantity.indexOf(' '))) + acc;
        return acc;
      }, 0);
      console.log('zhichu', temp);
      return temp;
    },
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      if (isEmptyArray(playerincome)) {
        this.sharereward = playerincome[0].share_income / 10000;
        this.writereward = playerincome[0].sign_income / 10000;
        console.log('share reward', this.sharereward);
        console.log('write reward', this.writereward);
      } else {
        this.sharereward = 0;
        this.writereward = 0;
      }
      return isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0.0000;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleOk() {
      this.withdraw(this.username);
    },
    async refresh() {
      this.refreshing = true;
      this.loading = true;
      /*
        同时触发独立的异步操作 for noobs

        // 写法一
        let [foo, bar] = await Promise.all([getFoo(), getBar()]);

        // 写法二
        let fooPromise = getFoo();
        let barPromise = getBar();
        let foo = await fooPromise;
        let bar = await barPromise;
      */
      const getPlayerTotalIncomePromise = this.getPlayerTotalIncome(this.username);
      const getAssetsListPromise = this.getAssetsList();
      this.playerincome = await getPlayerTotalIncomePromise;
      this.assets = await getAssetsListPromise;

      console.log(this.username, '\'s total income:', this.playerincome);
      console.log(this.username, '\'s assets:', this.assets);
      this.refreshing = false;
      this.loading = false;
    },
    // async refreshTheThree() {
    //  this.sharereward = 0;
    //  this.writereward = 0;
    //  this.sharecost = 0;

    //  for (let index = 0; index < this.assets.length; index += 1) {
    //    const element = this.assets[index];
    // if (element.type === 'share income') {
    //  this.sharereward += parseFloat(element.quantity.replace(' EOS', ''));
    //  // console.log(sharecost);
    // } else if (element.type === 'sign income') {
    //  this.writereward += parseFloat(element.quantity.replace(' EOS', ''));
    //  // console.log(sharecost);
    //   if (element.type === 'support expenses') {
    //     this.sharecost += parseFloat(element.quantity.replace(' EOS', ''));
    //   }
    // }
    // },//之后一段时间要是没问题就把这一段全删了
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
