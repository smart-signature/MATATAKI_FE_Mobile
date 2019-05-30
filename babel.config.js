module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    ['import', { // 似乎没什么用 已经引入了全部的css // 組件還是分離的
      libraryName: 'iview',
      libraryDirectory: 'src/components',
    }],
  ],
};
