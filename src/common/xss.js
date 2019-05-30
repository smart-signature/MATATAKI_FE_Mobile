import xss from 'xss';

// eslint-disable-next-line import/prefer-default-export
export const xssFilter = (html) => {
  // 自定义规则
  const options = {
    whiteList: {
      iframe: ['src', 'height', 'width', 'frameborder', 'allowfullscreen'],
      embed: ['src', 'allowFullScreen', 'quality', 'width', 'height', 'align', 'type'],
    },
  };
  const myxss = new xss.FilterXSS(options);
  return myxss.process(html);
};
