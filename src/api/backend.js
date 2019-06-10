import axios from 'axios';
import https from 'https';
import { Base64 } from 'js-base64';

// Doc : https://github.com/axios/axios

export const urlAddress = process.env.VUE_APP_URL;
export const apiServer = process.env.VUE_APP_API;
// https://github.com/axios/axios/issues/535
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axiosforApiServer = axios.create({
  baseURL: apiServer,
  headers: { Accept: '*/*', lang: 'zh' },
  httpsAgent,
});

// localStorage
export const getCurrentAccessToken = () => window.localStorage.getItem('ACCESS_TOKEN');
export const setAccessToken = token => window.localStorage.setItem('ACCESS_TOKEN', token);

/*
 * 拆token，返回json对象
*/
export const disassembleToken = (token) => {
  if (!token) { return { iss: null, exp: 0 }; }
  let tokenPayload = token.substring(token.indexOf('.') + 1);
  tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
  return JSON.parse(Base64.decode(tokenPayload));
  // {iss:用户名，exp：token的过期时间，用ticks的形式表示}
};

/* eslint no-param-reassign: ["error", { "props": false }] */
const accessBackend = async (options) => {
  // https://blog.fundebug.com/2018/07/25/es6-const/
  options.headers = {
    'x-access-token': getCurrentAccessToken(),
  };
  return axiosforApiServer(options);
};

const API = {
  async sendArticle(url = '', {
    signId = null, author, hash, title, fissionFactor, cover, isOriginal,
  }, {
    idProvider, publicKey, signature, username,
  }, needAccessToken = false) {
    const data = {
      author,
      cover,
      fissionFactor,
      hash,
      platform: idProvider.toLowerCase(),
      publickey: publicKey,
      sign: signature,
      signId,
      title,
      username,
      is_original: isOriginal,
    };
    return !needAccessToken
      ? axiosforApiServer.post(url, data)
      : accessBackend({ method: 'POST', url, data });
  },
  async publishArticle(article, signature) {
    return this.sendArticle('/publish', article, signature);
  },
  async editArticle(article, signature) {
    return this.sendArticle('/edit', article, signature, true);
  },
  async reportShare(share) {
    const data = {
      ...share, platform: share.idProvider.toLowerCase(), referrer: share.sponsor,
    };
    const { idProvider } = data;
    if (idProvider === 'EOS') {
      data.amount *= 10000;
    }
    delete data.idProvider;
    delete data.sponsor;
    return accessBackend({ method: 'POST', url: '/support', data });
  },

  /*
   * 根据用户名，公钥，客户端签名请求access_token
  */
  async auth({
    idProvider, publicKey, signature, username,
  }) {
    return axiosforApiServer.post('/auth', {
      platform: idProvider.toLowerCase(),
      publickey: publicKey,
      sign: signature,
      username,
    },
    {
      headers: { Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==' },
    });
  },
  async getArticleDatafromIPFS(hash) {
    return axios.get(`${apiServer}/ipfs/catJSON/${hash}`);
  },
  // 获取单篇文章的信息 by hash or id  需要 token 否则无法获取赞赏状态
  async getArticleInfo(hashOrId) {
    const reg = /^[0-9]*$/;
    // post hash获取  ， p id 短链接
    const url = reg.test(hashOrId) ? 'p' : 'post';
    return accessBackend({ url: `/${url}/${hashOrId}` });
  },
  // Be used in User page.
  async Follow({ followed }) {
    return accessBackend({
      method: 'POST',
      url: '/follow',
      data: { followed },
    });
  },
  async Unfollow({ followed }) {
    return accessBackend({
      method: 'POST',
      url: '/unfollow',
      data: { followed },
    });
  },
  async getUser({ username }, needAccessToken = false) {
    const url = `/user/${username}`;
    return !needAccessToken ? axiosforApiServer(url) : accessBackend({ url });
  },
  async getMyUserData() {
    const url = '/user/stats';
    return accessBackend({ url });
  },
  async getFansList({ username }) {
    return accessBackend({ url: `/fans?user=${username}` });
  },
  async getFollowList({ username }) {
    return accessBackend({ url: `/follows?user=${username}` });
  },
  async sendComment({ comment, signId }) {
    return accessBackend({
      method: 'POST',
      url: '/post/comment',
      // eslint-disable-next-line camelcase
      data: { comment, sign_id: signId },
    });
  },
  // be Used in Article Page
  async addReadAmount({ articlehash }) {
    return accessBackend({
      method: 'POST',
      url: `/post/show/${articlehash}`,
    });
  },
  // 删除文章
  async delArticle({ id }) {
    return accessBackend({
      method: 'DELETE',
      url: `/post/${id}`,
    });
  },
  // 设置头像
  async uploadAvatar({ avatar }) {
    return accessBackend({
      method: 'POST',
      url: '/user/setAvatar',
      data: { avatar },
    });
  },
  // 获取头像
  getAvatarImage(hash) { return `${apiServer}/image/${hash}`; },
  // BasePull 分页组件
  async getBackendData({ url, params }, needAccessToken = false) {
    // 分页组件接口地址
    const pullApiUrl = {
      // home
      homeTimeRanking: 'posts/timeRanking',
      homeSupportsRanking: 'posts/supportsRanking',
      homeAmountRankingEOS: 'posts/amountRanking',
      homeAmountRankingONT: 'posts/amountRanking',
      // article comments
      commentsList: 'support/comments',
      // followlist
      followsList: 'follows',
      fansList: 'fans',
      // asset
      assetList: 'tokens',
      // user articles
      // 原创文章-使用 homeTimeRanking 接口 地址一样
      userArticlesSupportedList: 'posts/supported',
      // draftbox
      draftboxList: 'drafts',
    };

    return !needAccessToken
      ? axiosforApiServer(pullApiUrl[url], { params })
      : accessBackend({ url: `/${pullApiUrl[url]}`, params });
  },
  async createDraft({
    title, content, cover, fissionFactor, isOriginal,
  }) {
    return accessBackend({
      method: 'POST',
      url: '/draft/save',
      data: {
        title, content, cover, fissionFactor, isOriginal,
      },
    });
  },
  async updateDraft({
    id, title, content, cover, fissionFactor, isOriginal,
  }) {
    return accessBackend({
      method: 'POST',
      url: '/draft/save',
      data: {
        id, title, content, cover, fissionFactor, isOriginal,
      },
    });
  },
  async delDraft({ id }) {
    return accessBackend({ method: 'DELETE', url: `/draft/${id}` });
  },
  async getDraft({ id }) { return accessBackend({ url: `/draft/${id}` }); },
  // Be used in User page.
  async setProfile({ nickname, introduction, email }) {
    return accessBackend({
      method: 'POST',
      url: '/user/setProfile',
      data: { nickname, introduction, email },
    });
  },
  async getMyPost(id) { return accessBackend({ url: `/mypost/${id}` }); },
  // 获取账户资产列表 暂时没有EOS数据
  async getBalance() { return accessBackend({ url: '/balance' }); },
  async withdraw(rawData) {
    const data = {
      ...rawData,
      platform: rawData.idProvider.toLowerCase(),
    };
    if (rawData.signature) {
      data.publickey = rawData.signature.publicKey;
      data.sign = rawData.signature.signature;
    }
    delete data.idProvider;
    delete data.tokenName;
    delete data.signature;
    return accessBackend({ method: 'POST', url: '/user/withdraw', data });
  },
  async loginGitHub(code) {
    return axiosforApiServer.post('/login/github', { code });
  },
  // 获取可用标签列表
  async getTags() {
    return axiosforApiServer.get('/tag/tags')
  }
};

export default API;
