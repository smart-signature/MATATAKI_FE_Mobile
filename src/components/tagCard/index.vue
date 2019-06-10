<template>
  <div 
    class="tag-card" 
    :style="tagStyleObject"
    @click="toggleTagStatus(tagCardCopy.status)"
    >{{tagCardCopy.name}}</div>
</template>

<script>
import tagColor from "@/common/tagColor";

export default {
  name: 'tagColor',
  props: ['tagCard'],
  data(){
    return {
      tagColors: {},
      tagStyleObject: { // 默认的颜色
        color: '#fff',
        backgroundColor: '#fff',
        border: '1px solid #fff'
      },
      tagCardCopy: Object.assign({}, this.tagCard)
    }
  },
  created() {
    this.tagColors = tagColor()
    // console.log(tagColor())
    this.setStyle()
  },
  methods: {
    // status: true 选中状态 false 默认状态
    setStyle(status = false) {
      let tagColor = this.tagColors[this.tagCardCopy.id]
      if (status) {
        this.tagStyleObject.color = '#fff'
        this.tagStyleObject.backgroundColor = tagColor
      } else {
        this.tagStyleObject.color = tagColor
        this.tagStyleObject.backgroundColor = '#fff'
      }
      this.tagStyleObject.border = `1px solid ${tagColor}`
    },
    toggleTagStatus(status) {
      this.tagCardCopy.status = !status
      this.setStyle(!status)
      // 向父级传递数据
      this.$emit('toggleTagStatus', this.tagCardCopy)
    }
  }
}
</script>

<style scoped lang="less" src="./index.less"></style>