import axios from 'axios';
import request from 'request';
import API from '@/api/scatter.js';

const apiServer = 'https://api.smartsignature.io';

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
  `${apiServer}/posts`, { params: { page, }, });
/*
  amount: 2000
  author: "minakokojima"
​​  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
  sign_id: 173
*/
const getSharesbysignid = ({signid}) => axios.get(`${apiServer}/shares?signid=${signid}`);
const getSignId = hash => axios.get(`${apiServer}/post/${hash}`);


// 示例代码。。请随便改。。。
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

async function getAuth() { // 示例代码。。请随便改。。。
  // 1. 取得签名
  let accessvalid = false;
  const nowtime = new Date().getTime();
  if (localStorage.getItem('ACCESS_TOKEN') != null) {
    const accesstime = localStorage.getItem('ACCESS_TIME');
    if (accesstime != null) {
      if (nowtime - accesstime < 604800000) {
        accessvalid = true;
      }
    }
  }
  if (!accessvalid) {
    await API.authSignature((username, publickey, sign) => {
      console.log('API.authSignature :', username, publickey, sign);
      // 2. post到服务端 获得accessToken并保存
      auth({ username, publickey, sign }, (error, response, body) => {
        console.log(body);
        if (!error) {
          // 3. save accessToken
          const accessToken = body;
          localStorage.setItem('ACCESS_TOKEN', accessToken);
          localStorage.setItem('ACCESS_TIME', nowtime);
        }
      });
    });
  }
}

// Be used in User page.
function Follow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/follow`;
  // const url = `http://localhost:7001/publish`;
  return request.post({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username,
      followed,
    },
  }, callback);
}

// Be used in User page.
function Unfollow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/unfollow`;
  // const url = `http://localhost:7001/publish`;
  return request.post({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {
      username,
      followed,
    },
  }, callback);
}

// Be used in User page.
function getUser({
  username,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const url = `${apiServer}/user/${username}`;
  // const url = `http://localhost:7001/publish`;
  return request.get({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback);
}

async function sendComment({ comment, sign_id }, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  return await request.post({
    uri: `${apiServer}/post/comment`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: { comment, sign_id },
  }, callback);
}

// be Used in Article Page
function addReadAmount({
  articlehash,
}, callback) {
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const url = `${apiServer}/post/show/${articlehash}`;
  return request.post({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    form: {},
  }, callback);
}

export {
  publishArticle, auth, getAuth,
  getArticleData, getArticlesList, getSignId,
  Follow, Unfollow, getUser,
  getSharesbysignid, addReadAmount, sendComment,
};
