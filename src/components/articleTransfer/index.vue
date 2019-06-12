<template>
  <Modal
    class="widget"
    width="375"
    class-name="widget-flex"
    v-model="transferModalCopy"
    footer-hide
    @on-visible-change="change"
    :closable="false">
      <div class="widget-writecontent" v-if="widgetModalStatus === 0">
        <p class="widget-title">转让文章的ownership</p>
        <van-field class="widget-input" v-model="transferId" placeholder="请输入想要转让的用户id" />
        <div class="widget-footer">
          <a class="help" href="javascript:;" @click="reviewHelp">如何转让ownership？</a>
          <a class="create" href="javascript:;" @click="transferArticle">转让文章</a>
        </div>
      </div>
      <div class="widget-help" v-if="widgetModalStatus === 1">
        <p class="widget-help-title">如何转让ownership</p>
        <p class="widget-help-content">
          目前的机制完全照搬加密水浒。一个疑问，这种打赏机制与一般的打赏有何不同呢。要点在于，Incentive，打赏之后，你就和这篇文章这枚 Token 成为了一个利益共同体。你可以通过传播这篇文章，使得自己获得收益。
        </p>
        <a class="widget-help-button" href="javascript:;" @click="backPage">知道了</a>
      </div>
  </Modal>
</template>

<script>
import { sleep } from '@/common/methods';
import { strTrim } from '@/common/reg';
import { backendAPI } from '@/api';

export default {
  name: 'ArticleTransfer',
  props: ['transferModal', 'articleId', 'from'],
  data() {
    return {
      transferModalCopy: this.transferModal,
      // 0 默认
      // 1 转让
      widgetModalStatus: 0,
      oldWidgetModalStatus: 0,
      transferId: '',
    };
  },
  watch: {
    transferModal(newVal) {
      this.transferModalCopy = newVal;
    },
  },
  computed: {
  },
  methods: {
    reviewHelp() {
      this.widgetModalStatus = 1;
    },
    backPage() {
      this.widgetModalStatus = this.oldWidgetModalStatus;
    },
    async transferArticle() {
      let transferId = this.transferId
      console.log(this.articleId)
      if (!strTrim(transferId)) return this.$toast({duration: 1000,message: '用户Id不能为空'});

      try {
        const res = await backendAPI.transferOwner(this.from, this.articleId, this.transferId)
        console.log(res)
        if (res.status === 200 && res.data.code === 0) {
          this.$toast({duration: 1000,message: '转让成功,自动返回首页'});
          this.change(false);
          this.$navigation.cleanRoutes(); // 清除路由记录
          this.$router.push({ name: 'home' });
        } else {
          this.$toast({duration: 1000,message: '对方未开启转让权限、用户不存在或不是你的文章'});
        }
      } catch (error) {
        console.log(error)
        this.$toast({duration: 1000,message: '对方未开启转让权限、用户不存在或不是你的文章'});
      }
    },
    resetStatus() {
      this.widgetModalStatus = 0;
      this.transferId = '';
    },
    async change(status) {
      // console.log(status)
      this.transferModalCopy = status;
      this.$emit('changeTransferModal', status);
      await sleep(300);
      !status && this.resetStatus();
    },
  },
};
</script>

<style lang="less">
/*样式覆盖*/
.widget-flex {
 display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal{
      top: 0;
  }
}
</style>
<style src="./index.less" scoped lang="less"></style>
