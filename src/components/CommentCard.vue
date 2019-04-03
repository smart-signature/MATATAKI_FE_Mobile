<template>
  <div class="comment">
    <h1 class="comment-title">
      <router-link :to="{ name: 'User', params: { username: comment.author }}">
        <span class="comment-author">{{comment.author}}</span>
      </router-link>
      <span> 赞赏了 </span>
      <span class="comment-quantity">{{comment.quantity}}</span>
    </h1>
    <h2 class="comment-timestamp">{{friendlyDate}}</h2>
    <p class="comment-message">{{displayMessage}}</p>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CommentCard',
  props: ['comment'],
  computed: {
    displayMessage() {
      return this.comment.message !== '' ? this.comment.message : '用户没有留下评论';
    },
    friendlyDate() {
      // const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.comment.timestamp);
      return moment(time.getTime() - time.getTimezoneOffset()
                   * 60000).fromNow();// 返回的数据带了时区
      // moment(this.asset.timestamp).fromNow();
    },
  },
  created() {
    // console.log(this.comment);
  },
};
</script>

<style scoped>
.comment {
    margin: 8px 20px;
    text-align: left;
    /* max-width: 335px; */
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    padding: 18px;
}
.comment-title {
  color: rgba(0,0,0,0.35);
  height: 20px;
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 1px;
}
.comment-author {
  color: rgba(0,0,0,0.70);
}
.comment-quantity {
  color: rgba(71,137,112,1);
  font-family: PingFangSC-Medium;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 1px;
}
.comment-timestamp {
  color: rgba(0,0,0,0.35);
  font-size: 12px;
}
.comment-message {
  color:rgba(0,0,0,1);
  /* height: 60px; */
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 1px;
}
</style>
