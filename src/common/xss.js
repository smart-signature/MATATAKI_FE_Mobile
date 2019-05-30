import xss from 'xss';

// eslint-disable-next-line import/prefer-default-export
export const xssFilter = (html) => {
  // 自定义规则
  const { whiteList } = xss;
  whiteList.iframe = ['src', 'height', 'width', 'frameborder', 'allowfullscreen'];
  whiteList.embed = ['src', 'allowFullScreen', 'quality', 'width', 'height', 'align', 'type'];

  const options = {
    whiteList,
  };
  const myxss = new xss.FilterXSS(options);
  return myxss.process(html);
};
