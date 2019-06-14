// 仅用于 import && export
// 使用例子
// 之前: `import { xxx } from '@/api/backend'`
// 之后: `import { xxx } from '@/api/'`
import API, { accessTokenAPI } from './backend';
import defaultImagesUploader from './imagesUploader';

const {
  getArticleDatafromIPFS, getArticleInfo,
  sendComment, addReadAmount,
  delArticle, uploadAvatar, getAvatarImage,
  createDraft, updateDraft, delDraft, getDraft,
  getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
} = API;

export {
  API as backendAPI,
  getArticleDatafromIPFS, getArticleInfo,
  sendComment, addReadAmount,
  delArticle, uploadAvatar, getAvatarImage,
  createDraft, updateDraft, delDraft, getDraft,
  getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
  // 額外項
  accessTokenAPI,
  defaultImagesUploader,
};
