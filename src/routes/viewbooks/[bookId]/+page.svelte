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

   }

  function handleChapterSelect(item) {
    console.log('选中章节:', item);
    get_chapter(bookId,item.id,(message) =>{
        if (message != "EOSE"){  
            currentChapterContent = message.data;

        }
    })
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
  .book-view-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    background-color: #f9fafb;
  }
  
  /* 左侧边栏样式 */
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
  
  .book-meta {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
  }
  
  .book-title {
    margin: 0 0 0.75rem 0;
    font-size: 1.5rem;
    color: #111827;
    line-height: 1.3;
  }
  
  .book-author {
    margin: 0 0 1rem 0;
    color: #6b7280;
    font-size: 0.95rem;
  }
  
  .book-description {
    margin-top: 1rem;
  }
  
  .book-description h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    color: #374151;
  }
  
  .book-description p {
    margin: 0;
    font-size: 0.9rem;
    color: #4b5563;
    line-height: 1.6;
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
  
  /* 加载和错误状态 */
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
  
  .error-container {
    width: 100%;
    padding: 2rem;
    text-align: center;
    color: #dc2626;
  }
  
  .error-container h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
  }
  
  .error-container p {
    margin: 0 0 1.5rem 0;
    color: #4b5563;
    font-size: 1.1rem;
  }
  
  .retry-btn {
    padding: 0.5rem 1rem;
    background-color: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.2s;
  }
  
  .retry-btn:hover {
    background-color: #2563eb;
  }
  
  /* 响应式调整 */
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
      <div class="book-meta">
        <h1 class="book-title">{bookTitle || "未知书名"}</h1>
        <p class="book-author">作者: {bookAuthor|| "未知作者"}</p>

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
          <p>请从左侧目录选择章节查看内容</p>
        </div>
      {:else}
        <div class="no-content">
          <p>本书暂无内容</p>
        </div>
      {/if}
    </main>
 
</div>

