export default () => {
  // tag id 对应相应的颜色, 全局统一
  const id = 9
  const color = ['#1c9cfe', '#fb6877', '#886cff', '#ffa443', '#fb6877', '#fdd55c', '#83dbff', '#9ce883', '#ffd7b6']
  let tag = {}

  for (let i = 1; i <= id; i++)
    tag[i] = color[i-1]
  return tag
}