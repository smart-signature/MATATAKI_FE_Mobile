import Vue from 'vue';
import {
  Cell, TabPane, Tabs,
} from 'zarm-vue';

// Instead of doing this: - Frank
// Vue.use(Button);
// Vue.use(Tabs);
// =====================
// We can do this:
[
  Cell, TabPane, Tabs,
].map(component => Vue.use(component));

// gimmick for import multiple seperated component in a much simpler way
