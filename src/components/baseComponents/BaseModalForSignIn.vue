<template>
  <Modal
    v-model="showModaCopy"
    footer-hide
    @on-visible-change="change"
    class-name="modalCenter">
      <div class="info-content">
        <p class="info-content-title">{{modalText.text}}</p>

        <div class="modal-login">
          <div class="modal-body" v-for="(item, index) in blockchain" :key="index">
            <div class="modal-body-content">
              <div class="modal-body-head">支持钱包</div>
                <div class="modal-wallet">
                  <a :href="itemWallet.href" target="_blank" v-for="(itemWallet, indexWallet) in item.wallet" :key="indexWallet">
                    <img :src="itemWallet.url" :alt="itemWallet.alt" />
                  </a>
                </div>
                <div class="modal-logo">
                  <div class="modal-logo-button" :class="'active'+index" @click="walletLogin(item.type)">
                    <img :src="item.url" :alt="item.title" />
                    <span>{{item.title}}</span>
                  </div>
                </div>

            </div>
            <a class="modal-doc" target="_blank" :href="item.doc.href">{{item.doc.title}}</a>
          </div>
        </div>
        <div class="modal-loading" v-if="modalLoading">
          <van-loading type="spinner" color="#1989fa" />
        </div>
      </div>
  </Modal>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import iconEOS from '@/assets/img/icon_logo_eos.svg';
import iconTokenpocket from '@/assets/img/icon_tokenpocket.svg';
import iconMathwallet from '@/assets/img/icon_mathwallet.svg';
import iconScatter from '@/assets/img/icon_scatter.svg';
import iconONT from '@/assets/img/icon_logo_ont.svg';
import iconCyano from '@/assets/img/icon_cyano.svg';
import iconLeafwallet from '@/assets/img/icon_leafwallet.svg';
import iconChallte from '@/assets/img/icon_challte.svg';
import iconMeet from '@/assets/img/icon_meet.svg';

export default {
  name: 'BaseModalForSignIn',
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    showModal(newVal) {
      this.showModaCopy = newVal;
    },
  },
  computed: {
    ...mapState(['userConfig']),
  },
  data() {
    return {
      showModaCopy: true,
      modalLoading: false,
      modalText: {
        text: '选择授权方式',
      },
      blockchain: [
        {
          url: iconEOS,
          title: 'EOS登陆',
          type: 'EOS',
          wallet: [
            {
              url: iconTokenpocket,
              href: 'https://www.tokenpocket.pro/',
              alt: 'https://www.tokenpocket.pro/',
            },
            {
              url: iconScatter,
              href: 'https://get-scatter.com/',
              alt: 'https://get-scatter.com/',
            },
            {
              url: iconChallte,
              href: 'http://eblock.io/',
              alt: 'http://eblock.io/',
            },
            {
              url: iconMathwallet,
              href: 'http://www.medishares.org/',
              alt: 'http://www.medishares.org/',
            },
            {
              url: iconLeafwallet,
              href: 'https://www.leafwallet.io/',
              alt: 'https://www.leafwallet.io/',
            },
            {
              url: iconMeet,
              href: 'https://meet.one/',
              alt: 'https://meet.one/',
            },
          ],
          doc: {
            title: '《如何使用EOS登录》',
            href: 'https://smartsignature.io/article/515',
          },
        },
        {
          url: iconONT,
          title: 'ONT登陆',
          type: 'ONT',
          wallet: [
            {
              url: iconMathwallet,
              href: 'http://www.medishares.org/',
              alt: 'http://www.medishares.org/',
            },
            {
              url: iconCyano,
              href: 'https://chrome.google.com/webstore/detail/cyano-wallet/dkdedlpgdmmkkfjabffeganieamfklkm',
              alt: 'https://chrome.google.com/webstore/detail/cyano-wallet/dkdedlpgdmmkkfjabffeganieamfklkm',
            },
          ],
          doc: {
            title: '《如何使用ONT登录》',
            href: 'https://smartsignature.io/article/516',
          },
        },
      ],
    };
  },
  methods: {
    ...mapActions(['idCheckandgetAuth']),
    ...mapMutations(['setUserConfig']),
    change(status) {
      if (this.modalLoading) this.modalLoading = false;
      this.showModaCopy = status;
      this.$emit('changeInfo', status);
    },
    async walletLogin(type) {
      this.setUserConfig({ blockchin: type });
      this.modalLoading = true;
      await this.signIn();
      this.modalLoading = false;
      this.change(false);
    },
    async signIn() {
      const success = () => {
        localStorage.setItem('blockchin', this.userConfig.blockchin); // 成功存储登陆方式
      };
      try {
        await this.idCheckandgetAuth();
        success();
      } catch (error) {
        try {
          await this.idCheckandgetAuth();
          success();
        } catch (err) {
          console.log(err);
          this.$toast.fail({
            duration: 1000,
            message: '登陆失败',
          });
        }
      }
    },
  },
};
</script>


<style lang="less" scoped>
.info-content {
  margin: 0 30px;
  transition: all .3s;
  &-title {
    text-align: center;
    font-size: 18px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
    margin: 20px 0 48px;
  }

  .modal-login {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .modal-body {
    flex: 0 0 50%;
    text-align: center;
    margin: 0 14px;
    transition: all .3s;
    &-content {
      background-color: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 0 14px 0;
      height: 194px;
    }

    &-head {
      width: 100%;
      background: #E6E6E6;
      padding: 7px 0;
      margin: 0 0 10px 0;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0,0,0,.7);
    }

    .modal-logo {
        flex: 1;
        display: flex;
        align-items: flex-end;
      &-button {
        text-align: center;
        color: #fff;
        margin: 16px 0 0;
        padding: 0 20px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: #eee;
        &.active0 {
          background: #444;
        }
        &.active1 {
          background: #4D9AFD;
        }
      img {
        height: 16px;
        padding: 0;
        margin: 8px 8px 8px 0;
        cursor: pointer;
        box-sizing: border-box;
      }
      span {
        font-size: 14px;
        font-weight: 400;
        padding: 0;
        margin: 0;
      }
    }
    }
    .modal-wallet {
      background: rgba(237, 237, 237, 0.75);
      border-radius: 16px;
      padding: 0;
      margin: 0;
      text-align: center;
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      flex-wrap: wrap;
      a {
        display: inline-block;
        padding: 0;
        width: 28px;
        height: 28px;
        margin: 5px;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
    .modal-doc {
      font-size:14px;
      font-weight:400;
      color:rgba(0,118,255,1);
      margin: 34px 0 28px 0;
      display: inline-block;
    }
  }
  .modal-loading {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.1);
  }
}

@media screen and (max-width: 400px) {
  .info-content {
    margin: 0 10px;
    .modal-body {
      margin: 0 4px;
    }
  }
}
</style>
