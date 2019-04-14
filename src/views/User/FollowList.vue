<template>
  <div class="draftbox">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">关注列表</div>
    </za-nav-bar>
    <div v-if="followlist.length == 0" style="margin-top:20px;">
      无记录
    </div>
    <div v-for="(item, index) in followlist" :key="index">
      <div class="onecard">
        <Row>
          <Col span="3"><img width="33px" class="onecard_pic" src="../../assets/logo.png"/></Col>
          <Col span="21">
            <Col span="18">
              <div class="onecard_title">{{item.name}}</div>
              <div class="onecard_date">{{item.fans}}粉丝</div>
            </Col>
            <Col span="6">
              <img width="16px" class="onecard_rightpic" @click="ClickRightIcon" src="../../assets/logo.png">
            </Col>
            <Divider style="margin-top:56px;margin-bottom:0px;"/>
          </Col>
        </Row>
      </div>
    </div>
    <za-actionsheet :visible.sync='clickicon'
      :actions='actions2'
      @cancel='cancelCb'>
    </za-actionsheet>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'DeaftBox',
  data() {
    return {
      followlist: [
        {
          name: '画夜夜的鹿角',
          fans: '73',
        },
        {
          name: '小岛美奈子',
          fans: '2.4w',
        },
      ],
      actions2: [{
        theme: 'error',
        text: '取消关注',
        onClick: () => console.log('取消关注'),
      }],
      clickicon: false,
    };
  },
  computed: {
    ...mapGetters(['currentUsername']),
    ifLogined() {
      return this.currentUsername !== null;
    },
    isMe() {
      const { username, currentUsername } = this;
      return username === currentUsername;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    ClickRightIcon() {
      this.clickicon = true;
    },
    cancelCb(reason, event) {
      console.log(reason, event);
    },
  },
};
</script>
<style>
a {
  color: #000;
  text-decoration: none; /* no underline */
}
.onecard{
  text-align: left;
  margin: 18px;
  height: 47px;
}
.onecard_pic{
  margin-top: 5px;
}
.onecard_title{
  font-size: 18px;
  font-weight:normal;
}
.onecard_date{
  font-size: 12px;
  opacity: 0.4;
}
.onecard_rightpic{
  margin-top :14px;
  margin-right: 4px;
  float:right;
}
.draftbox{
  /* background-color: #F7F7F7; */
  padding-bottom: 20px;
}
</style>
