import { eos, currentEOSAccount as currentAccount } from './scatter';

// https://github.com/EOSIO/eosjs/tree/v16.0.9

export const CONTRACT_ACCOUNT = process.env.VUE_APP_SIGNATURE_CONTRACT;

const transferEOS = ({ amount = 0, memo = '' }) => {
  if (!currentAccount()) throw (new Error('NOT-LOGINED'));
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

export const support = ({ amount = null, signId = null, sponsor = null }) => {
  if (!currentAccount()) { throw new Error('请先登录'); }
  if (!amount) { throw new Error('amount cant be falsy'); }
  if (!signId) { throw new Error('signId cant be falsy'); }
  return transferEOS({
    amount,
    memo: ((sponsor != null) ? `support ${signId} ${sponsor}` : `support ${signId}`),
  });
};

export const withdraw = () => {
  if (!currentAccount()) { throw new Error('请先登录'); }
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

/*
// https://eosio.stackexchange.com/questions/1459/how-to-get-all-the-actions-of-one-account
export const getContractActions = () => {
  const param = {
    json: true,
    account_name: CONTRACT_ACCOUNT,
    // pos: -1,
    offset: -200,
  };
  return eos().getActions(param);
};

export const getSharesInfo = async (owner) => {
  const { rows } = await eos().getTableRows({
    json: true,
    code: CONTRACT_ACCOUNT,
    scope: owner,
    table: 'shares',
    limit: 1000,
  });
  return rows;
};

export const getSignInfo = async (id) => {
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
    // pos: -1,
    offset: -100,
  });
  // console.log("player actions",actions);
  return actions;
};
*/
export const getPlayerIncome = async (name) => {
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
