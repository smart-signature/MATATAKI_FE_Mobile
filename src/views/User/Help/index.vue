<template>
  <div class="mw help">
    <BaseHeader :pageinfo="{ title: '设置'}"  />
    <div class="help-block">
      <div class="help-list" v-for="(item, index) in helpDoc" :key="index" @click="jumpTo({name: item.name})">
        <span class="help-list-title">{{item.title}}</span>
        <img src="@/assets/img/icon_arrow.svg" alt="view">
      </div>
    </div>

      <div class="help-block">
       <div class="help-list">
        <span class="help-list-title">接受文章转让</span>
        <span class="help-list-sub">
          <van-switch 
          size="22px" 
          v-model="articleTransfer" 
          active-color="#56A56B" 
          inactive-color="#F0F0F0"
          @change="changeTransfer" />
        </span>
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
        <span class="help-list-sub">v2.1.0</span>
      </div>
    </div>
    <div class="signout">
      <a class="signout-button" href="javascript:;" @click="btnsignOut">退出登录</a>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { backendAPI } from '@/api';
export default {
  naem: 'Help',
  data() {
    return {
      articleTransfer: false,
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
  created() {
    this.getMyUserData()
  },
  methods: {
    ...mapActions(['signOut']),
    btnsignOut() {
      this.signOut();
      this.jumpTo({ name: 'home' });
    },
    jumpTo(params) {
      if (!params.name) return;
      this.$router.push(params);
    },
    // 获取用户信息 - 转让状态
    async getMyUserData() {
     try {
        const res = await backendAPI.getMyUserData()
        if (res.status === 200 && res.data.code === 0) this.articleTransfer = !!res.data.data.accept
        else console.log('获取转让状态失败')
     } catch (error) { console.log(`获取转让状态失败${error}`) }
    },
    // 改变转让状态
    async changeTransfer(status) {
      try {
        this.articleTransfer = status
        let accept = status ? 1 : 0
        const res = await backendAPI.setProfile({accept})
        if (res.status === 200 && res.data.code === 0) return this.$toast.success({ duration: 1000, message: '成功' });
        else {
          this.$toast.fail({ duration: 1000, message: '失败' });
          this.articleTransfer = !status        
        }
      } catch (error) {
        this.articleTransfer = !status 
        console.log(`转让状态错误${error}`)    
        this.$toast.fail({ duration: 1000, message: '失败' });
      }
    }
  },

};
</script>

<style lang="less" scoped src="./index.less"></style>
