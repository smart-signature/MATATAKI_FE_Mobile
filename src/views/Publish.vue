<template>
  <div class="new-post">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="$router.go(-1)"></za-icon>
      </div>
      <div slot="title">发布文章</div>
      <div slot="right">
        <Button type="text" size="large" @click="sendThePost">确认发布</Button>
      </div>
    </za-nav-bar>
    <Form label-position="left" :label-width="100">
        <FormItem label="标题">
          <Input v-model="title" placeholder="请输入你的文章标题..." size="large" clearable />
        </FormItem>
        <!-- <FormItem label="署名">
          <Input v-model="author" placeholder="写上你的大名..." clearable />
        </FormItem> -->
        <FormItem label="裂变系数">
          <Input value="2" disabled placeholder="输入文章分享裂变系数" clearable />
        </FormItem>
    </Form>
    <mavon-editor ref=md v-model="markdownData" @imgAdd="$imgAdd" placeholder="左边输入 Markdown 格式的文字开始编辑，右边即时预览" />
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapActions, mapState } from 'vuex';
import { sendPost } from '@/api/ipfs';
import API from '@/api/scatter.js';
import { mavonEditor } from 'mavon-editor';
import request from 'request';
import { publishArticle, defaultImagesUploader, auth } from '../api';

export default {
  name: 'NewPost',
  components: {
    'mavon-editor': mavonEditor,
  },
  async created() {
    if (this.currentUsername) {
      return;
    }
    await this.suggestNetworkAsync();
    await this.loginScatterAsync();
  },
  data: () => ({
    title: '',
    author: '',
    markdownData: '',
    fissionFactor: 2000,
  }),
  computed: {
    ...mapGetters(['currentUsername']),
    ...mapState(['scatterAccount']),
  },
  methods: {
    ...mapActions([
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    async authDemo() { // 示例代码。。请随便改。。。
      // 1. 取得签名
      API.authSignature((username, publickey, sign) => {
        console.log(username, publickey, sign);
        // 2. post到服务端 获得accessToken并保存
        auth({ username, publickey, sign }, (error, response, body) => {
          console.log(body);
          if (!error) {
            // 3. save accessToken
            const accessToken = body;
            localStorage.setItem('ACCESS_TOKEN', accessToken);
          }
        });
      });

      // 4. 使用accessToken 示例。 请求修改某些和用户数据相关的api时，需要按照oauth2规范，在header里带上 accessToken， 以表示有权调用
      // const accessToken = localStorage.getItem("ACCESS_TOKEN");
      // request({
      //   uri: "some api url that need auth",
      //   // uri: "http://localhost:7001/follow",
      //   // uri: "http://localhost:7001/unfollow",
      //   rejectUnauthorized: false,
      //   json: true,
      //   headers: { Accept: '*/*', "x-access-token": accessToken },
      //   dataType: 'json',
      //   method: 'POST',
      //   form: {
      //     username:"joetothemoon",
      //     followed:"tengavinwood",
      //   },
      // }, function(err,resp, body){
      //    console.log(body);
      // });
    },
    async sendThePost() {
      if (!this.currentUsername) {
        await this.loginScatterAsync();
      }
      if (this.title === '' || this.markdownData === '') { // 标题或内容为空时
        return this.$Modal.warning({
          title: '提示',
          content: '标题或正文不能为空',
        });
      }
      // 用户不填写裂变系数则默认为2
      if (this.fissionFactor === '') this.fissionFactor = 2;

      const {
        title, markdownData, currentUsername, fissionFactor,
      } = this;
      const author = currentUsername;

      const sendFailed = () => this.$Notice.error({ title: '发送失败', desc: error });

      // for everyone
      // 規則 遇到 await 彈 error 出來，後面又沒.catch 會被最外層的 try catch 接走
      // 1. sendPost 裡的 axios code != 200 時，算是 error ，會直接被最外層的 try catch 接走
      // 2. getSignature 傳入的 callback 是接在 getArbitrarySignature.then 裡的，
      //    error 走 .catch ，所以 line 133 中 err 只會是 null 是個無效代碼
      // 3. publishArticle 又玩了一次，這次 callback 是給 request 的，
      // /   request 的 callback 是包含 error 情況的，所以 line 140 是必要的
      try {
        const { data } = await sendPost({
          title, author, content: markdownData, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code !== 200) this.sendFailed();
        else {
          console.log('Push action to signature.bp...', hash);
          // const { publicKey } = await API.getPublicKey();
          API.getSignature(author, hash, (err, signature, publicKey, username) => {
            console.log('签名成功后调', signature, publicKey);
            if (err) this.sendFailed();
            else {
              publishArticle({
                author, title, hash, publicKey, signature, currentUsername, fissionFactor,
              }, (error, response, body) => {
                if (body.msg !== 'success' || error) sendFailed();
                else {
                  this.$Notice.success({
                    title: '发送成功',
                    desc: '3秒后跳转到你发表的文章',
                  });
                  const jumpToArticle = () => this.$router.push({
                    name: 'Article',
                    params: { hash },
                  });
                  setTimeout(jumpToArticle, 3 * 1000);
                }
              });
            }
          });
        }
      } catch (error) {
        console.error(error);
        sendFailed();
      }
    },
    $imgAdd(pos, imgfile) {
      // 想要更换默认的 uploader， 请在 src/api/imagesUploader.js 修改 currentImagesUploader
      // 不要在页面组件写具体实现，谢谢合作 - Frank
      defaultImagesUploader(imgfile)
        .then(({ data }) => {
          const { url } = data.data;
          this.$refs.md.$img2Url(pos, url);
        });
    },
  },
};
</script>

<style scoped>
  .new-post {
    max-width: 90%;
    margin: 0 auto;
  }

  textarea,
  #editor div {
    display: inline-block;
    width: 49%;
    height: 100%;
    vertical-align: top;
    box-sizing: border-box;
    padding: 0 20px;
  }

  textarea {
    border: none;
    border-right: 1px solid #ccc;
    resize: none;
    outline: none;
    background-color: #f6f6f6;
    font-size: 14px;
    font-family: 'Monaco', courier, monospace;
    padding: 20px;
  }

  code {
    color: #f66;
  }
  /* 编辑器层级大于modal 改变编辑器层级 */
  .v-note-wrapper{
    z-index: 1000;
  }
</style>
