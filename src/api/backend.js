import axios from 'axios';
import request from 'request';
import API from '@/api/scatter';
import { Base64 } from 'js-base64';
import { currentEOSAccount as currentAccount } from './scatter';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;

// eslint-disable-next-line no-unused-vars
const oldpublishArticle = ({
  author, title, hash, publicKey, signature, username, fissionFactor,
}, callback) => request.post({
  uri: `${apiServer}/publish`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {
    author,
    fissionFactor,
    hash,
    publickey: publicKey,
    username,
    title,
    sign: signature,
  },
}, callback);

const publishArticle = ({
  author, title, hash, publicKey, signature, username, fissionFactor,
}) => axios.post(
  `${apiServer}/publish`,
  {
    author,
    fissionFactor,
    hash,
    publickey: publicKey,
    username,
    title,
    sign: signature,
  },
);

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
const getAssets = (user, page) => axios.get(`${apiServer}/assets`, { params: { user,page } });

/*
  amount: 2000
  author: "minakokojima"
  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
  sign_id: 173
*/
const getSharesbysignid = (signid, page) => axios.get(`${apiServer}/shares?signid=${signid}&page=${page}`);

const getCurrentAccessToken = () => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return accessToken;
};
const setAccessToken = token => localStorage.setItem('ACCESS_TOKEN', token);
// localStorage.setItem('ACCESS_TOKEN', accessToken);

// /<summary>
// /根据用户名，公钥，客户端签名请求access_token
// /</summary>
const auth = ({ username, publicKey, sign }, callback) => request.post({
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
// /装载access_token
// /</summary>
const getAuth = async (cb) => {
  const currentToken = getCurrentAccessToken();
  let decodedData = null;
  if (currentToken != null) {
    let tokenPayload = currentToken.substring(currentToken.indexOf('.') + 1);
    tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
    decodedData = JSON.parse(Base64.decode(tokenPayload));
  }
  const username = currentToken != null ? decodedData.iss : null;
  // iss:用户名,exp:token过期时间。
  // 1. 拆包token抓出时间,和用户并判断这个时间和系统时间，用户和当前登录用户的差异
  if (username !== currentAccount().name
    || decodedData === null || (decodedData.exp < new Date().getTime())) {
    console.log('Retake authtoken...');
    API.authSignature(({ username, publicKey, signature }) => {
      console.info('API.authSignature :', username, publicKey, signature);
      // 2. 将取得的签名和用户名和公钥post到服务端 获得accessToken并保存
      auth({ username, publicKey, sign: signature }, (error, response, body) => {
        if (!error) {
          // 3. save accessToken
          const accessToken = body;
          console.info('got the access token :', accessToken);
          setAccessToken(accessToken);
          cb();
        }
      });
    });
  } else cb();
};

/*
 * /<summary>
 * /后端访问入口，当遇到401的时候直接重新拿token
 * /</summary>
*/
const accessBackend = async (options, callback = () => {}) => {
  // 更新 Auth
  getAuth(() => { // 爱的魔力转圈圈，回调回调到你不分黑夜白天
    // 在这里套了7层callback，callback里面的async语法是无效的，所以一层一层套出来
    options.headers['x-access-token'] = getCurrentAccessToken();
    console.info('b4 request send, Options :', options);
    console.info('b4 request send, x-access-token :', options.headers['x-access-token']);
    request(options, callback); // 都是 request 害的，改用 axios 沒這些破事
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
// eslint-disable-next-line no-unused-vars
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
  method: 'POST',
  uri: `${apiServer}/follows`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {
    username,
  },
}, callback);

// Be used in User page.
const getFollowList = ({ username }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/fans`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: {
    username,
  },
}, callback);

// eslint-disable-next-line camelcase
const sendComment = ({ comment, sign_id }, callback) => accessBackend({
  method: 'POST',
  uri: `${apiServer}/post/comment`,
  rejectUnauthorized: false,
  json: true,
  headers: { Accept: '*/*' },
  dataType: 'json',
  form: { comment, sign_id },
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

export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getArticleInfo, getArticleInHash,
  Follow, Unfollow, getUser, setUserName, getFansList, getFollowList,
  getSharesbysignid, addReadAmount, sendComment,
  getArticles, getArticlesBySupportAmountRanking, getArticlesBySupportTimesRanking,getAssets
};
