<template>
  <Modal
    class="widget"
    width="375"
    class-name="widget-flex"
    :class="widgetModalStatus === 0 ? 'gray' : widgetModalStatus === 4 ? 'transparent' : 'white'"
    v-model="widgetModalCopy"
    footer-hide
    @on-visible-change="change"
    :closable="false">
      <div class="widget-content-button" v-if="widgetModalStatus === 0">
        <div class="widget-button" @click="createWidget">
          <div class="widget-button-img">
            <img src="@/assets/img/widget/widget.svg" alt="widget" />
          </div>
          <p>创建widget</p>
        </div>
        <div class="widget-button" @click="widgetModalStatus = 4">
          <div class="widget-button-img">
            <img src="@/assets/img/widget/share.svg" alt="widget" />
          </div>
          <p>生成长图</p>
        </div>
        <div class="widget-button" @click="copyCode(getClipboard)">
          <div class="widget-button-img">
            <img src="@/assets/img/widget/link.svg" alt="link" />
          </div>
          <p>复制邀请链接</p>
        </div>
      </div>
      <div class="widget-writecontent" v-if="widgetModalStatus === 1">
        <p class="widget-title">创建widget</p>
        <van-field
          class="widget-textarea"
          v-model="widgetContent"
          type="textarea"
          placeholder="添加简介(选填)"
          rows="4"
          autosize
        />
        <div class="widget-footer">
          <a class="help" href="javascript:;" @click="reviewHelp">如何使用widget？</a>
          <a class="create" href="javascript:;" @click="createWidgetContent">创建widget</a>
        </div>
      </div>
      <div class="widget-help" v-if="widgetModalStatus === 2">
        <p class="widget-help-title">什么是文章widget</p>
        <p class="widget-help-content">
          widget功能可以为当前文章生成一个精美的展示卡片。您可以将widget代码复制到智能签名的文章编辑器中，这样就可以在您的文章中插入精美的文章展示卡片。当然，您展示的文章卡片同样也会具有邀请链接的功能。
        </p>
        <br />
        <p class="widget-help-title">操作步骤</p>
        <p class="widget-help-content">
          1.你可以选择自定义展示卡片上的简介内容<br />
          2.点击“创建widget”按钮获取代码<br />
          3.点击“复制代码”按钮获取widget代码<br />
          4.粘贴代码到智能签名编辑器中即可展示<br />
        </p>

        <a class="widget-help-button" href="javascript:;" @click="backPage">知道了</a>
      </div>
      <div class="widget-review" v-if="widgetModalStatus === 3">
        <p class="widget-title">widget预览</p>
        <div class="widget-review-content" v-html="widgetContentIframe">
        </div>
        <p class="widget-review-des">复制下面的代码并黏贴到您的网站来展示</p>
        <van-field
          class="widget-textarea"
          v-model="widgetContentIframe"
          type="textarea"
          placeholder=""
          rows="4"
          autosize
          id="codeIframe"
          @focus="selectValue($event)"
        />
        <div class="widget-footer">
          <a class="help" href="javascript:;" @click="reviewHelp">如何使用widget？</a>
          <a class="create" href="javascript:;" @click="copyCode(widgetContentIframe)">复制代码</a>
        </div>
      </div>
      <div v-if="widgetModalStatus === 4">
        <QRCodeDialog :shareInfo="shareInfo" @change="change"></QRCodeDialog>
      </div>
  </Modal>
</template>

<script>
import { sleep } from '@/common/methods';
import { strTrim } from '@/common/reg';
import { urlAddress } from '@/api/backend';
// const urlAddress = 'http://localhost:8080'; // 开发用
import QRCodeDialog from './QRCodeDialog'

export default {
  name: 'Widget',
  props: ['widgetModal', 'id', 'getClipboard', 'invite', 'shareInfo'],
  components: {
    QRCodeDialog
  },
  data() {
    return {
      widgetModalCopy: this.widgetModal,
      // 0 默认
      // 1 创建widget
      // 2 widget help
      // 3 review widget
      widgetModalStatus: 0,
      oldWidgetModalStatus: 0,
      widgetContent: '',
      widgetContentIframe: '',
    };
  },
  watch: {
    widgetModalStatus(newVal, oldVal) {
      // console.log(newVal, oldVal)
      this.oldWidgetModalStatus = oldVal;
      // 如果显示创建widget 但是没有内容
      if (newVal === 3 && !this.widgetContent) {
        const invite = this.invite ? `&invite=${this.invite}` : '';
        this.widgetContentIframe = `<iframe width="100%" height="180" src='${urlAddress}/widget/?id=${this.id}${invite}' frameborder=0></iframe>`;
      }
    },
    widgetModal(newVal) {
      this.widgetModalCopy = newVal;
    },
    widgetContent(newVal) {
      let content = '';
      const invite = this.invite ? `&invite=${this.invite}` : '';
      // 去前后空格防止空内容
      if (strTrim(newVal)) content = `&content=${newVal}`;
      this.widgetContentIframe = `<iframe width="100%" height="180" src='${urlAddress}/widget/?id=${this.id}${content}${invite}' frameborder=0></iframe>`;
    },
  },
  computed: {
  },
  methods: {
    createWidget() {
      this.widgetModalStatus = 1;
    },
    reviewHelp() {
      this.widgetModalStatus = 2;
    },
    backPage() {
      this.widgetModalStatus = this.oldWidgetModalStatus;
    },
    createWidgetContent() {
      this.widgetModalStatus = 3;
    },
    copyCode(code) {
      this.$copyText(code).then(() => {
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
    selectValue(e) {
      event.currentTarget.select();
    },
    resetStatus() {
      this.widgetModalStatus = 0;
      this.widgetContent = '';
      this.widgetContentIframe = '';
    },
    async change(status) {
      // console.log(status)
      this.widgetModalCopy = status;
      this.$emit('changeWidgetModal', status);
      await sleep(300);
      !status && this.resetStatus();
    },
  },
};
</script>

<style lang="less">
/*样式覆盖*/
.widget{
  &.gray .ivu-modal-content{
    background-color: #F1F1F1;
  }
  &.white .ivu-modal-content{
    background-color: #fff;
  }
  &.transparent .ivu-modal-content{
    background-color: transparent;
    box-shadow: none;
  }
}
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
