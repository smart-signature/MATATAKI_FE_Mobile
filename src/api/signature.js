import request from 'request';
import { eos, currentEOSAccount as currentAccount } from './scatter';

const SIGNATURE_CONTRACT = 'signature.bp';

async function support({ amount = null, sign_id = null, referrer = null }) {
  if (currentAccount() == null) {
    alert('请先登录');
    return;
  }
  if (amount == null) {
    alert('amount cant be 0');
    return;
  }
  if (sign_id == null) {
    alert('sign_id can\'t be null');
    return;
  }

  return new Promise((resolve, reject) => {
    transferEOS({
      amount,
      memo: ((referrer != null) ? `support ${sign_id} ${referrer}` : `support ${sign_id}`),
    }).then(() => {
      resolve();
    }).catch((error) => {
      console.log('error on support:', error);
      reject(error);
    });
  });
}

async function withdraw() {
  if (currentAccount() == null) {
    alert('请先登录');
    return;
  }

  // const contract = await eos().contract(SIGNATURE_CONTRACT);

  if (currentAccount() == null) { throw new Error('NOT-LOGINED'); }

  return eos().transaction({
    actions: [
      {
        account: SIGNATURE_CONTRACT,
        name: 'claim',
        authorization: [{
          actor: currentAccount().name,
          permission: currentAccount().authority,
        }],
        data: {
          from: currentAccount().name,
        },
      },
    ],
  });
}
function transferEOS({ amount = 0, memo = '' }) {
  return new Promise((resolve, reject) => {
    if (currentAccount() == null) reject(new Error('NOT-LOGINED'));
    eos().transaction({
      actions: [
        {
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{
            actor: currentAccount().name,
            permission: currentAccount().authority,
          }],
          data: {
            from: currentAccount().name,
            to: SIGNATURE_CONTRACT,
            quantity: `${(amount).toFixed(4).toString()} EOS`,
            memo,
          },
        },
      ],
    }).then((result) => {
      // alert('publish success!');
      console.log(result);
      resolve();
    }).catch((error) => {
      console.log(`error:${JSON.stringify(error)} on transfer eos`);
      reject(error);
    });
  });
}
// https://eosio.stackexchange.com/questions/1459/how-to-get-all-the-actions-of-one-account
async function getContractActions() { // 190325 之後才許重構
  const param = {
    json: true,
    account_name: SIGNATURE_CONTRACT,
    /* pos: -1, */
    offset: -200,
  };

  return await eos().getActions(param);

  // const body = JSON.stringify(param);
  // const options = {
  //  method: 'POST',
  //  url: 'https://geo.eosasia.one/v1/history/get_actions',
  //  headers: { Accept: '*/*', 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
  //  body,
  // };
  // const aaa = await request(options, function (error, response, body) {
  //  if (error) throw new Error(error);
  //
  //  console.log(body);
  // }).on('response', function(response) {
  //  console.log(response.statusCode); // 200
  // console.log(response); // 200 JSON.parse(
  // console.log(response.headers['content-type']) // 'image/png'
  // return JSON.parse(response.body) ;
  // });
  // console.log(JSON.parse(aaa));
}

async function getSharesInfo(owner) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: owner,
    table: 'shares',
    limit: 1000,
  });
  return rows;
}
/*
async function getSharesInfo() {
  const { rows } = await eos().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'shares',
    limit: 10000,
  });
  return rows;
} */

async function getSignInfo(id) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'signs',
    lower_bound: id,
    limit: 1,
  });
  return rows;
}

async function getSignsInfo() {
  const { rows } = await eosapi.getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'signs',
    limit: 10000,
  });
  return rows;
}

async function getPlayerBills(owner) {
  const { actions } = await eos().getActions({
    json: true,
    account_name: owner,
    /* pos: -1, */
    offset: -100,
  });
  //console.log("player actions",actions);
  return actions;
}

async function getPlayerIncome(name) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: name,
    table: 'players',
    limit: 1,
  });
    // console.log("player income:",rows)  //for debug
  return rows;
}

/*
async function getSignbyhash({ hash = null }) {
  if (hash == null) {
    alert('hash cant be null');
    return;
  }
  const resp = await eosapi.getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'signs',
    lower_bound: hash,
    limit: 1,
  });
  console.log(resp.rows);
  return resp;
}

async function getGoods() {
  const { rows } = await eosapi().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'goods',
    limit: 10000,
  });
  return rows;
}

async function getMaxShareId() {
  const rows = await getSharesInfo();
  const len = rows.length;

  return len - 1;
}

async function getMaxSignId() {
  const rows = await getSignsInfo();
  const len = rows.length;
  let maxId = 0;

  for (let i = 0; i < len; i++) {
    for (obj in rows[i]) {
      if (obj.id > maxId) {
        maxId = obj.id;
      }
    }
  }
  return maxId;
}
*/

export {
  support, withdraw,
  getContractActions,
  getSignInfo, getSharesInfo,
  getPlayerIncome, getPlayerBills,
};
