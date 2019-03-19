import { eos, currentEOSAccount as currentAccount } from './scatter';

const SIGNATURE_CONTRACT = 'signature.bp';

const publishOnChain = async ({ hash = '', fission_factor = 2000 }) => {
  if (currentAccount() == null) {
    alert('请先登录');
    throw new Error('NOT-LOGINED');
  }
  return eos().transaction({
    actions: [
      {
        account: SIGNATURE_CONTRACT,
        name: 'publish',
        authorization: [{
          actor: currentAccount().name,
          permission: currentAccount().authority,
        }],
        data: {
          sign:
          {
            author: currentAccount().name,
            fission_factor,
            id: 0, /* 一定會被覆蓋 */
            ipfs_hash: hash,
            /* 下面兩個需要一個預設值 */
            public_key: 'EOS5P9HXdVTcAVMph4ZppDKBMkBuT6ihnkLqTUrVFBtGR94cPjykJ',
            signature: 'SIG_K1_KZU9PyXP8YAePjCfCcmBjGHARkvTVDjKpKvVgS6XL8o2FXTXUdhP3rqrL38dJYgJo2WNBdYubsY9LKTo47RUUE4N3ZHjZQ',
          },
        },
      },
    ],
  });
};

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

  return transferEOS({
    amount,
    memo: ((referrer != null) ? `support ${sign_id} ${referrer}` : `support ${sign_id}`),
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
  if (currentAccount() == null) { throw new Error('NOT-LOGINED'); }

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
    alert('publish success!');
    console.log(result);
  }).catch((error) => {
    alert(`error:${JSON.stringify(error)}`);
  });
}

async function getPlayerIncome(name) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: name,
    table: 'players',
    limit: 1,
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
  return actions;
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
*/
async function getSharesInfo() {
  const { rows } = await eosapi.getTableRows({
    json: true,
    code: SIGNATURE_CONTRACT,
    scope: SIGNATURE_CONTRACT,
    table: 'shares',
    limit: 10000,
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
/*
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
  publishOnChain,
  support, withdraw,
  getPlayerIncome, getPlayerBills,
};
