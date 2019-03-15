import { eos, eosapi, currentEOSAccount as currentAccount } from './scatter';

const publishOnChain = async ({hash = '',}) => {
  if (currentAccount() == null) { 
    alert('请先登录'); 
    throw new Error('NOT-LOGINED');
  }
  return await eos().transact({
    actions: [{
        account: 'signature.bp',
        name: 'publish',
        authorization: [{
          actor: currentAccount().name,
          permission: currentAccount().authority,
        }],
        data: {
          sign: {
            id: "0", /* 一定會被覆蓋 */
            author: currentAccount().name,
            fission_factor: "2000",
            ipfs_hash: hash,
            /* 下面兩個需要一個預設值 */
            public_key: 'EOS5P9HXdVTcAVMph4ZppDKBMkBuT6ihnkLqTUrVFBtGR94cPjykJ',
            signature: 'SIG_K1_KZU9PyXP8YAePjCfCcmBjGHARkvTVDjKpKvVgS6XL8o2FXTXUdhP3rqrL38dJYgJo2WNBdYubsY9LKTo47RUUE4N3ZHjZQ',
          },
        },
    }]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
  }).then(res => {
      console.log('sent: ', res);
  }).catch(err => {
      console.error('error: ', err);
  });
};

const ezpublishOnChain = ({hash = '',}) => {
  if (currentAccount() == null) { 
    alert('请先登录'); 
    throw new Error('NOT-LOGINED');
  }
  // const account = ScatterJS.account('eos');

  return eos().transact({
    actions: [{
        account: 'signature.bp',
        name: 'ezpublish',
        authorization: [{
          actor: currentAccount().name,
          permission: currentAccount().authority,
        }],
        data: {
            author: currentAccount().name,
            fission_factor: "2000",
            ipfs_hash: hash,
        },
    }]
  }, {
      blocksBehind: 3,
      expireSeconds: 30,
  }).then(res => {
      console.log('sent: ', res);
  }).catch(err => {
      console.error('error: ', err);
  });
};

const claim = () => {
  return eos.transact({
    actions: [
      {
        account: 'signature.bp',
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
};

async function support({ amount = null, hash = null, share_id = null }) {
  if (currentEOSAccount() == null) { 
    alert('请先登录'); 
    return;
  }
  const contract = await eos().contract('signature.bp');
  const sign = await contract.getSignbyhash(hash);
  return await contract.action_support({
    amount,
    sign_id: sign.id,
    share_id,
  });
}

const action_support = ({amount = null, sign_id = null, share_id = null,}) => {
  if (amount == null) {
    alert('amount cant be 0');
    return ;
  }
  if (sign_id == null) {
    alert('sign_id cant be null');
    return ;
  }

  return transferEOS({
    amount,
    memo: ( (share_id != null) ? `share ${sign_id} ${share_id}` : `share ${sign_id}` ),
  });
}

async function withdraw() {
  if (currentEOSAccount() == null) {
    alert('请先登录');
    return;
  }
  const contract = await eos().contract('signature.bp');
  return await contract.claim() ;
};

function transferEOS({ amount = 0, memo = '' }) {
  if (currentAccount() == null) { throw new Error('NOT-LOGINED'); }

  return eos.transact({
    actions: [
      {
        account: 'eosio.token',
        name: 'transfer',
        authorization: [`${currentAccount().name}@${currentAccount().authority}`],
        data: {
          from: currentAccount().name,
          to: 'signature.bp',
          quantity: `${(amount).toFixed(4).toString()} EOS`,
          memo,
        },
      },
    ],
  }).then((result) => {
    alert('publish success!');
  }).catch((error) => {
    alert(`error:${JSON.stringify(error)}`);
  });
}

const getPlayerIncome = (name) => {
  const { rows } = eosapi.getTableRows({
    json: true,
    code: 'signature.bp',
    scope: name,
    table: 'players',
    limit: 10000,
  });
  return rows;
}

async function getSignbyhash({ hash = null }) {
  if (hash == null) {
    alert('hash cant be null');
    return;
  }
  const resp = await eosapi.get_table_rows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'signs',
    table_key: 'hash',
    lower_bound: hash,
    limit: 1,
  });
  console.log(resp.rows);
  return resp;
}

async function getSharesInfo() {
  const { rows } = await eosapi.getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'shares',
    limit: 10000,
  });
  return rows;
}

async function getSignsInfo() {
  const { rows } = await eosapi.getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'signs',
    limit: 10000,
  });
  return rows;
}
/*
async function getGoods() {
  const { rows } = await eosapi().getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'goods',
    limit: 10000,
  });
  return rows;
}
*/

/*
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
  ezpublishOnChain, publishOnChain, claim, transferEOS, support, action_support,
  getSignbyhash, withdraw, getMaxShareId, getMaxSignId, getPlayerIncome, getGoods,
};
