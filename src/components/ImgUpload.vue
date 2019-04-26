<template>
  <div style="display: flex; align-items: center;justify-content: flex-start;">
    <div v-if="file" style="margin-right: 10px;">
      <img style="width: 50px;height: 50px;" :src="file.blob" />
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
      <img src="@/assets/plus.png" alt="">
    </file-upload>
    <za-modal :visible.sync='show' title="上传头图" :show-close='true'>
      <div class="modal-inner-wrapper">
        <img v-for="file in files" :src="file.blob" />
        <za-button @click.prevent="$refs.upload.active = true;loading = true;"
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
  },
  methods: {
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
</style>
