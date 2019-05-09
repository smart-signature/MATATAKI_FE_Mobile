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
    currentUsername: (state, { 'scatter/currentUsername': scatterUsername }) => (
      scatterUsername || (state.ontology.account || null)
    ),
    currentBalance: (state, {
      'scatter/currentUsername': scatterUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => (
      scatterUsername
        ? scatterBalance
        : (state.ontology.account ? ontologyBalance : '... XXX')
    ),
    isLogined: (state, { currentUserInfo }) => currentUserInfo.name !== null,
  },
  actions: {
    // output: { publicKey, signature, username }
    async getSignatureOfArticle({ dispatch, getters }, { author, hash }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      if (blockchain === 'EOS') actionName = 'scatter/getSignatureOfArticle';
      else if (blockchain === 'ONT') actionName = 'ontology/getSignatureOfArticle';
      return dispatch(actionName, { author, hash });
    },
    async getSignatureOfAuth({ dispatch, getters }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      if (blockchain === 'EOS') actionName = 'scatter/getSignatureOfAuth';
      else if (blockchain === 'ONT') actionName = 'ontology/getSignatureOfAuth';
      return dispatch(actionName);
    },
    async idCheck({
      dispatch, state, getters,
    }) {
      const {
        isConnected: isScatterConnected,
        isLoggingIn: isScatterLoggingIn,
      } = state.scatter;
      const {
        account: isOntologyConnected,
      } = state.ontology;
      const noId = (error) => {
        console.warn('Unable to get id, reason :', error);
        throw error;
      };

      console.log('Start id check ...');
      if (getters.currentUserInfo.name) {
        console.log('Id check pass, id :', getters.currentUserInfo);
        return true;
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
        else return true;
      }
    },
    async recordShare({ dispatch, getters }, { amount, signId, sponsor = null }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      if (false && blockchain === 'EOS') actionName = 'scatter/recordShare';
      else if (blockchain === 'ONT') actionName = 'ontology/recordShare';
      return dispatch(actionName, { amount, signId, sponsor });
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
          let balance = null;
          try {
            balance = await dispatch('ontology/getBalance');
          } catch (error) {
            console.warn('Failed to get balance :', error);
          }
          console.info('ONT address :', address, 'balance :', balance);
          meg += `ONT address : ${address}\n`;
        } catch (error) {
          console.warn('Failed to get ONT account :', error);
        }
      }
      return meg;
    },
  },
});
