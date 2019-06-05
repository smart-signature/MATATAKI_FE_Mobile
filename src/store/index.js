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
    currentUserInfo: (state, {
      'scatter/currentUsername': scatterUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => {
      const { userConfig, userInfo, ontology, github } = state;
      const { idProvider } = userConfig;
      let name = null;
      let balance = null;
      if (idProvider === 'EOS') {
        name = scatterUsername;
        balance = scatterBalance;
      }
      else if (idProvider === 'ONT') {
        name = ontology.account;
        balance = ontologyBalance;
      }
      else if (idProvider === 'GitHub') {
        name = github.account;
        balance = '... XXX';
      }
      return ({ name, balance, idProvider, nickname: userInfo.nickname });
    },
    isLogined: state => state.userInfo.accessToken !== null,
    isMe: (state, { currentUserInfo }) => target => currentUserInfo.name === target,
  },
  actions: {
    async getAuth({ commit, dispatch, getters }, accessToken) {
      const currentToken = accessToken || getCurrentAccessToken();
      const decodedData = disassembleToken(currentToken); // 拆包
      const username = currentToken ? decodedData.iss : null;
      const { name: currentUsername } = getters.currentUserInfo;
      if (!currentUsername) throw new Error('no currentUsername');
      if (!currentToken || !decodedData || decodedData.exp < new Date().getTime()
        || username !== currentUsername) {
        try {
          console.log('Retake authtoken...');
          const signature = await dispatch('getSignatureOfAuth');
          const response = await backendAPI.auth(signature);
          if (response.status !== 200) throw new Error('auth 出錯');
          // 3. save accessToken
          const accessToken = response.data;
          console.info('got the access token :', accessToken);
          setAccessToken(accessToken);
          commit('setAccessToken', getCurrentAccessToken());
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
    async idCheckandgetAuth({
      commit, dispatch, state, getters,
    }, data) {
      const { idProvider } = state.userConfig;
      if (!idProvider) throw new Error('did not choice idProvider');

      const accountInfoCheck = async () => {
        if(idProvider === 'GitHub') {
          if (getters.isLogined) commit('github/setAccount', state.userInfo.accessToken);
          return getters.isLogined;
        } else if (getters.currentUserInfo.name) {
          console.log('Id check pass, id :', getters.currentUserInfo);
          await dispatch('getAuth'); // 更新 Auth
          return true;
        }
        return false;
      };

      console.log('Start id check ...');
      console.info('Ontology status :', state.ontology.account);
      console.info('Scatter connect status :', state.scatter.isConnected);
      if (await accountInfoCheck()) return true;

      // Scatter
      if (idProvider === 'EOS') {
        if (!state.scatter.isConnected) {
          const result = await dispatch('scatter/connect');
          if (!result) throw new Error('faild connect to scatter');
        }
        if (state.scatter.isConnected && !state.scatter.isLoggingIn) {
          const result = await dispatch('scatter/login');
          if (!result) throw new Error('scatter login faild');
        }
      }
      // Ontology
      else if (idProvider === 'ONT') {
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
      }
      // GitHub
      else if (idProvider === 'GitHub') {
        try {
          const accessToken = await dispatch('github/signIn', data);
          setAccessToken(accessToken);
          commit('setAccessToken', getCurrentAccessToken());
        } catch (error) {
        }
      }

      if (await accountInfoCheck()) return true;

      throw new Error(`Unable to get ${idProvider}'s id`);
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
    },
    setUserConfig(state, config = null) {
      if (config) state.userConfig.idProvider = config.idProvider;
      else state.userConfig = { idProvider: null };
    },
    setNickname(state, nickname = '') {
      state.userInfo.nickname = nickname;
    },
  },
});
