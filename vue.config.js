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
