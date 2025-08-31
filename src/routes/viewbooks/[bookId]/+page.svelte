<script>
  import { onMount } from 'svelte';
  import ViewNestedTree from '$lib/ViewNestedTree.svelte';
  import "$lib/editbook.css";
  import ViewMD from '$lib/ViewMD.svelte';

  export let data;
  // 从数据中解构需要的字段（带默认值，避免 undefined 错误）
  const { 
    bookId, 
    bookInfo = {}, 
    initialOutline = [], 
    firstChapter = {}, 
    error 
  } = data;

  // 页面状态初始化（基于预取数据）
  let currentChapterContent = firstChapter.content || "";
  let globalClickId = firstChapter.id || null;
  let bookAuthor = bookInfo.author || "";
  let bookTitle = bookInfo.title || "";
  let coverImgurl = bookInfo.coverImgurl || "";

  let loaded = false;
  let mobileMenuOpen = false; // 控制移动端菜单显示状态

  import {upload_file,
    create_book,
    update_book,
    create_chapter,
    get_book_id,
    get_chapter} from "$lib/esclient";
   
  async function handleSetClickId(item) {
    globalClickId = item.id;
 
    if (item.type === 'folder')
      return;
    currentChapterContent = "";
    const tocContainer = document.getElementById('right-toc');
    if (tocContainer) {
        tocContainer.innerHTML=""
    }
    
    // 在移动设备上选择章节后自动关闭菜单
    if (window.innerWidth <= 768) {
      mobileMenuOpen = false;
    }
  }

  function getFrom() {
      let url;
      url = new URL(window.location.href);
      // 从查询参数中获取bookid（searchParams是处理URL查询参数的API）
      let value = url.searchParams.get('from');
      return value; // 如果不存在会返回null
  }

  async function handleChapterSelect(item) {
    console.log('选中章节:', item);
    const response = await fetch(`/viewbooks/${bookId}/${item.id}.md`);
    let text = await response.text();
    currentChapterContent = text;
    
    // 在移动设备上选择章节后自动关闭菜单
    if (window.innerWidth <= 768) {
      mobileMenuOpen = false;
    }
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

  async function loadChapterContent(chapterId) {
    await get_chapter(bookId, chapterId, (message) => {
      if (message !== "EOSE" && message.data) {
        currentChapterContent = message.data;
      }  
    });
  }

  onMount(async () => {
    loaded = true;
    // 动态加载 JS
  })

  // 点击遮罩层关闭菜单
  function closeMenuOnBackdrop(e) {
    if (e.target.classList.contains('mobile-sidebar-backdrop')) {
      mobileMenuOpen = false;
    }
  }
</script>

<style>
  :global{
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
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 5px 10px -5px rgba(0, 0, 0, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        margin-bottom: 2rem;
        position: relative;
        padding: 0.8rem 1.2rem;
        border-top: 2px solid rgba(102, 16, 242, 0.5);
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
      margin: 0 0 1rem 0;
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
      line-height: 1;
    }

    /* 大纲项样式 */
    .outline-item {
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

    /* 右侧 TOC 容器样式 */
    .right-toc-container {
      width: 280px;
      background: rgba(255, 255, 255, 0.95);
      border-left: 1px solid rgba(0, 0, 0, 0.05);
      padding: 1.8rem 0;
      padding-left:1rem;
      overflow-y: auto;
      box-shadow: -2px 0 15px rgba(0, 0, 0, 0.03);
      backdrop-filter: blur(10px);
      z-index: 9;
    }

    /* TOC 标题样式 */
    .toc-container::before {
      content: '章节导航';
      display: block;
      padding: 0 1.2rem 1rem;
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      border-bottom: 2px solid rgba(79, 70, 229, 0.15);
    }

    .toc-link {
      display: block;
      padding: 0.4rem 1.2rem;
      color: #64748b;
      text-decoration: none;
      font-size: 0.92rem;
      line-height: 1.5;
      transition: all 0.2s;
      border-right: 3px solid transparent;
    }

    /* 每个目录项 */
    .toc-item {
      margin: 6px 0;
      transition: all 0.2s ease;
      padding: 4px 8px;
      border-radius: 4px;
    }

    /* 鼠标悬停效果 */
    .toc-item:hover {
      color: #1D4ED8;
      background-color: rgba(59, 130, 246, 0.1);
      cursor: pointer;
    }

    .toc-link.active {
      color: #4F46E5;
      font-weight: 500;
      background-color: rgba(79, 70, 229, 0.05);
      border-right: 3px solid #4F46E5;
    }

    /* 多级标题缩进优化 */
    .lv1 .toc-link {
      font-weight: 500;
      padding-left: 1.2rem;
    }

    .lv2 .toc-link {
      padding-left: 1.8rem;
      font-size: 0.9rem;
    }

    .lv3 .toc-link {
      padding-left: 2.4rem;
      font-size: 0.88rem;
      color: #8492a6;
    }

    /* 空 TOC 状态 */
    .right-toc-container:empty {
      display: none;
    }

    /* 调整主布局适配 TOC */
    .book-view-container {
      gap: 0;
    }

    .book-content {
      flex: 1;
      padding: 2rem 3rem;
    }

    /* 主容器确保占满全屏高度 */
    .book-view-container {
      display: flex;
      min-height: 100vh;
      height: 100vh;
      overflow: hidden;
    }

    /* 左侧大纲容器：固定高度 + 内部滚动 */
    .book-sidebar {
      height: 100vh;
      padding: 1.8rem;
      overflow-y: auto;
    }

    /* 中间内容区：固定高度 + 独立滚动 */
    .book-content {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      padding: 2rem 3rem;
      scrollbar-width: thin;
    }

    .book-content blockquote {
      border-left: 4px solid #4f46e5;
      padding: 1rem 1.5rem;
      background-color: #f8fafc;
      margin: 2rem 0;
      font-style: italic;
      border-radius: 0 6px 6px 0;
    }

    /* 美化滚动条 */
    .book-sidebar::-webkit-scrollbar,
    .right-toc-container::-webkit-scrollbar,
    .book-content::-webkit-scrollbar {
      width: 6px;
    }

    .book-sidebar::-webkit-scrollbar-thumb,
    .right-toc-container::-webkit-scrollbar-thumb,
    .book-content::-webkit-scrollbar-thumb {
      background-color: rgba(156, 163, 175, 0.5);
      border-radius: 3px;
    }

    .book-sidebar::-webkit-scrollbar-track,
    .right-toc-container::-webkit-scrollbar-track,
    .book-content::-webkit-scrollbar-track {
      background-color: transparent;
    }

    /* 返回首页按钮容器 */
    .back-home-container {
      margin-bottom: -1rem;
      padding: 0 0.5rem;
    }

    /* 返回首页按钮样式 */
    .back-home-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(79, 70, 229, 0.2);
    }

    /* 按钮交互效果 */
    .back-home-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(79, 70, 229, 0.3);
      background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%);
    }

    .back-home-btn:active {
      transform: translateY(0);
      box-shadow: 0 2px 3px rgba(79, 70, 229, 0.2);
    }

    /* 移动端菜单按钮 */
    .mobile-menu-btn {
      display: none;
      position: fixed;
      top: 1rem;
      left: 1rem;
      z-index: 100;
      background: #4F46E5;
      color: white;
      border: none;
      border-radius: 8px;
      width: 44px;
      height: 44px;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }

    /* 移动端侧边栏 */
    .mobile-sidebar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 85%;
      height: 100%;
      background: white;
      z-index: 1000;
      
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .mobile-sidebar-backdrop {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    /* 移动端菜单打开时的状态 */
    .mobile-sidebar.open {
      transform: translateX(0);
    }

    .mobile-sidebar-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* 响应式设计 */
    @media (max-width: 768px) {
      .book-sidebar {
        display: none;
      }
      
      .book-content {
        padding: 1rem;
        padding-top: 4rem; /* 为顶部菜单按钮留出空间 */
      }
      
      .mobile-menu-btn {
        display: flex;
      }
      
      .mobile-sidebar,
      .mobile-sidebar-backdrop {
        display: block;
      }
      
      .right-toc-container {
        display: none;
      }
      
      /* 在移动端隐藏书籍信息 */
      .mobile-sidebar .book-meta {
        display: none;
      }
      
      .mobile-sidebar .book-outline {
        margin-top: 1rem;
      }
    }

    /* 中等屏幕调整 TOC 宽度 */
    @media (min-width: 1200px) and (max-width: 1440px) {
      .right-toc-container {
        width: 240px;
      }
    }

    /* link */
    .outline1-links {
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
    }

    /* 确保链接结构清晰 */
    .outline1-links-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .outline1-links-list li {
      margin: 0.5rem 0;
    }

    .outline1-links-list a {
      color: #000;
      text-decoration: none;
    }
  }
</style>

<svelte:head>
  <title>{bookTitle}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</svelte:head>

<!-- 页面主容器 -->
<div class="book-view-container">
  <!-- 移动端菜单按钮 -->
  <button class="mobile-menu-btn" on:click={() => mobileMenuOpen = !mobileMenuOpen}>
    <i class="fas fa-bars"></i>
  </button>

  <!-- 移动端侧边栏遮罩层 -->
  <div class="mobile-sidebar-backdrop {mobileMenuOpen ? 'open' : ''}" 
       on:click={closeMenuOnBackdrop}></div>

  <!-- 移动端侧边栏 - 不包含书籍信息 -->
  <aside class="mobile-sidebar {mobileMenuOpen ? 'open' : ''}">
    <div class="back-home-container">
      <button class="back-home-btn" on:click={() => history.back()}>
        <i class="fa fa-home mr-2"></i>返回
      </button>
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

  <!-- 桌面端侧边栏 -->
  <aside class="book-sidebar">
    <div class="back-home-container">
      <button class="back-home-btn" on:click={() => history.back()}>
        <i class="fa fa-home mr-2"></i>返回
      </button>
    </div>

    <div class="book-meta">
      <div class="py-5 px-2">
        <h1 class="book-title text-xl font-bold text-gray-800 mb-1 line-clamp-2">
          《{bookTitle}》
        </h1>
        <p class="book-author text-sm text-gray-600 flex items-center">
          <span class="inline-block w-1 h-1 rounded-full bg-gray-400 mr-1.5"></span>
          作者: {bookAuthor}
        </p>
        
        <div class="mt-3 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
        
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
    {#if currentChapterContent && loaded}
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

  <!-- 右侧 TOC 容器 -->
  <aside class="right-toc-container" id="right-toc">
    <!-- TOC 内容将由 ViewMD 生成并插入 -->
  </aside>
</div>

<div class="outline1-links" aria-hidden="true">
  <h2>{bookTitle} 章节链接</h2>
  <!-- 使用 Svelte 模板递归渲染链接 -->
  {#if initialOutline.length > 0}
    <ul class="outline1-links-list">
      {#each initialOutline as item}
        <li key={item.id}>
          {#if item.type === 'chapter' && item.id}
            <a href="/viewbooks/{bookId}/{item.id}.md">{item.title}</a>
          {:else}
            <span>{item.title}</span>
          {/if}
          
          {#if item.children && item.children.length > 0}
            <ul class="outline1-links-list">
              {#each item.children as child}
                <li key={child.id}>
                  {#if child.type === 'chapter' && child.id}
                    <a href="/viewbooks/{bookId}/{child.id}.md">{child.title}</a>
                  {:else}
                    <span>{child.title}</span>
                  {/if}
                  
                  {#if child.children && child.children.length > 0}
                    <ul class="outline1-links-list">
                      {#each child.children as grandchild}
                        <li key={grandchild.id}>
                          {#if grandchild.type === 'chapter' && grandchild.id}
                            <a href="/viewbooks/{bookId}/{grandchild.id}.md">{grandchild.title}</a>
                          {:else}
                            <span>{grandchild.title}</span>
                          {/if}
                        </li>
                      {/each}
                    </ul>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>