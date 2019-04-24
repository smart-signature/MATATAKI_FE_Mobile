import axios from 'axios';
import https from 'https';
import store from '@/store';
import { Base64 } from 'js-base64';
import API, { currentEOSAccount as currentAccount } from './scatter';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const publishArticle = async ({
  author, title, hash, fissionFactor,
}) => {
  const signature = await store.dispatch('getSignature', { author, hash });
  console.log('签名成功后调', signature);
  const { publicKey, signature: sign, username } = signature;
  return axios.post(`${apiServer}/publish`,
    {
      author,
      fissionFactor,
      hash,
      publickey: publicKey,
      sign,
      title,
      username,
    });
};

const oldpublishArticle = ({
  author, title, hash, fissionFactor,
}) => API.getSignature(author, hash).then(({ publicKey, signature, username }) => {
  console.log('签名成功后调', publicKey, signature, username);
  // if (err) failed('2nd step failed');
  return axios.post(`${apiServer}/publish`,
    {
      author,
      fissionFactor,
      hash,
      publickey: publicKey,
      sign: signature,
      title,
      username,
    });
});


// 获取支持过的文章列表 page user
const getArticleSupports = params => axios.get(
  `${apiServer}/supports`, { params },
);

/**
 * 获取按照发表时间文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取文章列表
 * @param {number} page： 第 {page} 页
 * @param {string} author 作者
 */
const getArticlesList = params => axios.get(
  `${apiServer}/posts`, { params },
);

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
const getAssets = (user, page) => axios.get(`${apiServer}/assets`, { params: { user, page } });

/*
  amount: 2000
  author: "minakokojima"
  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
  sign_id: 173
*/
const getSharesbysignid = (signid, page) => axios.get(`${apiServer}/shares?signid=${signid}&page=${page}`);

const getCurrentAccessToken = () => localStorage.getItem('ACCESS_TOKEN');
const setAccessToken = token => localStorage.setItem('ACCESS_TOKEN', token);

// /<summary>
// /根据用户名，公钥，客户端签名请求access_token
// /</summary>
const auth = ({ username, publicKey, sign }) => axios.post(`${apiServer}/auth`,
  { username, publickey: publicKey, sign },
  {
    headers: {
      Accept: '*/*',
      Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==',
    },
    // https://github.com/axios/axios/issues/535
    httpsAgent,
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
const accessBackend = (options, callback = () => {}) => {
  // 更新 Auth
  getAuth().then((accessToken) => {
    options.headers['x-access-token'] = accessToken;
  }).catch(() => {
    console.warn('將使用 access token 存檔');
    options.headers['x-access-token'] = getCurrentAccessToken();
  }).then(() => { // Do this whatever happened before
    console.info(
      'b4 request send, options :', options,
      ', x-access-token :', options.headers['x-access-token'],
    );
    axios(options).then(response => callback({ response }))
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


const getArticleData = hash => axios.get(`${apiServer}/ipfs/catJSON/${hash}`);
// 获取单篇文章的信息 hash
// const getArticleInfo = hash => axios.get(`${apiServer}/post/${hash}`);
const getArticleInfo = (hash, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/post/${hash}`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: {},
}, callback);

// 获取单篇文章的信息 （短链接 issues）
// const getArticleInHash = id => axios.get(`${apiServer}/p/${id}`);
const getArticleInHash = (id, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/p/${id}`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: {},
}, callback);


// Be used in User page.
const Follow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/follow`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: { username, followed },
}, callback);

// Be used in User page.
const Unfollow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/unfollow`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: { username, followed },
}, callback);

// Be used in User page.
const getUser = ({ username }) => axios.get(`${apiServer}/user/${username}`);
const oldgetUser = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/user/${username}`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: {},
}, callback);

// Be used in User page.
const setUserName = ({ newname }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/user/setNickname`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: { nickname: newname },
}, callback);

// Be used in User page.
const getFansList = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/fans?user=${username}`,
  headers: { Accept: '*/*' },
  httpsAgent,
}, callback);

// Be used in User page.
const getFollowList = ({ username }, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/follows?user=${username}`,
  headers: { Accept: '*/*' },
  httpsAgent,
}, callback);

const sendComment = ({ comment, signId }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/post/comment`,
  headers: { Accept: '*/*' },
  httpsAgent,
  // eslint-disable-next-line camelcase
  data: { comment, sign_id: signId },
}, callback);

// be Used in Article Page
const addReadAmount = ({ articlehash }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/post/show/${articlehash}`,
  headers: { Accept: '*/*' },
  httpsAgent,
}, callback);

// 删除文章
const delArticle = ({ id }, callback) => accessBackend({
  method: 'DELETE',
  url: `${apiServer}/post/${id}`,
  headers: { Accept: '*/*' },
  httpsAgent,
}, callback);

// 设置头像
const uploadAvatar = ({ avatar }, callback) => accessBackend({
  method: 'POST',
  url: `${apiServer}/user/setAvatar`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: { avatar },
}, callback);

// 获取头像
const getAvatarImage = hash => `${apiServer}/image/${hash}`;

// 编辑
const editArticle = ({
  signId, author, title, hash, fissionFactor,
}, callback) => API.getSignature(author, hash).then(({ publicKey, signature, username }) => accessBackend({
  method: 'POST',
  url: `${apiServer}/edit`,
  headers: { Accept: '*/*' },
  httpsAgent,
  data: {
    signId,
    author,
    fissionFactor,
    hash,
    publickey: publicKey,
    sign: signature,
    title,
    username,
  },
}, callback));

/* const editArticle = ({
  signId, author, title, hash, publicKey, signature, username, fissionFactor,
}, callback) => {
  // const url = `http://localhost:7001/publish`;
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  request.post({
    uri: `${apiServer}/edit`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*!/!*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      signId,
      author,
      fissionFactor,
      hash,
      publickey: publicKey,
      username,
      title,
      sign: signature,
    },
  }, callback);
}; */


// 基础组件 BasePull 使用的方法
// 因为目前只需要GET查询 所以不把 GET POST 等调用封装到一起，
// 区别 GET 用 params， POST 等用 data
// 所有用 BasePull 调用的接口 都带了 token 修改了 header，所以会请求两次 后续可以升级此方法来根据传进来的参数判断是否需要token
const getBackendData = ({ url, params }, callback) => accessBackend({
  method: 'GET',
  url: `${apiServer}/${url}`,
  params,
  headers: { Accept: '*/*' },
  httpsAgent,
}, callback);


export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getArticleInfo, getArticleInHash,
  Follow, Unfollow, getUser, setUserName, getFansList, getFollowList, oldgetUser,
  getSharesbysignid, addReadAmount, sendComment, getAssets, getAvatarImage,
  disassembleToken, delArticle, uploadAvatar, getArticleSupports, editArticle,
  getBackendData,
  oldpublishArticle,
};
