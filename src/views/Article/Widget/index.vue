<template>
  <Modal 
    class="widget"
    class-name="widget-flex"
    :class="widgetModalStatus === 0 ? 'gray' : 'white'"
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
          placeholder="添加一段25字以内的简介(选填)"
          rows="4"
          autosize
        />
        <div class="widget-footer">
          <a class="help" href="javascript:;" @click="reviewHelp">如何使用widget？</a>
          <a class="create" href="javascript:;" @click="createWidgetContent">创建widget</a>
        </div>
      </div>
      <div class="widget-help" v-if="widgetModalStatus === 2">
        <p class="widget-help-title">如何使用widget</p>
        <p class="widget-help-content">
          目前的机制完全照搬加密水浒。一个疑问，这种打赏机制与一般的打赏有何不同呢。要点在于，Incentive，打赏之后，你就和这篇文章这枚 Token 成为了一个利益共同体。你可以通过传播这篇文章，使得自己获得收益。
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
          placeholder="添加一段25字以内的简介(选填)"
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
  </Modal>
</template>

<script>
import { sleep } from "@/common/methods";
import { strTrim } from "@/common/reg";
import { urlAddress } from "@/api/backend";
// const  urlAddress = 'http://localhost:8080' // 开发用

export default {
  name: 'Widget',
  props: ['widgetModal', 'id','getClipboard'],
  data(){
    return {
      widgetModalCopy: this.widgetModal,
      // 0 默认
      // 1 创建widget
      // 2 widget help
      // 3 review widget
      widgetModalStatus: 0,
      oldWidgetModalStatus : 0,
      widgetContent: '',
      widgetContentIframe: '',
    }
  },
  watch: {
    widgetModalStatus(newVal, oldVal){
      // console.log(newVal, oldVal)
      this.oldWidgetModalStatus = oldVal
      // 如果显示创建widget 但是没有内容
      if (newVal === 3 && !this.widgetContent) {
        this.widgetContentIframe = `<iframe width="100%" height="150" src='${urlAddress}/widget/?id=${this.id}' frameborder=0></iframe>`
      }
    },
    widgetModal(newVal) {
      this.widgetModalCopy = newVal;
    },
    widgetContent(newVal){
      let content = ''
      // 去前后空格防止空内容
      if (strTrim(newVal)) content = `&content=${newVal}`
      this.widgetContentIframe = `<iframe width="100%" height="150" src='${urlAddress}/widget/?id=${this.id}${content}' frameborder=0></iframe>`
    }
  },
  computed: {
  },
  methods: {
    createWidget(){
      this.widgetModalStatus = 1
    },
    reviewHelp(){
      this.widgetModalStatus = 2
    },
    backPage(){
      this.widgetModalStatus = this.oldWidgetModalStatus
    },
    createWidgetContent(){
      this.widgetModalStatus = 3
    },
    copyCode(code){
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
    selectValue(e){
      event.currentTarget.select()
    },
    resetStatus(){
      this.widgetModalStatus = 0
      this.widgetContent = ''
      this.widgetContentIframe = ''
    },
    async change(status){
      // console.log(status)
      this.widgetModalCopy = status
      this.$emit('changeWidgetModal', status)
      await sleep(300)
      !status && this.resetStatus()
    }
  }
}
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