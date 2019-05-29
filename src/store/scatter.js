/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */

// initial state
const state = {
  // account 是個物件, .name 才是帳號名
  account: null,
  API: null,
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
  setIsLoggingIn(state, isLoggingIn = false) {
    state.isLoggingIn = isLoggingIn;
  },
  setIsConnected(state, isConnected) {
    state.isConnected = isConnected;
  },
  setAccount(state, account = null) {
    state.account = account;
  },
  setAPI(state, API = null) {
    state.API = API;
  },
  setBalance(state, { symbol, balance }) {
    state.balances[symbol] = balance;
  },
};

const actions = {
  async getAPI({ commit, state }) {
    if (!state.API) {
      const { default: API } = await import(/* webpackChunkName: "EOS-scatter" */ '@/api/scatter');
      commit('setAPI', API);
    }
    return state.API;
  },
  async connect({ commit, dispatch }) {
    const api = await dispatch('getAPI');
    console.log('Connecting to Scatter wallet or Scatter desktop...');
    const connected = await api.connectScatterAsync();
    console.log('🛸Scatter🛸 connect result: ', connected);
    // 不論有沒有連上都應該設定狀態，要是連上後登陸前把錢包關了(或是錢包當了)
    // 就會造成狀態不合
    // 加上 try catch 也是為了接下來的順利執行到
    // 參考 https://es6.ruanyifeng.com/#docs/async
    commit('setIsConnected', connected);
    if (connected) {
      const { currentEOSAccount } = await import(/* webpackChunkName: "EOS-scatter" */ '@/api/scatter');
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
  async getSignature({ dispatch, state }, { mode, rawSignData }) {
    const api = await dispatch('getAPI');
    const { eosClient } = await import(/* webpackChunkName: "EOS-scatter" */ '@/api/scatter');
    const { account } = state;
    const result = await eosClient.getAccount(account.name);
    // 获取当前权限
    const permissions = result.permissions.find(x => x.perm_name === account.authority);
    // 获取当前权限的public key
    const publicKey = permissions.required_auth.keys[0].key;


    let signData = null;
    let memo = null;
    if (mode === 'Article') {
      const [author, hash] = rawSignData;
      const hashPiece = [
        hash.slice(0, 12), hash.slice(12, 24), hash.slice(24, 36), hash.slice(36, 48),
      ];
      signData = `${author} ${hashPiece[0]} ${hashPiece[1]} ${hashPiece[2]} ${hashPiece[3]}`;
      memo = 'Smart Signature';
    } else if (mode === 'Auth') {
      [signData] = rawSignData;
      memo = 'Auth';
    } else if (mode === 'withdraw') {
      // 字符串切割 ont 提现地址和合约切割
      const strSlice = str => [str.slice(0, 12), str.slice(12, 24), str.slice(24, 36)];
      rawSignData[0] = strSlice(rawSignData[0]).join(' '); // 提现地址
      rawSignData[1] = strSlice(rawSignData[1]).join(' '); // 合约地址
      signData = rawSignData.join(' ');
      memo = 'withdraw';
    }
    // 申请签名
    const signature = await api.getArbitrarySignature(publicKey, signData, memo);
    console.log('got signature: ', signature);
    return ({ publicKey, signature, username: account.name });
  },
  async recordShare(context, share) {
    const { recordShare } = await import(/* webpackChunkName: "contract-EOS" */ '@/api/contractEOS');
    return recordShare(share);
  },
  async setBalances({ commit, dispatch, state }) {
    const api = await dispatch('getAPI');
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
    const api = await dispatch('getAPI');
    console.log('Start log in...');
    commit('setIsLoggingIn', true);
    try {
      const identity = await api.loginScatterAsync();
      if (!identity) { // 失敗若是走了 catch ，這條也不會 run
        commit('setAccount');
        commit('setIsLoggingIn');
        throw new Error('Failed to get identity in Scatter');
      }
      const account = identity.accounts.find(({ blockchain }) => blockchain === 'eos');
      commit('setAccount', account);
      console.log(account, 'log in successful.');
      dispatch('setBalances');
      commit('setIsLoggingIn');
      return account;
    } catch (error) {
      commit('setIsLoggingIn');
      console.error('Failed to log in Scatter :', error);
      throw error;
    }
  },
  async logout({ commit, dispatch }) {
    const api = await dispatch('getAPI');
    try {
      await api.logoutScatterAsync();
    } catch (err) {
      console.error('Failed to logout Scatter', err);
    }
    commit('setAccount');
    commit('setBalance', { symbol: 'eos', balance: '... EOS' });
    commit('setIsLoggingIn');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
