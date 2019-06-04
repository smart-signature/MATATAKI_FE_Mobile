window.onload = () => addWidget()


// http://localhost:8080/src/?
// title=%E6%88%91%E6%98%AF%E6%A0%87%E9%A2%98&
// content=%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B%E6%88%91%E6%98%AF%E7%AE%80%E4%BB%8B&
// id=100019&
// img=https://apitest.smartsignature.io/image/QmdvhrqQZHcuFfk119y55jjWCuw9vvohjxq2VbWHrL3zw6


const addWidget = async () => {
  const urlSearch = window.location.search.substr(1).split('&')
  const appDom = document.querySelector('#app')
  let baseUrl = `https://apitest.smartsignature.io`
  let defaultCoverImg = `https://api.smartsignature.io/image/QmbRLLuKxA8xMgVq23mX8dTkykmxSjirJCXUrLMH2xNt7R`
  let urlSearchData = {}

  const urlSearchDecodeURIComponent = arr => {
    let data = {}
    arr.forEach(i => {
      let arrData = i.split('=')
      data[arrData[0]] = decodeURIComponent(arrData[1])
    });
    return data
  }

  urlSearchData = urlSearchDecodeURIComponent(urlSearch)

  const setAppDom = ({title, content, img, ups, read, value, ontvalue}) => {
    let appDomStr = `<h1>${title}</h1>
    <div><img src="${img}" alt="cover" /><div>
        <p>${content}</p>
        <p>
          <span>点赞👍${ups}</span>
          <span>阅读👀${read}</span>
          <span>金额💰${value}</span>
          <span>金额💰${ontvalue}</span>
        </p>
      </div>
    </div>`
    appDom.innerHTML = appDomStr
  }

  const getInfobyId = id => {
    let url = `${baseUrl}/p/${id}`

    const setFailAppDom = () => {
      let {title,content, img=defaultCoverImg,ups=0,read=0, value=0, ontvalue=0} = urlSearchData
      setAppDom({title,content, img,ups,read, value, ontvalue})
    }
    axios.get(url)
      .then(function (response) {
        if (response.status === 200 && response.data.code === 0) {
          let {data} = response.data
          urlSearchData.ups = data.ups
          urlSearchData.read = data.read
          urlSearchData.value = data.value
          urlSearchData.ontvalue = data.ontvalue

          let {title,content, img=defaultCoverImg,ups,read, value, ontvalue} = urlSearchData
          setAppDom({title,content, img,ups,read, value, ontvalue})
        } else {
          console.error('请求失败')
          setFailAppDom()
        }
      })
      .catch(function (error) {
        console.log(error);
        setFailAppDom()
      })
  }

  await getInfobyId(urlSearchData.id)
}