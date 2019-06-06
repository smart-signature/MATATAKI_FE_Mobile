import { backendAPI, disassembleToken } from '@/api';

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
    const { data: accessToken } = await backendAPI.loginGitHub(code);
    commit('setAccount', accessToken);
    return accessToken;
  },
};

const mutations = {
  setAccount(state, accessToken = null) {
    state.account = (disassembleToken(accessToken)).iss;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
