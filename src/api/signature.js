import { eos, currentEOSAccount as currentAccount } from './scatter';

// https://github.com/EOSIO/eosjs/tree/v16.0.9

export const CONTRACT_ACCOUNT = process.env.VUE_APP_SIGNATURE_CONTRACT;

const transferEOS = ({ amount = 0, memo = '' }) => {
  if (currentAccount() == null) throw (new Error('NOT-LOGINED'));
  return eos().transaction({
    actions: [{
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
    }],
  });
};

const support = ({ amount = null, signId = null, referrer = null }) => {
  if (currentAccount() === null) { throw new Error('请先登录'); }
  if (amount === null) { throw new Error('amount cant be 0'); }
  if (signId === null) { throw new Error('sign_id can\'t be null'); }
  return transferEOS({
    amount,
    memo: ((referrer != null) ? `support ${signId} ${referrer}` : `support ${signId}`),
  });
};

const withdraw = () => {
  if (currentAccount() == null) { throw new Error('请先登录'); }
  return eos().transaction({
    actions: [{
      account: CONTRACT_ACCOUNT,
      name: 'claim',
      authorization: [{
        actor: currentAccount().name,
        permission: currentAccount().authority,
      }],
      data: { from: currentAccount().name },
    }],
  });
};


// https://eosio.stackexchange.com/questions/1459/how-to-get-all-the-actions-of-one-account
const getContractActions = () => {
  const param = {
    json: true,
    account_name: CONTRACT_ACCOUNT,
    /* pos: -1, */
    offset: -200,
  };
  return eos().getActions(param);

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
  //    console.log(response.statusCode); // 200    // 如果还需要用这段代码 请给statusCode 替换为 status
  //  }) {
  //
  // return JSON.parse(response.data) ;
  // });
  // console.log(JSON.parse(aaa));
};

const getSharesInfo = async (owner) => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: owner,
    table: 'shares',
    limit: 1000,
  });
  return rows;
};

const getSignInfo = async (id) => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
    table: 'signs',
    lower_bound: id,
    limit: 1,
  });
  return rows;
};

// eslint-disable-next-line no-unused-vars
const getSignsInfo = async () => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: CONTRACT_ACCOUNT,
    table: 'signs',
    limit: 10000,
  });
  return rows;
};

const getPlayerBills = async (owner) => {
  const { actions } = await eos().getActions({
    json: true,
    account_name: owner,
    /* pos: -1, */
    offset: -100,
  });
  // console.log("player actions",actions);
  return actions;
};

const getPlayerIncome = async (name) => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: name,
    table: 'players',
    limit: 1,
  });
  // console.debug('getPlayerIncome : ', rows);
  return rows;
};

/*
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
