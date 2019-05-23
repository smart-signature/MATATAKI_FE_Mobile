import Vue from 'vue';
import {
  Actionsheet, Button, Cell,
  TabPane, Tabs, Icon, Confirm, Input,
  Modal, KeyboardPicker, SwipeAction, Loading,
} from 'zarm-vue';

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  Actionsheet, Button, Cell,
  TabPane, Tabs, Icon, Confirm, Input,
  Modal, KeyboardPicker, SwipeAction, Loading,
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
