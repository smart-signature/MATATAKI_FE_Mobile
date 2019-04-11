/* eslint-disable */
import { client } from 'cyanobridge';
import * as config from '@/config';

client.registerClient();

// try...catch 放在 npm 包的使用入口的位置

const cyanobridgeAPI = {
  getAccount: () => {
    const params = {
      dappName: config.dappName,
      dappIcon: '' // some url points to the dapp icon
    };
    try {
      return client.api.asset.getAccount(params);
    } catch(err) {
      console.error('cyanobridge.js 內部錯誤，請查閱 npm 包的 doc 釐清 : ', err);
    }
  },
};

export default cyanobridgeAPI;
