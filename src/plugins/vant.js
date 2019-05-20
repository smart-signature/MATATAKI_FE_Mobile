import Vue from 'vue';
import {
  Button,
  Toast,
} from 'vant';

import 'vant/lib/button/style';
import 'vant/lib/toast/style';

// 增加前缀 区分多个组件库 防止冲突
Vue.component('vanButton', Button);

Vue.prototype.vantToast = Toast;
