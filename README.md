# Smart Signature Future
Sign it if you mean it. Let's Buldl! 🏄
前端在线预览[在此](https://sign-dev.dravatar.xyz/)
[Backend](https://github.com/smart-signature/smart-signature-backend) | [Contract](https://github.com/smart-signature/smart-signature-EOS-contract) | [Documentation](https://shimo.im/docs/UOYT3DqklCYBbzny) | [Whitepaper(Draft)](https://hackmd.io/Q3KNkxjgSwKRJ5cfBL2I4g)

Newcomes are encouraged to checkout our [good first issue](https://github.com/smart-signature/smart-signature-future/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) first. In order to be involved, you must to create your own branch and send pull request to the test branch. Always verify don't trust. 

## 为什么前端在线预览没有更新？

前端在线预览是实时依据 `testing` 分支实时部署更新的，没有人工干预。

为了加载性能、节省流量、提升用户体验，网站使用了 [Service Worker (服務工作線程)](https://developers.google.cn/web/fundamentals/primers/service-workers/?hl=zh-tw)。部分支持 Service Worker 的浏览器 **会使用你之前访问网站的缓存**，所以你会感觉没有更新。

### 如何知道网站是否在更新并使用最新版本？

请使用 Chrome (推荐) 或 Firefox 打开新标签页，鼠标右键点击 `Inspect Element` (审查元素) ，选择 `Console`

然后地址栏输入 `https://sign-dev.dravatar.xyz`, 观察 `messages`。

![](https://ws1.sinaimg.cn/large/006tKfTcgy1g1a6scu28rj327v0u0gpa.jpg)


如 console 出现 `静默更新完毕，请关闭这个标签并在新的标签页打开以使用更新后的版本。` 即代表后台成功地静默更新。

请关闭当前标签页，重新打开 `https://sign-dev.dravatar.xyz` 即可


## Project setup
```
npm install 
npm run serve # Compiles and hot-reloads for development
npm run build # Compiles and minifies for production
npm run lint  # Lints and fixes files
```

## Libs we love
- [Zarm UI](https://zhongantecheng.github.io/zarm-vue/#/documents/quick-start)
- [Dfuse](https://www.dfuse.io/en)
- [IPFS telegra.ph clone](https://github.com/alexstep/ipfs-telegra.ph)