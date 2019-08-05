<template>
  <div id="app">
    <navigation v-if="isRouterAlive">
      <router-view />
    </navigation>
    <BackTop v-if="!isPublishPage" :right="20" :bottom="70" :height="40">
      <img class="backtop" src="@/assets/img/icon_back_top.svg" alt="backtop" />
    </BackTop>
  </div>
</template>

<script>
import Konami from 'konami'
import { mapActions, mapGetters } from 'vuex'
import { version } from '../package.json'
import { accessTokenAPI } from '@/api'
import { sleep } from '@/common/methods'

export default {
  data() {
    return {
      isRouterAlive: true
    }
  },
  provide() {
    return {
      reload: this.reload
    }
  },
  computed: {
    ...mapGetters(['currentUserInfo']),
    isPublishPage() {
      // 如果是发布页面隐藏小火箭
      return this.$route.name === 'Publish'
    }
  },
  watch: {
    currentUserInfo: {
      handler(newVal, oldVal) {
        // console.debug(this.$backendAPI.accessToken.toString().includes('Promise'));
        if (
          this.$backendAPI.accessToken &&
          this.$backendAPI.accessToken.toString().includes('Promise')
        )
          return
        this.$backendAPI.accessToken = newVal.accessToken
        console.debug('watch $backendAPI.accessToken :', this.$backendAPI.accessToken)
      },
      deep: true
    }
  },
  created() {
    // https://juejin.im/post/5bfa4bb951882558ae3c171e
    console.info('Smart Signature version :', version)
    console.log(navigator.userAgent.toLowerCase(), window.location)
    this.tz()

    const { signIn, updateNotify } = this

    let accessToken = null
    // 根据本地存储的状态来自动登陆。失败之后再重试一次
    const data = {
      accessToken: accessTokenAPI.get(),
      idProvider: localStorage.getItem('idProvider')
    }
    if (data.idProvider && data.accessToken) {
      console.log('sign in form localStorage')
      try {
        accessToken = signIn(data)
      } catch (error) {
        accessToken = signIn(data)
      }
    }
    this.$backendAPI.accessToken = accessToken
    console.debug('$backendAPI.accessToken :', this.$backendAPI.accessToken)

    window.updateNotify = updateNotify
  },
  mounted() {
    ;(function() {
      const isPC = () => {
        const userAgentInfo = navigator.userAgent
        const Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod']
        let flag = true
        for (let v = 0; v < Agents.length; v++) {
          if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false
            break
          }
        }
        return flag
      }
      // 规则只匹配了 文章详情页面 其他直接使用 all
      const pathname = window.location.pathname.includes('/article/')
        ? '/p/' + window.location.pathname.slice(9)
        : window.location.pathname === '/'
        ? ''
        : window.location.pathname

      if (isPC() && window.location.pathname !== '/login/github')
        window.location.href = process.env.VUE_APP_PC_URL + pathname
    })()
    // eslint-disable-next-line no-unused-vars
    const easterEgg = new Konami(() => {
      this.triggerEasterEgg()
    })
  },
  methods: {
    tz() {
      const { href, origin } = window.location
      const wxOrigin =
        process.env.NODE_ENV === 'development'
          ? 'https://sstest.frontenduse.top'
          : 'https://smartsignature.frontenduse.top'

      const isWeixin = () => /micromessenger/.test(navigator.userAgent.toLowerCase())

      // 规则只匹配了 文章详情页面 其他直接使用 all
      let pathname = window.location.pathname

      let pathURL = ''
      // 如果是pc
      if (pathname.includes('/p/')) {
        pathURL = '/article/' + pathname.slice(3)
        // 如果是 m
      } else if (pathname.includes('/article/')) {
        pathURL = pathname
      } else if (pathname === '/') {
        pathURL = ''
      } else {
        pathURL = pathname
      }

      if (isWeixin() && origin !== wxOrigin) {
        window.location.href = href.replace(origin, wxOrigin + pathURL)
      }
    },
    ...mapActions(['signIn']),
    updateNotify(desc) {
      const btnCommonStyle = {
        type: 'default',
        size: 'large',
        style: 'margin: 0px 5px;'
      }
      this.$Message.info({
        render: h =>
          h('span', [
            desc,
            h(
              'Button',
              {
                attrs: {
                  // icon: 'ios-refresh',
                  ...btnCommonStyle
                },
                on: {
                  click: () => window.location.reload()
                }
              },
              '立即刷新'
            )
          ]),
        duration: 0
      })
    },
    triggerEasterEgg() {
      // 当用户在键盘输入 ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA 时触发这个函数
      this.$Message.info('恭喜你找到了隐藏彩蛋！')
      this.$router.push({ name: 'EasterEgg' })
    },
    async reload() {
      this.isRouterAlive = false
      await this.$nextTick()
      await sleep(800)
      this.isRouterAlive = true
    }
  }
}
</script>

<style scoped lang="less">
#app {
  /*text-align: center;*/
  margin: auto;
  height: 100%;
}

.backtop {
  width: 40px;
  height: 40px;
  cursor: pointer;
}
.ivu-back-top-show {
  animation: slideInUp 300ms ease-in-out both;
}
</style>
