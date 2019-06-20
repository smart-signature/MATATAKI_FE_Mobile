<template>
    <div class="home-fixed home-head mw">
      <div class="home-head-avatar" v-if="true">
        <img src="https://avatars2.githubusercontent.com/u/24250627?s=460&v=4" alt="" />
      </div>
      <a v-else href="javascript:void(0);" @click="loginButton" class="home-head-notlogin">登陆</a>

      <div class="home-head-nav">
        <a
          v-for="(item, index) in nav"
          :class="nowIndex === index && 'active'"
          @click="$emit('toggleNav', index)"
          :key="index" href="javascript:void(0);">
            <span>{{item}}</span>
          </a>
      </div>

      <img
        @click="$router.push({name: 'Publish', params: {id: 'create'}})"
        class="home-head-create"
        src="@/assets/img/icon_home_create.svg"
        alt="create"/>
    </div>
</template>

<script>
export default {
  name: 'homeHead',
  props: ['nav', 'nowIndex'],
  methods: {
    loginButton() {
      console.log('login');
    },
  },
};
</script>

<style lang="less" scoped>
.home-fixed {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 99;
}
.home-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #DBDBDB;
  padding: 10px 20px;
  background-color: #fff;
  box-sizing: border-box;
  &-avatar {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  &-notlogin {
    font-size:10px;
    font-weight:500;
    color:rgba(255,255,255,1);
    letter-spacing:2px;
    padding: 4px 8px;
    background: #000;
    border-radius: 6px;
  }
  &-nav {
    a {
      font-size:20px;
      font-weight:600;
      color:rgba(178,178,178,1);
      margin: 0 12px;
      position: relative;
      text-align: center;
      transition: all .18s ease-in-out;
      span {
        z-index: 2;
        position: relative;
      }
      &.active {
        color:rgba(0,0,0,1);
      }
      &.active::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: -2px;
        right: -2px;
        display: block;
        height: 5px;
        background-color: #1C9CFE;
      }
    }
  }

  &-create {
    width: 20px;
    height: 20px;
  }
}

</style>
