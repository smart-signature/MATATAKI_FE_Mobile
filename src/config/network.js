export const networks = ScatterJS.Network.fromJson({
  blockchain:'eos',
  chainId:'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  host:'nodes.get-scatter.com',
  port:443,
  protocol:'https'
});
/*
{
  // eos: {
  //   protocol: 'https',
  //   blockchain: 'eos',
  //   host: 'api.eosbeijing.one',
  //   port: 443,
  //   chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  // },
  bos: {
    protocol: 'https',
    blockchain: 'eos',
    host: 'hapi.bos.eosrio.io',
    port: 443,
    chainId: 'd5a3d18fbb3c084e3b1f3fa98c21014b5f3db536cc15d08f9f6479517c6a3d86',
  },
};
*/
export default networks;
