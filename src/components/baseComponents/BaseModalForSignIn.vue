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
        <a class="success" href="javascript:;" @click="confirm">{{modalText.button[0]}}</a>
        <a class="cancel" href="javascript:;" @click="cancel">{{modalText.button[1]}}</a>
      </div>
  </Modal>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

export default {
  name: 'BaseModalForSignIn',
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    showModal(newVal) {
      this.showModaCopy = newVal;
    },
  },
  computed: {
    ...mapState(['userConfig']),
  },
  data() {
    return {
      showModaCopy: this.showModal,
      modalText: {
        text: '选择登录账号',
        button: ['确认', '取消'],
      },
      blockchin: {
        name: [
          {
            name: 'EOS账号登录',
            type: 'EOS',
          },
          {
            name: '本体账号登录',
            type: 'ONT',
          },
        ],
        nowIndex: 0,
      },
    };
  },
  methods: {
    ...mapActions(['idCheckandgetAuth']),
    ...mapMutations(['setUserConfig']),
    change(status) {
      this.showModaCopy = status;
      this.$emit('changeInfo', status);
    },
    toggleBlockchin(index) {
      if (index === this.blockchin.nowIndex) return;
      this.blockchin.nowIndex = index;
    },
    async confirm() {
      this.setUserConfig({ blockchin: this.blockchin.name[this.blockchin.nowIndex].type });
      await this.signIn();
      this.change(false);
    },
    cancel() {
      this.change(false);
    },
    async signIn() {
      const success = () => {
        localStorage.setItem('blockchin', this.userConfig.blockchin); // 成功存储登陆方式
        return true;
      };

      try {
        await this.idCheckandgetAuth();
        return success();
      } catch (error) {
        try {
          await this.idCheckandgetAuth();
          return success();
        } catch (error) {
          console.log(error);
          this.vantToast.fail({
            duration: 1000,
            message: '登陆失败',
          });
          return false;
        }
      }
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
      background-image: url('../../assets/img/icon_select.svg');
      &.active {
        background-image: url('../../assets/img/icon_select_active.svg');
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
