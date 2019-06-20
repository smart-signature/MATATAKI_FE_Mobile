<template>
  <div class="slide-item">
    <img :src="cover" alt="cover" v-if="cover" />
    {{cover}}
    <div class="slide-read">{{slideIndex === 0 ?  '浏览量: ' + slide.read : '总销量: ' + slide.read}}</div>
  </div>
</template>

<script>
import { backendAPI } from '@/api';

export default {
  name: 'homeSlideItem',
  props: ['slide', 'slideIndex'],
  computed: {
    cover() {
      return this.slide.cover ? backendAPI.getAvatarImage(this.slide.cover) : '';
    },
  },
};
</script>

<style lang="less" scoped>
  .slide-item {
    height: 117px;
    width: 260px;
    flex: 1 0 260px;
    margin: 0 0 0 20px;
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    background:rgba(216,216,216,1);
    box-shadow: 0 0 10px 0px rgba(0,0,0,0.15);
    &:nth-last-child(1){
      margin: 0 20px;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .slide-read {
      position: absolute;
      bottom: 0;
      left: 0;
      background-color: #FB6877;
      color: #fff;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 20px;
      text-align: center;
      border-radius: 0 20px 0 0;
      line-height: 1.5;
    }
  }
</style>
