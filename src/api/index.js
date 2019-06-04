// 仅用于 import && export
// 使用例子
// 之前: `import { xxx } from '@/api/backend'`
// 之后: `import { xxx } from '@/api/'`
import API, { disassembleToken, getCurrentAccessToken, setAccessToken } from './backend';
import defaultImagesUploader from './imagesUploader';

const {
  getArticlesList,
  getArticleDatafromIPFS, getArticleInfo,
  getUser,
  Follow, Unfollow,
  getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar, getAvatarImage, getArticleSupports,
  draftList, createDraft, updateDraft, delDraft, getDraft,
  getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
} = API;

export {
  API as backendAPI,
  getArticlesList,
  getArticleDatafromIPFS, getArticleInfo,
  Follow, Unfollow, getUser,
  getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar, getAvatarImage, getArticleSupports,
  draftList, createDraft, updateDraft, delDraft, getDraft,
  getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
  // 額外項
  disassembleToken, getCurrentAccessToken, setAccessToken,
  defaultImagesUploader,
};
