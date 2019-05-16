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
            <img class="camera" src="/img/camera.png" />
          </div>
        </img-upload>
      </za-cell>
      <za-cell title="昵称">
        <za-input v-model="newname" placeholder="昵称1-12位，可包含中英文和数字"></za-input>
      </za-cell>
      <za-cell title="简介">
        <za-input v-model="newIntroduction" rows="3" type="textarea" placeholder="简介可设置5-20个字符"></za-input>
      </za-cell>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import {
  Follow, Unfollow, getUser,
  setUserName, getAssets, getAvatarImage, setProfile,
  uploadAvatar,
} from '@/api';
import imgUpload from '@/components/imgUpload/index.vue';
import { isNull } from '@/common/methods';

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
      newIntroduction: '',
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
    async saveIntro() {
      // 中文 字母 数字 1-12
      const reg = /^[\u4E00-\u9FA5A-Za-z0-9]{5,20}$/;
      if (!reg.test(this.newIntroduction)) {
        this.$toasted.show('<p style="margin: 8px 0;line-height: 1.5;">简介可设置5-20个字符</p>', {
          position: 'top-center',
          duration: 1500,
          fitToScreen: true,
        });
        return;
      }
      try {
        await setIntroduction({ introduction: this.newIntroduction });
        this.$Notice.success({ title: '保存成功' });
        this.introduction = this.newIntroduction;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            this.$Notice.error({ title: '登录信息已过期，请将内容保存后，重新登录并编辑' });
          } else if (error.response.status === 500) {
            this.$Notice.error({ title: '昵称已存在，请重新设置' });
            this.introduction = this.newIntroduction;
          } else {
            this.$Notice.error({
              title: '保存失败',
              desc: '简介可设置5-20个字符',
            });
            this.newIntroduction = this.introduction;
          }
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
      this.refreshUser();
    },
    checkSaveParams() {
      // 中文 字母 数字 1-12
      const reg = /^[\u4E00-\u9FA5A-Za-z0-9]{1,12}$/;
      let canSetProfile = true;
      if (!reg.test(this.newname)) {
        this.myToasted('昵称长度为1-12位，中文、英文、数字但不包括下划线等符号');
        canSetProfile = false;
      }
      if (this.newIntroduction.length < 5 || this.newIntroduction.length > 20) {
        this.myToasted('简介可设置5-20个字符');
        canSetProfile = false;
      }
      return canSetProfile;
    },
    myToasted(notice) {
      this.$toasted.show(`<p style="margin: 8px 0;line-height: 1.5;">${notice}</p>`, {
        position: 'top-center',
        duration: 1500,
        fitToScreen: true,
      });
    },
    async save() {
      if (!this.checkSaveParams()) return;
      try {
        const requestData = {
          nickname: this.newname,
          introduction: this.newIntroduction,
        };
        if (this.newname === this.nickname) delete requestData.nickname;
        if (this.introduction === this.newIntroduction) delete requestData.introduction;
        if (JSON.stringify(requestData) === '{}') {
          this.myToasted('请至少修改一项');
          return;
        }
        const response = await setProfile(requestData);
        if (response.data.code === 0) {
          this.$Notice.success({ title: '保存成功' });
          this.nickname = this.newname;
        } else {
          this.myToasted('昵称重复，请重新填写');
        }
      } catch (error) {
        if (error.response) {
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
          console.log(error.request);
        } else {
          console.log('Error', error.message);
        }
        console.log(error.config);
      }
      //this.refreshUser();
    },
    async refreshUser() {
      if (this.username === null) this.username = this.currentUsername;
      const { username, currentUsername } = this;
      const setUser = (data) => {
        this.nickname = data.nickname;
        this.email = data.email;
        this.newname = isNull(this.nickname) ? this.username : this.nickname;
        this.setAvatarImage(data.avatar);
        this.follows = data.follows;
        this.fans = data.fans;
        this.followed = data.is_follow;
        this.introduction = data.introduction;
        this.newIntroduction = data.introduction;
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
