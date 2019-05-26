<template>
  <div class="draft-outer" @click="() => {
      this.$router.push({ name: 'Publish', params: { id: draftbox.id }, query: { from: 'draft' } });
    }">
      <div class="onecard">
        <div class="onecard_title">{{draftbox.title}}</div>
        <div class="onecard_date">{{createTime}}</div>
      </div>
    <Icon type="md-close-circle" style="color: #515a6e;font-size: 24px;" @click.stop="delListBtn({
        id: draftbox.id,
        index: index
      })"/>
  </div>
</template>

<script>
import moment from 'moment';
import { isNDaysAgo } from '@/common/methods';

export default {
  name: 'DraftBoxList',
  props: ['draftbox', 'index'],
  computed: {
    createTime() {
      const time = moment(this.draftbox.create_time);
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
    },
  },
  methods: {
    delListBtn(data) {
      this.$emit('delId', data);
    },
  },
};
</script>

<style scoped>
.draft-outer {
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
  padding:15px;
  height: 80px;
}
a {
  color: #000;
  text-decoration: none; /* no underline */
}
.onecard{
  text-align: left;
}
.onecard_title{
  font-size: 18px;
  font-weight: bolder;
}
.onecard_date{
  font-size: 11px;
  margin-top: 6px;
  opacity: 0.4;
}

.za-swipeAction-actions-right {
  right: 0;
  background: #d45354;
  color: #ffffff;
  margin-right: 20px;
  padding: 20px;
  width: 80px;
  padding-bottom: 15px;
  /* background: rgba(255, 255, 255, 1); */
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
}
/* style="transition-duration: 300ms; transform: translate3d(-120px, 0px, 0px);" */
</style>
