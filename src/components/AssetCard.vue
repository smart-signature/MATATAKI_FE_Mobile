<template>
  <div class="card">
    <div class="card-info">
      <h2 class="card-pricing" :style='{ color: `${assetColor}` }'>{{assetAmount}}</h2>
      <span class="card-type">{{assetType}}</span>
    </div>
    <div class="card-info">
      <span class="card-title" v-if="!isWithdraw">{{asset.title}}</span>
      <span class="card-title" v-else>
        <span class="card-title-info">
          {{asset.toaddress.slice(0,6)}}...
          <img src="@/assets/img/icon_copy.svg" class="copy-hash" alt="hash" @click="copyInfo(asset.toaddress)" />
        </span>
        <span>
          {{asset.trx.slice(0,6)}}...
          <img src="@/assets/img/icon_copy.svg" class="copy-hash" alt="hash" @click="copyInfo(asset.trx)" />
        </span>
      </span>
      <span class="card-date">{{friendlyDate}}</span>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
// import { isNDaysAgo } from '@/common/methods';
import { precision } from '@/common/precisionConversion';

export default {
  name: 'AssetCard',
  props: ['asset'],
  computed: {
    friendlyDate() {
      // const isAppleSlave = navigator.platform.includes('iPhone');
      // const time = moment(this.asset.create_time);
      // const timeZoneOffset = moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1));
      // return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();

      return moment(this.asset.create_time).format('MMMDo HH:mm');
    },
    assetAmount() {
      const switchType = {
        withdraw: '',
        'share income': '+',
        'sign income': '+',
        'support expenses': '',
      };
      return switchType[this.asset.type] + precision(this.asset.amount, this.asset.symbol);
    },
    assetColor() {
      const switchType = {
        withdraw: 'color: #333',
        'share income': '#D95E5E',
        'sign income': '#D95E5E',
        'support expenses': '#519552',
      };
      return switchType[this.asset.type];
    },
    assetType() {
      // type='withdraw'：0 待处理 1已转账待确认 2成功 3失败， 4审核 5审核拒绝
      // type=其他：只有2，表示成功
      const { status, type } = this.asset;
      const switchStatus = {
        0: '提现待处理',
        1: '提现待确认',
        2: '提现成功',
        3: '提现失败',
        4: '提现审核中',
        5: '提现审核失败',
      };
      const switchType = {
        withdraw: switchStatus[status],
        'share income': '赞赏收入',
        'sign income': '写作收入',
        'support expenses': '赞赏支出',
      };
      return switchType[type];
    },
    isWithdraw() {
      return this.asset.type === 'withdraw';
    },
  },
  created() {},
  methods: {
    copyInfo(copyText) {
      this.$copyText(copyText).then(() => {
        this.$toast.success({
          duration: 1000,
          message: '复制成功',
        });
      }, () => {
        this.$toast.fail({
          duration: 1000,
          message: '复制失败',
        });
      });
    },
  },
};
</script>

<style scoped lang="less">

.card {
    margin: 0 20px;
    box-sizing: border-box;
    background-color: #fff;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    position: relative;
    text-align: left;
    &::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 1px;
      background-color: rgba(241,241,241,1);
    }
    &:nth-of-type(1){
      border-radius: 3px 3px 0 0;
    }
     &:nth-last-of-type(1){
      border-radius: 0 0 3px 3px;
      &::after {
        display: none;
      }
    }
    &-pricing {
      font-size: 24px;
      font-weight: bold;
    }
    &-type {
      font-size:14px;
      font-weight:400;
      color:rgba(0,0,0,.7);
    }
    &-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &-title {
      font-size:14px;
      font-weight:bold;
      color:rgba(0,0,0,.7);
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      &-info {
        margin: 0 6px 0 0;
      }
      .copy-hash {
        width: 16px;
      }
    }
    &-date {
      font-size:14px;
      font-weight:400;
      color:rgba(0,0,0,.44);
      flex: 0 0 100px;
      text-align: right;
    }
}

</style>
