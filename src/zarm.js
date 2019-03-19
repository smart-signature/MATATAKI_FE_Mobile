import Vue from 'vue';
import {
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon, Confirm
} from 'zarm-vue';

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon, Confirm
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
