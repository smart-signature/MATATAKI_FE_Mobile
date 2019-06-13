<template>
  <div class="buy-block" @click="jumpPage(buy.sign_id)">
    <div class="buy-list">
      <div class="buy-head">
        <span class="buy-title">{{buy.title}}</span>
        <span class="buy-money">
          <span class="buy-money-amount">-{{buyAmount}}</span>
          {{buy.symbol}}</span>
      </div>
      <p class="buy-content">地址: {{buy.digital_copy}}</p>
      <div class="buy-footer">
        <span class="buy-time">购买于 {{buyTime}}</span>
        <a href="javascript:;" @click="copyText(buy.digital_copy)">复制</a>
      </div>
    </div>
  </div>
</template>

<script>
import { precision } from "@/common/precisionConversion";
import moment from 'moment';

export default {
  name: 'buyCard',
  props: ['buy'],
  computed: {
    buyAmount() {
      return precision(this.buy.amount, this.buy.symbol)
    },
    buyTime() {
      return moment(this.buy.create_time).format('lll');
    }
  },
  methods: {
    copyText(text) {
      this.$copyText(text).then(() => {
        this.$toast.success({ duration: 1000, message: '复制成功' });
      }, () => {
        this.$toast.fail({ duration: 1000, message: '复制失败' });
      });
    },
    jumpPage(id) {
      this.$router.push({ name: 'Article', params: { hash: id }})
    }
  }
}
</script>

<style lang="less" scoped>
.buy-block {
  background:rgba(255,255,255,1);
  box-shadow:0px 5px 5px 0px rgba(235,235,235,0.5);
  border-radius:4px;
  margin: 14px 20px;
  &:nth-child(2){
    margin-top: 22px;
  }
  .buy-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    position: relative;
    flex-direction: column;
  }
  .buy-head {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .buy-title {
    font-size:18px;
    font-weight:600;
    color:rgba(0,0,0,1);
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    text-align: left;
  }
  .buy-money {
    font-size: 18px;
    font-weight: 600;
    color: #000;
    min-width: 110px;
    text-align: right;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    &-amount {
      color: #56A56B;
    }
  }
  .buy-content {
    width: 100%;
    font-size:14px;
    font-weight:400;
    color:rgba(0,0,0,1);
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin: 2px 0;
  }
  .buy-footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .buy-time {
      font-size:12px;
      font-weight:400;
      color:rgba(178,178,178,1);
    }
    a {
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      padding: 4px 20px;
      background-color: #232323;
      border-radius: 20px;
    }
  }
}
</style>
