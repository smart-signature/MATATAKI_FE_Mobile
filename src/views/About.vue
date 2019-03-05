<template>
  <div class="about">
    <div class="about-card">
      <div class="q-and-a" v-for="(item, idx) in items" :key="item.q">
        <h1 class="question">{{idx}}/ {{item.q}}</h1>
        <p class="answer">{{item.a}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
  data: () => ({
    items: [
      { q: "BALABALBALABA", a: "您可以在我们的平台上粘贴其他平台的原文链" },
      {
        q: "BALABALB您可以在我们的平台上粘贴其他平台的原文链ALABA",
        a: "BALABALBALABA"
      },
      {
        q: "BALABALBALABA",
        a: "BALA您可以在我们的平台上粘贴其他平台的原文链BALBALABA"
      }
    ]
  })
};
</script>


<style scoped>
.about {
  background: #f7f7f7;
  margin: 0 auto;
}

.about-card {
  max-width: 335px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 2px 5px 3px rgba(233, 233, 233, 0.5);
  border-radius: 8px;
  padding: 18px;
}
.q-and-a {
  color:rgba(0,0,0,1);
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
