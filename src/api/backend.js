import axios from 'axios';
import request from "request";

// const _OLD_apiServer = 'https://smartsignature.azurewebsites.net';
const apiServer = 'https://api.smartsignature.io';

// function __OLD_publishArticle({
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

function publishArticle({
  author, title, hash, publicKey, signature, username,
}) {
  const url = `${apiServer}/publish`;
  // const url = `http://localhost:7001/publish`;
  return axios.post(url, JSON.stringify({
    hash,
    publickey: publicKey,
    sign: signature,
    title,
    author,
    username,
  }), { headers: { 'Content-Type': 'application/json' } });
}

// NOTICE!! _newPublishArticle will be tested and replaced very soon
function _newPublishArticle({
  author, title, hash, publicKey, signature, username,
}) {
  const url = `${apiServer}/publish`;
  // const url = `http://localhost:7001/publish`;
  return request({
    uri: url,
    rejectUnauthorized: false,
    json: true,
    headers: { "Accept": '*/*' },
    dataType: 'json',
    method: "POST",
    form: {
        username,
        author,
        title,
        publickey: publicKey,
        hash,
        sign: signature,
    }
}, function (error, response, body) {
    console.log(body)
});
}

const getArticlesList = () => axios.get(`${apiServer}/api/article`);

export { publishArticle, getArticlesList, _newPublishArticle };
