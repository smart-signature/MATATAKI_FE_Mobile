import { networks } from './network';

const dappName = 'Smart Signature';

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

export { dappName, i18n, network };
