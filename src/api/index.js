// 仅用于 import && export
// 使用例子
// 之前: `import { xxx } from '@/api/backend'`
// 之后: `import { xxx } from '@/api/'`
import API, { disassembleToken } from './backend';
import defaultImagesUploader from './imagesUploader';

const {
  publishArticle,
  getArticlesList,
  auth, getAuth,
  getArticleDatafromIPFS, getArticleInfo,
  getUser,
  Follow, Unfollow,
  setUserName, getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar, getAvatarImage, getArticleSupports, editArticle,
  draftList, createDraft, updateDraft, delDraft, getDraft,
  reportShare, getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
} = API;

export {
  publishArticle,
  getArticlesList,
  auth, getAuth,
  getArticleDatafromIPFS, getArticleInfo,
  Follow, Unfollow, getUser,
  setUserName, getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar, getAvatarImage, getArticleSupports, editArticle,
  draftList, createDraft, updateDraft, delDraft, getDraft,
  reportShare, getMyUserData, setProfile, getMyPost,
  getBackendData, getBalance,
  // 額外項
  disassembleToken, defaultImagesUploader,
};
