import axios from 'axios';
import qs from 'qs';

const server = 'https://ipfs.libra.bet';

function sendPost({
  title, author, desc, content,
}) {
  const url = `${server}/addJSON`;

  const stringifyData = qs.stringify({
    'data[title]': title,
    'data[author]': author,
    'data[desc]': desc,
    'data[content]': content,
  });
  return axios({
    method: 'post',
    url,
    data: stringifyData,
    config: { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  });
}

export { sendPost };
