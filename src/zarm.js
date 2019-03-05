import Vue from 'vue';
import {
  Button, Alert, TabPane, Tabs, NavBar, Icon,
} from 'zarm-vue';

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  TabPane, Icon, Button, Alert, Tabs, NavBar,
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
