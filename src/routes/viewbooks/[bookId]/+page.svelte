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
  /* 保留原样式，移除与Tailwind冲突的部分 */
  .book-view-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #f9fafb;
  }
  
  .book-sidebar {
    width: 320px;
    background-color: #ffffff;
    border-right: 1px solid #e5e7eb;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .book-outline h2 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #111827;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .outline-tree {
    font-size: 0.95rem;
  }
  
  .empty-outline {
    color: #6b7280;
    font-size: 0.95rem;
    margin: 0;
    padding: 0.5rem;
    background-color: #f9fafb;
    border-radius: 4px;
  }
  
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

  @media (max-width: 768px) {
    .book-view-container {
      flex-direction: column;
    }
    
    .book-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
      max-height: 50vh;
    }
    
    .book-content {
      padding: 1rem;
    }
  }
</style>

<!-- 页面主容器 -->
<div class="book-view-container">
  <!-- 加载状态 -->
 
    <!-- 左侧边栏 - 书籍信息和大纲 -->
    <aside class="book-sidebar">
        <!-- 书籍信息 -->
      <div class="book-meta rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm border border-blue-100">
        <div class="p-4">
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

