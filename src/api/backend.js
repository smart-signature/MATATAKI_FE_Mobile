import axios from "axios";

const apiServer = 'https://smartsignature.azurewebsites.net'

function publishArticle({ hash, title, author, transactionId, accountName }) {
    const url = `${apiServer}/api/article`
    return axios.post(url, JSON.stringify({
        "account": accountName,
        "articleUrl": `https://smasin-dev.netlify.com/article/${hash}`,
        title,
        author,
        transactionId
    }), { headers: { "Content-Type": 'application/json',} })
}

const getArticlesList = () => axios.get(`${apiServer}/api/article`)

export { publishArticle, getArticlesList }