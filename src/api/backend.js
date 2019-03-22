import axios from 'axios';
import request from 'request';

// const _OLD_apiServer = 'https://smartsignature.azurewebsites.net';
const apiServer = 'https://api.smartsignature.io';

// function __OLD__oldPublishArticle({
//   hash, title, author, transactionId, accountName,
// }) {
//   const url = `${apiServer}/api/article`;
//   return axios.post(url, JSON.stringify({
//     account: accountName,
//     articleUrl: `https://sign-dev.dravatar.xyz/article/${hash}`,
//     title,
//     author,
//     transactionId,
//   }), { headers: { 'Content-Type': 'application/json' } });
// }

function _oldPublishArticle({
  author, title, hash, publicKey, signature, username,
}) {
  const url = `${apiServer}/publish`;
  // const url = `http://localhost:7001/publish`;
  return axios.post(url, JSON.stringify({
    hash,
    publicKey,
    sign: signature,
    title,
    author,
    username,
  }), { headers: { 'Content-Type': 'application/json' } });
}

// NOTICE!! publishArticle will be tested and replaced very soon
function publishArticle({
  author, title, hash, publicKey, signature, username, fissionFactor,
}, callback) {
  const url = `${apiServer}/publish`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*' },
    dataType: 'json',
    method: 'POST',
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

const getArticleData = (hash) => axios.get(`${apiServer}/ipfs/catJSON/${hash}`);

// fetch sign_id
const getSignId = (hash) => axios.get(`${apiServer}/post/${hash}`);
     
const getArticlesList = ({ page = 1 }) => axios.get(
  `${apiServer}/posts`, {
    params: {
      page,
    },
  },
);

// 示例代码。。请随便改。。。
function auth({
  username, publickey, sign,
}, callback) {
  const url = `${apiServer}/auth`;
  // const url = `http://localhost:7001/auth`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', Authorization: 'Basic bXlfYXBwOm15X3NlY3JldA==' },
    dataType: 'json',
    method: 'POST',
    form: {
      username,
      publickey,
      sign,
    },
  }, callback);
}

// Be used in User page.
function follow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  const url = `${apiServer}/follow`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', "x-access-token": accessToken},
    dataType: 'json',
    method: 'POST',
    form: {
      username,
      followed,
    },
  }, callback);
}

// Be used in User page.
function unfollow({
  username, followed,
}, callback) {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  console.log(accessToken);
  const url = `${apiServer}/unfollow`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', "x-access-token": accessToken },
    dataType: 'json',
    method: 'POST',
    form: {
      username,
      followed,
    },
  }, callback);
}

// Be used in User page.
function getuser({
  username,
}, callback) {
  const accessToken = localStorage.getItem("ACCESS_TOKEN");
  const url = `${apiServer}/user/` + username;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', "x-access-token": accessToken},
    dataType: 'json',
    method: 'GET',
    form: {},
  }, callback);
}

export {
  _oldPublishArticle, getArticlesList, publishArticle, auth,
  getArticleData, getSignId,
  follow, unfollow, getuser,
};
