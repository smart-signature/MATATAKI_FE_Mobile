import axios from 'axios';

const apiServer = 'https://smartsignature.azurewebsites.net';

function publishArticle({
  hash, title, author, transactionId, accountName,
}) {
  const url = `${apiServer}/api/article`;
  return axios.post(url, JSON.stringify({
    account: accountName,
    articleUrl: `https://smasin-dev.netlify.com/article/${hash}`,
    title,
    author,
    transactionId,
  }), { headers: { 'Content-Type': 'application/json' } });
}

function publishArticle2({
   author, title, hash, publicKey, signature,username
}) {
  const url = `http://api.smartsignature.io/publish`;
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

export { publishArticle, publishArticle2, getArticlesList };
