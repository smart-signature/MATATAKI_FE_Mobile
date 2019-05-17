import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home/index.vue';
import { disassembleToken } from '@/api';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      // meta: {
      //   keepAlive: true, // 缓存
      // },
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
      path: '/article/:hash', // 支持 hash id 访问
      name: 'Article',
      props: true,
      component: () => import(/* webpackChunkName: "article" */ './views/Article/index.vue'),
    },
    // {
    //   path: '/login',
    //   name: 'Login',
    //   component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
    // },
    {
      path: '/user/:username',
      name: 'User',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/index.vue'),
    },
    {
      path: '/user/edit/:username',
      name: 'UserEdit',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/edit.vue'),
      beforeEnter: (to, from, next) => {
        const tokenUserName = disassembleToken(localStorage.getItem('ACCESS_TOKEN')).iss;
        // eslint-disable-next-line eqeqeq
        if (to.params.username != tokenUserName) next('/');
        else { next(); }
      },
    },
    {
      path: '/user/asset/:username',
      name: 'Asset',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/Asset/index.vue'),
      beforeEnter: (to, from, next) => {
        const tokenUserName = disassembleToken(localStorage.getItem('ACCESS_TOKEN')).iss;
        // eslint-disable-next-line eqeqeq
        if (to.params.username != tokenUserName) next('/');
        else { next(); }
      }, // 你怎么能随便给别人看到自己的资产明细呢？不怕被人打吗？
    },
    {
      path: '/user/asset/:username/:type',
      name: 'AssetType',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/Asset/Asset.vue'),
      beforeEnter: (to, from, next) => {
        const tokenUserName = disassembleToken(localStorage.getItem('ACCESS_TOKEN')).iss;
        // eslint-disable-next-line eqeqeq
        if (to.params.username != tokenUserName) next('/');
        else { next(); }
      }, // 你怎么能随便给别人看到自己的资产明细呢？不怕被人打吗？
    },
    {
      path: '/user/:username/original',
      name: 'Original',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/Original.vue'),
      // meta: {
      //   keepAlive: true, // 缓存
      // },
    },
    {
      path: '/user/:username/reward',
      name: 'Reward',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/Reward.vue'),
      // meta: {
      //   keepAlive: true, // 缓存
      // },
    },
    {
      // id 用于编辑文章或者草稿的时候动态传值使用
      // 发布文章后面可以为  publish/create
      // 编辑文章后面接id publish/id？from=”edit“ 通过query来区分
      // 草稿箱编辑 publish/id？from=”draft“ 通过query来区分
      // 统一发布、编辑、草稿箱，解决出现多套样式和重复代码的问题，并且减少工作量和不必要的错误
      path: '/publish/:id',
      name: 'Publish',
      props: true,
      component: () => import(/* webpackChunkName: "article-edit" */ './views/Publish/Publish.vue'),
    },
    {
      path: '/followlist/:username',
      name: 'FollowList',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/FollowList/FollowList.vue'),
    },
    {
      path: '/draftbox/:username',
      name: 'DraftBox',
      props: true,
      component: () => import(/* webpackChunkName: "user" */ './views/User/DraftBox.vue'),
    },
    {
      path: '/_easter-egg',
      name: 'EasterEgg',
      props: true,
      component: () => import(/* webpackChunkName: "easter-egg" */ './views/EasterEgg.vue'),
    },
    { // 幽林页面重定向进入首页 可以考虑设计 404 页面
      path: '*',
      redirect: '/',
    },
  ],
});
