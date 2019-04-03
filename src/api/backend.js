import axios from 'axios';
import request from 'request';
import API from '@/api/scatter';
import { Base64 } from 'js-base64';

// https://github.com/axios/axios

export const apiServer = process.env.VUE_APP_API;
const AccessMethod = { POST: 0, GET: 1 };

// NOTICE!! publishArticle will be tested and replaced very soon
// ↑ 12 days ago
function publishArticle({
  author, title, hash, publicKey, signature, username, fissionFactor,
}, callback) {
  // const url = `http://localhost:7001/publish`;
  return request.post({
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
}

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
const getArticlesList = ({ page = 1 }) => axios.get(
  `${apiServer}/posts`, { params: { page } },
);
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
function auth({
  username, publicKey, sign,
}, callback) {
  const url = `${apiServer}/auth`;
  // console.log(username + ", " + typeof(username))
  // console.log(publickey + ", " + typeof(publickey))
  // console.log(sign + ", " + typeof(sign))
  // const url = `http://localhost:7001/auth`;
  return request.post({
    uri: url,
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
}
// /<summary>
// /装载access_token
// /</summary>
async function getAuth(options, callback, reqFunc, cb) {
  const currentToken = localStorage.getItem('ACCESS_TOKEN');
  let decodedData = null;
  console.log('aass', API.authSignature);
  if (currentToken != null) {
    console.log('1234');
    let tokenPayload = currentToken.substring(currentToken.indexOf('.') + 1);
    tokenPayload = tokenPayload.substring(0, tokenPayload.indexOf('.'));
    decodedData = JSON.parse(Base64.decode(tokenPayload));
    // 拆包token抓出时间并判断这个时间和系统时间的差异
  }
  if (decodedData === null || (decodedData.exp < new Date().getTime())) {
    API.authSignature(({ username, publicKey, signature }) => {
      console.log('API.authSignature :', username, publicKey, signature);
      // 2. 将取得的签名和用户名和公钥post到服务端 获得accessToken并保存
      auth({ username, publicKey, sign: signature }, (error, response, body) => {
        console.log(body);
        if (!error) {
          // 3. save accessToken
          const accessToken = body;
          localStorage.setItem('ACCESS_TOKEN', accessToken);
          cb(options, callback, reqFunc);
        }
      });
    });
  }
}
// 4. 使用accessToken 示例。 请求修改某些和用户数据相关的api时，需要按照oauth2规范，在header里带上 accessToken， 以表示有权调用
// const accessToken = localStorage.getItem("ACCESS_TOKEN");
// request({
//   uri: "some api url that need auth",
//   rejectUnauthorized: false,
//   json: true,
//   headers: { Accept: '*/*', "x-access-token": accessToken },
//   dataType: 'json',
//   method: 'POST',
//   form: {
//     username:"joetothemoon",
//     followed:"tengavinwood",
//   },
// }, function(err,resp, body){
//    console.log(body);
// });

// /<summary>
// /后端访问入口，当遇到401的时候直接重新拿token
// /</summary>
async function accessBackend(options, callback = () => {}, method = AccessMethod.POST) {
  let reqFunc = null;
  switch (method) {
    case AccessMethod.POST:
      reqFunc = request.post;
      break;
    case AccessMethod.GET:
      reqFunc = request.get;
      break;
    default:
      break;
  }
  console.log('lalala', options);
  getAuth(options, callback, reqFunc, (options, callback, reqFunc) => { // 爱的魔力转圈圈，回调回调到你不分黑夜白天
    // 在这里套了7层callback，callback里面的async语法是无效的，所以一层一层套出来
    options.headers['x-access-token'] = localStorage.getItem('ACCESS_TOKEN');
    console.log('alalal', options);
    reqFunc(options, callback);
  });
}
// Be used in User page.
function Follow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/follow`;
  // const url = `http://localhost:7001/publish`;
  return accessBackend({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username,
      followed,
    },
  }, callback, AccessMethod.POST);
}

// Be used in User page.
function Unfollow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/unfollow`;
  // const url = `http://localhost:7001/publish`;
  return accessBackend({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username,
      followed,
    },
  }, callback, AccessMethod.POST);
}

// Be used in User page.
function getUser({
  username,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const url = `${apiServer}/user/${username}`;
  // const url = `http://localhost:7001/publish`;
  return accessBackend({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback, AccessMethod.GET);
}

// eslint-disable-next-line camelcase
function sendComment({ comment, sign_id }, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return accessBackend({
    uri: `${apiServer}/post/comment`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: { comment, sign_id },
  }, callback, AccessMethod.POST);
}

// be Used in Article Page
function addReadAmount({
  articlehash,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const url = `${apiServer}/post/show/${articlehash}`;
  return accessBackend({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback, AccessMethod.POST);
}

export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getArticleInfo,
  Follow, Unfollow, getUser,
  getSharesbysignid, addReadAmount, sendComment,
};
