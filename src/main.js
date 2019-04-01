import Vue from 'vue';

import clipboard from 'clipboard';
import moment from 'moment';
import infiniteScroll from 'vue-infinite-scroll';
import App from './App.vue';
import './zarm';
import router from './router';
import store from './store';
import './registerServiceWorker';

// Vue plugins
// eslint-disable-next-line import/extensions
import './plugins/iview.js';

[
  infiniteScroll,
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
