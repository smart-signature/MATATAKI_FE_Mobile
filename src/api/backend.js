import axios from 'axios';
import request from 'request';
import API from '@/api/scatter';
import { Base64 } from 'js-base64';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;

// NOTICE!! publishArticle will be tested and replaced very soon
// ↑ 12 days ago
const publishArticle = ({
  author, title, hash, publicKey, signature, username, fissionFactor,
}, callback) => 
  // const url = `http://localhost:7001/publish`;
   request.post({
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
  }, callback)
;

// 開發測試中
// eslint-disable-next-line no-unused-vars
const newPublishArticle = ({
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
  { // 還是 request 的參數
    // 傳多餘或是名字錯誤的項進去不會發生任何事(除非是少項有檢查)，js神奇的地方
    // dataType 不知道哪來的參數，只有 jQuery ajax() 才有 datatype lol
    strictSSL: false, // request 內部會翻成 rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*' },
  },
);

const getArticleData = hash => axios.get(`${apiServer}/ipfs/catJSON/${hash}`);
const getArticleInfo = hash => axios.get(`${apiServer}/post/${hash}`);

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


/*
  amount: 2000
  author: "minakokojima"
  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
  sign_id: 173
*/
const getSharesbysignid = (signid, page) => axios.get(`${apiServer}/shares?signid=${signid}&page=${page}`);

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
  const currentToken = localStorage.getItem('ACCESS_TOKEN');
  let decodedData = null;
  if (currentToken != null) {
    let tokenPayload = currentToken.substring(currentToken.indexOf('.') + 1);
    tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
    decodedData = JSON.parse(Base64.decode(tokenPayload));
  }
  // 1. 拆包token抓出时间并判断这个时间和系统时间的差异
  if (decodedData === null || (decodedData.exp < new Date().getTime())) {
    API.authSignature(({ username, publicKey, signature }) => {
      console.log('API.authSignature :', username, publicKey, signature);
      // 2. 将取得的签名和用户名和公钥post到服务端 获得accessToken并保存
      auth({ username, publicKey, sign: signature }, (error, response, body) => {
        if (!error) {
          // 3. save accessToken
          const accessToken = body;
          console.info('got the access token :', accessToken);
          localStorage.setItem('ACCESS_TOKEN', accessToken);
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
    options.headers['x-access-token'] = localStorage.getItem('ACCESS_TOKEN');
    console.info('b4 request send, Options :', options);
    request(options, callback); // 都是 request 害的，改用 axios 沒這些破事
  });
};

// Be used in User page.
const Follow = ({ following, followed }, callback) => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  // console.log('accessToken: ', accessToken);
  return accessBackend({
    method: 'POST',
    uri: `${apiServer}/follow`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username: following,
      followed,
    },
  }, callback);
};

// Be used in User page.
const Unfollow = ({ following, followed }, callback) => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  // console.log('accessToken: ', accessToken);
  return accessBackend({
    method: 'POST',
    uri: `${apiServer}/unfollow`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username: following,
      followed,
    },
  }, callback);
};

// Be used in User page.
const getUser = ({ username }, callback) => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return accessBackend({
    method: 'GET',
    uri: `${apiServer}/user/${username}`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback);
};

// eslint-disable-next-line camelcase
const sendComment = ({ comment, sign_id }, callback) => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return accessBackend({
    method: 'POST',
    uri: `${apiServer}/post/comment`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: { comment, sign_id },
  }, callback);
};

// be Used in Article Page
const addReadAmount = ({ articlehash }, callback) => {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return accessBackend({
    method: 'POST',
    uri: `${apiServer}/post/show/${articlehash}`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback);
};

export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getArticleInfo,
  Follow, Unfollow, getUser,
  getSharesbysignid, addReadAmount, sendComment,
  getArticles, getArticlesBySupportAmountRanking, getArticlesBySupportTimesRanking,
};
