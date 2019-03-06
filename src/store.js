import Vue from 'vue';
import Vuex from 'vuex';
import api, { currentEOSAccount } from "./api/scatter";

Vue.use(Vuex);

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
    currentUsername: ({ scatterAccount }) => {
      return scatterAccount ? scatterAccount.name : null
    }
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
    async connectScatterAsync({ commit, dispatch, state }) {
      console.log('Connecting to Scatter desktop...');
      const connected = await api.connectScatterAsync();
      console.log('Connect Scatter result: ', connected);
      if (connected) {
        commit('setIsScatterConnected', true);
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
          api.getBalancesByContract({ symbol: 'eos', accountName: name })
        ]);
        const eos = balances[0][0];
        commit('setMyBalance', { symbol: 'eos', balance: eos });
      }
    },
    async suggestNetworkAsync() {
      return api.suggestNetworkAsync()
    },
    async loginScatterAsync({ commit, dispatch, state }) {
      commit('setIsScatterLoggingIn', true);
      try {
        const identity = await api.loginScatterAsync();
        if (!identity) {
          commit('setScatterAccount', null);
          return;
        }
        const account = identity.accounts.find(({ blockchain }) => blockchain === 'eos');
        commit('setScatterAccount', account);
        dispatch('getMyBalances');
      } catch (err) {
        console.error('Failed to login Scatter', err);
        Toast.open({
          message: `Failed to login Scatter: ${err.message}.`,
          type: 'is-danger',
          queue: false,
          duration: 5000,
        });
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
      Toast.open({
        message: 'You successfully logged out!',
        type: 'is-success',
        queue: false,
      });
    },
  },
});