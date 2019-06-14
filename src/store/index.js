import Vue from 'vue';
import Vuex from 'vuex';
import ontology from './ontology';
import scatter from './scatter';
import github from './github';
import {
  backendAPI, disassembleToken, getCurrentAccessToken, setAccessToken,
} from '@/api';

if (!window.Vue) Vue.use(Vuex);

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */
export default new Vuex.Store({
  modules: {
    ontology,
    scatter,
    github,
  },
  state: {
    userConfig: {
      // Identity Provider, IdP
      idProvider: null,
    },
    userInfo: {
      accessToken: null,
      nickname: '',
    },
  },
  getters: {
    currentUserInfo: ({ userConfig: { idProvider }, userInfo }, {
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => {
      let balance = null;
      if (idProvider === 'EOS') {
        balance = scatterBalance;
      } else if (idProvider === 'ONT') {
        balance = ontologyBalance;
      } else if (idProvider === 'GitHub') {
        balance = null;
      }
      const { id, iss: name } = disassembleToken(userInfo.accessToken);
      return {
        id, idProvider, name, balance, ...userInfo,
      };
    },
    //  displayName.length <= 12 ? name : name.slice(0, 12);
    displayName: ({ userInfo }, { currentUserInfo }) => userInfo.nickname || currentUserInfo.name,
    isLogined: ({ userInfo: { accessToken } }) => accessToken !== null,
    isMe: (state, { currentUserInfo: { id } }) => target => id === target,
    prefixOfType: ({ userConfig: { idProvider } }) => {
      if (idProvider === 'EOS') return 'scatter';
      if (idProvider === 'ONT') return 'ontology';
      return null;
    },
  },
  actions: {
    async getAuth({ dispatch, getters: { currentUserInfo } }, name = null) {
      if (!name) throw new Error('no name');
      let { accessToken } = currentUserInfo;
      const { exp, iss } = disassembleToken(accessToken);
      if (!iss || iss !== name || exp < new Date().getTime()) {
        try {
          console.log('Retake authtoken...');
          const { data } = await backendAPI.auth(await dispatch('getSignatureOfAuth', { name }));
          accessToken = data;
        } catch (error) {
          console.warn('取得 access token 出錯', error);
          throw error;
        }
      }
      return accessToken;
    },
    // output: { publicKey, signature, username }
    async getSignature({ dispatch, getters }, data = { mode: null, rawSignData: null }) {
      // console.debug(getters.currentUserInfo, data.mode, data.rawSignData);
      const { currentUserInfo, prefixOfType } = getters;
      const { idProvider } = currentUserInfo;
      return { idProvider, ...(await dispatch(`${prefixOfType}/getSignature`, data)) };
    },
    async getSignatureOfArticle({ dispatch }, { author, hash }) {
      return dispatch('getSignature', { mode: 'Article', rawSignData: [author, hash] });
    },
    async getSignatureOfAuth({ dispatch }, { name = null }) {
      return dispatch('getSignature', { mode: 'Auth', rawSignData: [name] });
    },
    async signIn({
      commit, dispatch, state, getters,
    }, { code = null, idProvider = null, accessToken = null }) {
      if (!idProvider) throw new Error('did not choice idProvider');
      commit('setUserConfig', { idProvider });
      
      console.debug('debug :', code, idProvider, accessToken);
      // recover
      if (accessToken) {
        commit('setAccessToken', accessToken);
        if (idProvider === 'GitHub') return true;
      }

      const errorFailed = new Error(`Unable to get ${idProvider}'s id`);
      const { prefixOfType } = getters;
      // Scatter
      if (idProvider === 'EOS') {
        try {
          if (!state.scatter.isConnected) {
            const result = await dispatch(`${prefixOfType}/connect`);
            if (!result) throw new Error('Scatter: connection failed');
          }
          if (!state.scatter.isLoggingIn) {
            const result = await dispatch(`${prefixOfType}/login`);
            if (!result) throw new Error('Scatter: login failed');
          }
          accessToken = await dispatch('getAuth', getters[`${prefixOfType}/currentUsername`]);
        } catch (error) {
          console.error(error);
          throw errorFailed;
        }
      }
      // Ontology
      else if (idProvider === 'ONT') {
        try {
          if (!state.ontology.account) await dispatch(`${prefixOfType}/getAccount`);
          try {
            await dispatch('ontology/getBalance');
          } catch (error) {
            console.warn('Ontology: Failed to get balance :', error);
          }
          accessToken = await dispatch('getAuth', state.ontology.account);
        } catch (error) {
          console.error(error);
          throw errorFailed;
        }
      }
      // GitHub
      else if (idProvider === 'GitHub') {
        try {
          accessToken = await dispatch(`${prefixOfType}/signIn`, { code });
        } catch (error) {
          console.error('GitHub: signIn Failed.', error);
          throw errorFailed;
        }
      }
      commit('setAccessToken', accessToken);
      localStorage.setItem('idProvider', state.userConfig.idProvider);
    },
    async makeShare({ dispatch, getters, state: { userConfig: { idProvider } } }, share) {
      share.idProvider = idProvider;
      if (idProvider === 'EOS') {
        share.contract = 'eosio.token';
        share.symbol = 'EOS';
      } else if (idProvider === 'ONT') {
        share.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        share.symbol = 'ONT';
      }
      await dispatch(`${getters.prefixOfType}/recordShare`, share);
      return backendAPI.reportShare(share);
    },
    async getCurrentUser({ commit, getters: { currentUserInfo } }) {
      const { data: { data } } = await backendAPI.getUser({ id: currentUserInfo.id });
      console.info(data);
      commit('setNickname', data.nickname);
      return data;
    },
    signOut({ commit, dispatch, getters: { prefixOfType } }) {
      dispatch(`${prefixOfType}/logout`);
      commit('setUserConfig');
      commit('setAccessToken');
      commit('setNickname');
      localStorage.clear();
    },
    // data: { amount, toaddress, memo }
    async withdraw({ dispatch, getters }, data) {
      console.debug(data);
      // 根据传进来的mode判断提现什么币
      if (data.tokenName === 'EOS') {
        data.contract = 'eosio.token';
        data.symbol = 'EOS';
        data.idProvider = 'eos';
      } else if (data.tokenName === 'ONT') {
        data.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        data.symbol = 'ONT';
        data.idProvider = 'ont';
      }
      data.amount *= 10000; // 前端统一*10000

      const {
        amount, contract, symbol, toaddress, tokenName,
      } = data;
      if (getters.currentUserInfo.idProvider !== 'GitHub') {
        data.signature = await dispatch(
          'getSignature',
          {
            mode: 'withdraw',
            rawSignData: [toaddress, contract, symbol, amount],
            tokenName,
          },
        );
      }

      return backendAPI.withdraw(data);
    },
  },
  mutations: {
    setAccessToken(state, accessToken = null) {
      state.userInfo.accessToken = accessToken;
      setAccessToken(accessToken);
      console.info('set access token :', accessToken);
    },
    setNickname(state, nickname = '') {
      state.userInfo.nickname = nickname;
    },
    setUserConfig(state, config = null) {
      // only idProvider now
      if (config) state.userConfig.idProvider = config.idProvider;
      else state.userConfig.idProvider = null;
    },
  },
});
