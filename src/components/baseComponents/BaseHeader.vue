<template>
  <div class="header" :style="customizeHeaderBc && 'background:' + customizeHeaderBc" :class="[isCenter && 'mw', isToggleBc && 'bc']">
    <div class="header-left" slot="left">
      <template v-if="white">
        <img src="@/assets/newimg/back_white.svg" alt="back" @click="goBack" class="back-icon">
        <img src="@/assets/newimg/zhuye_white.svg" alt="home" @click="goHome" class="home-icon">
      </template>
      <template v-else>
        <img src="@/assets/newimg/back.svg" alt="back" @click="goBack" class="back-icon">
        <img src="@/assets/newimg/zhuye.svg" alt="home" @click="goHome" class="home-icon">
      </template>
    </div>
    <p slot="title" class="title"> {{pageinfo.title}} </p>
    <div class="header-right" slot="right">
      <slot name='info'></slot>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'; // mapGetters 未使用
import throttle from 'lodash/throttle';

export default {
  name: 'BaseHeader',
  props: {
    // 页面信息
    pageinfo: {
      type: Object,
    },
    // 是否居中显示 是否添加 class mw
    isCenter: {
      type: Boolean,
      default: true,
    },
    // 自定义返回方法
    customizeBackFunc: {
      type: Boolean,
      default: false,
    },
    // 自定义Home方法
    customizeHomeFunc: {
      type: Boolean,
      default: false,
    },
    white: {
      type: Boolean,
      default: false,
    },
    // 自定义头部背景
    customizeHeaderBc: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isToggleBc: false,
    };
  },
  created() {
    this.addHandleScroll();
  },
  destroyed() {
    this.removeHandleScroll();
  },
  // 依據 https://blog.csdn.net/m0_37728716/article/details/81289317
  // 從 crearted 改成 mounted
  // 這極有可能是這幾天錢包登陸老是有問題的原因
  // 依據 https://github.com/vuejs/vue/issues/7333
  // 已確認此 Header.vue 的 crearted 內容不會被執行
  mounted() {
    // console.log('Does this page need to log in?:', this.pageinfo.needLogin);
  },
  methods: {
    ...mapGetters(['isLogined']),
    // 返回
    goBack() {
      if (this.customizeBackFunc) {
        this.$emit('headerBackFunc');
      } else {
        this.$router.go(-1);
      }
    },
    // 回到首页
    goHome() {
      if (this.customizeHomeFunc) {
        this.$emit('headerHomeFunc');
      } else {
        this.$router.push({ name: 'home' });
      }
    },
    addHandleScroll() {
      window.addEventListener('scroll', throttle(this.handleScroll, 150));
    },
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      // console.log(scrollTop);
      if (scrollTop > 10) {
        this.isToggleBc = true;
      } else {
        this.isToggleBc = false;
      }
    },
    removeHandleScroll() {
      window.removeEventListener('scroll', this.handleScroll);
    },
  },
  watch: {
    isLogined(newState) {
      if (newState) this.$Message.success('登录成功');
    },
  },
};
</script>

<style lang="less" scoped>
.header {
  min-height: 45px;
  background-color: transparent;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transition: all .6s;
  &.bc {
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, .1);
  }
}
.header-left {
  position: absolute;
  left: 20px;
  display: flex;
  align-items: center;
}
.title {
  text-align: center;
  font-size:16px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  letter-spacing:1px;
  color: #000000;
}
.header-right{
  position: absolute;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-icon {
  width: 9px;
  cursor: pointer;
}

.home-icon {
  width: 19px;
  margin-left: 16px;
  cursor: pointer;
}

</style>
