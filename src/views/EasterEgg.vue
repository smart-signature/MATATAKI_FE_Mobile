<template>
    <div class="easter-egg">
        <h1 class="title">🎉 恭喜你发现了隐藏的彩蛋！</h1>
        <p>当前模式：{{env}}</p>
        <p>版本号： {{ version }}</p>
        <p v-if="checkIsBuildOnCommit">基于 commit <a :href="commitUrl">{{ commitHash }} </a> 构建</p>
        <Button @click="recordShareTest">recordShareTest</Button>
        <Button @click="show">show</Button>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import API from '@/api/ontology';
import { ontology } from '@/config';

export default {
  name: 'Easter-Egg',
  computed: {
    ...mapGetters(['currentUserInfo']),
    env() {
      return process.env.NODE_ENV;
    },
    version() {
      return process.env.VUE_APP_VERSION;
    },
    commitHash() {
      return process.env.VUE_APP_COMMIT_HASH;
    },
    checkIsBuildOnCommit() {
      // undefined will be stringify to "undefined"
      // Ref: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/util/resolveClientEnv.js#L1
      return this.commitHash !== 'undefined';
    },
    commitUrl() {
      return `https://github.com/smart-signature/smart-signature-future/commit/${this.commitHash}`;
    },
  },
  methods: {
    ...mapActions(['recordShare']),
    async recordShareTest() {
      console.info('currentUserInfo :', this.currentUserInfo);
      this.show();
      const transaction = await this.recordShare({ amount: 1, signId: '666' });
      console.log('transaction :', transaction);
      this.show();
    },
    async show() {
      // console.info('currentUserInfo :', this.currentUserInfo);
      // const balance = await API.getBalance({ address: 'AUZ27HUQt66H4g8MnEURNZvmSSpH9ZqKXz' });
      // console.log('AUZ27HUQt66H4g8MnEURNZvmSSpH9ZqKXz', ' :', balance);
      const address = 'AbU4AyDhukbj4EFb4fX633th144Rg2sG9A';
      const url = process.env.NODE_ENV === 'production' 
          ? `https://${ontology.currentUsingNode}:10334`
          : `http://${ontology.currentUsingNode}:20334`;
      const response = await fetch(`${url}/api/v1/balance/${address}`);
      console.debug(response);
      const { Result } = await response.json();
      // console.debug(Result);
      const { ong: ONG, ont: ONT } = Result;
      console.debug({ ONG, ONT });
    },
  },
};
</script>
