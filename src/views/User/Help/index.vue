<template>
  <div class="help">
    <BaseHeader :pageinfo="{ title: '帮助'}"  />
    <div class="help-block">
      <div class="help-list" v-for="(item, index) in helpDoc" :key="index" @click="jumpTo(item.name)">
        <span class="help-list-title">{{item.title}}</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view">
      </div>
    </div>

    <div class="help-block">
      <a class="help-list" href="https://github.com/smart-signature/smart-signature-future" target="_blank">
        <span class="help-list-title">关于我们</span>
        <div class="help-list-right">
          <span class="help-list-sub">Github 入口</span>
          <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="view">
        </div>
      </a>
      <a class="help-list" href="https://t.me/smartsignature_io" target="_blank">
        <span class="help-list-title">加入电报</span>
        <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="view">
      </a>
       <div class="help-list">
        <span class="help-list-title">最新版本</span>
        <span class="help-list-sub">v2.0.1</span>
      </div>
    </div>
    <div class="signout">
      <a class="signout-button" href="javascript:;" @click="btnsignOut">退出登录</a>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  naem: 'Help',
  data() {
    return {
      helpDoc: [
        {
          title: '规则介绍',
          name: 'About',
        },
        {
          title: '用户协议',
          name: '',
        },
        {
          title: '隐私政策',
          name: '',
        },
      ],
    };
  },
  methods: {
    ...mapActions(['signOut']),
    btnsignOut() {
      this.signOut();
      this.jumpTo({ name: 'home' });
    },
    jumpTo(name) {
      if (!name) return;
      this.$router.push({ name });
    },
  },

};
</script>

<style lang="less" scoped src="./index.less"></style>
