import Vue from 'vue';
import VueHead from 'vue-head';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import clipboard from 'clipboard';
import moment from 'moment';
import infiniteScroll from 'vue-infinite-scroll';
import App from './App.vue';
import './zarm';
import router from './router';
import store from './store';
import './registerServiceWorker';

// Vue plugins
import './plugins/iview';
import './plugins/vue-toasted';

// global css
import '@/assets/css/index.less';


[
  VueHead, infiniteScroll,
].map(c => Vue.use(c));

// 基础组件的自动化全局注册
const requireComponent = require.context(
  // 其组件目录的相对路径
  './components',
  // 是否查询其子目录
  false,
  // 匹配基础组件文件名的正则表达式
  /Base[A-Z]\w+\.(vue|js)$/,
);

requireComponent.keys().forEach((fileName) => {
  // 获取组件配置
  const componentConfig = requireComponent(fileName);

  // 获取组件的 PascalCase 命名
  const componentName = upperFirst(
    camelCase(
      // 获取和目录深度无关的文件名
      fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, ''),
    ),
  );

  // 全局注册组件
  Vue.component(
    componentName,
    // 如果这个组件选项是通过 `export default` 导出的，
    // 那么就会优先使用 `.default`，
    // 否则回退到使用模块的根。
    componentConfig.default || componentConfig,
  );
});

Vue.config.productionTip = false;

Vue.prototype.clipboard = clipboard;

// Register moment's default language
moment.locale('zh-CN');

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
