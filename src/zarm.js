import Vue from 'vue';
import {
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon,
} from 'zarm-vue';
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css' // 這個應該搬到哪啊？

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  Actionsheet, Alert, Button, Cell, Pull,
  TabPane, Tabs, NavBar, Icon, mavonEditor
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
