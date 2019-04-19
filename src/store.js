import Vue from 'vue';
import Vuex from 'vuex';
import api, { currentEOSAccount } from './api/scatter';
import cyanobridgeAPI from './api/cyanobridge';

Vue.use(Vuex);

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */

export default new Vuex.Store({
  state: {
    cyanobridge: {
      account: null,
    },
    isScatterConnected: false,
    scatterAccount: null,
    balances: {
      eos: '... EOS',
    },
    isScatterLoggingIn: false,
    isLoadingData: false,
  },
  getters: {
    currentUsername: ({ scatterAccount }) => (scatterAccount ? scatterAccount.name : null),
  },
  mutations: {
    setIsScatterLoggingIn(state, isScatterLoggingIn) {
      state.isScatterLoggingIn = isScatterLoggingIn;
    },
    setIsScatterConnected(state, isScatterConnected) {
      state.isScatterConnected = isScatterConnected;
    },
    setScatterAccount(state, account) {
      state.scatterAccount = account;
    },
    setMyBalance(state, { symbol, balance }) {
      state.balances[symbol] = balance;
    },
    setCyanobridgeAccount(state, account) {
      state.cyanobridge.account = account;
    },
  },
  actions: {
    cyanobridgegetAccount({ commit, dispatch }) {
      return new Promise((resolve, reject) => {
        console.log('Connecting to wallet ...');
        cyanobridgeAPI.getAccount()
          .then((result) => {
            const { result: address } = result;
            commit('setCyanobridgeAccount', address);
            console.log('1.');
            resolve(address);
          })
          .catch(result => reject(result));
      });
    },
    async connectScatterAsync({ commit, dispatch }) {
      console.log('Connecting to wallet or Scatter desktop...');
      // try {
      const connected = await api.connectScatterAsync();
      // 沒連上就彈到上層去了，下面都不會 run
      // } catch (error) {
      // }
      console.log('Connect Scatter result: ', connected);
      // 不論有沒有連上都應該設定狀態，要是連上後登陸前把錢包關了(或是錢包當了)
      // 就會造成狀態不合
      // 加上 try catch 也是為了接下來的順利執行到
      // 參考 https://es6.ruanyifeng.com/#docs/async
      commit('setIsScatterConnected', connected);
      if (connected) {
        if (currentEOSAccount()) {
          commit('setScatterAccount', currentEOSAccount());
          dispatch('getMyBalances');
        }
      } else throw 'failed to connect wallet';
      return connected;
    },
    async getMyBalances({ commit, state }) {
      const { name } = state.scatterAccount;
      const contractType = 'eos';
      if (contractType) {
        const balances = await Promise.all([
          api.getBalancesByContract({ symbol: 'eos', accountName: name }),
        ]);
        const eos = balances[0][0] || '0 EOS';
        commit('setMyBalance', { symbol: 'eos', balance: eos });
      }
    },
    async suggestNetworkAsync() {
      await api.suggestNetworkAsync();
    },
    // 參考 https://es6.ruanyifeng.com/#docs/async
    async loginScatterAsync({ commit, dispatch }) {
      console.log('Start log in...');
      commit('setIsScatterLoggingIn', true);
      return new Promise(async (resolve, reject) => {
        try {
          const identity = await api.loginScatterAsync();
          if (!identity) { // 失敗若是走了 catch ，這條也不會 run
            commit('setScatterAccount', null);
            reject(false);
          }
          const account = identity.accounts.find(({ blockchain }) => blockchain === 'eos');
          commit('setScatterAccount', account);
          console.log('Login successful.');
          dispatch('getMyBalances');
        } catch (err) {
          console.error('Failed to log in Scatter :', err);
          reject(false);
        }
        commit('setIsScatterLoggingIn', false);
        resolve(this.scatterAccount ? account : false);
      });
    },
    async logoutScatterAsync({ commit }) {
      try {
        await api.logoutScatterAsync();
        localStorage.removeItem('ACCESS_TOKEN');
      } catch (err) {
        console.error('Failed to logout Scatter', err);
      }
      commit('setScatterAccount', null);
    },
  },
});
