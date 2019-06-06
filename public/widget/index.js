(function(){
    const urlSearch = window.location.search.substr(1).split('&')
    const appDom = document.querySelector('#app')
    let url = `https://test.smartsignature.io`
    let baseUrl = `https://apitest.smartsignature.io`
    let logoImg = '../img/logo.png'
    let urlSearchData = {}

    const axiosApi = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: { Accept: '*/*', lang: 'zh' },
    });
    // url 参数解析
    const urlSearchDecodeURIComponent = arr => {
      let data = {}
      arr.forEach(i => {
        let arrData = i.split('=')
        data[arrData[0]] = decodeURIComponent(arrData[1])
      });
      return data
    }
    urlSearchData = urlSearchDecodeURIComponent(urlSearch)

    // 设置内容
    const setAppDom = ({title, content, img, ups, read}) => {
      let appDomStr = `
      <div class="container">
        <div class="widget">
          <img class="logo" src="${logoImg}" alt="logo" />
          <h1 class="jumpPage">${title || '没有获取到标题'}</h1>
          <div class="widget-content">
            <img class="cover jumpPage" src="${img}" alt="cover" />
            <p class="widget-des">${content || '目前的机制完全照搬加密水浒。一个疑问，这种打赏机制与一般的打赏有何不同呢。这种打赏机制与一般的打赏有何不同呢。这种打赏…'}</p>
          </div>
          <p class="author">by: lojimaxxxxxxx</p>
          <div class="readorups jumpPage">
            <span><img src="./img/read.svg" alt="read" />${read || 0}</span>
            <span><img src="./img/ups.svg" alt="ups" />${ups || 0}</span>
          </di>
        </div>
      </div>`
      appDom.innerHTML = appDomStr
      // show line 4
      $clamp(document.querySelector('.widget-des'), {clamp: 4});

      // 页面跳转
      const titleClick = () => {
       let jumpPageDom = document.querySelectorAll('.jumpPage')
       jumpPageDom.forEach((i, index) => {
        jumpPageDom[index].addEventListener('click', () => {
          window.open(`${url}/article/${urlSearchData.id || ''}`)  
        }, false)
       })
      }
      titleClick()

    }

    // 通过id获取信息
    const getInfobyId = id => {
      let url = `/p/${id}`

      const setFailAppDom = () => {
        let {title,content, img=logoImg,ups,read} = urlSearchData
        setAppDom({title,content, img,ups,read})
      }
      axiosApi.get(url)
        .then(function (response) {
          if (response.status === 200 && response.data.code === 0) {
            let {data} = response.data
            // urlSearchData.title = data.title
            urlSearchData.title = '智能签名啥啥好啊啊的啊发的 啊的 啊'
            urlSearchData.ups = data.ups
            urlSearchData.read = data.read
            let {title,content, img=logoImg,ups,read} = urlSearchData
            setAppDom({title,content, img,ups,read})
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

    getInfobyId(urlSearchData.id)

}())