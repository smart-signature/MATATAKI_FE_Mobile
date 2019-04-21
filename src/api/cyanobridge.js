/* eslint-disable */
import * as config from '@/config';

const isAPP = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// try...catch 放在 npm 包的使用入口的位置

const getClient = async () => {
  if (isAPP) {
    const { client } = await import('cyanobridge');
    client.registerClient();
    return client;
  } else {
    const { client } = await import('ontology-dapi');
    client.registerClient({});
    return client;
  }
};

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

const cyanobridgeAPI = {
  getAccount: async (client = null) => {
    let _client = client;
    if ( _client === null ) _client = await getClient();
    const params = {
      dappName: config.dappName,
      dappIcon: '' // some url points to the dapp icon
    };
    try {
      return isAPP ? _client.api.asset.getAccount(params) : _client.api.asset.getAccount();
    } catch(err) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', err);
    }
  },
};



export default cyanobridgeAPI;
export { toolkit };