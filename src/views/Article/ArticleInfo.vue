<template>
  <Modal v-model="infoModaCopy" footer-hide @on-visible-change="change">
      <p
        slot="header"
        style="text-align: center;
              font-size:16px;
              font-family:PingFangSC-Medium;
              font-weight:500;
              color: #494949;
      ">
      帮助信息</p>
      <div class="info-content">
        <p>1.赞赏金额: 本文收到的赞赏总额</p>
        <p>2.裂变系数: 你可得到的最高回报=赞赏额*裂变系数</p>
        <p>3.赞赏: 赞赏的文章可以在赞赏列表中查看</p>
        <p>4.分享: 先赞赏后分享，好友赞赏你可得更多</p>
      </div>
      <div slot="footer"></div>
  </Modal>
</template>

<script>
export default {
  props: {
    infoModa: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    infoModa(newVal) {
      this.infoModaCopy = newVal;
    },
  },
  data() {
    return {
      infoModaCopy: this.infoModa,
    };
  },
  methods: {
    change(status) {
      this.infoModaCopy = status;
      this.$emit('changeInfo', status);
    },
  },
};
</script>

<style lang="less" scoped>
.info-content {
  margin: 0 10px;
  p {
    font-size:14px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    color:rgba(0,0,0,1);
    line-height:1.5;
    letter-spacing:1px;
  }
}
</style>
