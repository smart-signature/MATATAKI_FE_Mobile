import Vue from 'vue';
import {
  Button,
  Toast,
  PullRefresh,
  Loading,
  Dialog,
  Field,
} from 'vant';

import 'vant/lib/button/style';
import 'vant/lib/toast/style';
import 'vant/lib/pull-refresh/style';
import 'vant/lib/dialog/style';
import 'vant/lib/field/style';

// 增加前缀 区分多个组件库 防止冲突
Vue.component('vanButton', Button); // 按钮
Vue.component('vanPullRefresh', PullRefresh); // 下拉刷新
Vue.component('vanLoading', Loading); // 加载中
Vue.use(Toast); // 轻提示
Vue.use(Dialog); // 对话框
Vue.use(Field); // 输入框
