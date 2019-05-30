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
    const signId = 100436;
    
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const axiosX = axios.create({
      httpsAgent,
    });

    var ontWallet = Wallet.create('test');
    let privateKeys = [
      // AT9deLiocSk3SC6k9gX2U5gwPCZGn8ASyP
      'L2JRYhnR5dHSUnsPSxD8LRGCxcWuAq6pQasjwZypTgVUEw3kdQBw',
      // ATA6v4nkHHDpL56DrcbVmuAnf4QV2LkmfU
      'L1XMnVnSrocLGcy9VMbSr1GUouF4nyvMwrprcPfQ5a2moKeCs6d3',
      // AaccygC1DTeg24xSqWZEb7qMwtRKQduNNM
      'KxFEbLBxHscqMKq4uLstWhm3zeHz44X1X6UXgMkNTjJEhZrFrcFa',
    ];
    privateKeys = privateKeys.map((key) => Crypto.PrivateKey.deserializeWIF(key));
    for (let key of privateKeys) {
      ontWallet.addAccount(Account.create(key, 'password', 'cat1'));
    }
    
    const { makeTransactionsByJson, signTransaction } = TransactionBuilder;
    const restClient = new RestClient('https://polaris1.ont.io:10334');
    const amount = 10;
    const symbol = 'ONT';
    let json = null;
    let privateZ = null;
    let txs = [];
    let i = 0;
    for (let account of ontWallet.accounts) {
      try {
        await axiosX(`https://ont.io/api/v1/asset/transfer/${account.address.toBase58()}`);
      } catch (error) {
        
      }
      json = {
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
                        value: `String:${account.address.toBase58()}`,
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
                payer: account.address.toBase58()
            }
        }
      };
      txs.push((makeTransactionsByJson(json))[0]);
      privateZ = account.encryptedKey.decrypt('password', account.address, account.salt);
      signTransaction(txs[i], privateZ);
      i++;
    }

    await txs.forEach(async tx => restClient.sendRawTransaction(tx.serialize(), false));
    
    const ACCESS_TOKENs = [
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVDlkZUxpb2NTazNTQzZrOWdYMlU1Z3dQQ1pHbjhBU3lQIiwiZXhwIjoxNTU5Njc3OTgwNTc0LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTF9.FOHInE1zHz75YxApyra6zoMWyo1o2VM8wngsbVyNBdQ',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVEE2djRua0hIRHBMNTZEcmNiVm11QW5mNFFWMkxrbWZVIiwiZXhwIjoxNTU5NzMzMTQxNDk1LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTR9.74UbZsD6Blqejyai6Pi7YuKk1aRq25RU0_3m9YfdFcc',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBYWNjeWdDMURUZWcyNHhTcVdaRWI3cU13dFJLUWR1Tk5NIiwiZXhwIjoxNTU5NzMzNDMwMDkwLCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTV9._U9EDjRnnbg2XqE3j2L_fa6lRYhCxxA9xGYpv4ZlvMo',
    ];
    for (i = 0; i < ontWallet.accounts.length; i++) {
      window.localStorage.setItem('ACCESS_TOKEN', ACCESS_TOKENs[i]);
      try {
      await backendAPI.reportShare({
        amount: amount,
        blockchain: 'ONT',
        contract: 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV',
        signId: signId,
        symbol: 'ONT',
        referrer: null,
      });  
      } catch (error) {
        
      }
      try {
        await backendAPI.sendComment({ comment: `test ${i}`, signId });  
      } catch (error) {
        
      }
      
    }
    },
  },
};
</script>
