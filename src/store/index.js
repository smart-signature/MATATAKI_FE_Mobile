import Vue from 'vue';
import Vuex from 'vuex';
import ontology from './ontology';
import scatter from './scatter';
import github from './github';
import {
  backendAPI, getUser, disassembleToken, getCurrentAccessToken, setAccessToken,
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
    currentUserInfo: ({
      userConfig, userInfo, ontology, github,
    }, {
      'scatter/currentUsername': scatterUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => {
      const { idProvider } = userConfig;
      let name = null;
      let balance = null;
      if (idProvider === 'EOS') {
        name = scatterUsername;
        balance = scatterBalance;
      } else if (idProvider === 'ONT') {
        name = ontology.account;
        balance = ontologyBalance;
      } else if (idProvider === 'GitHub') {
        name = github.account;
        balance = '... XXX';
      }
      return ({
        name, balance, idProvider, nickname: userInfo.nickname,
      });
    },
    //  displayName.length <= 12 ? name : name.slice(0, 12);
    displayName: ({ userInfo }, { currentUserInfo }) => userInfo.nickname || currentUserInfo.name,
    isLogined: ({ userInfo }) => userInfo.accessToken !== null,
    isMe: (state, { currentUserInfo }) => target => currentUserInfo.name === target,
  },
  actions: {
    async getAuth({ commit, dispatch, getters }, accessToken) {
      const currentToken = accessToken || getCurrentAccessToken();
      const decodedData = disassembleToken(currentToken); // 拆包
      const username = currentToken ? decodedData.iss : null;
      const { name } = getters.currentUserInfo;
      if (!name) throw new Error('no name');
      if (!currentToken || !decodedData || decodedData.exp < new Date().getTime()
        || username !== name) {
        try {
          console.log('Retake authtoken...');
          const signature = await dispatch('getSignatureOfAuth');
          const { status, data: accessToken } = await backendAPI.auth(signature);
          if (status !== 200) throw new Error('auth 出錯');
          console.info('got the access token :', accessToken);
          commit('setAccessToken', accessToken);
          return accessToken;
        } catch (error) {
          console.warn('取得 access token 出錯', error);
          throw error;
        }
      }
      commit('setAccessToken', getCurrentAccessToken());
      return currentToken;
    },
    // output: { publicKey, signature, username }
    async getSignature({ dispatch, getters }, data) {
      // console.debug(getters.currentUserInfo, data.mode, data.rawSignData);
      const { idProvider } = getters.currentUserInfo;
      let signature = null;
      if (idProvider === 'EOS') {
        signature = await dispatch('scatter/getSignature', data);
      } else if (idProvider === 'ONT') {
        signature = await dispatch('ontology/getSignature', data.rawSignData);
      }
      signature.idProvider = idProvider;
      return signature;
    },
    async getSignatureOfArticle({ dispatch }, { author, hash }) {
      return dispatch('getSignature', { mode: 'Article', rawSignData: [author, hash] });
    },
    async getSignatureOfAuth({ dispatch, getters }) {
      return dispatch('getSignature', { mode: 'Auth', rawSignData: [getters.currentUserInfo.name] });
    },
    async signIn({
      commit, dispatch, state, getters,
    }, { code, idProvider, recover = false }) {
      if (idProvider) {
        commit('setUserConfig', { idProvider });
      } else idProvider = state.userConfig.idProvider;
      // console.debug('signIn :', data, idProvider);
      if (!idProvider) throw new Error('did not choice idProvider');

      const errorFailed = new Error(`Unable to get ${idProvider}'s id`);
      console.debug(recover);
      if (recover) {
        if (idProvider === 'GitHub') {
          commit('setAccessToken', getCurrentAccessToken());
          commit('github/setAccount', state.userInfo.accessToken);
        }
        return true;
      }

      // Scatter
      if (idProvider === 'EOS') {
        try {
          if (!state.scatter.isConnected) {
            const result = await dispatch('scatter/connect');
            if (!result) throw new Error('Scatter: connection failed');
          }
          if (!state.scatter.isLoggingIn) {
            const result = await dispatch('scatter/login');
            if (!result) throw new Error('Scatter: login failed');
          }
          await dispatch('getAuth');
        } catch (error) {
          console.error(error);
          throw errorFailed;
        }
      }
      // Ontology
      else if (idProvider === 'ONT') {
        try {
          if (!state.ontology.account) await dispatch('ontology/getAccount');
          try {
            await dispatch('ontology/getBalance');
          } catch (error) {
            console.warn('Ontology: Failed to get balance :', error);
          }
          await dispatch('getAuth');
        } catch (error) {
          console.error(error);
          throw errorFailed;
        }
      }
      // GitHub
      else if (idProvider === 'GitHub') {
        try {
          commit('setAccessToken', await dispatch('github/signIn', { code }));
        } catch (error) {
          console.error('GitHub: signIn Failed.', error);
          throw errorFailed;
        }
      }

      localStorage.setItem('idProvider', state.userConfig.idProvider);
    },
    async makeShare({ dispatch, getters }, share) {
      const { idProvider } = getters.currentUserInfo;
      share.idProvider = idProvider;
      if (idProvider === 'EOS') {
        share.contract = 'eosio.token';
        share.symbol = 'EOS';
      } else if (idProvider === 'ONT') {
        share.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        share.symbol = 'ONT';
      }
      await dispatch('recordShare', share);
      return backendAPI.reportShare(share);
    },
    async recordShare({ dispatch }, share) {
      const { idProvider } = share;
      let actionName = null;
      if (idProvider === 'EOS') actionName = 'scatter/recordShare';
      else if (idProvider === 'ONT') actionName = 'ontology/recordShare';
      return dispatch(actionName, share);
    },
    async getUser({ commit, getters }) {
      const { data } = await getUser({ username: getters.currentUserInfo.name });
      console.log(data);
      commit('setNickname', data.nickname);
      return data;
    },
    signOut({ commit, dispatch, state }) {
      const { idProvider } = state.userConfig;
      const EOS = idProvider === 'EOS';
      const ONT = idProvider === 'ONT';
      if (EOS) dispatch('scatter/logout');
      if (ONT) dispatch('ontology/signOut');
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
      data.signature = await dispatch(
        'getSignature',
        {
          mode: 'withdraw',
          rawSignData: [toaddress, contract, symbol, amount],
          tokenName,
        },
      );

      try {
        const res = await backendAPI.withdraw(data);
        return res;
      } catch (error) {
        // 手动抛出一个promise reject error
        return Promise.reject(error);
      }
    },
  },
  mutations: {
    setAccessToken(state, accessToken = null) {
      state.userInfo.accessToken = accessToken;
      setAccessToken(accessToken);
    },
    setUserConfig(state, config = null) {
      // only idProvider now
      if (config) state.userConfig.idProvider = config.idProvider;
      else state.userConfig.idProvider = null;
    },
    setNickname(state, nickname = '') {
      state.userInfo.nickname = nickname;
    },
  },
});
