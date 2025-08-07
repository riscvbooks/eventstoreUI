<script>
  import { onMount } from 'svelte';
  import ViewNestedTree from '$lib/ViewNestedTree.svelte';
  import "$lib/editbook.css";
  import { page } from '$app/stores';


  import ViewMD from '$lib/ViewMD.svelte';

  // 从page.params中提取bookId
  const bookId = $page.params.bookId;

  import {upload_file,
    create_book,
    update_book,
    create_chapter,
    get_book_id,
    get_chapter} from "$lib/esclient";
  
   let initialOutline = [];
   let bookAuthor;
   let bookTitle;
   let coverImgurl;

   let currentChapterContent;
   let globalClickId;
   async function handleSetClickId(item) {
    globalClickId = item.id;

    currentChapterContent = "";
   }

  function handleChapterSelect(item) {
    console.log('选中章节:', item);
     
    get_chapter(bookId,item.id,(message) =>{
        if (message != "EOSE"){  
            currentChapterContent = message.data;

        }
    })
  }

 function findFirstChapterNode(items) {
    for (const item of items) {
      // 假设章节节点有 type: 'chapter' 属性，可根据实际结构调整
      if (item.type === 'chapter' && item.id) {
        return item;
      }
      // 如果有子节点，递归查找
      if (item.children && item.children.length > 0) {
        const found = findFirstChapterNode(item.children);
        if (found) return found;
      }
    }
    return null; // 未找到章节节点
  }

  function loadChapterContent(chapterId) {
    
    get_chapter(bookId, chapterId, (message) => {
      if (message !== "EOSE" && message.data) {
        currentChapterContent = message.data;
      }  
    });
  }

    onMount(async () => {

                    // 动态加载 CSS
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/static/css/vue.css';
        document.head.appendChild(css);

        // 动态加载 JS
        const js = document.createElement('script');
        js.src = '/static/js/docsify.min.js';
        document.body.appendChild(js);

        const styleElements = document.getElementsByTagName('style');
        let targetStyleElement = null;
        for (let i = 0; i < styleElements.length; i++) {
            const element = styleElements[i];
            const dataViteDevId = element.getAttribute('data-vite-dev-id');
            if (dataViteDevId && dataViteDevId.includes('app.css')) {            
                element.parentNode.removeChild(element);
                break;
            }
        }

        await get_chapter(bookId,"outline.md",function(message){
            if (message != "EOSE"){
                
                initialOutline = JSON.parse(message.data)
                let firstChapter = findFirstChapterNode(initialOutline)
                if (firstChapter) loadChapterContent(firstChapter.id)
            }
        });

        await get_book_id(bookId, (message) => {
            if (message != "EOSE"){
            
            bookAuthor = message.data.author;
            bookTitle = message.data.title;
            coverImgurl = message.data.coverImgurl;
            }
        });

    })

</script>

<style>
/* 基础布局样式 */
.book-view-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f0f4f8 0%, #e6e9f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 侧边栏样式（合并重复定义，保留增强版设计） */
.book-sidebar {
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.8rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  z-index: 10;
}

/* 书籍信息卡片样式 */
.book-meta {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 
              0 5px 10px -5px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(12px);
  margin-bottom: 2rem;
  position: relative; /* 用于伪元素定位 */
}

.book-meta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px; /* 高度减少，视觉更纤细 */
  background: linear-gradient(90deg, 
    rgba(79, 70, 229, 0.4),  /* 降低蓝色透明度 */
    rgba(139, 92, 246, 0.4)  /* 降低紫色透明度 */
  );
  z-index: -1;
}

/* 书籍标题与作者样式 */
.book-title {
  font-size: 1.4rem;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.book-author {
  color: #64748b;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0; /* 保留必要的间距 */
}

/* 书籍统计信息 */
.book-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1.2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.stat-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.08);
  border-radius: 8px;
  color: #4F46E5;
}

/* 目录区域样式 */
.book-outline h2 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #1e293b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid rgba(79, 70, 229, 0.15);
}

.outline-tree {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* 大纲项样式 */
.outline-item {
  padding: 0.5rem 0.8rem;
  margin: 0.3rem 0;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.outline-item:hover {
  background: rgba(79, 70, 229, 0.03);
  border-left: 3px solid rgba(79, 70, 229, 0.2);
}

.outline-item.active {
  background: rgba(79, 70, 229, 0.08);
  border-left: 3px solid #4F46E5;
  color: #4F46E5;
  font-weight: 500;
}

.outline-icon {
  color: #8B5CF6;
  font-size: 0.9rem;
}

.chapter-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 6px;
  text-align: center;
  line-height: 24px;
  font-size: 0.8rem;
  color: #8B5CF6;
  margin-right: 0.3rem;
}

/* 空目录提示样式 */
.empty-outline {
  color: #94a3b8;
  font-size: 0.95rem;
  margin: 1rem 0;
  padding: 1.5rem;
  background: rgba(241, 245, 249, 0.8);
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  text-align: center;
}

/* 章节层级缩进 */
.outline-children {
  margin-left: 1.8rem;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
  padding-left: 1rem;
}

/* 右侧内容区样式 */
.book-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background-color: #ffffff;
}

.no-selection, .no-content {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  font-size: 1.2rem;
  color: #374151;
  padding: 1rem 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 响应式设计（合并重复断点样式） */
@media (max-width: 768px) {
  .book-view-container {
    flex-direction: column;
  }
  
  .book-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    max-height: 45vh;
  }
  
  .book-content {
    padding: 1.5rem;
  }
}
</style>

<!-- 页面主容器 -->
<div class="book-view-container">
  <!-- 加载状态 -->
 
    <!-- 左侧边栏 - 书籍信息和大纲 -->
    <aside class="book-sidebar">
        <!-- 书籍信息 -->
      <div class="book-meta">
        <div class="p-5">
          <h1 class="book-title text-xl font-bold text-gray-800 mb-1 line-clamp-2">
            《{bookTitle}》
          </h1>
          <p class="book-author text-sm text-gray-600 flex items-center">
            <span class="inline-block w-1 h-1 rounded-full bg-gray-400 mr-1.5"></span>
            作者: {bookAuthor}
          </p>
          
          <!-- 装饰分隔线 -->
          <div class="mt-3 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
          
          <!-- 章节数量统计 -->
          {#if initialOutline.length > 0}
            <div class="mt-3 text-xs text-gray-500">
              共 {initialOutline.length} 个章节
            </div>
          {/if}
        </div>
      </div>
      
     <div class="flex items-center gap-2 my-1">
        <div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
        <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
        <div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
    </div>

      <div class="book-outline">
        <h2>目录</h2>
        {#if initialOutline.length > 0}
          <ViewNestedTree 
            items={initialOutline} 
            onSelect={handleChapterSelect}
            onSetClickId={handleSetClickId}
            clickId={globalClickId}  
            class="outline-tree"
          />
        {:else}
          <p class="empty-outline">本书暂无目录</p>
        {/if}
      </div>
    </aside>
    
    <!-- 右侧内容区 - Markdown内容 -->
    <main class="book-content">
      {#if currentChapterContent}
        <ViewMD mdcontent={currentChapterContent} />
      {:else if initialOutline.length > 0}
        <div class="no-selection">
          <p>作者正在快速赶工中，耐心等待...</p>
        </div>
      {:else}
        <div class="no-content">
          <p>本书暂无内容</p>
        </div>
      {/if}
    </main>
 
</div>

