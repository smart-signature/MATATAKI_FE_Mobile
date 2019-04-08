/* eslint-disable */
import { client } from 'cyanobridge';
import * as config from '@/config';

client.registerClient();

const cyanobridgeAPI = {
  getAccount: async () => {
    const params = {
      dappName: config.dappName,
      dappIcon: '' // some url points to the dapp icon
    };
 
    try {
      const { result } = await client.api.asset.getAccount(params);
      // const res = await client.api.identity.getIdentity(params);
      console.log(result);
      return result;
    } catch(err) {
      console.log(err);
    }
  },
};

export default cyanobridgeAPI;
