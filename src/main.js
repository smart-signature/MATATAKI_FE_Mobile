import Vue from 'vue';

import clipboard from 'clipboard';
import iView from 'iview';
import moment from 'moment';
import infiniteScroll from 'vue-infinite-scroll';
import App from './App.vue';
import './zarm';
import router from './router';
import store from './store';
import './registerServiceWorker';


// CSS Style
import 'iview/dist/styles/iview.css';

[
  iView, infiniteScroll,
].map(c => Vue.use(c));

Vue.config.productionTip = false;

Vue.prototype.clipboard = clipboard;

// Register moment's default language
moment.locale('zh-CN');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
