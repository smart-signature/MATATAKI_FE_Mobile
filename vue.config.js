// 动态计算环境变量并以 `process.env.` 注入网站
// trick from: https://cli.vuejs.org/zh/guide/mode-and-env.html#在客户端侧代码中使用环境变量
process.env.VUE_APP_COMMIT_HASH = process.env.COMMIT_REF

module.exports = {
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        import: [],
      },
    },
  },
  pwa: {
    msTileColor: '#4DBA87',
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
    },
    iconPaths:{
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico'
    },
  },
};
