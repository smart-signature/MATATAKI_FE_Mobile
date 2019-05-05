// 待修
import { client, isAPP, toolkit } from './cyanobridge';

const scriptHash = '03d99d998fba6b1bb02d84676bce52f2f4a6ddc3';
const gasLimit = 20000;
const gasPrice = 500;

const getSign = async (signId) => {
  let result = null;
  // console.log('x1.');
  if (!isAPP) {
    result = await client.api.smartContract.invokeRead({
      scriptHash,
      operation: 'getSign',
      args: [{
        type: 'Integer',
        value: signId,
      }],
      gasLimit,
      gasPrice,
    });
  } else {
    result = await client.api.smartContract.invokeRead({
      scriptHash,
      operation: 'getSign',
      args: [{
        type: 'Integer',
        value: signId,
      }],
      gasLimit,
      gasPrice,
    });
  }

  console.log('result: ', JSON.stringify(result));


  const { ab2str, hexstring2ab, reverseHex } = toolkit;
  /*
    const langarr.push([
        parseInt(reverseHex(`${result[0]}`), 16),
        parseInt(reverseHex(`${result[1]}`), 16),
        ab2str(hexstring2ab(`${result[2]}`)),
        countryPointsJson[i].code
      ])
    }

    const globals = [
      parseInt(reverseHex(`${results[0]}`), 16),
      ab2str(hexstring2ab(`${results[1]}`)),
      results[2] ? parseInt(reverseHex(`${results[2]}`), 16) : 0,
    ]

   */
};

const recordShare = async ({ amount = null, shareKey = null }) => {
  // if (currentAccount() === null) { throw new Error('请先登录'); }
  if (!amount) { throw new Error('amount cant be null'); }
  if (!shareKey) { throw new Error('shareKey cant be null'); }
  const operation = 'RecordShare';

  let result = null;
  if (!isAPP) {
    result = await client.api.smartContract.invokeRead({
      scriptHash,
      operation,
      args: [
        {
          type: 'Integer',
          value: amount,
        },
        {
          type: 'string',
          value: shareKey,
        },
      ],
      gasLimit,
      gasPrice,
    });
  } else {
    result = await client.api.smartContract.invokeRead({
      scriptHash,
      operation,
      args: [
        {
          type: 'Integer',
          value: amount,
        },
        {
          type: 'string',
          value: shareKey,
        },
      ],
      gasLimit,
      gasPrice,
    });
  }

  console.log('result: ', JSON.stringify(result));


  const { ab2str, hexstring2ab, reverseHex } = toolkit;
  /*
    const langarr.push([
        parseInt(reverseHex(`${result[0]}`), 16),
        parseInt(reverseHex(`${result[1]}`), 16),
        ab2str(hexstring2ab(`${result[2]}`)),
        countryPointsJson[i].code
      ])
    }

    const globals = [
      parseInt(reverseHex(`${results[0]}`), 16),
      ab2str(hexstring2ab(`${results[1]}`)),
      results[2] ? parseInt(reverseHex(`${results[2]}`), 16) : 0,
    ]

   */
};

export {
  getSign,
};
