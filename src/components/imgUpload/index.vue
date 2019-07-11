<template>
  <div>
    <!-- 上传图片 -->
    <FileUpload
      ref="upload"
      v-model="files"
      extensions="gif,jpg,jpeg,png,webp"
      accept="image/png,image/gif,image/jpeg,image/webp"
      @input-file="inputFile"
      @input-filter="inputFilter"
    >
      <slot name="uploadButton">
        <Button>上传按钮</Button>
      </slot>
    </FileUpload>

    <!-- 编辑图片 modal -->
    <Modal
      v-model="modal"
      width="400"
      class-name="img-upload-modal"
      closable
      :mask-closable="false"
    >
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
        {{ buttonText }}
      </Button>
    </Modal>
  </div>
</template>

<script>
import VueUploadComponent from "vue-upload-component";
import Cropper from "cropperjs";
import { ifpsUpload } from "@/api/ipfs";
import Compressor from "compressorjs";

export default {
  name: "ImgUpload",
  components: { FileUpload: VueUploadComponent },
  props: {
    // 按钮文字
    buttonText: {
      type: String,
      default: "保存"
    },
    // 显示上传图片大小 单位 M
    imgSize: {
      type: Number,
      default: 5
    },
    // 是否上传完成
    imgUploadDone: {
      type: Number,
      default: 0,
      required: true
    },
    // 比列
    aspectRatio: {
      type: Number,
      default: 1 / 1
    },
    // 上传类型
    updateType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      files: [], // 文件数据
      modal: false, // modal 框显示和隐藏
      modalLoading: false, // modal button loading
      postAction: ifpsUpload, // 上传地址
      quality: 0.8 // 压缩品质
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
            aspectRatio: this.aspectRatio,
            viewMode: 1
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
    }
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
    async inputFilter(newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // 过滤不是图片后缀的文件
        if (!/\.(gif|jpg|jpeg|png|webp)$/i.test(newFile.name)) {
          this.$toast.fail({
            duration: 1000,
            message: "请选择图片"
          });
          return prevent();
        }
      }
      // 限定最大字节
      const maxSize = size => {
        if (newFile.file.size >= 0 && newFile.file.size > 1024 * 1024 * size) {
          this.$toast.fail({
            duration: 1000,
            message: "图片过大"
          });
          prevent();
          return false;
        }
        return true;
      };
      // 压缩方法
      const compressorFunc = async () => {
        await new Compressor(newFile.file, {
          quality: this.quality,
          success(file) {
            // eslint-disable-next-line no-param-reassign
            newFile.file = file;
            maxSize(this.imgSize);
          },
          error(err) {
            console.log(err);
            this.$toast.fail({
              duration: 1000,
              message: "自动压缩图片失败"
            });
          }
        });
      };
      // 图片预览
      const modalImgView = () => {
        if (newFile && (!oldFile || newFile.file !== oldFile.file)) {
          // eslint-disable-next-line no-param-reassign
          newFile.url = "";
          const URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL) {
            // eslint-disable-next-line no-param-reassign
            newFile.url = URL.createObjectURL(newFile.file);
            //   console.log(this.files);
            this.modal = true; // 显示 modal
          }
        }
      };
      const maxSizeResult = await maxSize(10);
      if (!maxSizeResult) return true;
      await compressorFunc();
      await modalImgView();
    },
    // 上传图片
    uploadButton() {
      this.modalLoading = true;
      this.uploadImg();
    },
    async uploadImg() {
      // 上传图像 from https://github.com/lian-yue/vue-upload-component/blob/master/docs/views/examples/Avatar.vue
      const oldFile = this.files[0];
      const binStr = atob(
        this.cropper
          .getCroppedCanvas()
          .toDataURL(oldFile.type)
          .split(",")[1]
      );
      const arr = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i += 1) {
        arr[i] = binStr.charCodeAt(i);
      }
      const file = new File([arr], oldFile.name, { type: oldFile.type });
      await this.$refs.upload.update(oldFile.id, {
        file,
        type: file.type,
        size: file.size,
        active: true
      });
    },
    /**
     * Has changed // 上传完的操作写在这里
     * @param  Object|undefined   newFile   只读
     * @param  Object|undefined   oldFile   只读
     * @return undefined
     */
    async inputFile(newFile, oldFile) {
      if (newFile && oldFile && !newFile.active && oldFile.active) {
        console.log(this.files[0]);
        const res = await this.$backendAPI.uploadImage(this.updateType, this.files[0].file);
        console.log(res);
        return;

        if (newFile.response.code === 200) {
          this.$emit("doneImageUpload", newFile.response);
        } else {
          this.modalLoading = false;
          this.$toast.fail({
            duration: 1000,
            message: "上传图片失败"
          });
        }
      }
    }
  }
};
</script>

<style lang="less" src="./index.less">
// 覆盖图像上传modal样式 无法使用scoped
</style>
