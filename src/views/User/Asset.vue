<template>
  <div class="assetpage">
    <BaseHeader
      :pageinfo="{ left: 'back', title: `${newName.length >= 12 ?  `${newName.substring(0,12)}...` : newName}的资产明细`, rightPage: 'home',
                   needLogin: false, }"/>
    <div class="topcard">
      <div class="toptext1">待提现</div><br/>
      <div class="topremain">{{playerincome.toFixed(4)}}</div>
      <div style="position:absolute;right:40px;top:90px;">
          <Button class="withdraw" ghost @click="visible = true"><div style="margin-top:-2px">提现</div></Button>
          <za-confirm
            :visible="visible"
            title="提现确认" message="确定要提现吗？"
            :ok="handleOk" :cancel="() => { visible = false }"></za-confirm>
      </div>
      <Divider style="margin-top:10px;margin-bottom:10px;"/>
      <Row type="flex" justify="center" class="code-row-bg">
        <Col span="6">
          <p class="toptext2">创作历史收益</p>
          <p class="toptext3"
            :style='assetsRewards.totalSignIncome > 0 ? { color: "#f50" }
                    : (assetsRewards.totalSignIncome < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalSignIncome}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏历史收益</p>
          <p class="toptext3"
             :style='assetsRewards.totalShareIncome > 0 ? { color: "#f50" }
                     : (assetsRewards.totalShareIncome < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareIncome}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏历史支出</p>
          <p class="toptext3"
            :style='assetsRewards.totalShareExpenses > 0 ? { color: "#f50" }
                    : (assetsRewards.totalShareExpenses < 0 ? { color: "#87d068" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareExpenses}}
          </p>
        </Col>
      </Row>
    </div>
    <div class="detailtext">明细</div>
    <div class="assets">
      <za-pull :on-refresh="refresh" :refreshing="refreshing">
        <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
          <AssetCard :asset="a" v-for="a in assets" :key="a.timestamp"/>
        </div>
        <p class="loading-stat">{{displayAboutScroll}}</p>
      </za-pull>
    </div>
  </div>
</template>

<script>
import { AssetCard } from '@/components/';
import { getAssets, getUser } from '@/api';
import {
  CONTRACT_ACCOUNT, getPlayerIncome, withdraw,
} from '@/api/signature';
import { isEmptyArray } from '@/common/methods';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetCard },
  created() {
    this.getPlayerTotalIncome(this.username);
    this.getUser(this.username);
    // this.sharecost = this.getPlayerTotalCost();
  },
  data() {
    return {
      assets: [],
      page: 1,
      activeNameSwipe: '全部',
      selectedLabelDefault: '全部',
      tabs: [
        { label: '全部' },
        { label: '支持收入' },
        { label: '转发收入' },
      ],
      playerincome: 0,
      assetsRewards: {
        totalSignIncome: 0,
        totalShareIncome: 0,
        totalShareExpenses: 0,
      },
      refreshing: false,
      visible: false,
      isTheEndOfTheScroll: false,
      busy: false,
      newName: '',
    };
  },
  computed: {
    displayAboutScroll() {
      if (this.isTheEndOfTheScroll) {
        return '🎉 哇，你真勤奋，所有明细已经加载完了～ 🎉';
      }
      return '😄 勤奋地加载更多精彩内容 😄';
    },
  },
  methods: {
    // async getAssetsList() {
    //   console.log('Connecting to EOS fetch assets...');
    //   const actions = (await getPlayerBills(this.username)).map(a => a.action_trace);
    //   // console.log(actions.map(a => a.action_trace));
    //   const actions2 = actions.filter(a => a.act.account === CONTRACT_ACCOUNT
    //       && a.act.name === 'bill'
    //       && a.act.data.type !== 'test income' /* 過濾 test income */
    //       && a.act.data.quantity !== '0.0000 EOS'); /* 過濾 0 的收入支出 */
    //   console.log('actions>??', actions2);
    //   return actions2.map(a => ({
    //     quantity: a.act.data.quantity,
    //     type: a.act.data.type,
    //     timestamp: a.block_time,
    //     signId: a.act.data.signId,
    //   }));
    // },
    // getPlayerTotalCost() { // 過一段時間不用就刪了 :P
    //   console.log('assets::', JSON.stringify(this.assets));
    //   const temp = this.assets.reduce((acc, asset) => {
    //     if (asset.type === 'support expenses') {
    //       return parseFloat(asset.quantity.substr(0, asset.quantity.indexOf(' '))) + acc;
    //     }
    //     return acc;
    //   }, 0);
    //   console.log('zhichu', temp); // 寫這啥，看不懂
    //   return temp;
    // },
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      this.playerincome = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleOk() {
      this.withdraw(this.username);
    },

    async loadMore(isEmptyArr = false) {
      // 默认第一次会加载
      if (this.isTheEndOfTheScroll) return;
      this.busy = true;
      await this.getAssets(this.username, this.page, isEmptyArr);
    },
    async refresh() {
      this.refreshing = true;
      this.isTheEndOfTheScroll = false;
      this.page = 1;
      await this.loadMore(true);
      this.refreshing = false;
    },
    goBack() {
      this.$router.go(-1);
    },
    async withdraw(name) {
      console.log('Connecting to EOS fetch data...');
      await withdraw(name)
        .then(() => this.$Message.success('提现成功!'))
        .catch((err) => {
          console.log(err);
          this.$Message.error('提现失败!');
        });
      this.visible = false; // 成功和失败都关闭弹窗
    },
    // 获取历史总收入
    async getAssets(user, page, isEmptyArr = false) {
      await getAssets(user, page)
        .then((res) => {
          if (res.status === 200) {
            const { data } = res;
            this.assetsRewards.totalSignIncome = data.totalSignIncome > 0 ? `+${data.totalSignIncome / 10000}` : data.totalSignIncome / 10000;
            this.assetsRewards.totalShareIncome = data.totalShareIncome > 0 ? `+${data.totalShareIncome / 10000}` : data.totalShareIncome / 10000;
            this.assetsRewards.totalShareExpenses = data.totalShareExpenses > 0 ? `+${data.totalShareExpenses / 10000}` : data.totalShareExpenses / 10000;
            if (data.history.length >= 0 && data.history.length < 20) { this.isTheEndOfTheScroll = true; } // 数据请求完
            else this.page += 1;
            const historyFilter = data.history.filter(i => i.amount !== 0); // 过滤金额为0
            if (isEmptyArr) this.assets.length = 0; // 清空数组
            this.assets = [...this.assets, ...historyFilter]; // 合并数组
            this.busy = false;
          }
        })
        .catch((err) => {
          console.log(err);
          this.$Message.error('获取历史收入错误请重试');
          this.busy = false;
          this.isTheEndOfTheScroll = true;
        });
    },
    async getUser(username) {
      await getUser({ username }).then(({ data }) => {
        this.newName = data.nickname || data.username;
      }).catch((err) => {
        this.newName = this.username;
        console.log(err);
      });
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
  margin-right: 0px;
}
.loading-stat {
  margin: 10px;
  color: #999;
  font-size: 13px;
  text-align: center;
}
</style>
