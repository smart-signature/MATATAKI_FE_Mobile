/* eslint-disable */
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import * as config from '@/config';
import PriceFormatter from './priceFormatter';

ScatterJS.plugins(new ScatterEOS());

// const account = 'signature.bp';

// api https://get-scatter.com/docs/api-create-transaction

// @trick: use function to lazy eval Scatter eos, in order to avoid no ID problem.
const eos = () => ScatterJS.scatter.eos(config.network.eos, Eos, { expireInSeconds: 60 });
const currentEOSAccount = () => ScatterJS.scatter.identity && ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos');

// {
//     chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
//     protocol: "https",
//     host: 'proxy.eosnode.tools',
//     port: 443,
//     httpEndpoint: "https://proxy.eosnode.tools",
// },

const eosClient = Eos({
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  httpEndpoint: "https://proxy.eosnode.tools",
});

const API = {
  async getSignature(author, hash, publicKey) {
    const hash_piece1 = hash.slice(0, 12);
      const hash_piece2 = hash.slice(12, 24);
      const hash_piece3 = hash.slice(24, 36);
      const hash_piece4 = hash.slice(36, 48);

      const sign_data = `${author} ${hash_piece1} ${hash_piece2} ${hash_piece3} ${hash_piece4}`;
      // 申请签名
      return ScatterJS.scatter.getArbitrarySignature(publicKey, sign_data, 'Smart Signature')
  },
  async getBalancesByContract({ tokenContract = 'eosio.token', accountName, symbol }) {
    return eos().getCurrencyBalance(tokenContract, accountName, symbol);
  },
  install(Vue) {
    Object.defineProperties(Vue.prototype, {
      $API: {
        get() {
          return API;
        },
      },
    });
  },
  connectScatterAsync() {
    return ScatterJS.scatter.connect(config.appScatterName, { initTimeout: 2000 });
  },
  suggestNetworkAsync() {
    return ScatterJS.scatter.suggestNetwork(config.network.eos);
  },
  loginScatterAsync() {
    const requiredFields = { accounts: [config.network.eos] };
    return ScatterJS.scatter.getIdentity(requiredFields);
  },
  logoutScatterAsync() {
    return ScatterJS.scatter.forgetIdentity();
  },
  transferEOSAsync({
    to,
    memo = '',
    amount = 0,
  }) {
    return eos().transfer(
      currentEOSAccount().name,
      to,
      PriceFormatter.formatPrice(amount),
      memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  async transferTokenAsync({
    to,
    memo = '',
    amount = 0,
    tokenContract = 'eosio.token',
  }) {
    const contract = await eos().contract(tokenContract);

    return contract.transfer(
      currentEOSAccount().name,
      to,
      amount,
      memo, {
        authorization: [`${currentEOSAccount().name}@${currentEOSAccount().authority}`],
      },
    );
  },
  getAccount() {
    return ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos');
  },
  getPublicKey() {
    return ScatterJS.scatter.getPublicKey('eos')
  },
  getArbitrarySignatureAsync({ publicKey, data }) {
    return ScatterJS.scatter.getArbitrarySignature({ publicKey, data }).then((signature) => {
      console.log({ publicKey, data, signature });
      return signature;
    }).catch((error) => {
      // todo(minakokojima): better error message.
      alert(error);
    });
  },
};


export default API;
export { eos, currentEOSAccount };
