import axios from 'axios';
import request from 'request';

const apiServer = 'https://api.smartsignature.io';

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

// fetch sign_id
const getSignId = hash => axios.get(`${apiServer}/post/${hash}`);

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
  // console.log(username + ", " + typeof(username))
  // console.log(publickey + ", " + typeof(publickey))
  // console.log(sign + ", " + typeof(sign))
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
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/follow`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
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
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  console.log(accessToken);
  const url = `${apiServer}/unfollow`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
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
  const accessToken = localStorage.getItem('ACCESS_TOKEN');
  const url = `${apiServer}/user/${username}`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*', 'x-access-token': accessToken },
    dataType: 'json',
    method: 'GET',
    form: {},
  }, callback);
}

/*
  amount: 2000
  author: "minakokojima"
​​  comment: ""
  create_time: "2019-03-26T01:04:21.000Z"
​​   sign_id: 173
*/
async function getSharesbysignid({
  signid,
}, callback) {
  return await request.get({
    uri: `${apiServer}/shares?signid=${signid}`,
    rejectUnauthorized: false,
    json: true,
    headers: { Accept: '*/*' },
    dataType: 'json',
  }, callback);
}

export {
  publishArticle, auth,
  getArticleData, getArticlesList, getSignId,
  follow, unfollow, getuser,
  getSharesbysignid,
};
