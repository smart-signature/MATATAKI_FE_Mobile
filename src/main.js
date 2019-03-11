import Vue from 'vue';
import moment from 'moment';
import App from './App.vue';
import './zarm';
import router from './router';
import store from './store';
import iView from 'iview';
import mavonEditor from 'mavon-editor';
import './registerServiceWorker';

// CSS Style
import 'mavon-editor/dist/css/index.css'
import 'iview/dist/styles/iview.css';

[
  iView, mavonEditor,
].map(c => Vue.use(c));

Vue.config.productionTip = false;

// Register moment's default language
moment.locale('zh-CN');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
