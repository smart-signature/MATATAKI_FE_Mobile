import axios from 'axios';
import https from 'https';
import store from '@/store';
import { Base64 } from 'js-base64';
import API, { currentEOSAccount as currentAccount } from './scatter';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;
// https://github.com/axios/axios/issues/535
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axiosforApiServer = axios.create({
  baseURL: apiServer,
  headers: { Accept: '*/*' },
  httpsAgent,
});

const getSignature = ({ author, hash }) => store.dispatch('getSignature', { author, hash });
const publishArticle = async ({
  author, title, hash, fissionFactor, cover,
}) => {
  const signature = await getSignature({ author, hash });
  console.log('签名成功后调', signature);
  // 若 getSignature reject(或內部 throw 被轉為reject)
  // 則 publishArticle 會成為 Promise.reject()
  const { publicKey: publickey, signature: sign, username } = signature;
  return axiosforApiServer.post('/publish',
    {
      author,
      fissionFactor,
      hash,
      publickey,
      sign,
      title,
      username,
      cover,
    });
};

const oldpublishArticle = ({
  author, title, hash, fissionFactor, cover,
}) => API.getSignature(author, hash).then(({ publicKey, signature, username }) => {
  console.log('签名成功后调', publicKey, signature, username);
  // if (err) failed('2nd step failed');
  return axiosforApiServer.post('/publish',
    {
      author,
      fissionFactor,
      hash,
      publickey: publicKey,
      sign: signature,
      title,
      username,
      cover,
    });
});


// 获取支持过的文章列表 page user
const getArticleSupports = params => axiosforApiServer.get('/supports', { params });

/**
 * 获取按照发表时间文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取文章列表
 * @param {number} page： 第 {page} 页
 * @param {string} author 作者
 */
const getArticlesList = params => axiosforApiServer.get('/posts', { params });

/**
 * 转移到了组件内
 * 获取打赏金额文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取打赏金额排行榜
 * @param {number} page： 第 {page} 页
 */

/**
 * 转移到了组件内
 * 获取打赏次数文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取打赏次数排行榜
 * @param {number} page： 第 {page} 页
 */


// 获取资产明细
const getAssets = (user, page) => axiosforApiServer.get('/assets', { params: { user, page } });

/*
  amount: 2000
  author: "minakokojima"
  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
  sign_id: 173
*/
const getSharesbysignid = (signid, page) => axiosforApiServer.get(`/shares?signid=${signid}&page=${page}`);

const getCurrentAccessToken = () => localStorage.getItem('ACCESS_TOKEN');
const setAccessToken = token => localStorage.setItem('ACCESS_TOKEN', token);

// /<summary>
// /根据用户名，公钥，客户端签名请求access_token
// /</summary>
const auth = ({ username, publicKey, sign }) => axiosforApiServer.post('/auth',
  { username, publickey: publicKey, sign },
  {
    headers: { Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==' },
  });

// /<summary>
// /拆token，返回json对象
// /</summary>
const disassembleToken = (token) => {
  if (token === undefined || token === null) { return { iss: null, exp: 0 }; }
  let tokenPayload = token.substring(token.indexOf('.') + 1);
  tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
  return JSON.parse(Base64.decode(tokenPayload));
  // {iss:用户名，exp：token的过期时间，用ticks的形式表示}
};
// /<summary>
// /装载access_token
// /</summary>
const getAuth = () => new Promise(async (resolve, reject) => {
  const currentToken = getCurrentAccessToken();
  const decodedData = disassembleToken(currentToken); // 拆包
  const username = currentToken != null ? decodedData.iss : null;
  if (currentAccount() !== null && (currentToken === null
    || decodedData === null || decodedData.exp < new Date().getTime()
    || username !== currentAccount().name)) {
    try {
      console.log('Retake authtoken...');
      const signature = await API.authSignature();
      console.info('API.authSignature :', signature);
      // 将取得的签名和用户名和公钥post到服务端 获得accessToken
      const { username: _username, publicKey, signature: sign } = signature;
      const response = await auth({ username: _username, publicKey, sign });
      if (response.status === 200) {
        // 3. save accessToken
        const accessToken = response.data;
        console.info('got the access token :', accessToken);
        setAccessToken(accessToken);
        return resolve(accessToken);
      }

      throw new Error('auth 出錯');
    } catch (error) {
      console.warn('取得用戶新簽名出錯', error);
      return reject(error);
    }
  } else return resolve(currentToken);
});

/*
 * /<summary>
 * /后端访问入口，当遇到401的时候直接重新拿token
 * /</summary>
*/
/* eslint no-param-reassign: ["error", { "props": false }] */
const accessBackend = (options, callback = () => {}) => {
  // https://blog.fundebug.com/2018/07/25/es6-const/
  options.headers = {};
  // 更新 Auth
  getAuth().then((accessToken) => {
    options.headers['x-access-token'] = accessToken;
  }).catch(() => {
    console.warn('將使用 access token 存檔');
    options.headers['x-access-token'] = getCurrentAccessToken();
  }).then(() => { // Do this whatever happened before
    // console.info(
    //   'b4 request send, options :', options,
    //   ', x-access-token :', options.headers['x-access-token'],
    // );
    axiosforApiServer(options).then(response => callback({ response }))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          callback({ error, response: error.response });
          return;
        } if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
        callback({ error });
      });
  });
};


const getArticleDatafromIPFS = hash => axiosforApiServer.get(`/ipfs/catJSON/${hash}`);

// 获取单篇文章的信息 by hash or id  需要 token 否则无法获取赞赏状态
const getArticleInfo = (hashOrId, callback) => {
  const reg = /^[0-9]*$/;
  // post hash获取  ， p id 短链接
  const url = reg.test(hashOrId) ? 'p' : 'post';
  const getArticleInfoAPI = (hashOrId, callback) => accessBackend({
    method: 'GET',
    url: `/${url}/${hashOrId}`,
  }, callback);
  getArticleInfoAPI(hashOrId, callback);
};


// 該被廢棄
const getArticleInfoCB = (hash, callback) => accessBackend({
  method: 'GET',
  url: `/post/${hash}`,
}, callback);


// Be used in User page.
const Follow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  url: '/follow',
  data: { username, followed },
}, callback);

// Be used in User page.
const Unfollow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  url: '/unfollow',
  data: { username, followed },
}, callback);

// Be used in User page.
const getUser = ({ username }) => axiosforApiServer.get(`/user/${username}`);
const oldgetUser = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `/user/${username}`,
  data: {},
}, callback);

// Be used in User page.
const setUserName = ({ newname }, callback) => accessBackend({
  method: 'POST',
  url: '/user/setNickname',
  data: { nickname: newname },
}, callback);

// Be used in User page.
const getFansList = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `/fans?user=${username}`,
}, callback);

// Be used in User page.
const getFollowList = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `/follows?user=${username}`,
}, callback);

const sendComment = ({ comment, signId }, callback) => accessBackend({
  method: 'POST',
  url: '/post/comment',
  // eslint-disable-next-line camelcase
  data: { comment, sign_id: signId },
}, callback);

// be Used in Article Page
const addReadAmount = ({ articlehash }, callback) => accessBackend({
  method: 'POST',
  url: `/post/show/${articlehash}`,
}, callback);

// 删除文章
const delArticle = ({ id }, callback) => accessBackend({
  method: 'DELETE',
  url: `/post/${id}`,
}, callback);

// 设置头像
const uploadAvatar = ({ avatar }, callback) => accessBackend({
  method: 'POST',
  url: '/user/setAvatar',
  data: { avatar },
}, callback);

// 获取头像
const getAvatarImage = hash => `/image/${hash}`;

// 编辑
const editArticle = ({
  signId, author, title, hash, fissionFactor, cover,
}, callback) => API.getSignature(author, hash).then(({ publicKey, signature, username }) => accessBackend({
  method: 'POST',
  url: '/edit',
  data: {
    signId,
    author,
    fissionFactor,
    hash,
    publickey: publicKey,
    sign: signature,
    title,
    username,
    cover,
  },
}, callback));

// 基础组件 BasePull 使用的方法
// 因为目前只需要GET查询 所以不把 GET POST 等调用封装到一起，
// 区别 GET 用 params， POST 等用 data
// 所有用 BasePull 调用的接口 都带了 token 修改了 header，所以会请求两次 后续可以升级此方法来根据传进来的参数判断是否需要token
const getBackendData = ({ url, params }, callback) => accessBackend({
  method: 'GET',
  url: `/${url}`,
  params,
}, callback);

// 草稿箱api
const draftList = ({ page }, callback) => accessBackend({
  method: 'GET',
  url: '/drafts',
  params: { page },
}, callback);

const createDraft = ({
  title, content, cover, fissionFactor,
}, callback) => accessBackend({
  method: 'POST',
  url: '/draft/save',
  data: {
    title, content, cover, fissionFactor,
  },
}, callback);

const updateDraft = ({
  id, title, content, cover, fissionFactor,
}, callback) => accessBackend({
  method: 'POST',
  url: '/draft/save',
  data: {
    id, title, content, cover, fissionFactor,
  },
}, callback);

const delDraft = ({ id }, callback) => accessBackend({
  method: 'DELETE',
  url: `/draft/${id}`,
}, callback);

const getDraft = ({ id }, callback) => accessBackend({
  method: 'GET',
  url: `/draft/${id}`,
}, callback);


// 每天浪費時間寫這個，不對吧，像隔壁用 API 一起輸出呀
export {
  publishArticle, auth, getAuth,
  getArticleDatafromIPFS, getArticlesList,
  getArticleInfo, getArticleInfoCB,
  Follow, Unfollow, getUser, setUserName, getFansList, getFollowList, oldgetUser,
  getSharesbysignid, addReadAmount, sendComment, getAssets, getAvatarImage,
  disassembleToken, delArticle, uploadAvatar, getArticleSupports, editArticle,
  getBackendData,
  oldpublishArticle,
  draftList, createDraft, updateDraft, delDraft, getDraft,
};
