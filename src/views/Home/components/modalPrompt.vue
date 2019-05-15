<template>
  <Modal
    v-model="showModaCopy"
    footer-hide
    @on-visible-change="change"
    width="330"
    class-name="modalCenter">
      <div class="info-content">
        <p>{{modalText.text}}</p>
        <div class="blockchin" v-for="(item, index) in blockchin.name" :key="index" @click="toggleBlockchin(index)">
          <div class="blockchin-radio" :class="blockchin.nowIndex===index && 'active'"></div>
          <span>{{item.name}}</span>
        </div>
        <a class="success" href="javascript:;" @click="success">{{modalText.button[0]}}</a>
        <a class="cancel" href="javascript:;" @click="cancel">{{modalText.button[1]}}</a>
      </div>
  </Modal>
</template>

<script>
export default {
  name: 'modalPrompt',
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    modalText: {
      type: Object,
      default: () => ({
        text: '提示',
        button: ['确认', '取消'],
      }),
    },
  },
  watch: {
    showModal(newVal) {
      this.showModaCopy = newVal;
    },
  },
  data() {
    return {
      showModaCopy: this.showModal,
      blockchin: {
        name: [
          {
            name: 'EOS账号登录',
            type: 'EOS',
          },
          {
            name: 'ONT账号登录',
            type: 'ONT',
          },
        ],
        nowIndex: 0,
      },
    };
  },
  methods: {
    change(status) {
      this.showModaCopy = status;
      this.$emit('changeInfo', status);
    },
    toggleBlockchin(index) {
      if (index === this.blockchin.nowIndex) return;
      this.blockchin.nowIndex = index;
    },
    success() {
      this.$emit('modalSuccess', this.blockchin.name[this.blockchin.nowIndex].type);
    },
    cancel() {
      this.showModaCopy = false;
      this.$emit('changeInfo', false);
    },
  },
};
</script>


<style lang="less" scoped>
.info-content {
  margin: 0 10px;
  p {
    text-align: center;
    color:#484848;
    letter-spacing:1px;
    margin: 10px 0 18px;
    font-size:18px;
    font-weight:400;
    color:rgba(0,0,0,.7);
  }
  .blockchin {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 12px 0;
    cursor: pointer;
    font-size:14px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    color:rgba(0,0,0,.7);
    letter-spacing:1px;
    &-radio {
      width: 26px;
      height: 26px;
      background-image: url('../../../assets/img/icon_select.svg');
      &.active {
        background-image: url('../../../assets/img/icon_select_active.svg');
      }
    }
    span {
      margin-left: 14px;
    }
  }
  a {
    display: block;
    width: 270px;
    height: 46px;
    color: #fff;
    text-align: center;
    line-height: 46px;
    font-size:14px;
    font-family:PingFangSC-Medium;
    font-weight:500;
    letter-spacing:1px;
    border-radius: 3px;
    margin: 12px auto;
    cursor: pointer;
      &.success {
        background-color: #478970;
        margin-top: 30px;
      }
      &.cancel {
        background-color:#D7D7D7;
      }
  }
}

</style>
