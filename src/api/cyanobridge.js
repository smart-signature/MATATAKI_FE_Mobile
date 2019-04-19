/* eslint-disable */
import { client } from 'cyanobridge';
import { client as ontologyClient, ParameterType } from 'ontology-dapi';
import * as config from '@/config';

client.registerClient();
ontologyClient.registerClient({});

const isAPP = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

// try...catch 放在 npm 包的使用入口的位置


// import { client as clientApp } from 'cyanobridge'
// import countryPointsJson from '@/util/countryPoints.json';
// import ui from './ui';

// console.log(countryPointsJson, 'countryPointsJson')
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
  getAccount: () => {
    const params = {
      dappName: config.dappName,
      dappIcon: '' // some url points to the dapp icon
    };
    try {
      return ontologyClient.api.asset.getAccount();
    } catch(err) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', err);
    }
  },
};



export default cyanobridgeAPI;
export { client, ontologyClient, isAPP, toolkit };