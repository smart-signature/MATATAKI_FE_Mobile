<template>
    <div class="asset mw">
        <BaseHeader :pageinfo="{ left: 'back', title: `账户`, rightPage: 'home', needLogin: false, }"/>
        <div class="asset-list">
            <div class="list" v-for="(item, index) in assetList" :key="index" @click="jumpTo(index)">
               <div>
                    <span class="list-type">{{item.type}}</span>
                    <span
                    class="list-status "
                    :class="item.status && 'bind'"
                    >
                    {{item.status ? '已绑定' : '未绑定'}}
                    </span>
               </div>
               <div class="list-right">
                   <template v-if="item.status">
                       <div>
                          <p class="list-right-text withdraw"><span>{{item.withdraw}}</span>待提现</p>
                          <p class="list-right-text total">{{item.total}}总收益</p>
                       </div>
                   </template>
                    <template v-else>
                        <p class="list-right-unbind">暂未推出,敬请期待</p>
                    </template>
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
        {
          type: 'EOS',
          status: true,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'ONT',
          status: false,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'ETH',
          status: false,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'BTC',
          status: false,
          withdraw: 0,
          total: 0,
        },
        {
          type: 'RMB',
          status: false,
          withdraw: 0,
          total: 0,
        },
      ],
    };
  },
  created() {
    this.getAssets(this.username);
    this.getPlayerTotalIncome(this.username);
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
    // 获取历史总收入 暂时没有接口 先用已有的接口数据  -- copy from /user/index.vue
    async getAssets(username) {
      await getAssets(username, 1).then((res) => {
        if (res.status === 200) {
          // 手动指定第一个list
          this.assetList[0].total = (res.data.totalSignIncome + res.data.totalShareIncome) / 10000;
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
      this.assetList[0].withdraw = isEmptyArray(playerincome)
        ? (playerincome[0].share_income + playerincome[0].sign_income) / 10000
        : 0;
      // 截止2019年3月24日中午12时合约拿过来的东西要除以10000才能正常显示
    },
  },
};
</script>

<style lang="less" scoped src="./index.less"></style>
