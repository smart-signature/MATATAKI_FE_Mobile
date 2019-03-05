<template>
  <div class="about">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">关于我们</div>
      <div slot="right"></div>
    </za-nav-bar>
    <div class="about-card">
      <div class="q-and-a" v-for="(item, idx) in items" :key="item.q">
        <h1 class="question">{{idx}}/ {{item.q}}</h1>
        <p class="answer">{{item.a}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import items from '../assets/QuestionAndAnswer.json';

export default {
  name: 'About',
  data: () => ({
    items,
  }),
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>


<style scoped>
.about {
  background: #f7f7f7;
  margin: auto;
  text-align: center;
}

.about-card {
  margin: 10px;
  text-align: center;
  /* max-width: 335px; */
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
  padding: 18px;
}
.q-and-a {
  color: rgba(0, 0, 0, 1);
  text-align: left;
}
h1.question {
  font-size: 15px;
  font-weight: 500;
}
p.answer {
  font-size: 12px;
  font-weight: 400;
}
</style>
