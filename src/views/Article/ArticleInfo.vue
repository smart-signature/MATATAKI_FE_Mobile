<template>
  <Modal
    v-model="infoModaCopy"
    footer-hide @on-visible-change="change"
    class-name="modalCenter">
      <p
        slot="header"
        style="text-align: center;
              font-size:16px;
              font-family:PingFangSC-Medium;
              font-weight:500;
              color: #494949;
      ">爱上智能签名需要几步？</p>
      <div class="info-content">
        <p>1.点击“赞赏”按钮，支持好文，获取收益！</p>
        <p>2.点击“分享”按钮，生成您的邀请链接。</p>
        <p>3.转发链接，好友赞赏越多，收益越多。</p>
        <p>4.个人页面“提现“，实现自由之路！</p>
        <p class="des">(添加微信DappsDev加入智能签名早鸟群)</p>
        <img src="@/assets/img/code.png" alt="wechatCode:DappsDev">
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
    width: 290px;
    margin: 0 auto;
    &:nth-of-type(1) {
      margin-top: 10px;
    }
  }
  p.des {
    text-align: center;
    margin: 20px auto;
  }
  img {
    display: block;
    border: 1px solid #e2e2e2;
    box-sizing: border-box;
    width: 40%;
    margin: 20px auto 30px;
    padding: 2px;
  }
}
@media screen and (max-width: 575.98px) {
  .info-content {
    img {
      width: 60%;
    }
  }
}
@media screen and (max-width: 350px) {
  .info-content {
    p {
      width: auto;
    }
    img {
      width: 80%;
    }
  }
}
</style>