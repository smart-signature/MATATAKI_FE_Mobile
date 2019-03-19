import axios from 'axios';

// const _OLD_apiServer = 'https://smartsignature.azurewebsites.net';
const apiServer = 'http://api.smartsignature.io';

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
    publicKey,
    sign: signature,
    title,
    author,
    username,
  }), { headers: { 'Content-Type': 'application/json' } });
}

const getArticlesList = () => axios.get(`${apiServer}/api/article`);

export { publishArticle, getArticlesList };
