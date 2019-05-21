<template>
  <div class="assetpage mw">
    <BaseHeader :pageinfo="{ left: 'back', title: '资产明细', rightPage: 'home' }"/>

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
import { withdraw } from '@/api/contractEOS';
import AssetList from './AssetList.vue';
import { mapGetters } from 'vuex';
import { precision } from '@/common/precisionConversion';

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

    this.togglewithdrawButton();
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
  watch: {
    currentUserInfo() {
      this.togglewithdrawButton();
    },
  },
  methods: {
    // 确认提现
    handleOk() {
      this.withdraw(this.username);
    },
    // 提现
    async withdraw(name) {
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


      const precisionFunc = (amount) => {
        const amountType = amount > 0 ? '+' : '';
        return amountType + precision(amount, this.type);
      };

      this.playerincome = precision(balance, this.type);

      assetsRewards.totalSignIncome = precisionFunc(sign);
      assetsRewards.totalShareIncome = precisionFunc(shareIn);
      assetsRewards.totalShareExpenses = precisionFunc(shareExp);
    },
    // 提现按钮单击
    withdrawButton() {
      // 目前只支持EOS提现 所以其他不允许弹出
      if (!this.isWithdrawButton) return;
      if (this.playerincome <= 0) {
        this.vantToast.fail({
          duration: 1000,
          message: '没有可以提现的余额',
        });
        return;
      }
      this.visible = true;
    },
    togglewithdrawButton() {
      const { blockchain } = this.currentUserInfo;
      // console.log(blockchain);
      // EOS可以提现
      if (blockchain === 'EOS' && this.type === 'EOS') {
        this.isWithdrawButton = true; // 可以提现
      } else {
        this.isWithdrawButton = false; // 不能提现
      }
    },
  },
};
</script>

<style lang="less" scoped src="./Asset.less"></style>
