import { networks } from './network';

const dappName = 'Smart Signature';
const ontology = {
  scriptHash: process.env.VUE_APP_SCRIPT_HASH,
  gasLimit: 20000,
  gasPrice: 500,
};

const network = networks;

const i18n = [
  {
    locale: 'zh',
    aliases: ['zh', 'zh-cn', 'zh-hk', 'zh-sg', 'zh-tw'],
  },
  {
    locale: 'en',
    aliases: ['en', 'en-us', 'en-au', 'en-bz', 'en-ca', 'en-ie', 'en-jm', 'en-nz', 'en-ph', 'en-za', 'en-tt', 'en-gb', 'en-zw'],
  },
  {
    locale: 'ja',
    aliases: ['jp', 'ja', 'ja-jp'],
  },
  {
    locale: 'ko',
    aliases: ['ko'],
  },
];

export {
  dappName, ontology, i18n, network,
};
