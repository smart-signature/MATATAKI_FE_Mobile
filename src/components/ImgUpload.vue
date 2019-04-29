<template>
  <div class="imgUpload">
    <div v-if="file" style="margin-right: 10px;">
      <img style="width: 50px;height: 50px;" :src="file.blob" alt="cover" />
    </div>
    <file-upload
      ref="upload"
      name="avatar"
      :maximum="1"
      v-model="files"
      :post-action="postAction"
      @input-file="inputFile"
      @input-filter="inputFilter"
    >
      <img v-if="!file" src="@/assets/plus.png" alt="add">
    </file-upload>
      <img v-if="file" @click.prevent="removeAvatar" class="remove" src="@/assets/img/icon_remove.svg" alt="remove">

    <za-modal :visible.sync='show' title="上传图文封面" :show-close='true'>
      <div class="modal-inner-wrapper">
        <div v-if="files.length" style="max-width: 100%">
          <img ref="editImage" :src="files[0].blob" />
        </div>
        <za-button @click.prevent="editSave"
                   theme="primary">
          确定上传
        </za-button>
      </div>
    </za-modal>
    <za-loading :visible.sync="loading"></za-loading>
    <za-toast :visible.sync="toastShow" :duration="1000">{{toastText}}</za-toast>
  </div>
</template>

<script>
import FileUpload from 'vue-upload-component';
import { apiServer, getAvatarImage } from '@/api/backend';
import Cropper from 'cropperjs';
import '../views/User/css/cropper.css';

export default {
  name: 'imgUpload',
  props: ['cover'],
  components: {
    FileUpload,
  },
  data() {
    return {
      postAction: `${apiServer}/ipfs/upload`,
      show: false,
      files: [],
      file: null,
      loading: false,
      toastShow: false,
      toastText: '上传成功',
    };
  },
  watch: {
    cover(val) {
      if (val) {
        this.file = {
          blob: getAvatarImage(val),
        };
      }
    },
    show(value) {
      if (value) {
        this.$nextTick(function () {
          if (!this.$refs.editImage) {
            return;
          }
          const cropper = new Cropper(this.$refs.editImage, {
            aspectRatio: 1 / 1,
            viewMode: 1,
          });
          this.cropper = cropper;
        });
      } else if (this.cropper) {
        this.cropper.destroy();
        this.cropper = false;
      }
    },
  },
  methods: {
    async editSave() {
      this.loading = true;
      const oldFile = this.files[0];
      const binStr = atob(this.cropper.getCroppedCanvas().toDataURL(oldFile.type).split(',')[1]);
      const arr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i += 1) {
        arr[i] = binStr.charCodeAt(i);
      }
      const file = new File([arr], oldFile.name, { type: oldFile.type });
      await this.$refs.upload.update(oldFile.id, {
        file,
        type: file.type,
        size: file.size,
        active: true,
      });
    },
    _toast(toastText) {
      this.toastShow = true;
      this.toastText = toastText;
    },
    inputFile(newFile, oldFile) {
      if (newFile && oldFile && !newFile.active && oldFile.active) {
        this.loading = false;
        if (newFile.response.code === 200) {
          this.file = this.files[0];
          this.show = false;
          this._toast('上传成功');
          this.$emit('setDone', newFile.response.hash);
        } else {
          this._toast('上传失败');
        }
      }
      if (newFile && !oldFile) {
        this.$nextTick(() => {
          this.show = true;
        });
      }
    },
    inputFilter(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // 过滤不是图片后缀的文件
        if (!/\.(jpeg|jpe|jpg|gif|png|webp)$/i.test(newFile.name)) {
          return prevent();
        }
      }

      // 创建 blob 字段 用于图片预览
      newFile.blob = '';
      const URL = window.URL || window.webkitURL;
      if (URL && URL.createObjectURL) {
        newFile.blob = URL.createObjectURL(newFile.file);
      }
    },
    removeAvatar() {
      console.log(11);
      this.$refs.upload.remove(this.files);
      this.file = '';
      this.$emit('setDone', '');
    },
  },
};
</script>

<style scoped>
  .modal-inner-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  .modal-inner-wrapper>img {
    width: 100%;
    margin-bottom: 10px;
  }
  .imgUpload {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .remove {
    width: 20px;
    cursor: pointer;
  }
</style>
