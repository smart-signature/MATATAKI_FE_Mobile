// 仅用于 import && export
// 使用例子
// 之前: `import { xxx } from '@/api/backend'`
// 之后: `import { xxx } from '@/api/'`
import defaultImagesUploader from './imagesUploader';

// This line below is exports

export {
  getArticlesList, publishArticle,
  auth, getAuth,
  getArticleDatafromIPFS, getArticleInfo,
  Follow, Unfollow, getUser,
  setUserName, getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar, getAvatarImage, getArticleSupports, editArticle,
  draftList, createDraft, updateDraft, delDraft, getDraft,
} from './backend';
export { defaultImagesUploader };
