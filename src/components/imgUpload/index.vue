<template>
    <div>
        <!-- 上传图片 -->
        <file-upload
            ref="upload"
            v-model="files"
            @input-file="inputFile"
            @input-filter="inputFilter"
            extensions="gif,jpg,jpeg,png,webp"
            accept="image/png,image/gif,image/jpeg,image/webp"
            name="avatar"
            :post-action="postAction"
            >
            <slot name="uploadButton">
                <Button>上传按钮</Button>
            </slot>
        </file-upload>

        <!-- <button v-show="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true" type="button">开始上传</button> -->
        <!-- <button v-show="$refs.upload && $refs.upload.active" @click.prevent="$refs.upload.active = false" type="button">停止上传</button> -->


        <!-- 编辑图片 modal -->
        <Modal
            width="400"
            v-model="modal"
            class-name="img-upload-modal">
            <div slot="header" class="modal-header">
                <p class="modal-header-title">编辑图像</p>
                <p class="modal-header-subtitle">调整图像寸和位置</p>
            </div>
            <div class="modal-content">
                <!-- 目前都只用了单文件上传, 所以裁剪取得files[0] 如果需要支持多图,请扩展组件 -->
                <img v-if="files.length && modal" ref="editImage" :src="files[0].url" />
            </div>
            <Button
                slot="footer"
                class="save-button"
                type="primary"
                size="large"
                :loading="modalLoading"
                @click.prevent="uploadButton"
            >
                {{buttonText}}
            </Button>
        </Modal>
    </div>

</template>

<script>
import VueUploadComponent from 'vue-upload-component';
import Cropper from 'cropperjs';
import './cropper.css';
import { apiServer } from '@/api/backend';


export default {
  name: 'imgUpload',
  components: { FileUpload: VueUploadComponent },
  props: {
    // 按钮文字
    buttonText: {
      type: String,
      default: '保存',
    },
    // 显示上传图片大小 单位 M
    imgSize: {
      type: Number,
      default: 2,
    },
    // 是否上传完成
    imgUploadDone: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  data() {
    return {
      files: [], // 文件数据
      modal: false, // modal 框显示和隐藏
      modalLoading: false, // modal button loading
      postAction: `${apiServer}/ipfs/upload`, // 上传地址
    };
  },
  watch: {
    // 显示modal
    modal(value) {
      if (value) {
        this.modalLoading = false;
        this.$nextTick(() => {
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
    // 上传完成
    imgUploadDone() {
      this.modal = false;
      this.modalLoading = false;
    },
  },
  methods: {
    /**
     * Pretreatment // 过滤操作可以写在这里
     * @param  Object|undefined   newFile   读写
     * @param  Object|undefined   oldFile   只读
     * @param  Function           prevent   阻止回调
     * @return undefined
     */
    // eslint-disable-next-line consistent-return
    inputFilter(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // 过滤不是图片后缀的文件
        if (!/\.(gif|jpg|jpeg|png|webp)$/i.test(newFile.name)) {
          this.$toasted.show('复制成功', {
            position: 'top-center',
            duration: 1500,
            fitToScreen: true,
          });
          return prevent();
        }
      }

      // 限定最大字节
      if (newFile.size >= 0 && newFile.size > 1024 * 1024 * this.imgSize) {
        this.$toasted.show(`请选择 ${this.imgSize}M 以内的图片`, {
          position: 'top-center',
          duration: 1500,
          fitToScreen: true,
        });
        return prevent();
      }
      // 图片预览
      if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
        // eslint-disable-next-line no-param-reassign
        newFile.url = '';
        const URL = window.URL || window.webkitURL;
        if (URL && URL.createObjectURL) {
        // eslint-disable-next-line no-param-reassign
          newFile.url = URL.createObjectURL(newFile.file);
          //   console.log(this.files);
          this.modal = true; // 显示 modal
        }
      }
    },
    // 上传图片
    uploadButton() {
      this.modalLoading = true;
      this.uploadImg();
    },
    async uploadImg() {
      // 上传图像 from https://github.com/lian-yue/vue-upload-component/blob/master/docs/views/examples/Avatar.vue
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
    /**
     * Has changed // 上传完的操作写在这里
     * @param  Object|undefined   newFile   只读
     * @param  Object|undefined   oldFile   只读
     * @return undefined
     */
    inputFile(newFile, oldFile) {
      if (newFile
           && oldFile
           && !newFile.active
           && oldFile.active
      ) {
        if (newFile.response.code === 200) {
          this.$emit('doneImageUpload', newFile.response);
        } else {
          this.modalLoading = false;
          this.$toasted.show('上传图片失败', {
            position: 'top-center',
            duration: 1500,
            fitToScreen: true,
          });
        }
      }
    },
  },
};
</script>

<style lang="less" src="./index.less">
// 覆盖图像上传modal样式 无法使用scoped
</style>
