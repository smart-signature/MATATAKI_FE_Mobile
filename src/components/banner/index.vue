<template>
  <div class="banner mw">
    <div class="bg">
      <img src="@/assets/img/m_logo.png" alt="logo" />
      <img src="@/assets/img/m_banner.png" alt="banner" />
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="less" scoped>
.banner {
  box-sizing: border-box;
  margin-bottom: 20px;
  padding: 0 20px;
  .bg {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e3f4ff;
    border-radius: 10px;
  }
  img {
    &:nth-child(1) {
      width: 20px;
      margin-right: 8px;
    }
    &:nth-child(2) {
      width: 276px;
    }
  }
}
</style>
