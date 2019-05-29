import { unmock, ignoreStory } from 'unmock-node';
import {
  Account, Crypto, RestClient, TransactionBuilder, Wallet, // utils,
} from 'ontology-ts-sdk';
import { ontology } from '@/config';
import backendAPI from '../../src/api/backend';
import https from 'https';
// https://developer.ont.io/applyOng
// console.log('address2: ' + account2.address.toBase58() + ' ' + account2.address.serialize());
// `address1: ${account1.address.toBase58()} ${account1.address.serialize()}`
require('mock-local-storage');


beforeEach(function() {
  window.localStorage.setItem('ACCESS_TOKEN', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJBVDlkZUxpb2NTazNTQzZrOWdYMlU1Z3dQQ1pHbjhBU3lQIiwiZXhwIjoxNTU5Njc3OTgwNTc0LCJwbGF0Zm9ybSI6Im9udCIsImlkIjozMTF9.FOHInE1zHz75YxApyra6zoMWyo1o2VM8wngsbVyNBdQ');
  // unmock(ignoreStory())
});

describe('The world', function() {
  this.timeout(60000);
  it('ONT 讚賞測試 @ signId: 100429', async () => {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const axiosX = axios.create({
      httpsAgent,
    });

    var ontWallet = Wallet.create('test');
    let privateKeys = [
      // AT9deLiocSk3SC6k9gX2U5gwPCZGn8ASyP
      'L2JRYhnR5dHSUnsPSxD8LRGCxcWuAq6pQasjwZypTgVUEw3kdQBw',
      'L3MQU2MopV96RJKgZNNVC7oRicRTjWwB7WhQHk8vu6xadrQhYrrf',
    ];
    privateKeys = privateKeys.map((key) => Crypto.PrivateKey.deserializeWIF(key));
    ontWallet.addAccount(Account.create(privateKeys[0], 'password', 'cat1'));
    const { address, encryptedKey, salt } = ontWallet.accounts[0];
    const private2 = encryptedKey.decrypt('password', address, salt);
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
    const { makeTransactionsByJson, signTransaction } = TransactionBuilder;

    const txs = makeTransactionsByJson(json);
    signTransaction(txs[0], private2);
    // await axiosX('https://polaris1.ont.io:10334/api/v1/version');
    return true;
    await restClient.sendRawTransaction(txs[0].serialize(), false);
    //return true;
    //console.log(res);
    
    await backendAPI.reportShare({
      amount: amount,
      blockchain: 'ONT',
      contract: 'AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV',
      signId: signId,
      symbol: 'ONT',
      referrer: null,
    });
    return await backendAPI.sendComment({ comment: 'test 1', signId });
    return true;
  });
});
