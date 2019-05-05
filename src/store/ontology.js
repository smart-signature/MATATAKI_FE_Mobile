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
  // currentUsername: ({ account }) => (account || null),
};

const actions = {
  async getAccount({ commit }) {
    console.log('Connecting to ont wallet ...');
    try {
      const address = await cyanobridgeAPI.getAccount();
      commit('setAccount', address);
      return address;
    } catch (error) {
      throw error;
    }
  },
  async getSignature({ signData }) {
    let { account } = state;
    if (!account) {
      await dispatch('getAccount');
      account = state.account;
    }
    const signature = await cyanobridgeAPI.signMessage(signData);
    return ({ publicKey: signature.publicKey, signature: signature.data, username: account });
  },
  async getSignatureOfArticle({ dispatch }, { author, hash }) {
    return dispatch('getSignature', { signData: `${author} ${hash}` })
  },
  async getSignatureOfAuth({ dispatch, state }) {
    const { account } = state;
    if (!account) throw new Error('no account');
    return dispatch('getSignature', { signData: account });
  },
};

const mutations = {
  setAccount(state, account) {
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
