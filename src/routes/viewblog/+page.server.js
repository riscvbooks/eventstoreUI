import { get_blog_id, get_user_profile } from "$lib/esclient";

// 将回调式API转换为Promise
function getBlogIdPromise(blogId) {
  return new Promise((resolve, reject) => {
    get_blog_id(blogId, (message) => {
      if (message.code === 200) {
        resolve({
          blogData: JSON.parse(message.data),
          userPubkey: message.user,
          serverTimestamp: message.servertimestamp
        });
      } else {
        reject(new Error(`获取博客失败: ${message.message || '未知错误'}`));
      }
    });
  });
}

function getUserProfilePromise(pubkey) {
  return new Promise((resolve) => {
    get_user_profile(pubkey, (msg) => {
      if (msg.code === 200) {
        resolve(JSON.parse(msg.data));
      } else {
        // 即使获取用户信息失败也不阻断主流程
        resolve(null);
      }
    });
  });
}

export async function load({ url }) {
  try {
    // 从URL参数获取blogid
    const blogId = url.searchParams.get('blogid');
    
    if (!blogId) {
      return {
        blogData: null,
        userProfile: null,
        error: '缺少博客ID参数'
      };
    }

    // 1. 预取博客基本信息
    const { blogData, userPubkey, serverTimestamp } = await getBlogIdPromise(blogId);
    
    // 补充服务器时间戳
    blogData.servertimestamp = serverTimestamp;

    // 2. 预取作者信息
    const userProfile = userPubkey ? await getUserProfilePromise(userPubkey) : null;

    return {
      blogId,
      blogData,
      userProfile,
      error: null
    };
  } catch (error) {
    console.error('博客数据预取失败:', error);
    return {
      blogId: url.searchParams.get('blogid') || '',
      blogData: null,
      userProfile: null,
      error: error.message || '加载博客内容失败'
    };
  }
}
    