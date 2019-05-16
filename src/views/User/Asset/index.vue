<template>
    <div class="asset mw">
        <BaseHeader :pageinfo="{ left: 'back', title: `我的账户`, rightPage: 'home', needLogin: false, }"/>
        <div class="asset-list">
            <div class="list" v-for="(item, index) in assetList" :key="index" @click="jumpTo(index)">
               <div class="list-left">
                    <img class="list-icon" :src="item.imgUrl" :alt="item.type" />
                    <span class="list-type" :class="item.status || 'unbind'">{{item.type}}</span>
               </div>
               <div class="list-right">
                   <template v-if="item.status">
                       <div>
                          <p class="list-right-text withdraw"><span>{{item.withdraw}}</span>待提现</p>
                          <p class="list-right-text total">{{item.total}}总收益</p>
                       </div>
                   </template>
                    <template v-else>
                        <p class="list-right-unbind">即将上线,敬请期待</p>
                    </template>
                    <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="">
               </div>
            </div>
        </div>
        <!-- 暂未支持的币种 -->
        <div class="asset-list">
            <div class="list" v-for="(item, index) in assetOtherList" :key="index">
               <div class="list-left">
                    <img class="list-icon" :src="item.imgUrl" :alt="item.type" />
                    <span class="list-type" :class="item.status || 'unbind'">{{item.type}}</span>
               </div>
               <div class="list-right">
                   <template v-if="item.status">
                       <div>
                          <p class="list-right-text withdraw"><span>{{item.withdraw}}</span>待提现</p>
                          <p class="list-right-text total">{{item.total}}总收益</p>
                       </div>
                   </template>
                    <template v-else>
                        <p class="list-right-unbind">即将上线,敬请期待</p>
                    </template>
                    <img class="arrow" src="@/assets/img/icon_arrow.svg" alt="">
               </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getAssets, getBalance } from '@/api';
import { getPlayerIncome } from '@/api/signature';
import { isEmptyArray } from '@/common/methods';
import { mapGetters } from 'vuex';


export default {
  name: 'Asset',
  props: ['username'],
  data() {
    return {
      assetList: [
        {
          type: 'EOS',
          imgUrl: require('../../../assets/img/icon_EOS.svg'),
          status: true,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'ONT',
          imgUrl: require('../../../assets/img/icon_ONT.svg'),
          status: true,
          withdraw: 0,
          total: 0,
        },
      ],
      // 暂未支持的币种
      assetOtherList: [
        {
          type: 'ETH',
          imgUrl: require('../../../assets/img/icon_ETH.svg'),
          status: false,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'BTC',
          imgUrl: require('../../../assets/img/icon_BTC.svg'),
          status: false,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'RMB',
          imgUrl: require('../../../assets/img/icon_RMB.svg'),
          status: false,
          withdraw: 0,
          total: 0,
        },
      ],
    };
  },
  computed: {
    ...mapGetters(['currentUserInfo']),
  },
  created() {
    this.getBalance();
    const { blockchain } = this.currentUserInfo;
    // EOS
    // 如果是EOS账号从链上查询余额
    if (blockchain === 'EOS') {
      this.getPlayerTotalIncome(this.username);
    }
  },
  methods: {
    jumpTo(index) {
      if (!this.assetList[index].status) return;
      this.$router.push({
        name: 'AssetType',
        params: {
          type: this.assetList[index].type,
        },
      });
    },
    // 获取可提现 暂时没有接口 先用已有的接口数据 -- copy from /user/asset/asset.vue
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      // 手动指定第一个list
      this.assetList[0].withdraw = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
    // 获取账户资产列表 暂时没有EOS数据
    async getBalance() {
      await getBalance().then((res) => {
        if (res.status === 200 && res.data.code === 0) {
          if (res.data.data.length === 0) return;
          // 筛选数据
          const filterArr = symbol => res.data.data.filter(i => (i.symbol === symbol));
          const filterArrONT = filterArr('ONT');
          const filterArrEOS = filterArr('EOS');

          const { blockchain } = this.currentUserInfo;
          // 如果不是是EOS账号使用接口余额
          if (blockchain !== 'EOS') {
            if (filterArrEOS.length !== 0) { // eos
              this.assetList[0].withdraw = filterArrEOS[0].amount / 10000;
            }
          }

          if (filterArrEOS.length !== 0) { // eos
            this.assetList[0].total = filterArrEOS[0].totalIncome / 10000;
          }

          if (filterArrONT.length !== 0) { // ont
            this.assetList[1].withdraw = filterArrONT[0].amount;
            this.assetList[1].total = filterArrONT[0].totalIncome;
          }
        } else {
          this.$toasted.show(`${res.data.message}`, {
            position: 'top-center',
            duration: 1000,
            fitToScreen: true,
          });
        }
      }).catch((err) => {
        console.log(err);
        this.$toasted.show('获取数据失败', {
          position: 'top-center',
          duration: 1000,
          fitToScreen: true,
        });
      });
    },
  },
};
</script>

<style lang="less" scoped src="./index.less"></style>
