import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'About',
      // 路由级 code-splitting
      // 这会给当前的路由页生成单独的块文件 (webpackChunkName 是 about 则得到 about.[版本哈希].js)
      // 只有使用该 route 的场合才会下载这个页面的代码 (惰性加载).
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    },
    {
      path: '/article/:hash',
      name: 'Article',
      props: true,
      component: () => import(/* webpackChunkName: "article" */ './views/Article.vue'),
    },
    {
      path: '/article/:hash/:inviter',
      redirect: (to) => {
        const { hash, inviter } = to.params;
        return { name: 'Article', params: { hash, inviter } };
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
    },
    {
      path: '/user/:username',
      name: 'User',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/index.vue'),
    },
    {
      path: '/user/:username/asset',
      name: 'Asset',
      props: true,
      component: () => import(/* webpackChunkName: "user-asset" */ './views/User/Asset.vue'),
    },
    {
      path: '/user/:username/original',
      name: 'Original',
      props: true,
      component: () => import(/* webpackChunkName: "user-original" */ './views/User/Original.vue'),
    },
    {
      path: '/user/:username/reward',
      name: 'Reward',
      props: true,
      component: () => import(/* webpackChunkName: "user-reward" */ './views/User/Reward.vue'),
    },
    {
      path: '/publish',
      name: 'Publish',
      props: true,
      component: () => import(/* webpackChunkName: "new-post" */ './views/Publish.vue'),
    },
  ],
});
