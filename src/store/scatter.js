import api, { eosClient, currentEOSAccount } from '@/api/scatter';

/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */

// initial state
const state = {
  // account 是個物件, .name 才是帳號名
  account: null,
  balances: {
    eos: '... EOS',
  },
  isConnected: false,
  isLoggingIn: false,
  isLoadingData: false,
};

const getters = {
  currentBalance: ({ balances }) => balances.eos,
  currentUsername: ({ account }) => (account ? account.name : null),
};

const mutations = {
  setIsLoggingIn(state, isLoggingIn) {
    state.isLoggingIn = isLoggingIn;
  },
  setIsConnected(state, isConnected) {
    state.isConnected = isConnected;
  },
  setAccount(state, account) {
    state.account = account;
  },
  setBalance(state, { symbol, balance }) {
    state.balances[symbol] = balance;
  },
};

const actions = {
  async connect({ commit, dispatch }) {
    console.log('Connecting to Scatter wallet or Scatter desktop...');
    const connected = await api.connectScatterAsync();
    console.log('🛸Scatter🛸 connect result: ', connected);
    // 不論有沒有連上都應該設定狀態，要是連上後登陸前把錢包關了(或是錢包當了)
    // 就會造成狀態不合
    // 加上 try catch 也是為了接下來的順利執行到
    // 參考 https://es6.ruanyifeng.com/#docs/async
    commit('setIsConnected', connected);
    if (connected) {
      if (currentEOSAccount()) {
        commit('setAccount', currentEOSAccount());
        dispatch('setBalances');
        // Scatter 10.0 need to suggestNetwork, if not, scatter is not working on login
        await api.suggestNetworkAsync().then(added => (
          console.log('🛸Scatter🛸 suggest network result: ', added)
        ));
        return true;
      }
    }
    return false;
  },
  async getSignature({ state }, { signData, memo = '' }) {
    const { account } = state;
    const result = await eosClient.getAccount(account.name);
    // 获取当前权限
    const permissions = result.permissions.find(x => x.perm_name === account.authority);
    // 获取当前权限的public key
    const publicKey = permissions.required_auth.keys[0].key;
    // 申请签名
    const signature = await api.getArbitrarySignature(publicKey, signData, memo);
    console.log('got signature: ', signature);
    return ({ publicKey, signature, username: account.name });
  },
  async getSignatureOfArticle({ dispatch }, { author, hash }) {
    const hashPiece = [
      hash.slice(0, 12), hash.slice(12, 24), hash.slice(24, 36), hash.slice(36, 48),
    ];
    const signData = `${author} ${hashPiece[0]} ${hashPiece[1]} ${hashPiece[2]} ${hashPiece[3]}`;
    return dispatch('getSignature', { signData, memo: 'Smart Signature' });
  },
  async getSignatureOfAuth({ dispatch }) {
    return dispatch('getSignature', { signData: state.account.name, memo: 'Auth' });
  },
  async setBalances({ commit, state }) {
    const { name } = state.account;
    const contractType = 'eos';
    if (contractType) {
      const balances = await Promise.all([
        api.getBalancesByContract({ symbol: 'eos', accountName: name }),
      ]);
      const eos = balances[0][0] || '0 EOS';
      commit('setBalance', { symbol: 'eos', balance: eos });
    }
  },
  async login({ commit, dispatch }) {
    console.log('Start log in...');
    commit('setIsLoggingIn', true);
    return new Promise(async (resolve, reject) => {
      try {
        const identity = await api.loginScatterAsync();
        if (!identity) { // 失敗若是走了 catch ，這條也不會 run
          commit('setAccount', null);
          commit('setIsLoggingIn', false);
          reject(new Error('Failed to get identity in Scatter'));
        }
        const account = identity.accounts.find(({ blockchain }) => blockchain === 'eos');
        commit('setAccount', account);
        console.log(account, 'log in successful.');
        dispatch('setBalances');
        commit('setIsLoggingIn', false);
        resolve(account);
      } catch (err) {
        commit('setIsLoggingIn', false);
        console.error('Failed to log in Scatter :', err);
        reject(err);
      }
    });
  },
  async logout({ commit }) {
    try {
      await api.logoutScatterAsync();
      localStorage.removeItem('ACCESS_TOKEN');
    } catch (err) {
      console.error('Failed to logout Scatter', err);
    }
    commit('setAccount', null);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
