import axios from 'axios';
import request from 'request';
import API from '@/api/scatter';

// https://github.com/axios/axios

export const apiServer = 'https://apitest.smartsignature.io'; // 以后都在这里改

const AccessMethod = { POST: 0, GET: 1 };

// NOTICE!! publishArticle will be tested and replaced very soon
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
  /* old version
    return axios.post(url, JSON.stringify({
    hash,
    publicKey,
    sign: signature,
    title,
    author,
    username,
  }), { headers: { 'Content-Type': 'application/json' } });
  */
}

const getArticleData = hash => axios.get(`${apiServer}/ipfs/catJSON/${hash}`);
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
const getSharesbysignid = ({ signid }) => axios.get(`${apiServer}/shares?signid=${signid}`);
const getArticleInfo = hash => axios.get(`${apiServer}/post/${hash}`);


// /<summary>
// /根据用户名，公钥，客户端签名请求access_token
// /</summary>
function auth({
  username, publickey, sign,
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
      publickey,
      sign,
    },
  }, callback);
}
// /<summary>
// /装载access_token
// /</summary>
async function getAuth() {
  // 1.取得签名
  await API.authSignature((username, publickey, sign) => {
    console.log('API.authSignature :', username, publickey, sign);
    // 2. 将取得的签名和用户名和公钥post到服务端 获得accessToken并保存
    auth({ username, publickey, sign }, (error, response, body) => {
      console.log(body);
      if (!error) {
        // 3. save accessToken
        const accessToken = body;
        localStorage.setItem('ACCESS_TOKEN', accessToken);
      }
    });
  });
}
// /<summary>
// /后端访问入口，当遇到401的时候直接重新拿token
// /</summary>
async function accessBackend(data, callback = () => {}, method = AccessMethod.POST) {
  let reqFunc = null;
  switch (method) {
    case AccessMethod.POST:
      reqFunc = request.post;
      break;
    case AccessMethod.GET:
      reqFunc = request.get;
      break;
  }
  reqFunc(data, async (err, response, body) => {
    if (response.statusCode == 401) {
      localStorage.removeItem('ACCESS_TOKEN');
      await getAuth();
      return reqFunc(data, callback);
    }
    return callback(err, response, body);
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
