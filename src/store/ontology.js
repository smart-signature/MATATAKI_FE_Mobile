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

const getters = {
  currentBalance: ({ balances }) => (balances.ont),
  currentUsername: ({ account }) => (account || null),
};

const actions = {
  getAccount({ commit }) {
    console.log('Connecting to ont wallet ...');
    return new Promise((resolve, reject) => {
      cyanobridgeAPI.getAccount()
        .then((result) => {
          // const { result: address } = result; // o
          const address = result; // c
          commit('setAccount', address);
          // console.debug('1.');
          resolve(address);
        })
        .catch(result => reject(result));
    });
  },
};

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
