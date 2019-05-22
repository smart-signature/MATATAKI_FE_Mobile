<template>
  <div class="card">
    <h2 class="card-pricing" :style='{ color: `${assetColor}` }'>{{assetAmount}}</h2>
    <div class="card-info">
      <p class="card-title">{{asset.title}}</p>
      <p class="card-date">{{friendlyDate}}</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
// https://github.com/clampy-js/vue-clampy
import clampy from '@clampy-js/vue-clampy';
import { isNDaysAgo } from '@/common/methods';
import { precision } from '@/common/precisionConversion';

export default {
  name: 'AssetCard',
  props: ['asset'],
  directives: {
    clampy,
  },
  computed: {
    friendlyDate() {
      // const isAppleSlave = navigator.platform.includes('iPhone');
      const time = moment(this.asset.create_time);
      // const timeZoneOffset = moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1));
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
    },
    assetAmount() {
      const precisionFunc = (amount) => {
        const amountType = amount > 0 ? '+' : '';
        return amountType + amount + this.asset.symbol;
      };
      return precisionFunc(precision(this.asset.amount, this.asset.symbol));
    },
    assetColor() {
      // eslint-disable-next-line no-nested-ternary
      return this.asset.amount > 0 ? '#D95E5E' : (this.asset.amount < 0 ? '#519552' : '#a7aab7');
    },
  },
  created() {},
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
    &-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &-title {
      font-size:12px;
      font-weight:bold;
      color:rgba(0,0,0,.7);
      letter-spacing:1px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    &-date {
      font-size:12px;
      font-weight:400;
      color:rgba(0,0,0,.44);
      flex: 0 0 88px;
      text-align: right;
    }
}

</style>
