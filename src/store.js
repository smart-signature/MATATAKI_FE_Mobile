import Vue from 'vue';
import Vuex from 'vuex';
import api, { currentEOSAccount } from './api/scatter';

Vue.use(Vuex);

// That's vuex's need, sorry eslint
/* eslint-disable no-param-reassign */

export default new Vuex.Store({
  state: {
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
  },
  actions: {
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
      }
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
    // 這不該是 async
    // 理由:只有一個 await api.loginScatterAsync() ，
    // 那直接讓他接.catch 彈框表示'无法与你的钱包建立链接'就好
    // 而外層使用的 loginScatterAsync 的場景並沒有需要 .then .catch
    // 而是都是登錄與操作分開的場景，最需要的是自動登陸，而不是按下按鈕在執行前的登陸
    // 而且此 async 並沒有任何 return ，
    // 唯一依靠是內層 await api.loginScatterAsync() return 的 Promise
    // 又被 try catch 接走，等於此 func 外頭沒有接到任何 return 的 Promise
    // =====
    // 又由於引用此 func 的數量過多，重構不太好
    // 因此會新分出一個新的非 async 的 loginScatter 先做使用於新更動的地方
    // 再逐一去除 loginScatterAsync 的依賴，或是整體調用 loginScatter 的位置重配優先
    // 以上 todo
    // 參考 https://es6.ruanyifeng.com/#docs/async
    async loginScatterAsync({ commit, dispatch }) {
      console.log('Start log in...');
      commit('setIsScatterLoggingIn', true);
      try {
        const identity = await api.loginScatterAsync();
        if (!identity) { // 失敗的話走了 catch ，這條也不會 run
          commit('setScatterAccount', null);
          return;
        }
        const account = identity.accounts.find(({ blockchain }) => blockchain === 'eos');
        commit('setScatterAccount', account);
        console.log('Login successful.');
        dispatch('getMyBalances');
      } catch (err) { // 這裡又是一個不會 run zzz
        console.error('Failed to log in Scatter :', err);
      }
      commit('setIsScatterLoggingIn', false);
    },
    async logoutScatterAsync({ commit }) {
      try {
        await api.logoutScatterAsync();
      } catch (err) {
        console.error('Failed to logout Scatter', err);
      }
      commit('setScatterAccount', null);
    },
  },
});
