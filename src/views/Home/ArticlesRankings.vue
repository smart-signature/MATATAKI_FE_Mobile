<template>
  <div class="mw">
      <div class="head">
          <Dropdown trigger="click" @on-click="dropdownClick" class="dropdown">
            <span class="dropdown-text">
                {{tabsData[activeIndex].label}}
                <Icon class="dropdown-icon" size="22" type="md-arrow-dropdown" />
            </span>
            <DropdownMenu slot="list">
                <DropdownItem class="dropdown-list" v-for="(item, index) in tabsData" :key="index" :name="index">{{item.label}}</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <!-- <span class="des">规则介绍<Icon type="ios-arrow-forward" /></span> -->
      </div>
      <BasePull
        :params="item.params"
        :apiUrl="item.apiUrl"
        :activeIndex="activeIndex"
        :nowIndex="index"
        @getListData="getListData"
        v-for="(item, index) in tabsData"
        :key="index"
        v-show="index === activeIndex"
        >
          <ArticleCard :article="item" v-for="(item, index) in item.articles" :key="index"/>
      </BasePull>
  </div>

</template>

<script>
import { ArticleCard } from '@/components/';

export default {
  name: 'ArticlesRankings',
  components: { ArticleCard },
  data() {
    return {
      tabsData: [
        {
          label: '发布时间',
          params: {},
          apiUrl: 'posts',
          articles: [],
        },
        {
          label: '赞赏金额',
          params: {},
          apiUrl: 'getSupportAmountRanking',
          articles: [],
        },
        {
          label: '赞赏次数',
          params: {},
          apiUrl: 'getSupportTimesRanking',
          articles: [],
        },
      ],
      activeIndex: 0,
    };
  },
  created() {},
  methods: {
    getListData(res) {
      this.tabsData[res.index].articles = res.data;
    },
    dropdownClick(name) {
      console.log(name);
      this.activeIndex = name;
    },
  },

};
</script>

<style lang="less" scoped>
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px 0 20px;
  .dropdown-text {
    font-size:14px;
    font-family:PingFangSC-Semibold;
    font-weight:600;
    color:#494949;
    line-height:18px;
    letter-spacing:1px;
  }
  .dropdown-icon {
    color: #AFAFAF;
    margin-left: -6px;
  }
}

.dropdown-list {
  position: relative;
  &:nth-child(n+2):after {
    content: '';
    display: block;
    position: absolute;
    height: 1px;
    top: 0;
    left: 20px;
    right: 20px;
    background-color: #F4F4F4;
  }
}
</style>
