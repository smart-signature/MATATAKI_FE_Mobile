import Vue from 'vue';
import {
  Button,
  Toast,
  PullRefresh,
} from 'vant';

import 'vant/lib/button/style';
import 'vant/lib/toast/style';
import 'vant/lib/pull-refresh/style';

// 增加前缀 区分多个组件库 防止冲突
Vue.component('vanButton', Button); // 按钮
Vue.component('vanPullRefresh', PullRefresh); // 下拉刷新

Vue.prototype.vantToast = Toast; // 轻提示
