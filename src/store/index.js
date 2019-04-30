import Vue from 'vue';
import Vuex from 'vuex';
import ontology from './ontology';
import scatter from './scatter';

Vue.use(Vuex);

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */

export default new Vuex.Store({
  modules: {
    ontology,
    scatter,
  },
  getters: {
    // rule: 帳號優先級 EOS > ONT
    // rule: EOS 帳號最長 12 位， ONT 帳號(地址)一定是 20 位
    currentUserInfo: (state, { currentUsername, currentBalance }) => ({
      name: currentUsername,
      balance: currentBalance,
      blockchain: currentUsername
        ? (currentUsername.length <= 12 ? 'EOS' : 'ONT')
        : null,
    }),
    currentUsername: (state, { 'scatter/currentUsername': scatter }) => (
      scatter || (state.ontology.account || null)
    ),
    currentBalance: (state, {
      'scatter/currentUsername': scatterUsername,
      'ontology/currentUsername': ontologyUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => (
      scatterUsername
        ? scatterBalance
        : (ontologyUsername ? ontologyBalance : '... XXX')
    ),
    isLogined: (state, { currentUserInfo }) => currentUserInfo.name !== null,
  },
  actions: {
    // output: { publicKey, signature, username }
    async getSignatureOfArticle({
      commit, dispatch, state, getters,
    }, { author, hash }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      if (blockchain === 'EOS') actionName = 'scatter/getSignatureOfArticle';
      else if (blockchain === 'ONT') actionName = 'ontology/getSignatureOfArticle';
      return dispatch(actionName, { author, hash });
    },
    async idCheck({
      commit, dispatch, state, getters,
    }) {
      await new Promise(async (resolve, reject) => {
        const { ontology, scatter } = state;
        const {
          isConnected: isScatterConnected,
          isLoggingIn: isScatterLoggingIn,
        } = scatter;
        const {
          account: isOntologyConnected,
        } = ontology;

        const noId = (error) => {
          console.warn('Unable to get id, reason :', error);
          reject(error);
        };

        console.log('Start id check ...');
        if (getters.currentUserInfo.name) {
          console.log('Id check pass, id :', getters.currentUserInfo.name);
          resolve(true);
          return;
        }
        console.info('Ontology status :', isOntologyConnected);
        console.info('Scatter status :', isScatterConnected);
        // 場景：開了網頁之後才解鎖 Scatter
        // 這時候沒有執行 connectScatter 就登录不能
        if (!isScatterConnected) {
          const result = await dispatch('scatter/connect');
          if (!result) noId(new Error('faild connect to scatter'));
        }
        if (isScatterConnected && !isScatterLoggingIn) {
          const result = await dispatch('scatter/login');
          if (!result) noId(new Error('scatter login faild'));
          else resolve(true);
        }
      });
    },
    async walletConnectionSetup({ dispatch }, { EOS, ONT }) {
      let meg = '';
      if (EOS) {
        try {
          await dispatch('scatter/connect');
          // if (!this.scatterAccount) await this.loginScatterAsync();
        } catch (error) {
          console.warn('Unable to connect Scatter wallets :', error);
        }
      }
      if (ONT) {
        try {
          const address = await dispatch('ontology/getAccount');
          console.info('ONT address :', address);
          meg += `ONT address : ${address}\n`;
        } catch (error) {
          console.warn('Failed to get ONT account :', error);
        }
      }
      return meg;
    },
  },
});
