<template>
    <div class="easter-egg">
        <h1 class="title">🎉 恭喜你发现了隐藏的彩蛋！</h1>
        <p>当前模式：{{env}}</p>
        <p>版本号： {{ version }}</p>
        <p v-if="checkIsBuildOnCommit">基于 commit <a :href="commitUrl">{{ commitHash }} </a> 构建</p>
        <Button @click="recordShareTest">recordShareTest</Button>
        <Button @click="maaaaa">maaaaa</Button>
    </div>
</template>

<script>
/* eslint-disable */
import { mapActions, mapGetters } from 'vuex';
import API from '@/api/ontology';
import { ontology } from '@/config';
import { 
  Account, Crypto, RestClient, TransactionBuilder, Wallet, // utils,
} from 'ontology-ts-sdk';
import backendAPI from '../../src/api/backend';
import https from 'https';


export default {
  name: 'Easter-Egg',
  computed: {
    ...mapGetters(['currentUserInfo']),
    env() {
      return process.env.NODE_ENV;
    },
    version() {
      return process.env.VUE_APP_VERSION;
    },
    commitHash() {
      return process.env.VUE_APP_COMMIT_HASH;
    },
    checkIsBuildOnCommit() {
      // undefined will be stringify to "undefined"
      // Ref: https://github.com/vuejs/vue-cli/blob/dev/packages/%40vue/cli-service/lib/util/resolveClientEnv.js#L1
      return this.commitHash !== 'undefined';
    },
    commitUrl() {
      return `https://github.com/smart-signature/smart-signature-future/commit/${this.commitHash}`;
    },
  },
  methods: {
    ...mapActions(['recordShare']),
    async recordShareTest() {
      console.info('currentUserInfo :', this.currentUserInfo);
      this.show();
      const transaction = await this.recordShare({ amount: 1, signId: '666' });
      console.log('transaction :', transaction);
      this.show();
    },
    async show() {
      // console.info('currentUserInfo :', this.currentUserInfo);
      // const balance = await API.getBalance({ address: 'AUZ27HUQt66H4g8MnEURNZvmSSpH9ZqKXz' });
      // console.log('AUZ27HUQt66H4g8MnEURNZvmSSpH9ZqKXz', ' :', balance);
      const address = 'AbU4AyDhukbj4EFb4fX633th144Rg2sG9A';
      const url = process.env.NODE_ENV === 'production'
        ? `https://${ontology.currentUsingNode}:10334`
        : `http://${ontology.currentUsingNode}:20334`;
      const response = await fetch(`${url}/api/v1/balance/${address}`);
      console.debug(response);
      const { Result } = await response.json();
      // console.debug(Result);
      const { ong: ONG, ont: ONT } = Result;
      console.debug({ ONG, ONT });
    },
    async maaaaa() {
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      const axiosX = axios.create({
        httpsAgent,
      });

      var ontWallet = Wallet.create('test');
      let privateKeys = [
        // AT9deLiocSk3SC6k9gX2U5gwPCZGn8ASyP
        'L2JRYhnR5dHSUnsPSxD8LRGCxcWuAq6pQasjwZypTgVUEw3kdQBw',
      ];
      privateKeys = privateKeys.map((key) => Crypto.PrivateKey.deserializeWIF(key));
      ontWallet.addAccount(Account.create(privateKeys[0], 'password', 'cat1'));
      const { address, encryptedKey, salt } = ontWallet.accounts[0];
      const private2 = encryptedKey.decrypt('password', address, salt);
      // const address2 = new Address('AXK2KtCfcJnSMyRzSwTuwTKgNrtx5aXfFX');
      const restClient = new RestClient('https://polaris1.ont.io:10334');
      const amount = 1;
      const signId = 100429;
      const symbol = 'ONT';
      const json = {
          action: 'invoke',
          params: {
              login: true,
              message: 'invoke smart contract test',
              invokeConfig: {
                  contractHash: ontology.scriptHash,
                  functions: [{
                      operation: 'RecordShare',
                      args: [{
                          name: 'arg0',
                          value: `String:${address.toBase58()}`,
                      }, {
                          name: 'arg1',
                          value: `String:${signId.toString()}`,
                      }, {
                          name: 'arg2',
                          value: `String:${symbol}`,
                      }, {
                          name: 'arg3',
                          value: amount,
                      },{
                          name: 'arg4',
                          value: `String:${amount.toString()}`,
                      }]
                  }],
                  gasLimit: 20000,
                  gasPrice: 500,
                  payer: address.toBase58()
              }
          }
      };
      console.log('xDD', address.value);
      const { makeTransactionsByJson, signTransaction } = TransactionBuilder;

      const txs = makeTransactionsByJson(json);
      signTransaction(txs[0], private2);
      // const rer = await axiosX('https://polaris1.ont.io:10334/api/v1/version');
      // throw new Error(rer.status);
      // return true;
      // await restClient.sendRawTransaction(txs[0].serialize(), false);
      window.localStorage.setItem('ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVDlkZUxpb2NTazNTQzZrOWdYMlU1Z3dQQ1pHbjhBU3lQIiwiZXhwIjoxNTU5Njc3OTgwNTc0LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTF9.FOHInE1zHz75YxApyra6zoMWyo1o2VM8wngsbVyNBdQ');
      await backendAPI.reportShare({
        amount: amount,
        blockchain: 'ONT',
        contract: 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV',
        signId: signId,
        symbol: 'ONT',
        referrer: null,
      });
     await backendAPI.sendComment({ comment: 'test 1', signId });
    
    },
  },
};
</script>
