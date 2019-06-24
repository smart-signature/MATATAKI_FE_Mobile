import Vue from "vue";
import VueHead from "vue-head";

import moment from "moment";
// 记录路由并缓存页面，像原生APP导航一样。
import Navigation from "vue-navigation";
// 复制内容
import VueClipboard from "vue-clipboard2";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import { backendAPI } from "@/api";

import "./registerServiceWorker";
// import "lib-flexible"; // 适配

// Vue plugins
import "./plugins/iview";
import "./plugins/vant";
import "./plugins/baseComponents";

// global css
import "@/assets/css/index.less";

Vue.prototype.$backendAPI = backendAPI;

Vue.use(VueClipboard);

// 记录路由并缓存页面，像原生APP导航一样。
Vue.use(Navigation, { router, store, keyName: "CACHE" });

[VueHead].map(c => Vue.use(c));

Vue.config.productionTip = false;

// Register moment's default language
moment.locale("zh-CN");

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
