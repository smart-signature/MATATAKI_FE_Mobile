<template>
  <div class="draftbox">
    <za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">关注列表</div>
    </za-nav-bar>
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <div v-if="lists[tab.listname].length == 0" style="margin-top:20px;">
          无记录
        </div>
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="loading">
          <div class="content">
            <div v-for="(item, index) in lists[tab.listname]" :key="index">
              <div class="onecard" @click="jumpToUser(item.followed || item.username)">
                <Row>
                  <Col span="3"><img width="33px" class="onecard_pic" src="../../assets/logo.png"/></Col>
                  <Col span="21">
                    <Col span="18">
                      <div class="onecard_title">{{item.followed || item.username}}</div>
                      <div class="onecard_date">{{item.fans}}粉丝</div>
                    </Col>
                    <!-- <Col span="6">
                      <img width="16px" class="onecard_rightpic" @click="ClickRightIcon" src="../../assets/logo.png">
                    </Col> -->
                    <Divider style="margin-top:56px;margin-bottom:0px;"/>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </za-pull>
      </za-tab-pane>
    </za-tabs>
    <!-- 弹出框确认 -->
    <za-actionsheet :visible.sync='clickicon' :actions='actions2'></za-actionsheet>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getFollowList, getFansList, getUser } from '@/api/backend';

export default {
  name: 'DeaftBox',
  props: ['listtype', 'username'],
  data() {
    return {
      lists: {
        followlist: [],
        fanslist: [],
      },
      actions2: [{
        theme: 'error',
        text: '取消关注',
        onClick: () => console.log('取消关注'),
      }],
      clickicon: false,
      activeNameSwipe: '粉丝',
      refreshing: false,
      loading: false,
      tabs: [
        {
          label: '粉丝',
          listname: 'fanslist',
        },
        {
          label: '关注',
          listname: 'followlist',
        },
      ],
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
    jumpToUser(username) {
      this.$router.push({ name: 'User', params: { username } });
    },
    async RefreshList() {
      this.refreshing = true;
      this.loading = true;
      if (this.activeNameSwipe == '关注') {
        getFollowList({ username: this.username }, (error, response, body) => {
          console.log(body.list);
          this.lists.followlist = body.list || [];
          if (response.statusCode != 200) {
            this.$Notice.error({
              title: '获取失败',
            });
          }
          this.refreshing = false;
          this.loading = false;
        });
      } else {
        getFansList({ username: this.username }, (error, response, body) => {
          console.log(body.list);
          this.lists.fanslist = body.list || [];
          if (response.statusCode != 200) {
            this.$Notice.error({
              title: '获取失败',
            });
          }
          this.refreshing = false;
          this.loading = false;
        });
      }
    },
    async refresh() {
      this.RefreshList();
    },
    handleClick(tab, event) {
      this.RefreshList();
      console.log(tab.label);
    },
  },
  async created() {
    this.activeNameSwipe = this.listtype || '关注';
    await this.RefreshList();
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
