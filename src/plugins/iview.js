import Vue from 'vue';
import {
  BackTop, Button, Icon,
  Row, Divider, Message,
  Notice, Modal, Avatar,
  Tooltip, RadioGroup, Radio,
  Dropdown, DropdownMenu, DropdownItem,
  Checkbox,
} from 'iview';

import 'iview/dist/styles/iview.css';

Vue.prototype.$Message = Message;
Vue.prototype.$Modal = Modal;

// Vue.use(iView);
Vue.component('BackTop', BackTop);
Vue.component('Button', Button);
Vue.component('Icon', Icon);
Vue.component('Row', Row);
Vue.component('Divider', Divider);
Vue.component('Notice', Notice);
Vue.component('Message', Message); // 好像没有已组件的形式使用 后续用不到就可以删除
Vue.component('Modal', Modal);
Vue.component('Avatar', Avatar);
Vue.component('Tooltip', Tooltip);
Vue.component('RadioGroup', RadioGroup);
Vue.component('Radio', Radio);
Vue.component('Dropdown', Dropdown);
Vue.component('DropdownMenu', DropdownMenu);
Vue.component('DropdownItem', DropdownItem);
Vue.component('Checkbox', Checkbox);
