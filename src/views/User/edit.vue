/* eslint-disable no-shadow */
<template>
  <div class="user mw">
    <BaseHeader :pageinfo="{ title: `编辑`, rightPage: 'home', needLogin: false, }" >
      <div slot="right">
        <span class="send-button" @click="save">完成</span>
      </div>
    </BaseHeader>

    <div class="centercard editCard">
      <za-cell title="头像" class="imgcard">
        <img-upload :imgUploadDone="imgUploadDone" @doneImageUpload="doneImageUpload">
          <div class="user-avatar" slot="uploadButton">
            <img class="userpic" :src="avatar" @error="() => { this.avatar = require('../../assets/logo.png');}" alt="" slot="description">
          </div>
        </img-upload>
      </za-cell>
      <za-cell title="昵称">
        <za-input v-model="nickname" placeholder="昵称1-12位，可包含中英文和数字"></za-input>
      </za-cell>
      <za-cell title="简介">
        <za-input v-model="introduction" rows="3" type="textarea" placeholder="简介可设置5-20个字符"></za-input>
      </za-cell>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import {
  Follow, Unfollow, getUser,
  setUserName, getAssets, getAvatarImage,
  uploadAvatar,
} from '@/api';
import imgUpload from '@/components/imgUpload/index.vue';

export default {
  name: 'User',
  props: ['username'],
  components: { imgUpload },
  data() {
    return {
      playerincome: 0,
      editing: false,
      followed: false,
      follows: 0,
      fans: 0,
      nickname: '',
      newname: '',
      email: '',
      // eslint-disable-next-line global-require
      avatar: require('../../assets/logo.png'),
      imgUploadDone: 0, // 图片是否上传完成
      introduction: '',
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
  },
  methods: {
    ...mapActions('scatter', [
      'logout',
    ]),
    logoutScatterAsync() { return this.logout(); },
    edit() {
      this.editing = !this.editing;
    },
    jumpTo(params) {
      this.$router.push(params);
    },
    cancel() {
      this.editing = !this.editing;
    },
    async save() {
      if (this.newname === this.nickname) {
        this.editing = !this.editing;
        return;
      }
      // 中文 字母 数字 1-12
      const reg = /^[\u4E00-\u9FA5A-Za-z0-9]{1,12}$/;
      if (!reg.test(this.newname)) {
        // this.$Message.error('昵称长度为1-12位，中文、英文、数字但不包括下划线等符号');
        this.$toasted.show('<p style="margin: 8px 0;line-height: 1.5;">昵称长度为1-12位，中文、英文、数字但不包括下划线等符号</p>', {
          position: 'top-center',
          duration: 1500,
          fitToScreen: true,
        });
        return;
      }
      try {
        const response = await setUserName({ newname: this.newname });
        this.$Notice.success({ title: '保存成功' });
        this.nickname = this.newname;
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          if (error.response.status === 401) {
            this.$Notice.error({ title: '登录信息已过期，请将内容保存后，重新登录并编辑' });
          } else if (error.response.status === 500) {
            this.$Notice.error({ title: '昵称已存在，请重新设置' });
            this.nickname = this.newname;
          } else {
            this.$Notice.error({
              title: '保存失败',
              desc: '昵称长度为1-12位，中文、英文、数字但不包括下划线等符号',
            });
            this.newname = this.nickname === '' ? this.username : this.nickname;
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
      this.refreshUser();
      this.editing = !this.editing;
    },
    async refreshUser() {
      if (this.username === null) this.username = this.currentUsername;
      const { username, currentUsername } = this;
      const setUser = (data) => {
        this.nickname = data.nickname;
        this.email = data.email;
        this.newname = this.nickname === '' ? this.username : this.nickname;
        this.setAvatarImage(data.avatar);
        this.follows = data.follows;
        this.fans = data.fans;
        this.followed = data.is_follow;
        this.introduction = data.introduction;
      };
      try {
        const response = await getUser({ username }, currentUsername);
        if (response.status !== 200) throw new Error('getUser error');
        setUser(response.data);
      } catch (error) {
        throw error;
      }
    },
    async follow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({ title: '账号信息无效，关注失败' });
        return;
      }
      try {
        await Follow({ followed: username, username: currentUsername });
        this.$Notice.success({ title: '关注成功' });
        this.followed = true;
      } catch (error) {
        this.$Notice.error({ title: '关注失败' });
      }
      this.refreshUser();
    },
    async unfollow_user() {
      const { username, currentUsername } = this;
      if (!currentUsername || !username) {
        this.$Notice.error({ title: '账号信息无效，取消关注失败' });
        return;
      }
      try {
        await Unfollow({ followed: username, username: currentUsername });
        this.$Notice.success({ title: '已取消关注' });
        this.followed = false;
      } catch (error) {
        this.$Notice.error({ title: '取消关注失败' });
      }
      this.refreshUser();
    },
    setAvatarImage(hash) {
      // 空hash 显示默认Logo头像
      // eslint-disable-next-line global-require
      if (!hash) this.avatar = require('../../assets/logo.png');
      else this.avatar = getAvatarImage(hash);
    },
    // 完成上传
    async doneImageUpload(res) {
      const avatar = res.hash;
      try {
        // 更新图像
        const response = await uploadAvatar({ avatar });
        if (response.status !== 201) throw new Error('201');
        this.refreshUser();
        this.imgUploadDone += 1;
      } catch (error) {
        console.log(error);
        this.$Message.error('上传失败请重试');
      }
    },
  },
  created() {
    const { refreshUser } = this;
    refreshUser();
    document.title = '编辑';
  },
};
</script>

<style lang="less" scoped src="./index.less"></style>
<style lang="less">
  .editCard {
    .za-cell-title {
      text-align: left;
    }
    .za-input {
      input, textarea {
        text-align: right;
      }
    }
    .za-cell-content {
      justify-content: flex-end;
    }
    .za-cell-title {
      color: #7E7E7E;
    }
  }
  .imgcard {
    padding: 10px  0;
    .user-avatar {
      width: 55px;
      height: 55px;
      flex: 0 0 55px;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .camera {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
    }
  }
</style>
