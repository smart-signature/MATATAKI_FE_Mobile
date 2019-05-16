<template>
  <div class="assetpage mw">
    <BaseHeader
      :pageinfo="{ left: 'back', title: `资产明细`, rightPage: 'home', needLogin: false, }"/>


    <div class="topcard">
      <div class="topcard-head">
        <div>
          <p class="topcard-title">待提现</p>
          <p class="topcard-playerincome">{{playerincome}}</p>
        </div>
        <!-- 控制提现样式 如果修改记得修改class样式 -->
        <div class="withdraw" :class="!isWithdrawButton && 'disabled'" @click="withdrawButton">
          <!-- 控制提现文字 根据不同情况修改 -->
          {{
            isWithdrawButton ?
            '全部提现' :
            '提现未开放'
          }}
        </div>
      </div>

      <div class="topcard-list">
        <div class="topcard-list-line">
          <p class="topcard-list-title">创作历史收益</p>
          <p class="topcard-list-pricing"
            :style='assetsRewards.totalSignIncome > 0 ? { color: "#D95E5E" }
                    : (assetsRewards.totalSignIncome < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalSignIncome}}
          </p>
        </div>
        <div class="topcard-list-line">
          <p class="topcard-list-title">赞赏历史收益</p>
          <p class="topcard-list-pricing"
             :style='assetsRewards.totalShareIncome > 0 ? { color: "#D95E5E" }
                     : (assetsRewards.totalShareIncome < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareIncome}}
          </p>
        </div>
        <div class="topcard-list-line">
          <p class="topcard-list-title">赞赏历史支出</p>
          <p class="topcard-list-pricing"
            :style='assetsRewards.totalShareExpenses > 0 ? { color: "#D95E5E" }
                    : (assetsRewards.totalShareExpenses < 0 ? { color: "#519552" } : {color: "#a7aab7"})'>
            {{assetsRewards.totalShareExpenses}}
          </p>
        </div>
      </div>
    </div>


    <div class="detailtext">明细</div>
    <AssetList :username="username" :type="type" @getOtherAsset="getOtherAsset" />

    <za-confirm
      :visible="visible"
      title="提现确认" message="确定要提现吗？"
      :ok="handleOk" :cancel="() => { visible = false }">
    </za-confirm>
  </div>
</template>

<script>
import { getPlayerIncome, withdraw } from '@/api/signature';
import { isEmptyArray } from '@/common/methods';
import AssetList from './AssetList.vue';
import { mapGetters } from 'vuex';

export default {
  name: 'AssetType',
  props: ['username', 'type'],
  components: { AssetList },
  created() {
    // 认为是用户手动切换非法地址  考虑要不要移到路由里面去拦截
    const assetTypeArr = ['EOS', 'ONT'];
    if (!assetTypeArr.includes(this.type)) {
      this.$router.push({ name: 'home' });
    }

    const { blockchain } = this.currentUserInfo;
    // console.log(blockchain);
    // EOS
    // 如果是EOS账号并且是进入的EOS列表从链上查询余额
    if (blockchain === 'EOS' && this.type === 'EOS') {
      this.getPlayerTotalIncome(this.username);
      this.isWithdrawButton = true; // 可以提现
    } else {
      this.isWithdrawButton = false; // 不能提现
    }
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
      isWithdrawButton: true,
    };
  },
  computed: {
    ...mapGetters(['currentUserInfo']),
  },
  methods: {
    // 得到待提现
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      this.playerincome = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
    // 确认提现
    handleOk() {
      this.withdraw(this.username);
    },
    // 提现
    async withdraw(name) {
      console.log('Connecting to EOS fetch data...');
      await withdraw(name)
        .then(() => this.$Message.success('提现成功!'))
        .catch((error) => {
          console.error(error);
          this.$Message.error('提现失败!');
        });
      this.visible = false; // 成功和失败都关闭弹窗
    },
    // 得到明细数据
    getOtherAsset(res) {
      const {
        balance,
        totalSignIncome: sign,
        totalShareIncome: shareIn,
        totalShareExpenses: shareExp,
      } = res.data.data;
      const { assetsRewards } = this;
      // EOS
      if (this.type !== 'EOS') {
        this.playerincome = balance;
        assetsRewards.totalSignIncome = sign > 0 ? `+${sign}` : sign;
        assetsRewards.totalShareIncome = shareIn > 0 ? `+${shareIn}` : shareIn;
        assetsRewards.totalShareExpenses = shareExp > 0 ? `+${shareExp}` : shareExp;
      } else {
        // this.playerincome = balance / 10000;
        assetsRewards.totalSignIncome = sign > 0 ? `+${sign / 10000}` : sign / 10000;
        assetsRewards.totalShareIncome = shareIn > 0 ? `+${shareIn / 10000}` : shareIn / 10000;
        assetsRewards.totalShareExpenses = shareExp > 0 ? `+${shareExp / 10000}` : shareExp / 10000;
      }
    },
    // 提现按钮单击
    withdrawButton() {
      // 目前只支持EOS提现 所以其他不允许弹出
      if (!this.isWithdrawButton) return;
      if (this.playerincome <= 0) {
        this.$toasted.show('没有可以提现的余额', {
          position: 'top-center',
          duration: 1000,
          fitToScreen: true,
        });
        return;
      }
      this.visible = true;
    },
  },
};
</script>

<style lang="less" scoped src="./Asset.less"></style>
