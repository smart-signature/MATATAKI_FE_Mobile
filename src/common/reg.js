/**
 *
 * @param {地址} address 判断地址 是EOS还是ONT
 */
// eslint-disable-next-line import/prefer-default-export
export const isAddress = address => (/^A[0-9a-zA-Z]{33}$/.test(address));
