/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-alert */
import { eos, currentEOSAccount as currentAccount } from './scatter';

export const CONTRACT_ACCOUNT = process.env.VUE_APP_SIGNATURE_CONTRACT;

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

  // eslint-disable-next-line no-use-before-define
  return transferEOS({
    amount,
    memo: ((referrer != null) ? `support ${sign_id} ${referrer}` : `support ${sign_id}`),
  });
}

const withdraw = async () => {
  if (currentAccount() == null) {
    alert('请先登录');
    return;
  }

  // eslint-disable-next-line consistent-return
  return eos().transaction({
    actions: [
      {
        account: CONTRACT_ACCOUNT,
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
  // return new Promise((resolve, reject) => {
  if (currentAccount() == null) throw (new Error('NOT-LOGINED'));
  return eos().transaction({
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
          to: CONTRACT_ACCOUNT,
          quantity: `${(amount).toFixed(4).toString()} EOS`,
          memo,
        },
      },
    ],
  });
}
// https://eosio.stackexchange.com/questions/1459/how-to-get-all-the-actions-of-one-account
async function getContractActions() { // 190325 之後才許重構
  const param = {
    json: true,
    account_name: CONTRACT_ACCOUNT,
    /* pos: -1, */
    offset: -200,
  };

  // eslint-disable-next-line no-return-await
  return await eos().getActions(param);

  // const options = {
  //  url: 'https://geo.eosasia.one/v1/history/get_actions',
  //  headers: {
  //    Accept: '*/*',
  //    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
  //   },
  //  body: JSON.stringify(param),
  // };
  // const aaa = await axios.post(options)
  //  .then('response', (response) => {
  //    console.log(response.statusCode); // 200
  //  }) {
  //
  // return JSON.parse(response.data) ;
  // });
  // console.log(JSON.parse(aaa));
}

const getSharesInfo = async (owner) => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: owner,
    table: 'shares',
    limit: 1000,
  });
  return rows;
}

async function getSignInfo(id) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
    table: 'signs',
    lower_bound: id,
    limit: 1,
  });
  return rows;
}

// eslint-disable-next-line no-unused-vars
const getSignsInfo = async () => { // 未调用
  // eslint-disable-next-line no-undef
  const { rows } = await eosapi.getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
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
  // console.log("player actions",actions);
  return actions;
}

async function getPlayerIncome(name) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
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
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
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
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
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
