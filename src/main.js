import Vue from 'vue';
import moment from 'moment';
import App from './App.vue';
import './zarm';
import router from './router';
import store from './store';
import './registerServiceWorker';
import 'zarm-vue/zarm-vue.default.css';
  //-- iview --//
import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);
  //           //

Vue.config.productionTip = false;

// Register moment's default language
moment.locale('zh-CN');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
