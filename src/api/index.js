// 仅用于 import && export
// 使用例子
// 之前: `import { xxx } from '@/api/backend'`
// 之后: `import { xxx } from '@/api/'`
import defaultImagesUploader from './imagesUploader';

// This line below is exports

export {
  getArticlesList, publishArticle, auth, getAuth,
  getArticleData, getArticleInfo, getArticleInHash,
  Follow, Unfollow, getUser, oldgetUser,
  setUserName, getFansList, getFollowList,
  getSharesbysignid, sendComment, addReadAmount, getAssets,
  delArticle, uploadAvatar,
} from './backend';
export { defaultImagesUploader };
