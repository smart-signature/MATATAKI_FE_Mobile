import cyanobridgeAPI from '@/api/cyanobridge';

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */


// initial state
const state = {
  account: null,
  balances: {
    ong: '... ONG',
    ont: '... ONT',
  },
};

// getters
const getters = {
  currentBalance: ({ balances }) => (balances.ont),
  currentUsername: ({ account }) => (account || null),
};

// actions
const actions = {
  getAccount({ commit }) {
    console.log('Connecting to ont wallet ...');
    return new Promise((resolve, reject) => {
      cyanobridgeAPI.getAccount()
        .then((result) => {
          // const { result: address } = result; // o
          const address = result; // c
          commit('setAccount', address);
          console.log('1.');
          resolve(address);
        })
        .catch(result => reject(result));
    });
  },
};

// mutations
const mutations = {
  setAccount(state, { account }) {
    state.account = account;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
