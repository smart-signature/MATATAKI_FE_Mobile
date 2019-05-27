import Vue from 'vue';
import Vuex from 'vuex';
import ontology from './ontology';
import scatter from './scatter';
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
    currentUserInfo: (state, {
      currentUsername,
      'scatter/currentUsername': scatterUsername,
      'scatter/currentBalance': scatterBalance,
      'ontology/currentBalance': ontologyBalance,
    }) => ({
      name: currentUsername,
      balance: scatterUsername
        ? scatterBalance
        : (state.ontology.account ? ontologyBalance : '... XXX'),
      blockchain: currentUsername ? (currentUsername.length <= 12 ? 'EOS' : 'ONT') : null,
      nickname: state.userInfo.nickname,
    }),
    currentUsername: (state, { 'scatter/currentUsername': scatterUsername }) => (
      scatterUsername || state.ontology.account || null
    ),
    isLogined: (state, { currentUserInfo }) => currentUserInfo.name !== null,
    isMe: (state, { currentUserInfo }) => target => currentUserInfo.name === target,
  },
  actions: {
    async getAuth({ dispatch, getters }) {
      const currentToken = getCurrentAccessToken();
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
          return accessToken;
        } catch (error) {
          console.warn('取得用戶新簽名出錯', error);
          throw error;
        }
      } else return currentToken;
    },
    // output: { publicKey, signature, username }
    async getSignature({ dispatch, getters }, mode, ...rawSignData ) {
      const { blockchain } = getters.currentUserInfo;
      let signature = null;
      if (blockchain === 'EOS') {
        signature = await dispatch('scatter/getSignature', { mode, rawSignData });
      } else if (blockchain === 'ONT') {
        signature = await dispatch('ontology/getSignature', rawSignData);
      }
      signature.blockchain = blockchain;
      return signature;
    },
    async getSignatureOfArticle({ dispatch }, { author, hash }) {
      return dispatch('getSignature', 'Article', author, hash );
    },
    async getSignatureOfAuth({ dispatch, getters }) {
      return dispatch('getSignature', 'Auth', getters.currentUserInfo.name);
    },
    async idCheckandgetAuth({
      dispatch, state, getters,
    }) {
      const { blockchin } = state.userConfig;
      if (!blockchin) throw new Error('did not choice blockchin');

      console.log('Start id check ...');
      console.info('Ontology status :', state.ontology.account);
      console.info('Scatter connect status :', state.scatter.isConnected);
      if (getters.currentUserInfo.name) {
        console.log('Id check pass, id :', getters.currentUserInfo);
        try { // 更新 Auth
          await dispatch('getAuth');
        } catch (error) {
          console.error('getAuth error:', error.message);
          throw new Error('更新 Auth 失敗');
        }
        return true;
      }

      // Scatter
      if (blockchin === 'EOS') {
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
      if (blockchin === 'ONT') {
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
          await dispatch('getAuth');
        } catch (error) {
          console.error('getAuth error:', error.message);
          throw new Error('更新 Auth 失敗');
        }
        return true;
      }

      const noId = (error) => {
        console.warn('Unable to get id, reason :', error);
        throw error;
      };

      throw new Error('Unable to get id');
    },
    async makeShare({ dispatch, getters }, share) {
      const { blockchain } = getters.currentUserInfo;
      share.blockchain = blockchain;
      if (blockchain === 'EOS') {
        share.contract = 'eosio.token';
        share.symbol = 'EOS';
      } else if (blockchain === 'ONT') {
        share.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        share.symbol = 'ONT';
      }
      await dispatch('recordShare', share);
      return backendAPI.reportShare(share);
    },
    async recordShare({ dispatch }, share) {
      const { blockchain } = share;
      let actionName = null;
      if (blockchain === 'EOS') actionName = 'scatter/recordShare';
      else if (blockchain === 'ONT') actionName = 'ontology/recordShare';
      return dispatch(actionName, share);
    },
    async getUser({ commit, getters }) {
      const { data } = await getUser({ username: getters.currentUserInfo.name });
      console.log(data);
      commit('setNickname', data.nickname);
      return data;
    },
    signOut({ commit, dispatch, state }) {
      const { blockchin } = state.userConfig;
      const EOS = blockchin === 'EOS';
      const ONT = blockchin === 'ONT';
      if (EOS) dispatch('scatter/logout');
      if (ONT) dispatch('ontology/signOut');
      commit('setUserConfig');
      commit('setNickname');

      localStorage.clear();
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
    // data: { amount, toaddress, memo }
    async withdraw({ dispatch, getters }, data) {
      const { blockchain } = getters.currentUserInfo;
      data.blockchain = blockchain;
      if (blockchain === 'EOS') {
        data.contract = 'eosio.token';
        data.symbol = 'EOS';
      } else if (blockchain === 'ONT') {
        data.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        data.symbol = 'ONT';
      }
      const { amount, contract, symbol, toaddress } = data;
      data.signature = await dispatch(
        'getSignature', 'withdraw', toaddress, contract, symbol, amount,
      );
      return backendAPI.withdraw(data);
    },
  },
  mutations: {
    setUserConfig(state, config = null) {
      if (config) state.userConfig.blockchin = config.blockchin;
      else state.userConfig = { blockchin: null };
    },
    setNickname(state, nickname = '') {
      state.userInfo.nickname = nickname;
    },
  },
});
