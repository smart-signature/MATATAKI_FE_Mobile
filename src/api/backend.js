import axios from 'axios';
import request from 'request';
import https from 'https';
import API from '@/api/scatter';
import { Base64 } from 'js-base64';
import { currentEOSAccount as currentAccount } from './scatter';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;

const publishArticle = ({
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

const getArticleData = hash => axios.get(`${apiServer}/ipfs/catJSON/${hash}`);
const getArticleInfo = hash => axios.get(`${apiServer}/post/${hash}`);
// 获取单篇文章的信息 （短链接 issues）
const getArticleInHash = id => axios.get(`${apiServer}/p/${id}`);

/**
 * 获取按照发表时间文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取文章列表
 * @param {number} page： 第 {page} 页
 */
const getArticlesList = ({ page = 1 }) => axios.get(
  `${apiServer}/posts`, { params: { page } },
);

/**
 * 获取打赏金额文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取打赏金额排行榜
 * @param {number} page： 第 {page} 页
 */
const getArticlesBySupportAmountRanking = ({ page = 1 }) => axios.get(
  `${apiServer}/getSupportAmountRanking`, { params: { page } },
);


/**
 * 获取打赏次数文章排行榜 https://github.com/smart-signature/smart-signature-backend/blob/master/doc.md#获取打赏次数排行榜
 * @param {number} page： 第 {page} 页
 */
const getArticlesBySupportTimesRanking = ({ page = 1 }) => axios.get(
  `${apiServer}/getSupportTimesRanking`, { params: { page } },
);

export const OrderBy = {
  TimeLine: '最新发布',
  SupportAmount: '最多赞赏金额',
  RecentSupport: '最新赞赏',
  SupportTimes: '最多赞赏次数',
};

const getArticles = ({ page = 1, orderBy = OrderBy.TimeLine }) => {
  switch (orderBy) {
    case OrderBy.SupportAmount:
      return getArticlesBySupportAmountRanking({ page });
    case OrderBy.SupportTimes:
      return getArticlesBySupportTimesRanking({ page });
    default:
      return getArticlesList({ page }); // orderBy 不符合以上 0case 就默认就给你按照时间排序了
  }
};


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
    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  });

// eslint-disable-next-line no-unused-vars
const oldauth = ({ username, publicKey, sign }, callback) => request.post({
  uri: `${apiServer}/auth`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*', Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==' },
  dataType: 'json',
  form: {
    username,
    publickey: publicKey,
    sign,
  },
}, callback);
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
const getAuth = () => new Promise((resolve, reject) => {
  const currentToken = getCurrentAccessToken();
  const decodedData = disassembleToken(currentToken); // 拆包
  const username = currentToken != null ? decodedData.iss : null;
  if (currentAccount() !== null && ( currentToken === null
    || decodedData === null || decodedData.exp < new Date().getTime()
    || username !== currentAccount().name )) {
    console.log('Retake authtoken...');
    API.authSignature().then(({ username, publicKey, signature }) => {
      console.info('API.authSignature :', username, publicKey, signature);
      // 2. 将取得的签名和用户名和公钥post到服务端 获得accessToken
      return auth({ username, publicKey, sign: signature });
    }).then((response) => {
      if (response.status === 200) {
        // 3. save accessToken
        const accessToken = response.data;
        console.info('got the access token :', accessToken);
        setAccessToken(accessToken);
        resolve(accessToken);
      } else {
        throw new Error('auth 出錯');
      }
    }).catch((err) => {
      console.warn('取得用戶新簽名出錯', err);
      reject();
    });
  } else resolve(currentToken);
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
    request(options, callback);
  });
};

// dataType 不知道哪來的參數，只有 jQuery ajax() 才有 datatype lol

// Be used in User page.
const Follow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/follow`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: { username, followed },
}, callback);

// Be used in User page.
const Unfollow = ({ username, followed }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/unfollow`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: { username, followed },
}, callback);

// Be used in User page.
const getUser = ({ username }) => axios.get(`${apiServer}/user/${username}`);
const oldgetUser = ({ username }, callback) => accessBackend({
  method: 'GET',
  uri: `${apiServer}/user/${username}`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {},
}, callback);

// Be used in User page.
const setUserName = ({ newname }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/user/setNickname`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {
    nickname: newname,
  },
}, callback);

// Be used in User page.
const getFansList = ({ username }, callback) => accessBackend({
  method: 'GET',
  uri: `${apiServer}/fans?user=${username}`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
}, callback);

// Be used in User page.
const getFollowList = ({ username }, callback) => accessBackend({
  method: 'GET',
  uri: `${apiServer}/follows?user=${username}`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
}, callback);

const sendComment = ({ comment, signId }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/post/comment`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  // eslint-disable-next-line camelcase
  form: { comment, sign_id: signId },
}, callback);

// be Used in Article Page
const addReadAmount = ({ articlehash }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/post/show/${articlehash}`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {},
}, callback);

// 删除文章
const delArticle = ({ id }, callback) => accessBackend({
  method: 'DELETE',
  uri: `${apiServer}/post/${id}`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {},
}, callback);

// 设置头像
const uploadAvatar = ({ avatar }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/user/setAvatar`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: { avatar },
}, callback);

// 获取头像
const getAvatarImage = hash => axios.get(`${apiServer}/image/${hash}`, {
  responseType: 'arraybuffer',
});

export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getArticleInfo, getArticleInHash,
  Follow, Unfollow, getUser, setUserName, getFansList, getFollowList, oldgetUser,
  getSharesbysignid, addReadAmount, sendComment,
  getArticles, getArticlesBySupportAmountRanking, getArticlesBySupportTimesRanking, getAssets,
  disassembleToken, delArticle, uploadAvatar, getAvatarImage,
};
