<template>
    <div class="asset mw">
        <BaseHeader :pageinfo="{ left: 'back', title: `我的账户`, rightPage: 'home', needLogin: false, }"/>
        <div class="asset-list" v-for="(itemAssetList, index) in assetList" :key="index">
            <div class="list" v-for="(item, itemIndex) in itemAssetList" :key="itemIndex" @click="jumpTo(index, itemIndex)">
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
import { getAssets } from '@/api';
import { getPlayerIncome } from '@/api/signature';
import { isEmptyArray } from '@/common/methods';


export default {
  name: 'Asset',
  props: ['username'],
  data() {
    return {
      assetList: [
        [
          {
            type: 'EOS',
            imgUrl: require('../../../assets/img/icon_EOS.svg'),
            status: true,
            withdraw: 0,
            total: 0,
          },
          {
            type: 'ONT',
            imgUrl: require('../../../assets/img/icon_ONT.png'),
            status: false,
            withdraw: 0,
            total: 0,
          },
        ],
        [
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
      ],
    };
  },
  created() {
    this.getAssets(this.username);
    this.getPlayerTotalIncome(this.username);
  },
  methods: {
    jumpTo(index, itemIndex) {
      if (!this.assetList[index][itemIndex].status) return;
      this.$router.push({
        name: 'AssetType',
        params: {
          type: this.assetList[index][itemIndex].type,
        },
      });
    },
    // 获取历史总收入 暂时没有接口 先用已有的接口数据  -- copy from /user/index.vue
    async getAssets(username) {
      await getAssets(username, 1).then((res) => {
        if (res.status === 200) {
          // 手动指定第一个list
          this.assetList[0][0].total = (res.data.totalSignIncome + res.data.totalShareIncome) / 10000;
        }
      }).catch((err) => {
        console.log(err);
        this.$Message.error('获取历史收入错误请重试');
      });
    },
    // 获取可提现 暂时没有接口 先用已有的接口数据 -- copy from /user/asset/asset.vue
    async getPlayerTotalIncome(name) {
      console.log('Connecting to EOS fetch player income...');
      const playerincome = await getPlayerIncome(name); // 从合约拿到支持收入和转发收入
      // 手动指定第一个list
      this.assetList[0][0].withdraw = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
  },
};
</script>

<style lang="less" scoped src="./index.less"></style>
