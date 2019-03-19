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
          <Input v-model="fissionFactor" placeholder="输入文章分享裂变系数" clearable />
        </FormItem>
    </Form>
    <mavon-editor ref=md v-model="markdownData" @imgAdd="$imgAdd" placeholder="左边输入 Markdown 格式的文字开始编辑，右边即时预览" />
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters, mapActions } from 'vuex';
import { sendPost } from '@/api/ipfs';
import API from '@/api/scatter.js';
import { publishArticle } from '@/api/backend';
import { mavonEditor } from 'mavon-editor';

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
  },
  methods: {
    ...mapActions([
      'suggestNetworkAsync',
      'loginScatterAsync',
    ]),
    async sendThePost() {
      const {
        title, markdownData, currentUsername, fissionFactor,
      } = this;
      const author = currentUsername;
      try {
        const { data } = await sendPost({
          title, author, content: markdownData, desc: 'whatever',
        });
        const { code, hash } = data;
        if (code === 200) {
          console.log('Push action to signature.bp...', hash);
          // const { transaction_id } = await publishOnChain({ hash, fissionFactor });
          API.getSignature(author, hash, (err, signature, publicKey, username) => {
            // console.log("签名成功后调", signature, publicKey)
            if (err) {
              this.$Notice.error({
                title: '发送失败',
              });
            } else {
              // _oldPublishArticle({
              //   author, title, hash, publicKey, signature, username,
              // })
              publishArticle({
                author, title, hash, publicKey, signature, username,
              }, (error, response, body) => {
                console.info(error);
                console.info(response);
                console.info(body);
                if (body.msg === 'success' && !error) {
                  this.$Notice.success({
                    title: '发送成功',
                    desc: '3秒后跳转到你发表的文章',
                  });
                  const jumpToArticle = () => this.$router.push({
                    name: 'Article',
                    params: { hash },
                  });
                  setTimeout(jumpToArticle, 3 * 1000);
                } else {
                  this.$Notice.error({
                    title: '发送失败',
                    desc: error,
                  });
                }
              });
            }
          });
        } else {
          this.$Notice.error({
            title: '发送失败',
          });
        }
      } catch (error) {
        console.error(error);
        this.$Notice.error({
          title: '发送失败',
        });
      }
    },
    $imgAdd(pos, imgfile) {
      const formdata = new FormData();
      formdata.append('smfile', imgfile);
      axios({
        url: 'https://sm.ms/api/upload',
        method: 'post',
        data: formdata,
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(({ data }) => {
        const { url } = data.data;
        // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
        // $vm.$img2Url 详情见本页末尾
        this.$refs.md.$img2Url(pos, url);
      });
    },
  },
  test() {
  // publishOnChain({ hash: 'QmfJsZmbsFcaNEBejP6HcXQEXycVXKfFwbMM3eju4VdsN3' });
  // transferEOS({amount: 0, memo: '', });
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
</style>
