<template>
  <div class="card" @click="$router.push({ name: 'User', params: { id } })">
    <div class="avatar">
      <img v-if="avatarList" :src="avatarList" alt="avatar" v-lazy="avatarList" />
    </div>
    <div class="card-list">
      <div>
        <p class="list-name">{{list.nickname || list.username || list.followed}}</p>
        <p class="list-des">{{list.fans}}粉丝</p>
      </div>
      <!-- 后面用来放关注按钮 -->
    </div>
  </div>
</template>

<script>
import { backendAPI } from "@/api";
export default {
  props: ['list', 'ownerId'],
  computed: {
    id() { 
      const { list, ownerId } = this;
      return list.uid == ownerId ? list.fuid : list.uid
    },
    avatarList() {
      return this.list.avatar ? backendAPI.getAvatarImage(this.list.avatar) : ''
    }
  },
};
</script>

<style scoped lang="less">
  .card {
    padding: 0 0 0 20px;
    display: flex;
    align-items: center;
  }
  .avatar {
    width: 33px;
    height: 33px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #D8D8D8;
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  .card-list {
    flex: 1;
    text-align: left;
    position: relative;
    margin-left: 14px;
    padding: 14px 0;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      border:1px solid rgba(196,196,196, 0.2);
    }
  }
  .list-name {
    font-size:14px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    color:#494949;
    line-height:20px;
    letter-spacing:1px;
  }
  .list-des {
    font-size:12px;
    font-family:PingFangSC-Regular;
    font-weight:400;
    color:#A0A0A0;
    line-height:17px;
    letter-spacing:1px;
  }
</style>
