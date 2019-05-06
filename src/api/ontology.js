/* eslint-disable */
import * as config from '@/config';

// https://github.com/backslash47/OEPs/blob/oep-dapp-api/OEP-6/OEP-6.mediawiki

const isAPP = /Firefox|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// const isAPP = !/Chrome/i.test(navigator.userAgent);
// try...catch 放在 npm 包的使用入口的位置

const toolkit = {
  ab2str: (buf) => String.fromCharCode.apply(null, new Uint8Array(buf)),
  hexstring2ab:  (str) => {
    const result = [];

    while (str.length >= 2) {
      result.push(parseInt(str.substring(0, 2), 16));
      str = str.substring(2, str.length);
    }

    return result;
  },
  reverseHex: (hex) => {
    if (hex.length % 2 !== 0) {
      throw new Error(`Incorrect Length: ${hex}`);
    }
    let out = '';
    for (let i = hex.length - 2; i >= 0; i -= 2) {
      out += hex.substr(i, 2);
    }
    return out;
  },
};

const API = {
  client: null,
  async setClient() {
    if (this.client) return;
    if (isAPP) {
      const { client } = await import(/* webpackChunkName: "cyanobridge" */ 'cyanobridge');
      client.registerClient();
      this.client = client;
    } else {
      const { client } = await import(/* webpackChunkName: "cyanobridge" */ 'ontology-dapi');
      client.registerClient({});
      this.client = client;
    }
  },
  // Network
  async getBalance({ address }) {
    if (!this.client) await this.setClient();
    const { client } = this;
    try {
      if (isAPP) throw new Error('no getBalance func'); // done
      return client.api.network.getBalance({ address }); // done
    } catch(error) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', error);
      throw error;
    }
  },
  // Asset
  async getAccount() {
    if (!this.client) await this.setClient();
    const { client } = this;
    const params = {
      dappName: config.dappName,
      dappIcon: '' // some url points to the dapp icon
    };
    try {
      return isAPP 
        ? client.api.asset.getAccount(params) // done
        : client.api.asset.getAccount(); // done
    } catch(error) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', error);
    }
  },
  // Message
  async signMessage({ message }) {
    if (!this.client) await this.setClient();
    const { client } = this;
    const params = {
      type: 'account', // account or identity that will sign the message
      dappName: config.dappName, // dapp's name
      dappIcon: '', // some url that points to the dapp's icon
      message, // message sent from dapp that will be signed by native client
      expired: new Date('2020-01-01').getTime(), // expired date of login
      callback: '' // callback url of dapp
    };
    try {
      return isAPP
        ? client.api.message.login(params) // done, todo: setup expired
        : client.api.message.signMessage({ message }); // done
    } catch(err) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', err);
    }
  },
  // SmartContract
  async invoke({
    scriptHash, operation, args, gasPrice, gasLimit, requireIdentity
  }) {
    if (!this.client) await this.setClient();
    const { client } = this;
    const config = {
      "login": true,
      "message": "invoke smart contract",
      "url": ""  
    }
    const params = {
          scriptHash,
          operation,
          args,
          gasPrice,
          gasLimit,
          payer: await this.getAccount(),
          config,
    }
    try {
      return isAPP
        ? client.api.smartContract.invoke(params) // done
        : client.api.smartContract.invoke({
          scriptHash, operation, args, gasPrice, gasLimit, requireIdentity
        }); // done
    } catch(err) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', err);
    }
  },
};



export default API;
export { toolkit };