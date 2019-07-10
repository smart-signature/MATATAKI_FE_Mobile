<template>
  <div class="outer">
    <div class="white-bg">
      <div ref="capture" class="container">
        <section class="header">
          <img src="@/assets/newimg/SmartSignature.svg" alt="SmartSignature" />
          <h1>投资好文，分享有收益</h1>
        </section>
        <section class="content-container">
          <h1>{{ shareInfo.title }}</h1>
          <div class="desc">
            <div class="user">
              <img class="avatar" :src="shareInfo.avatar || defaultAvatar" alt="" />
              <span class="name">{{ shareInfo.name }}</span>
            </div>
            <span class="time">{{ shareInfo.time }}</span>
          </div>
          <div class="content markdown-body" v-html="shareInfo.content"></div>
        </section>
        <div class="hide-article-box">
          <span>—— 长按海报访问更多精彩内容 ——</span>
        </div>
        <section class="footer">
          <img src="@/assets/newimg/logo-word.svg" alt="SmartSignature" />
          <canvas ref="qr" class="qrcode" width="55" height="55"></canvas>
        </section>
      </div>
    </div>
    <button class="save-btn" @click="save">保存</button>
  </div>
</template>

<script>
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import defaultAvatar from "@/assets/avatar-default.svg";

export default {
  name: "QRCodeDialog",
  props: {
    shareInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      defaultAvatar
    };
  },
  watch: {},
  mounted() {
    this.genQRCode();
  },
  methods: {
    save() {
      const loading = this.$toast.loading({
        mask: true,
        duration: 0,
        message: `图片生成中...`
      });
      html2canvas(this.$refs.capture, {
        useCORS: true
      }).then(canvas => {
        let link = document.createElement("a");
        link.href = canvas.toDataURL();
        link.setAttribute("download", "smartsignature.png");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        loading.clear();
        this.$emit("change", false);
        this.$toast.success({ duration: 1500, message: `图片生成成功` });
      });
    },
    genQRCode() {
      console.log(this.$parent);
      QRCode.toCanvas(this.$refs.qr, window.location.href, { width: 55 }, function(error) {
        if (error) console.error(error);
        console.log("success!");
      });
    }
  }
};
</script>

<style lang="less" scoped>
.markdown-body {
  font-size: 14px;
  font-family: -apple-system, SF UI Text, Arial, PingFang SC, Hiragino Sans GB, Microsoft YaHei,
    WenQuanYi Micro Hei, sans-serif;
  color: #000000;
}
.white-bg {
  background: #ffffff;
}
.outer {
  background: transparent;
}
.hide-article-box {
  width: 100%;
  background-image: linear-gradient(-180deg, rgba(255, 255, 255, 0) 0%, #fff 70%);
  padding-bottom: 20px;
  text-align: center;
  position: relative;
  z-index: 9999;
  padding-top: 100px;
  bottom: 2px;
  margin-top: -100px;
  color: #b2b2b2;
  font-size: 14px;
}
.save-btn {
  font-size: 20px;
  color: #ffffff;
  border-radius: 6px;
  border: none;
  background: #1c9cfe;
  width: 335px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 20px auto 0 auto;
}
.container {
  width: 100%;
  margin: auto;
}
.header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: inherit;
  height: 130px;
  background: url("../../../assets/newimg/share-bg.svg");
  h1 {
    font-size: 20px;
    color: #ffffff;
    line-height: 28px;
    margin: 0;
  }
}
.content-container {
  width: inherit;
  padding: 20px;
  box-sizing: border-box;
  h1 {
    color: #000000;
    font-size: 20px;
    line-height: 24px;
    margin: 0;
  }
}
.content {
  max-height: 180px;
  overflow: hidden;
}
.desc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
}
.user {
  display: flex;
  align-items: center;
  max-width: 70%;
}
.time {
  color: #b2b2b2;
  font-size: 12px;
}
.name {
  color: #000;
  font-size: 12px;
  margin-left: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
.footer {
  background: #f1f1f1;
  height: 75px;
  width: inherit;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  box-sizing: border-box;
  img {
    width: 50%;
  }
  .qrcode {
    background: #ffffff;
  }
}
</style>
