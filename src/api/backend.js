import axios from 'axios';

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
   author, title, hash, publicKey, signature,username
}) {
  const url = `https://${apiServer}/publish`;
  // const url = `http://localhost:7001/publish`;
  return axios.post(url, JSON.stringify({
    hash: hash,
    publickey: publicKey,
    sign: signature,
    title,title,
    author:author,
    username:username
  }), { headers: { 'Content-Type': 'application/json' } });
}

const getArticlesList = () => axios.get(`${apiServer}/api/article`);

export { publishArticle, getArticlesList };
