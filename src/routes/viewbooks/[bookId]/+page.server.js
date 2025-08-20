import { get_book_id, get_chapter } from "$lib/esclient";

// 工具函数：将回调式API转换为Promise
function getBookIdPromise(bookId) {
  return new Promise((resolve, reject) => {
    get_book_id(bookId, (message) => {
      if (message === "EOSE") {
        reject(new Error("未找到书籍信息"));
      } else if (message) {
        resolve(message);
      } else {
        reject(new Error("获取书籍信息失败"));
      }
    });
  });
}

function getChapterPromise(bookId, chapterId) {
  return new Promise((resolve, reject) => {
    get_chapter(bookId, chapterId, (message) => {
      if (message === "EOSE") {
        resolve(null); // 没有更多数据
      } else if (message) {
        resolve(message);
      } else {
        reject(new Error(`获取章节 ${chapterId} 失败`));
      }
    });
  });
}

// 工具函数：查找第一个章节节点
function findFirstChapterNode(items) {
  for (const item of items) {
    if (item.type === 'chapter' && item.id) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findFirstChapterNode(item.children);
      if (found) return found;
    }
  }
  return null;
}

export async function load({ params }) {
  try {
    const { bookId } = params;
    
    // 1. 并行预取书籍基本信息和大纲
    const [bookInfo, outlineData] = await Promise.all([
      getBookIdPromise(bookId),
      getChapterPromise(bookId, "outline.md")
    ]);

    // 2. 解析大纲
    let initialOutline = [];
    if (outlineData?.data) {
      initialOutline = JSON.parse(outlineData.data);
    }

    // 3. 获取第一个章节内容
    let firstChapterContent = null;
    const firstChapter = findFirstChapterNode(initialOutline);
    if (firstChapter) {
      const chapterData = await getChapterPromise(bookId, firstChapter.id);
      firstChapterContent = chapterData?.data || null;
    }

    // 4. 提取URL中的from参数
    // 注意：server端无法直接获取window.location，需要从请求URL中解析
    // 这里假设from参数可能通过请求头或其他方式传递，实际需根据你的路由设计调整
    // const fromParam = request.url.searchParams.get('from') || null;

    return {
      bookId,
      bookInfo: {
        author: bookInfo.data.author,
        title: bookInfo.data.title,
        coverImgurl: bookInfo.data.coverImgurl
      },
      initialOutline,
      firstChapter: {
        id: firstChapter?.id || null,
        content: firstChapterContent
      },
      error: null
    };
  } catch (error) {
    console.error("数据预取失败:", error);
    return {
      bookId: params.bookId,
      bookInfo: null,
      initialOutline: [],
      firstChapter: null,
      error: error.message
    };
  }
}
    