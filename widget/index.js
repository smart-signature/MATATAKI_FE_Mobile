/* eslint-disable func-names */
import axios from 'axios';
import './clamp';
// style
import './index.less';
// img
import readImg from './img/read.svg';
import upsImg from './img/ups.svg';
import logoImg from './img/logo.svg';
import logoSquareImg from './img/logo_square.svg';
import logoRectangleImg from './img/logo_rectangle.svg';

// 获取url信息
const urlSearch = window.location.search.substr(1).split('&');
// 获取容器
const appDom = document.querySelector('#app');
// 地址
const urlMode = {
  development: {
    url: 'https://test.smartsignature.io',
    api: 'https://apitest.smartsignature.io',
  },
  production: {
    url: 'https://smartsignature.io',
    api: 'https://api.smartsignature.io',
  },
};
const mode = process.env.NODE_ENV;
const { url } = urlMode[mode];
const baseUrl = urlMode[mode].api;


// 数据
let urlSearchData = {};

// axios 设置
const axiosApi = axios.create({
  baseURL: baseUrl,
});

// 提取内容 删除多余的标签
const regRemoveContent = (str) => {
  // 去除空格
  const strTrim = str => str.replace(/\s+/g, '');
  // 去除标签
  const regRemoveTag = str => str.replace(/<[^>]+>/ig, '');
  // 去除markdown img
  const regRemoveMarkdownImg = str => str.replace(/!\[.*?\]\((.*?)\)/ig, '');
  // 去除 markdown 标签
  const regRemoveMarkdownTag = str => str.replace(/[\\\`\*\_\[\]\#\+\-\!\>]/ig, '');

  const regRemoveTagResult = regRemoveTag(str);
  const regRemoveMarkdownImgResult = regRemoveMarkdownImg(regRemoveTagResult);
  const regRemoveMarkdownTagResult = regRemoveMarkdownTag(regRemoveMarkdownImgResult);
  return strTrim(regRemoveMarkdownTagResult);
};

// url 参数解析
const urlSearchDecodeURIComponent = (arr) => {
  const data = {};
  arr.forEach((i) => {
    const arrData = i.split('=');
    data[arrData[0]] = decodeURIComponent(arrData[1]);
  });
  return data;
};
urlSearchData = urlSearchDecodeURIComponent(urlSearch);
if (urlSearchData.content) urlSearchData.content = regRemoveContent(urlSearchData.content);

// 设置内容
const setAppDom = ({
  title, content, img, ups, read, username,
}) => {
  const appDomStr = `
      <div class="container">
        <div class="widget">
          <img class="logo" src="${logoImg}" alt="logo" />
          <h1 class="jumpPage">${title || '标题找不到啦~'}</h1>
          <div class="widget-content">
            <img class="cover jumpPage" src="${img || logoRectangleImg}" alt="cover" />
            <p class="widget-des">${content || '没有简介信息'}</p>
          </div>
          <p class="author">by: ${username || ''}</p>
          <div class="readorups jumpPage">
            <span><img src="${readImg}" alt="read" />${read || 0}</span>
            <span><img src="${upsImg}" alt="ups" />${ups || 0}</span>
          </di>
        </div>
      </div>`;
  appDom.innerHTML = appDomStr;
  // show line 3
  // eslint-disable-next-line no-undef
  $clamp(document.querySelector('.widget-des'), { clamp: 3 });

  // 页面跳转
  const titleClick = () => {
    const jumpPageDom = document.querySelectorAll('.jumpPage');
    jumpPageDom.forEach((i, index) => {
      jumpPageDom[index].addEventListener('click', () => {
        const invite = urlSearchData.invite ? `?invite=${urlSearchData.invite}` : '';
        window.open(`${url}/article/${urlSearchData.id || ''}${invite}`);
      }, false);
    });
  };
  titleClick();
};

// 获取内容
const getArticleContent = (hash) => {
  const url = `/ipfs/catJSON/${hash}`;
  axiosApi.get(url)
    .then((res) => {
      if (res.status === 200 && res.data.code === 200) {
        const { data } = res.data;

        urlSearchData.content = regRemoveContent(data.content);
        const {
          title, content, img, ups, read, username,
        } = urlSearchData;
        setAppDom({
          title, content, img, ups, read, username,
        });
      } else {
        console.error('请求失败');
        setAppDom({});
      }
    })
    .catch((err) => {
      console.log(err);
      setAppDom({});
    });
};

// 通过id获取信息
const getInfobyId = (id) => {
  const url = `/p/${id}`;
  axiosApi.get(url)
    .then((response) => {
      if (response.status === 200 && response.data.code === 0) {
        const { data } = response.data;
        urlSearchData.title = data.title;
        urlSearchData.ups = data.ups;
        urlSearchData.read = data.read;
        urlSearchData.username = data.nickname || data.username;
        urlSearchData.img = data.cover ? `${baseUrl}/image/${data.cover}` : logoImg;
        const {
          title, content, img, ups, read, username,
        } = urlSearchData;
        setAppDom({
          title, content, img, ups, read, username,
        });
        // 没有传递内容请求接口获取
        if (!urlSearchData.content) getArticleContent(data.hash);
      } else {
        console.error('请求失败');
        setAppDom({});
      }
    })
    .catch((error) => {
      console.log(error);
      setAppDom({});
    });
};
getInfobyId(urlSearchData.id);
