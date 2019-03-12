import { eos, currentEOSAccount as currentAccount } from './scatter';

const publishOnChain = async () => {
  if (currentAccount() == null) { throw new Error('NOT-LOGINED'); }
  return eos().transaction({
    actions: [
      {
        account: 'signature.bp',
        name: 'publish',
        authorization: [{
          actor: currentAccount().name,
          permission: currentAccount().authority,
        }],
        data: {
          from: currentAccount().name,
          fission_factor: 2000,
        },
      },
    ],
  });
};

const claim = (callback) => {
  if (currentAccount() == null) { throw new Error('NOT-LOGINED'); }

  return eos().transaction({
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

function transferEOS({ amount = 0, memo = '', }) {
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

function share_to_action({sign_id = null, upstream_share_id = null,}) {
  if (sign_id == null ) {
    alert('sign_id cant be null');
    return ;
  }
  const amountStr = prompt('请输入打赏金额(EOS)', '');
  const amount = parseFloat(amountStr);
  if (amount == null ) {
    alert('amount cant be 0');
    return ;
  }

  console.log(amount);
  transferEOS({
    amount,
    memo: ( (upstream_share_id != null) ? `share ${sign_id} ${upstream_share_id}` : `share ${upstream_share_id}` ),
  });
}

async function getSignbyhash({hash = null,}) {
  if ( hash == null ) {
    alert('hash cant be null');
    return ;
  }
  const resp = await eos().get_table_rows({
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
  const { rows } = await eos().getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'shares',
    limit: 10000,
  });
  return rows;
}

async function getSignsInfo() {
  const { rows } = await eos().getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'signs',
    limit: 10000,
  });
  return rows;
}

async function getGoods() {
  const { rows } = await eos().getTableRows({
    json: true,
    code: 'signature.bp',
    scope: 'signature.bp',
    table: 'goods',
    limit: 10000,
  });
  return rows;
}

async function getPlayerIncome(name) {
  const { rows } = await eos().getTableRows({
    json: true,
    code: 'signature.bp',
    scope: name,
    table: 'players',
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

export { publishOnChain, claim, transferEOS, share_to_action };
