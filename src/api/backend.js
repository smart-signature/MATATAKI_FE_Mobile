import axios from 'axios';
import https from 'https';
import { Base64 } from 'js-base64';

// Doc : https://github.com/axios/axios

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
    blockchain, publicKey, signature, username,
  }, needAccessToken = false) {
    const data = {
      author,
      cover,
      fissionFactor,
      hash,
      platform: blockchain.toLowerCase(),
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
      ...share, platform: share.blockchain.toLowerCase(), referrer: share.sponsor,
    };
    const { blockchain } = data;
    if (blockchain === 'EOS') {
      data.amount *= 10000;
    }
    delete data.blockchain;
    delete data.sponsor;
    return accessBackend({ method: 'POST', url: '/support', data });
  },
  // 获取支持过的文章列表 page user
  async getArticleSupports(params) { return axiosforApiServer('/supports', { params }); },
  /**
    * 获取按照发表时间文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取文章列表
    * @param {number} page： 第 {page} 页
    * @param {string} author 作者
  */
  async getArticlesList(params) { return axiosforApiServer('/posts', { params }); },
  // 获取资产明细
  async getAssets(user, page) { return axiosforApiServer('/assets', { params: { user, page } }); },
  /*
    amount: 2000
    author: "minakokojima"
    comment: ""
    create_time: "2019-03-26T01:04:21.000Z"
    sign_id: 173
  */
  async getSharesbysignid(signid, page) {
    return axiosforApiServer(`/shares?signid=${signid}&page=${page}`);
  },

  /*
   * 根据用户名，公钥，客户端签名请求access_token
  */
  async auth({
    blockchain, publicKey, signature, username,
  }) {
    return axiosforApiServer.post('/auth', {
      platform: blockchain.toLowerCase(),
      publickey: publicKey,
      sign: signature,
      username,
    },
    {
      headers: { Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==' },
    });
  },

  /*
   * 装载access_token
  */

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
  async Follow({ username, followed }) {
    return accessBackend({
      method: 'POST',
      url: '/follow',
      data: { username, followed },
    });
  },
  async Unfollow({ username, followed }) {
    return accessBackend({
      method: 'POST',
      url: '/unfollow',
      data: { username, followed },
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
  // Be used in User page.
  async setUserName({ newname }) {
    return accessBackend({
      method: 'POST',
      url: '/user/setNickname',
      data: { nickname: newname },
    });
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
  // 草稿箱api
  async draftList({ page }) {
    return accessBackend({ url: '/drafts', params: { page } });
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
      platform: rawData.blockchain.toLowerCase(),
      publickey: rawData.signature.publicKey,
      sign: rawData.signature.signature,
    };
    delete data.blockchain;
    delete data.tokenName;
    delete data.signature;
    return accessBackend({ method: 'POST', url: '/user/withdraw', data });
  },
};

export default API;
