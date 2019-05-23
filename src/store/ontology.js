import API from '@/api/ontology';

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */

// initial state
const state = {
  account: null,
  balance: {
    ONG: 0,
    ONT: 0,
  },
};

const getters = {
  currentBalance: ({ balance }) => (`${balance.ONT} ONT`),
};

const actions = {
  async getAccount({ commit }) {
    console.log('Connecting to ont wallet ...');
    const address = await API.getAccount();
    commit('setAccount', address);
    return address;
  },
  async getBalance({ commit, state }) {
    const { account } = state;
    if (!account) throw new Error('no account');
    const balance = await API.getBalance({ address: account });
    commit('setBalance', balance);
    return balance;
  },
  async getSignature({ state }, { signData }) {
    const { account } = state;
    if (!account) throw new Error('no account');
    const signature = await API.signMessage({ message: signData });
    return ({ publicKey: signature.publicKey, signature: signature.data, username: account });
  },
  async getSignatureOfArticle({ dispatch }, { author, hash }) {
    return dispatch('getSignature', { signData: `${author} ${hash}` });
  },
  async getSignatureOfAuth({ dispatch, state }) {
    const { account } = state;
    if (!account) throw new Error('no account');
    return dispatch('getSignature', { signData: account });
  },
  async recordShare({ state }, {
    amount, signId, sponsor, symbol,
  }) {
    const { account } = state;
    if (!account) throw new Error('no account');
    const { recordShare } = await import(/* webpackChunkName: "contract-Ontology" */ '@/api/contractOntology');
    return recordShare({
      amount, owner: account, signId, sponsor, symbol,
    });
  },
  signOut({ commit }) {
    commit('setAccount');
    commit('setBalance');
  },
};

const mutations = {
  setAccount(state, account = null) {
    state.account = account;
  },
  setBalance(state, balance = { ONG: 0, ONT: 0 }) {
    state.balance = balance;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
