import axios from 'axios';
import https from 'https';
import store from '@/store';
import { Base64 } from 'js-base64';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;
// https://github.com/axios/axios/issues/535
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axiosforApiServer = axios.create({
  baseURL: apiServer,
  headers: { Accept: '*/*' },
  httpsAgent,
});

// store
const { name: currentUsername, blockchain } = store.getters.currentUserInfo;
const getSignatureOfArticle = ({ author, hash }) => store.dispatch('getSignatureOfArticle', { author, hash });
const getSignatureOfAuth = () => store.dispatch('getSignatureOfAuth');

const publishArticle = async ({
  author, title, hash, fissionFactor, cover,
}) => {
  const signature = await getSignatureOfArticle({ author, hash });
  console.log('getSignatureOfArticle :', signature);
  // 若 getSignatureOfArticle reject(或內部 throw 被轉為reject)
  // 則 publishArticle 會成為 Promise.reject()
  const { publicKey: publickey, signature: sign, username } = signature;
  return axiosforApiServer.post('/publish',
    {
      author,
      fissionFactor,
      hash,
      // platform: blockchain,
      publickey,
      sign,
      title,
      username,
      cover,
    });
};

// 编辑
const editArticle = async ({
  signId, author, title, hash, fissionFactor, cover,
}) => {
  const signature = await getSignatureOfArticle({ author, hash });
  console.log('签名成功后调', signature);
  const { publicKey: publickey, signature: sign, username } = signature;
  return accessBackend({
    method: 'POST',
    url: '/edit',
    data: {
      signId,
      author,
      fissionFactor,
      hash,
      // platform: blockchain,
      publickey,
      sign,
      title,
      username,
      cover,
    },
  });
};

// todo: 等後端給參數
/*
const getShareKey = ({
  signId, username, amount, referral
}) => axiosforApiServer.post('', { signId, username, amount, referral });
*/

// todo: 等後端給參數
/*
const reportShareRecord = ({ share }) => axiosforApiServer.post('', { share });
*/

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
  if (!token) { return { iss: null, exp: 0 }; }
  let tokenPayload = token.substring(token.indexOf('.') + 1);
  tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
  return JSON.parse(Base64.decode(tokenPayload));
  // {iss:用户名，exp：token的过期时间，用ticks的形式表示}
};
// /<summary>
// /装载access_token
// /</summary>
const getAuth = async () => {
  const currentToken = getCurrentAccessToken();
  const decodedData = disassembleToken(currentToken); // 拆包
  const username = currentToken != null ? decodedData.iss : null;
  if (currentUsername !== null && (currentToken === null
    || decodedData === null || decodedData.exp < new Date().getTime()
    || username !== currentUsername)) {
    try {
      console.log('Retake authtoken...');
      const signature = await getSignatureOfAuth();
      console.info('API.authSignature :', signature);
      // 将取得的签名和用户名和公钥post到服务端 获得accessToken
      const { username: _username, publicKey, signature: sign } = signature;
      const response = await auth({ username: _username, publicKey, sign });
      if (response.status === 200) {
        // 3. save accessToken
        const accessToken = response.data;
        console.info('got the access token :', accessToken);
        setAccessToken(accessToken);
        return accessToken;
      }

      throw new Error('auth 出錯');
    } catch (error) {
      console.warn('取得用戶新簽名出錯', error);
      throw error;
    }
  } else return currentToken;
};

/*
 * /<summary>
 * /后端访问入口，当遇到401的时候直接重新拿token
 * /</summary>
*/
/* eslint no-param-reassign: ["error", { "props": false }] */
const accessBackend = async (options) => {
  // https://blog.fundebug.com/2018/07/25/es6-const/
  options.headers = {};
  let accessToken = getCurrentAccessToken();
  try { // 更新 Auth
    accessToken = await getAuth();
  } catch (error) {
    console.warn('將使用 access token 存檔');
  }
  options.headers['x-access-token'] = accessToken;

  return axiosforApiServer(options);
};

const getArticleDatafromIPFS = hash => axiosforApiServer.get(`/ipfs/catJSON/${hash}`);

// 获取单篇文章的信息 by hash or id  需要 token 否则无法获取赞赏状态
const getArticleInfo = (hashOrId) => {
  const reg = /^[0-9]*$/;
  // post hash获取  ， p id 短链接
  const url = reg.test(hashOrId) ? 'p' : 'post';
  return accessBackend({
    method: 'GET',
    url: `/${url}/${hashOrId}`,
  });
};

// Be used in User page.
const Follow = ({ username, followed }) => accessBackend({
  method: 'POST',
  url: '/follow',
  data: { username, followed },
});
const Unfollow = ({ username, followed }) => accessBackend({
  method: 'POST',
  url: '/unfollow',
  data: { username, followed },
});

// Be used in User page.
const getUser = ({ username }) => axiosforApiServer.get(`/user/${username}`);
// todo: rename
const oldgetUser = ({ username }) => accessBackend({
  method: 'GET',
  url: `/user/${username}`,
});

// Be used in User page.
const setUserName = ({ newname }) => accessBackend({
  method: 'POST',
  url: '/user/setNickname',
  data: { nickname: newname },
});

// Be used in User page.
const getFansList = ({ username }) => accessBackend({
  method: 'GET',
  url: `/fans?user=${username}`,
});
const getFollowList = ({ username }) => accessBackend({
  method: 'GET',
  url: `/follows?user=${username}`,
});

const sendComment = ({ comment, signId }) => accessBackend({
  method: 'POST',
  url: '/post/comment',
  // eslint-disable-next-line camelcase
  data: { comment, sign_id: signId },
});

// be Used in Article Page
const addReadAmount = ({ articlehash }) => accessBackend({
  method: 'POST',
  url: `/post/show/${articlehash}`,
});

// 删除文章
const delArticle = ({ id }) => accessBackend({
  method: 'DELETE',
  url: `/post/${id}`,
});

// 设置头像
const uploadAvatar = ({ avatar }) => accessBackend({
  method: 'POST',
  url: '/user/setAvatar',
  data: { avatar },
});

// 获取头像
const getAvatarImage = hash => `${apiServer}/image/${hash}`;

// 基础组件 BasePull 使用的方法
// 因为目前只需要GET查询 所以不把 GET POST 等调用封装到一起，
// 区别 GET 用 params， POST 等用 data
// 所有用 BasePull 调用的接口 都带了 token 修改了 header，所以会请求两次 后续可以升级此方法来根据传进来的参数判断是否需要token
const getBackendData = ({ url, params }) => accessBackend({
  method: 'GET',
  url: `/${url}`,
  params,
});

// 草稿箱api
const draftList = ({ page }) => accessBackend({
  method: 'GET',
  url: '/drafts',
  params: { page },
});

const createDraft = ({
  title, content, cover, fissionFactor,
}) => accessBackend({
  method: 'POST',
  url: '/draft/save',
  data: {
    title, content, cover, fissionFactor,
  },
});

const updateDraft = ({
  id, title, content, cover, fissionFactor,
}) => accessBackend({
  method: 'POST',
  url: '/draft/save',
  data: {
    id, title, content, cover, fissionFactor,
  },
});

const delDraft = ({ id }) => accessBackend({
  method: 'DELETE',
  url: `/draft/${id}`,
});

const getDraft = ({ id }) => accessBackend({
  method: 'GET',
  url: `/draft/${id}`,
});

// 每天浪費時間寫這個，不對吧，像隔壁用 API 一起輸出呀
export {
  auth, getAuth,
  publishArticle,
  getArticleDatafromIPFS, getArticleInfo, getArticlesList,
  Follow, Unfollow, getUser, setUserName, getFansList, getFollowList, oldgetUser,
  getSharesbysignid, addReadAmount, sendComment, getAssets, getAvatarImage,
  disassembleToken, delArticle, uploadAvatar, getArticleSupports, editArticle,
  getBackendData,
  draftList, createDraft, updateDraft, delDraft, getDraft,
};
