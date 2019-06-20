<template>
  <router-link :to="{ name: 'Article', params: { hash } }">
    <div class="card">
      <div class="img-outer">
        <img v-lazy="cover" :src="cover" alt="cover" class="img-inner" />
        <div class="full"></div>
      </div>
      <div v-if="nowIndex === 0" class="card-text">
        <h2 v-clampy="2" class="title">{{ article.title }}</h2>
        <p class="date">
          <span>{{ friendlyDate }}</span>
          <span>
            <img class="read" src="../assets/img/icon_article_read.svg" alt="read" />{{
              article.read
            }}
            <img class="eos" src="../assets/img/icon_article_ont.svg" alt="ont" />{{
              articleOntValue
            }}
            <img class="ont" src="../assets/img/icon_eos_article.svg" alt="eos" />{{ articleValue }}
          </span>
        </p>
      </div>
      <div v-else class="card-text">
        <h2 v-clampy="2" class="title">{{ article.title }}</h2>
        <p class="date">
          <span>销量: {{ article.read }}</span>
          <span>
            <img class="eos" src="../assets/img/icon_article_ont_orange.svg" alt="ont" />{{
              articleOntValue
            }}
            <img class="ont orange" src="../assets/img/icon_article_eos_orange.svg" alt="eos" />{{
              articleValue
            }}
          </span>
        </p>
      </div>
    </div>
  </router-link>
</template>

<script>
import moment from "moment";
import { isNDaysAgo } from "@/common/methods";
import { precision } from "@/common/precisionConversion";
import { getAvatarImage } from "@/api";

import clampy from "@clampy-js/vue-clampy";
import Vue from "vue";

import coverDefault from "@/assets/img/cover_default.png";

Vue.use(clampy);

export default {
  name: "ArticleCard",
  directives: {
    clampy
  },
  props: {
    article: {
      type: Object,
      default: () => {}
    },
    nowIndex: {
      type: Number,
      default: () => 0
    }
  },
  data() {
    return {};
  },
  computed: {
    friendlyDate() {
      const time = moment(this.article.create_time);
      return isNDaysAgo(2, time) ? time.format("MMMDo HH:mm") : time.fromNow();
    },
    hash() {
      return this.article.id; // 原来是 hash 现在用id进入
    },
    cover() {
      if (this.article.cover) return getAvatarImage(this.article.cover);
      return coverDefault;
    },
    articleValue() {
      return precision(this.article.eosvalue, "eos");
    },
    articleOntValue() {
      return precision(this.article.ontvalue, "ont");
    }
  },
  mounted() {}
};
</script>

<style scoped lang="less">
.card {
  margin: 20px;
  text-align: left;
  box-sizing: border-box;
  background-color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.card .title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 1);
  line-height: 18px;
}

.img-outer {
  flex: 0 0 120px;
  width: 120px;
  height: 60px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  margin-right: 10px;
  .img-inner {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .full {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.card-text {
  flex: 1;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  height: 60px;
  justify-content: space-between;
}

.card .date {
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  color: rgba(178, 178, 178, 1);
  justify-content: space-between;
  span {
    display: flex;
    align-items: center;
  }
  img {
    margin: 0 4px 0 8px;
    &:nth-child(1) {
      margin-left: 0;
    }
    &.read {
      width: 20px;
      height: 14px;
    }
    &.ont {
      width: 12px;
      height: 18px;
      opacity: 0.6;
      &.orange {
        opacity: 1;
      }
    }
    &.eos {
      width: 15px;
      height: 14px;
    }
  }
}
</style>
