import axios from 'axios'
import qs from 'qs'
import { apiServer, accessTokenAPI } from '@/api/backend'

function sendPost({ title, author, desc, content }) {
  const stringifyData = qs.stringify({
    'data[title]': title,
    'data[author]': author,
    'data[desc]': desc,
    'data[content]': content
  })
  // return axios.post(`${apiServer}/ipfs/addJSON`, {
  //   data: stringifyData,
  //   config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  // });
  const token = accessTokenAPI.get();
  return axios({
    method: 'post',
    url: `${apiServer}/post/ipfs`,
    data: stringifyData,
    config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    headers: { 'x-access-token': token }
  })
}

// eslint-disable-next-line import/prefer-default-export
export { sendPost }

// 图片上传接口
export const ifpsUpload = `${apiServer}/ipfs/upload`
