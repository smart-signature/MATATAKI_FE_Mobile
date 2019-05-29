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
      accessToken: null,
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
    isLogined: state => state.userInfo.accessToken !== null,
    isMe: (state, { currentUserInfo }) => target => currentUserInfo.name === target,
  },
  actions: {
    async getAuth({ commit, dispatch, getters }) {
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
      const { blockchain } = getters.currentUserInfo;
      // const { blockchain } = data;
      // console.log(data.blockchain);
      let signature = null;
      if (blockchain === 'EOS') {
        signature = await dispatch('scatter/getSignature', data);
      } else if (blockchain === 'ONT') {
        signature = await dispatch('ontology/getSignature', data.rawSignData);
      }
      signature.blockchain = blockchain;
      return signature;
    },
    async getSignatureOfArticle({ dispatch }, { author, hash }) {
      return dispatch('getSignature', { mode: 'Article', rawSignData: [author, hash] });
    },
    async getSignatureOfAuth({ dispatch, getters }) {
      return dispatch('getSignature', { mode: 'Auth', rawSignData: [getters.currentUserInfo.name] });
    },
    async idCheckandgetAuth({
      dispatch, state, getters,
    }) {
      const { blockchin } = state.userConfig;
      if (!blockchin) throw new Error('did not choice blockchin');

      // console.debug(getters.currentUserInfo);
      const accountInfoCheck = async () => {
        if (getters.currentUserInfo.name) {
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
      if (blockchin === 'EOS') {
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
      if (blockchin === 'ONT') {
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

      if (await accountInfoCheck()) return true;

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
      commit('setAccessToken');
      commit('setNickname');

      localStorage.clear();
    },
    // data: { amount, toaddress, memo }
    async withdraw({ dispatch, getters }, data) {
      // const { blockchain } = getters.currentUserInfo;
      // data.blockchain = blockchain;
      console.log(data);
      // console.log(blockchain);

      // 根据传进来的mode判断提现什么币
      if (data.tokenName === 'EOS') {
        data.contract = 'eosio.token';
        data.symbol = 'EOS';
        data.blockchain = 'eos';
      } else if (data.tokenName === 'ONT') {
        data.contract = 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV';
        data.symbol = 'ONT';
        data.blockchain = 'ont';
      }
      data.amount *= 10000; // 前端统一*10000

      const {
        amount, contract, symbol, toaddress,
      } = data;
      data.signature = await dispatch(
        'getSignature',
        {
          mode: 'withdraw',
          rawSignData: [toaddress, contract, symbol, amount],
        },
      );

      try {
        const res = await backendAPI.withdraw(data);
        return res;
      } catch (error) {
        return error;
      }
    },
  },
  mutations: {
    setAccessToken(state, accessToken = null) {
      state.userInfo.accessToken = accessToken;
    },
    setUserConfig(state, config = null) {
      if (config) state.userConfig.blockchin = config.blockchin;
      else state.userConfig = { blockchin: null };
    },
    setNickname(state, nickname = '') {
      state.userInfo.nickname = nickname;
    },
  },
});
