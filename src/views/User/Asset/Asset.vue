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
            :style='assetsRewards.totalSignIncome > 0 ? { color: "#D95E5E" }
                    : (assetsRewards.totalSignIncome < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalSignIncome}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏历史收益</p>
          <p class="toptext3"
             :style='assetsRewards.totalShareIncome > 0 ? { color: "#D95E5E" }
                     : (assetsRewards.totalShareIncome < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareIncome}}
          </p>
        </Col>
        <Col span="3" style="text-align:center">
          <Divider type="vertical" style="height:20px;margin-top:16px;" />
        </Col>
        <Col span="6">
          <p class="toptext2">赞赏历史支出</p>
          <p class="toptext3"
            :style='assetsRewards.totalShareExpenses > 0 ? { color: "#D95E5E" }
                    : (assetsRewards.totalShareExpenses < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareExpenses}}
          </p>
        </Col>
      </Row>
    </div>
    <div class="detailtext">明细</div>
    <AssetList class="asset-list" :username="username" @getOtherAsset="getOtherAsset" />
  </div>
</template>

<script>
import { getUser } from '@/api';
import { getPlayerIncome, withdraw } from '@/api/signature';
import { isEmptyArray } from '@/common/methods';
import AssetList from './AssetList.vue';

export default {
  name: 'Asset',
  props: ['username'],
  components: { AssetList },
  created() {
    this.getPlayerTotalIncome(this.username);
    this.getUser(this.username);
  },
  data() {
    return {
      assets: [],
      playerincome: 0,
      assetsRewards: {
        totalSignIncome: 0,
        totalShareIncome: 0,
        totalShareExpenses: 0,
      },
      visible: false,
      newName: '',
    };
  },
  computed: { },
  methods: {
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      this.playerincome = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
    handleOk() {
      this.withdraw(this.username);
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
    async getUser(username) {
      await getUser({ username }).then(({ data }) => {
        this.newName = data.nickname || data.username;
      }).catch((err) => {
        this.newName = this.username;
        console.log(err);
      });
    },
    getOtherAsset(res) {
      // console.log(res);
      const {
        totalSignIncome: sign,
        totalShareIncome: shareIn,
        totalShareExpenses: shareExp,
      } = res.data;
      const { assetsRewards } = this;
      assetsRewards.totalSignIncome = sign > 0 ? `+${sign / 10000}` : sign / 10000;
      assetsRewards.totalShareIncome = shareIn > 0 ? `+${shareIn / 10000}` : shareIn / 10000;
      assetsRewards.totalShareExpenses = shareExp > 0 ? `+${shareExp / 10000}` : shareExp / 10000;
    },
  },
};
</script>

<style lang="less" scoped src="./Asset.less"></style>
