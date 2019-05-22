import Vue from 'vue';
import {
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon, Confirm, Input,
  Modal, KeyboardPicker, SwipeAction, Toast, Loading,
} from 'zarm-vue';

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon, Confirm,
  Input, SwipeAction,
  Modal, KeyboardPicker, Toast, Loading,
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
