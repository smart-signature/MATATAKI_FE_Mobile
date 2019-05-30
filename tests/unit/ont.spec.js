import { unmock, ignoreStory } from 'unmock-node';
import {
  Account, Crypto, RestClient, TransactionBuilder, Wallet, // utils,
} from 'ontology-ts-sdk';
import { ontology } from '@/config';
import backendAPI from '../../src/api/backend';
require('mock-local-storage');

// https://developer.ont.io/applyOng

beforeEach(function() {
  // unmock(ignoreStory())
});

describe('The world', function() {
  this.timeout(120000);

  const signId = 100431;
  const amount = 10;

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

  it('給本體測試帳號打錢', async () => {
    for (let account of ontWallet.accounts) {
      try {
        await axios(`https://ont.io/api/v1/asset/transfer/${account.address.toBase58()}`);
      } catch (error) {

      }
    }
    return true;
  });

  it('ONT 讚賞測試 part 1 合約', async () => {
    const { makeTransactionsByJson, signTransaction } = TransactionBuilder;
    const restClient = new RestClient('https://polaris1.ont.io:10334');
    
    const symbol = 'ONT';
    let json = null;
    let privateZ = null;
    let txs = [];
    let i = 0;
    for (let account of ontWallet.accounts) {
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
    
    return true;
  });
  
  const ACCESS_TOKENs = [
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVDlkZUxpb2NTazNTQzZrOWdYMlU1Z3dQQ1pHbjhBU3lQIiwiZXhwIjoxNTU5Njc3OTgwNTc0LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTF9.FOHInE1zHz75YxApyra6zoMWyo1o2VM8wngsbVyNBdQ',
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVEE2djRua0hIRHBMNTZEcmNiVm11QW5mNFFWMkxrbWZVIiwiZXhwIjoxNTU5NzMzMTQxNDk1LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTR9.74UbZsD6Blqejyai6Pi7YuKk1aRq25RU0_3m9YfdFcc',
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBYWNjeWdDMURUZWcyNHhTcVdaRWI3cU13dFJLUWR1Tk5NIiwiZXhwIjoxNTU5NzMzNDMwMDkwLCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTV9._U9EDjRnnbg2XqE3j2L_fa6lRYhCxxA9xGYpv4ZlvMo',
  ];
  for (let i = 0 ; i < ontWallet.accounts.length; i++) {
      window.localStorage.setItem('ACCESS_TOKEN', ACCESS_TOKENs[i]);
      it(`backendAPI.reportShare ${i}`, async () => {
        await backendAPI.reportShare({
          amount,
          blockchain: 'ONT',
          contract: 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV',
          signId,
          symbol: 'ONT',
          referrer: null,
        }).catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);
        });
        // throw res.config ;
        it(`backendAPI.sendComment ${i}`, async () => backendAPI.sendComment({ comment: `test ${i}`, signId }));
        return true;
      });
  }
  
  return true;
});
