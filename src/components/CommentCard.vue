<template>
  <div class="comment">
    <div class="comment-info">
      <Avatar icon="ios-person" class="comment-avatar" />
        <div class="comment-head">
          <router-link class="comment-author" :to="{ name: 'User', params: { username: comment.author }}">
            {{comment.nickname || comment.author }}
          </router-link>
          赞赏了
          <span class="comment-quantity">{{`${parseFloat(comment.amount) / 10000} EOS`}}</span>
          <p class="comment-timestamp">{{friendlyDate}}</p>
        </div>
      </div>
      <p class="comment-message">{{displayMessage}}</p>
      <div class="comment-line"></div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CommentCard',
  props: ['comment'],
  computed: {
    displayMessage() {
      return this.comment.comment !== '' ? this.comment.comment : '用户没有留下评论';
    },
    friendlyDate() {
      // const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.comment.create_time);
      return moment(time.getTime() - time.getTimezoneOffset()
                   * 60000).fromNow();// 返回的数据带了时区
    },
  },
};
</script>

<style scoped>
.comment {
    margin: 10px 24px;
    text-align: left;
}

.comment-info {
  display: flex;
}
.comment-head {
  font-size:14px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  color:#A6A6A6;
  line-height:20px;
  letter-spacing:1px;
}
.comment-avatar {
  margin-right: 12px;
}
.comment-author {
  color: rgba(0,0,0,0.70);
  font-size:14px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  color:rgba(0,0,0,1);
  line-height:20px;
  letter-spacing:1px;
}
.comment-quantity {
  font-family:PingFangSC-Medium;
  font-weight:500;
  color:rgba(71,137,112,1);
  line-height:20px;
  letter-spacing:1px;
}
.comment-timestamp {
  font-size:12px;
  font-family:PingFangSC-Regular;
  font-weight:400;
  color:#A6A6A6;
  line-height:17px;
  letter-spacing:1px;
}
.comment-message {
  color:rgba(0,0,0,1);
  /* height: 60px; */
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 1px;
  margin: 8px 0 14px 44px;
  word-break: break-all;
}
.comment-line {
  height: 1px;
  margin-left: 44px;
  background-color: rgba(241,241,241,1);
  box-sizing: border-box;
}
@media screen and (min-width: 750px) {
  .comment {
    margin: 18px 24px;
  }
}

</style>
