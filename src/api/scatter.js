import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs2';
import {JsonRpc, Api} from 'eosjs';
import EosApi from 'eosjs-api';
import * as config from '@/config';
import PriceFormatter from './priceFormatter';

// for eosjs-api
const options = {
  httpEndpoint: 'http://api.eosnewyork.io:80', // great one
  verbose: false, // API logging
}
const eosapi = EosApi(options);

// api https://get-scatter.com/docs/api-create-transaction

ScatterJS.plugins( new ScatterEOS() );
const rpc = new JsonRpc(config.network.fullhost());

// @trick: use function to lazy eval Scatter eos, in order to avoid no ID problem.
const eos = ScatterJS.eos(config.network, Api, {rpc, beta3:true});

// const account = ScatterJS.account('eos');
const currentEOSAccount = () => ScatterJS.identity && ScatterJS.identity.accounts.find(x => x.blockchain === 'eos');

// backup
/* () => ScatterJS.identity && ScatterJS.identity.accounts.find(x => x.blockchain === 'eos'); */

// new
/*{
  ScatterJS.login().then(id => {
     return account;
  }).catch(err => {
    console.error('error: ', err);
    return null ;
  });
};*/


const API = {
  async getBalancesByContract({ tokenContract = 'eosio.token', accountName, symbol }) {
    return eosapi.getCurrencyBalance(tokenContract, accountName, symbol);
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
    return ScatterJS.connect(config.appScatterName, {network:config.network});
  },
  suggestNetworkAsync() {
    return ScatterJS.suggestNetwork(config.network.eos);
  },
  loginScatterAsync() {
    const requiredFields = { accounts: [config.network.eos] };
    return ScatterJS.login(); /* ScatterJS.getIdentity(requiredFields);*/
  },
  logoutScatterAsync() {
    return ScatterJS.scatter.logout();
  },
  /*
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
  },*/
  getPublicKey() {
    return ScatterJS.getPublicKey('eos').then(publicKey => {
      console.log(publicKey);
      return publicKey ;
    }).catch(error => {
      console.error('getPublicKey 失敗', error);
    });
  },
  getArbitrarySignatureAsync({publicKey, data}) {
    return ScatterJS.getArbitrarySignature({publicKey, data}).then(signature => {
      console.log({publicKey, data, signature});
      return signature ;
    }).catch(error => {
      console.error('getArbitrarySignature 失敗', error);
    });
  },
};


export default API;
export { eos, eosapi, currentEOSAccount };
