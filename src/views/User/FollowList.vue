<template>
  <div class="draftbox">
    <BaseHeader
            :pageinfo="{ left: 'back', title: '关注列表', rightPage: 'home',
                   needLogin: false, }"/>
    <!--<za-nav-bar>
      <div slot="left">
        <za-icon theme="primary" type="arrow-left" @click="goBack"></za-icon>
      </div>
      <div slot="title">关注列表</div>
    </za-nav-bar>-->
    <za-tabs v-model="activeNameSwipe" @change="handleClick">
      <za-tab-pane :label="tab.label" :name="tab.label" v-for="tab in tabs" :key="tab.label">
        <div v-if="lists[tab.listname].length == 0" style="margin-top:20px;">无记录</div>
        <za-pull :on-refresh="refresh" :refreshing="refreshing" :loading="loading">
          <div class="content">
            <div v-for="(item, index) in lists[tab.listname]" :key="index">
              <div v-if="item.followed !== '' && item.username !== ''"
                class="onecard" @click="jumpToUser( item.username )">
                <Row>
                  <Col span="3">
                    <img width="33px" class="onecard_pic" :src="item.avatar">
                  </Col>
                  <Col span="21">
                    <Col span="18">
                      <div class="onecard_title">{{item.followed}}</div>
                      <div class="onecard_date">{{item.fans}}粉丝</div>
                    </Col>
                    <!-- <Col span="6">
                      <img width="16px" class="onecard_rightpic"
                        @click="ClickRightIcon" src="../../assets/logo.png">
                    </Col>-->
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
    <za-actionsheet :visible.sync="clickicon" :actions="actions2"></za-actionsheet>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import {
  getFollowList,
  getFansList,
  getUser,
  getAvatarImage,
} from '@/api/backend';

export default {
  name: 'DeaftBox',
  props: ['listtype', 'username', 'avatar'],
  data() {
    return {
      lists: {
        followlist: [],
        fanslist: [],
      },
      actions2: [
        {
          theme: 'error',
          text: '取消关注',
          onClick: () => console.log('取消关注'),
        },
      ],
      clickicon: false,
      activeNameSwipe: '粉丝',
      refreshing: false,
      loading: false,
      avatarloading: true,
      tabs: [
        {
          label: '关注',
          listname: 'followlist',
        },
        {
          label: '粉丝',
          listname: 'fanslist',
        },
      ],
    };
  },
  watch: {

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
        getFollowList({ username: this.username }, async ({ error, response }) => {
          console.log(error, response);
          const list = response.data.list || [];
          if (response.status !== 200) {
            this.$Notice.error({
              title: '获取失败',
            });
          } else {
            for (const index in list) {
              list[index].username = list[index].followed;
              if (this.lists.followlist[index] === undefined) list[index].avatar = require('../../assets/logo.png');
              await this.getUserData(list, index);
            }
            this.lists.followlist = list;
          }
          this.refreshing = false;
          this.loading = false;
        });
      } else {
        getFansList({ username: this.username }, async ({ error, response }) => {
          const list = response.data.list || [];
          if (response.status !== 200) {
            this.$Notice.error({
              title: '获取失败',
            });
          } else {
            for (const index in list) {
              list[index].followed = list[index].username;
              if (this.lists.fanslist[index] === undefined) list[index].avatar = require('../../assets/logo.png');
              await this.getUserData(list, index);
            }
            this.lists.fanslist = list;
          }
          this.refreshing = false;
          this.loading = false;
        });
      }
    },
    async getAvatarImage(hash, list, index) {
      if (hash && hash !== '') {
        try {
          const response = await getAvatarImage(hash);
          // .then(response => {
          // this.avatarloading = false;
          list[index].avatar = `data:image/png;base64,${btoa(
            new Uint8Array(response.data).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )}`;
          // this.avatarloading = true;
        } catch (e) {
          console.log(e);
          list[index].avatar = require('../../assets/logo.png');
        }
      } else {
        list[index].avatar = require('../../assets/logo.png');
      }
    },
    async getUserData(list, index) {
      const { username } = list[index];
      try {
        const response = await getUser({ username });
        const { data } = response;
        list[index].followed = data.nickname === '' ? username : data.nickname;
        await this.getAvatarImage(data.avatar, list, index);
      } catch (e) {
        console.log(e);
      }
    },
    async refresh() {
      this.RefreshList();
    },
    handleClick() {
      this.RefreshList();
      // console.log(tab.label);
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
.onecard {
  text-align: left;
  margin: 18px;
  height: 47px;
}
.onecard_pic {
  margin-top: 5px;
}
.onecard_title {
  font-size: 18px;
  font-weight: normal;
}
.onecard_date {
  font-size: 12px;
  opacity: 0.4;
}
.onecard_rightpic {
  margin-top: 14px;
  margin-right: 4px;
  float: right;
}
.draftbox {
  /* background-color: #F7F7F7; */
  padding-bottom: 20px;
}
</style>
