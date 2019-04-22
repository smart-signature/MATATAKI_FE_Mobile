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
    currentUserInfo: (state, { currentUsername, currentBalance }) => ({
      name: currentUsername,
      balance: currentBalance,
      blockchain: null,
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
    async getSignature({ commit, dispatch, state, getters }, { author, hash }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      if (blockchain === 'ONT') actionName = 'ontology/getSignature';
      // todo:
      // else if (blockchain === 'EOS') actionName = 'ontology/getSignature';
      await dispatch(actionName, { author, hash });
    },
    async idCheck({ commit, dispatch, state, getters }) {
      await new Promise(async (resolve, reject) => {
        const { ontology, scatter } = state;
        const {
          isConnected: isScatterConnected,
          isLoggingIn: isScatterLoggingIn
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
          await dispatch('scatter/login').catch((error) => { noId(error) });
        }
      });
    },
    async walletConnectionSetup() {
    },
  },
});
