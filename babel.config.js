module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    ['component', {
      libraryName: 'zarm-vue',
      styleLibraryName: 'theme',
    }],
    ['import', {
      "libraryName": 'iview',
      "libraryDirectory": 'src/components'
    }],
],
};
