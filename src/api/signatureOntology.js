// 待修
import { client, isAPP, toolkit } from './cyanobridge';

const getSign = async (signId) => {
  let result = null;
  console.log('x1.');
  if (!isAPP) {
    result = await client.api.smartContract.invokeRead({
      scriptHash: '03d99d998fba6b1bb02d84676bce52f2f4a6ddc3',
      operation: 'getSign',
      args: [{
        type: 'Integer',
        value: signId,
      }],
      gasLimit: 20000,
      gasPrice: 500,
    });
  } else {
    result = await client.api.smartContract.invokeRead({
      scriptHash: '03d99d998fba6b1bb02d84676bce52f2f4a6ddc3',
      operation: 'getSign',
      args: [{
        type: 'Integer',
        value: signId,
      }],
      gasLimit: 20000,
      gasPrice: 500,
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
