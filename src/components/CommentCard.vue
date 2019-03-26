<template>
  <div class="card comment">
    <a>
      <h2 class="comment-quantity"
        :style='comment.quantity.replace(" EOS","") > 0 ? { color: "#f50" } : { color: "#87d068" } '>
        {{(comment.quantity.substring(0,1) !== '-' ? '+': '') + asset.quantity}}</h2>
      <p class="comment-information">{{friendlyDate}}</p>
    </a>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CommentCard',
  props: ['comment'],
  computed: {
    friendlyDate() {
      const isAppleSlave = navigator.platform.includes('iPhone');
      const time = new Date(this.asset.timestamp);
      return moment(time.getTime() - time.getTimezoneOffset() * 60000 * (isAppleSlave ? 0 : 1)).fromNow();// moment(this.asset.timestamp).fromNow();
    },
  },
  created() {
    // console.log(this.asset.quantity);
  },
};
</script>

<style scoped>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
h2.comment-quantity {
  font-size: 18px;
  font-weight: 600;
  color: #478970;
  /* line-height: 25px; */
}
.comment-information {
  color: rgb(105,105,105);
}
</style>
