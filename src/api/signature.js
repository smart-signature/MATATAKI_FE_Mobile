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

function transferEOS({ memo = '', amount = 0 }) {
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

function input() {
  const amountStr = prompt('请输入打赏金额', '');
  const amount = parseFloat(amountStr);
  console.log(amount);
  const shareaccount = getRefer();
  let shareid = null;
  if (shareaccount == null) {
    transferEOS({
      amount,
      memo: `share ${signid}`,
    });
  } else {
    for (let i = sharerows.length - 1; i >= 0; i--) {
      if (sharerows[i].reader === shareaccount) {
        shareid = sharerows[i].id;
        break;
      }
    }

    if (shareid != null) {
      if (amount != null) {
        transferEOS({
          amount,
          memo: `share ${signid} ${shareid}`,
        });
      }
    } else if (amount != null) {
      transferEOS({
        amount,
        memo: `share ${signid}`,
      });
    }
  }
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

export { publishOnChain, claim, transferEOS };
