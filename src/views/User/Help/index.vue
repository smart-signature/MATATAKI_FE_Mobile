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
      <div class="help-list">
        <span class="help-list-title">最新版本</span>
        <span class="help-list-sub">v2.0.1</span>
      </div>
    </div>
  </div>
</template>

<script>
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
    jumpTo(name) {
      if (!name) return;
      this.$router.push({ name });
    },
  },

};
</script>

<style lang="less" scoped src="./index.less"></style>
