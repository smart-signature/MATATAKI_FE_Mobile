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
  }
};
