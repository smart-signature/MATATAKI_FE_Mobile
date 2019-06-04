import { backendAPI } from '@/api';

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */

// initial state
const state = {
  account: null,
};

const getters = {
};

const actions = {
  async signIn({ commit }, { code }) {
    if (!code) throw new Error('GitHub login faild, no code.');
    const response = await backendAPI.loginGitHub(code);
    // 拆解 response
    // commit('setAccount');
  },
};

const mutations = {
  setAccount(state, account = null) {
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
