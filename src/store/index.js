import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import ontology from './ontology';
import scatter from './scatter';
import { getAuth, getUser } from '@/api';

Vue.use(Vuex);

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */

export default new Vuex.Store({
  // plugins: [createPersistedState()],
  modules: {
    ontology,
    scatter,
  },
  state: {
    userConfig: {
      blockchin: null,
    },
    userInfo: {
      nickname: '',
    },
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
      nickname: state.userInfo.nickname,
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
    async idCheckandgetAuth({
      commit, dispatch, state, getters,
    }, { EOS, ONT }) {
      const noId = (error) => {
        console.warn('Unable to get id, reason :', error);
        throw error;
      };

      const { blockchin } = state.userConfig;
      if (!blockchin) { // 1st time
        if (!EOS && !ONT) { // 不該到這
          EOS = true;
          ONT = true;
        } else commit('setUserConfig', { EOS, ONT });
      } else if (!EOS && !ONT) {
        EOS = blockchin === 'EOS';
        ONT = blockchin === 'ONT';
      }

      console.log('Start id check ...');
      console.info('Ontology status :', state.ontology.account);
      console.info('Scatter connect status :', state.scatter.isConnected);
      if (getters.currentUserInfo.name) {
        console.log('Id check pass, id :', getters.currentUserInfo);
        try { // 更新 Auth
          await getAuth();
        } catch (error) {
          console.error('getAuth error:', error.message);
          throw new Error('更新 Auth 失敗');
        }
        return true;
      }

      // Scatter
      if (EOS) {
        try {
          if (!state.scatter.isConnected) {
            const result = await dispatch('scatter/connect');
            if (!result) throw new Error('faild connect to scatter');
          }
          if (state.scatter.isConnected && !state.scatter.isLoggingIn) {
            const result = await dispatch('scatter/login');
            if (!result) new Error('scatter login faild');
          }
        } catch (error) {
          console.warn(error);
        }
      }
      // Ontology
      if (ONT) {
        try {
          if (!state.ontology.account) {
            const address = await dispatch('ontology/getAccount');
            let balance = null;
            try {
              balance = await dispatch('ontology/getBalance');
            } catch (error) {
              console.warn('Failed to get balance :', error);
            }
            console.info('ONT address :', address, 'balance :', balance);
          }
        } catch (error) {
          console.warn('Failed to get ONT account :', error);
        }
      }

      if (getters.currentUserInfo.name) {
        console.log('Id check pass, id :', getters.currentUserInfo);
        try { // 更新 Auth
          await getAuth();
        } catch (error) {
          console.error('getAuth error:', error.message);
          throw new Error('更新 Auth 失敗');
        }
        return true;
      }

      throw new Error('Unable to get id');
    },
    async recordShare({ dispatch, getters }, { amount, signId, sponsor = null }) {
      const { blockchain } = getters.currentUserInfo;
      let actionName = null;
      // eslint-disable-next-line no-constant-condition
      if (false && blockchain === 'EOS') actionName = 'scatter/recordShare';
      else if (blockchain === 'ONT') actionName = 'ontology/recordShare';
      return dispatch(actionName, { amount, signId, sponsor });
    },
    async getUser({ commit, getters }) {
      const { data } = await getUser({ username: getters.currentUserInfo.name });
      console.log(data);
      commit('setNickname', data.nickname);
      return data;
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
  mutations: {
    setUserConfig(state, config) {
      state.userConfig.blockchin = config.EOS ? 'EOS' : 'ONT';
    },
    setNickname(state, nickname) {
      state.userInfo.nickname = nickname;
    },
  },
});
