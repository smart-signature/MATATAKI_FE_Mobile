<template>
  <div class="card">
    <div>
      <h2 class="asset-quantity" :style='{ color: `${assetColor}` }'>{{assetAmount}} EOS</h2>
      <p class="asset-information">{{friendlyDate}}</p>
    </div>
    <div class="detailright">
      <p v-clampy="3">{{asset.title}}</p>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
// https://github.com/clampy-js/vue-clampy
import clampy from '@clampy-js/vue-clampy';
import { isNDaysAgo } from '@/common/methods';

export default {
  name: 'AssetCard',
  props: ['asset'],
  directives: {
    clampy,
  },
  computed: {
    friendlyDate() {
      const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.asset.create_time);
      const timeZoneOffset = moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1));
      return isNDaysAgo(2, timeZoneOffset) ? timeZoneOffset.format('MMMDo HH:mm') : timeZoneOffset.fromNow();
    },
    assetAmount() {
      return this.asset.amount > 0 ? `+${this.asset.amount / 10000}` : this.asset.amount / 10000;
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
    justify-content: space-between;
    align-items: center;
    position: relative;
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
}
.asset-quantity {
  font-size:22px;
  font-family:PingFangSC-Semibold;
  font-weight:600;
  line-height:30px;
}
.asset-information {
  font-size:11px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  color:#A6A6A6;
  line-height:16px;
  letter-spacing:1px;
}
.detailright{
    width: 60px;
    height: 60px;
    background-color: #ecebeb;
    color: #777777;
    font-size: 12px;
    font-weight: normal;
    padding: 5px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    word-wrap: break-word;
    font-family:PingFangSC-Regular;
    font-weight:400;
    color:rgba(119,119,119,1);
    line-height:15px;
}
</style>
