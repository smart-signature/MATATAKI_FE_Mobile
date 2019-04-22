<template>
  <div class="card">
    <router-link :to="{ name: 'Article', params: { hash }}">
        <h2 class="title">{{article.title}}</h2>
        <p class="avatar">{{article.nickname || article.author}}</p>
        <p class="date">
          {{friendlyDate}} · <img src="../assets/img/icon_amount.png" alt="eos" />
          {{article.value/ 10000}}
        </p>
    </router-link>
  </div>
</template>

<script>
import moment from 'moment';
import { isNDaysAgo } from '@/common/methods';

export default {
  name: 'ArticleCard',
  props: ['article'],
  computed: {
    friendlyDate() {
      const time = moment(this.article.create_time);
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
    },
    hash() {
      return this.article.hash;
    },
  },
};
</script>

<style scoped>
/* 文章card */
.card {
  margin: 10px 20px;
  text-align: left;
  box-shadow: 0px 2px 8px 0 rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  border: 1px solid #f1f1f1;
  box-sizing: border-box;
  background-color: #fff;
  padding: 18px;
}
.card a {
  color: #000;
  text-decoration: none;
}

.card .title {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
  color: rgb(76,76,76);
}

.card .avatar {
  color: #4D4D4D;
  font-size:16px;
  font-family:PingFangSC-Regular;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 18px;
  font-weight:400;
  letter-spacing:1px;
}
.card .date {
  font-size:14px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  letter-spacing:1px;
  color: #A5A5A5;
  display: flex;
  align-items: center;
}
.card .date img {
  width: 12px;
  margin: 0 8px;
}
</style>
