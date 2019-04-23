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
  getAccount({ commit }) {
    console.log('Connecting to ont wallet ...');
    return new Promise((resolve, reject) => {
      cyanobridgeAPI.getAccount()
        .then((address) => {
          commit('setAccount', address);
          resolve(address);
        })
        .catch(result => reject(result));
    });
  },
  async getSignature({ dispatch, state }, { author, hash }) {
    return new Promise(async (resolve, reject) => {
      let { account } = state;
      if (!account) {
        await dispatch('getAccount');
        account = state.account;
      }
      // 需要签名的数据
      const signData = `${author} ${hash}`;
      // 申请签名
      const signature = await cyanobridgeAPI.signMessage(signData);
      return resolve({ publicKey: signature.publicKey, signature: signature.data, username: account });
    });
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
