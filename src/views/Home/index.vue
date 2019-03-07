<template>
  <div class="home">
    <div class="head">
      <link rel="icon" type="image/png" sizes="32x32" href="./img/Andoromeda logo@2x.png">
      <link rel="icon" type="image/png" sizes="16x16" href="./img/Andoromeda logo.png">
      <div style="float:left">
        <img src="/img/Andoromeda logo.png" alt="Andoromeda logo"> 
        Andoromeda</div>
      <div style="float:right" >En</div>

      <div class="logined" v-if="isLogined">
          <p
            @click="$router.push({ name: 'User', params: {username: currentUsername } })"
            class="username"
          >{{currentUsername}}</p>
        </div>
      <div class="not-login-yet" style="float:right" v-else>
          <za-button theme='primary' size='xs'  @click="$router.push({name: 'Login'})">登录</za-button>
      </div>
      <br />
      <br />
      <h1 class="title">-SmartSignature-</h1>
      <h2 class="subtitle">首个EOS去中心化智能签名项目</h2>
    </div>
    <MyBanner />
    <ArticlesList/>
  </div>
</template>

<script>
import MyBanner from './MyBanner.vue';
import ArticlesList from './ArticlesList.vue';

export default {
  name: 'Home',
  components: { ArticlesList, MyBanner },
  data: () => ({}),
};
</script>

<style scoped>
.head {
  background: #478970;
  color: #fff;
  padding-top: 10px;
  height: 155px;
  text-align: center;
  align-items: center;
  vertical-align: middle;
}
h1.title {
  font-size: 32px;
  /* padding-top: 101px; */
  font-family: BodoniSvtyTwoSCITCTT-Book;
  font-weight: normal;
  width: 100%;
  color: rgba(255, 255, 255, 1);
  line-height: 27px;
  letter-spacing: 2px;
}
h2.subtitle {
  font-size: 16px;
  font-family: PingFangSC-Light;
  font-weight: 300;
  color: rgba(255, 255, 255, 1);
  line-height: 18px;
  letter-spacing: 1px;
}
</style>
