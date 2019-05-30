<template>
  <router-link :to="{ name: 'Article', params: { hash }}">
    <div class="card">
      <div class="article-text">
        <h2 class="title">{{article.title}}</h2>
        <p class="avatar">{{article.nickname || article.author}}</p>
        <p class="date">
          {{friendlyDate}} ·
          <img src="../assets/img/icon_eos_article.svg" alt="eos" />{{articleValue}}
          <img src="../assets/img/icon_ont_article.svg" alt="ont" />{{articleOntValue}}
        </p>
      </div>
      <div class="img-outer" v-if="cover">
        <img :src="cover" alt="" class="img-inner">
      </div>
    </div>
  </router-link>
</template>

<script>
import moment from 'moment';
import { isNDaysAgo } from '@/common/methods';
import { precision } from '@/common/precisionConversion';
import { getAvatarImage } from '@/api';

export default {
  name: 'ArticleCard',
  props: ['article'],
  computed: {
    friendlyDate() {
      const time = moment(this.article.create_time);
      return isNDaysAgo(2, time) ? time.format('MMMDo HH:mm') : time.fromNow();
    },
    hash() {
      return this.article.id; // 原来是 hash 现在用id进入
    },
    cover() {
      if (this.article.cover) return getAvatarImage(this.article.cover);
      return null;
    },
    articleValue() {
      return precision(this.article.eosvalue, 'eos');
    },
    articleOntValue() {
      return precision(this.article.ontvalue, 'ont');
    },
  },
};
</script>

<style scoped>
.article-text {
  flex: 1;
  overflow: hidden;
}
.img-outer {
  flex: 0 0 80px;
  width: 80px;
  height: 80px;
  margin-left: 10px;
}
.img-inner {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 3px;
  object-fit: cover;
}
/* 文章card */
.card {
  margin: 10px 20px;
  text-align: left;
  box-shadow: 0px 1px 4px 0 rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  box-sizing: border-box;
  background-color: #fff;
  padding: 14px 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: relative;
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
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size:14px;
  font-weight:400;
  letter-spacing:1px;
  margin-top: 4px;
}
.card .date {
  font-size:14px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  letter-spacing:1px;
  color: #A5A5A5;
  display: flex;
  align-items: center;
  margin-top: 2px;
}
.card .date img {
  width: 12px;
  margin: 0 8px;
  opacity: 0.7;
}
</style>
