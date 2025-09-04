<script>
  import { onMount } from 'svelte';
  import ViewNestedTree from '$lib/ViewNestedTree.svelte';
  import "$lib/editbook.css";
  import ViewMD from '$lib/ViewMD.svelte';
  import {
    upload_file,
    create_book,
    update_book,
    create_chapter,
    get_book_id,
    get_chapter,
    like_book,
    comment_book,
    get_book_like,
    get_book_like_counts,
    get_book_comments,
    get_book_comment_counts,

  } from "$lib/esclient";

  import {getKey} from "$lib/getkey";

  export let data;
  // 从数据中解构需要的字段（带默认值，避免 undefined 错误）
  const { 
    bookId, 
    bookInfo = {}, 
    initialOutline = [], 
    firstChapter = {}, 
    error,
    userPubkey = null // 假设从数据中获取当前用户公钥
  } = data;

  // 页面状态初始化（基于预取数据）
  let currentChapterContent = firstChapter.content || "";
  let globalClickId = firstChapter.id || null;
  let bookAuthor = bookInfo.author || "";
  let bookTitle = bookInfo.title || "";
  let coverImgurl = bookInfo.coverImgurl || "";

  // 点赞和评论状态
  let isLiked = false;
  let likeCount = 0; // 默认值，便于测试
  let commentCount = 0; // 默认值，便于测试
  let isCommentPanelOpen = false;
  let newComment = "";
  let comments = [];


 


  let Keypriv;
  let Keypub;


  let loaded = false;
  let mobileMenuOpen = false; // 控制移动端菜单显示状态


  get_book_like_counts(bookId,function(message){
    if (message.code == 200) likeCount = message.counts;
  })

  get_book_comment_counts(bookId,function(message){
    if (message.code == 200) commentCount = message.counts;
  })
   
  function getTagValue(tags,t) {
    const dTag = tags.find(tag => Array.isArray(tag) && tag[0] === t);
    return dTag ? dTag[1] : null;
  }

  
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
      let value = url.searchParams.get('from');
      return value;
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

  async function loadChapterContent(chapterId) {
    await get_chapter(bookId, chapterId, (message) => {
      if (message !== "EOSE" && message.data) {
        currentChapterContent = message.data;
      }  
    });
  }

  // 点赞相关函数
  async function handleLike() {
    if (!Keypriv) {
      alert("请先登录再进行点赞操作");
      return;
    }

    // 切换点赞状态
    isLiked = !isLiked;
    likeCount = isLiked ? likeCount + 1 : likeCount - 1;
    
    like_book(bookId,Keypub,Keypriv,function(message){
       if (message.code == 200)  isLiked = message.liked;
    })
  }

 

  async function loadComments() {
    if (!bookId) return;

    let commentList = [];

    get_book_comments(bookId,function(message){
      if (message != 'EOSE') {
        comments = commentList.sort((a, b) => b.created_at - a.created_at);
      }
      commentList.push(message)
    })

    // 按时间排序
    
  }

  async function handleAddComment() {
    if (!Keypub) {
      alert("请先登录再进行评论");
      return;
    }

    if (!newComment.trim()) return;

    comment_book(bookId,Keypub,Keypriv,newComment,function(message){
      console.log(message)
    })
    await loadComments(); // 重新加载评论
  }

  onMount(async () => {
    loaded = true;
 
    let Key = getKey();
    
    Keypriv = Key.Keypriv;
    Keypub = Key.Keypub;

    if (Keypub ){
      get_book_like(bookId,Keypub,function(message){
        if (message != 'EOSE') isLiked = getTagValue(message.tags,'liked');
      })
    } 

    loadComments();

    // 窗口大小改变时仅重新计算评论面板位置
    window.addEventListener('resize', () => {
      // 如果评论面板打开，重新居中
      if (isCommentPanelOpen) {
        positionCommentPanel();
      }
    });
  });

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

    /* 侧边栏样式 */
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

    .author-dot {
        width: 16px;
        height: 16px;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
    }
    
    .author-dot::after {
        content: '';
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
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
      position: relative;
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

    .interactive-controls {
      position: absolute; /* 相对于最近的定位父元素 */
      right: 20px; /* 距离父元素右侧20px */
      bottom: 20px; /* 距离父元素底部20px */
      
      /* 保留其他原有样式 */
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      padding: 0.5rem 0.6rem;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      z-index: 50;
      transition: all 0.2s ease;
      border: 1px solid rgba(226, 232, 240, 0.8);
      backdrop-filter: blur(10px);
      height: 40px;
      box-sizing: border-box;
    }

    /* 交互项样式 */
    .interact-item {
      display: flex;
      align-items: center;
      gap: 0.2rem;
      cursor: pointer;
      padding: 0.2rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .interact-item:hover {
      background: rgba(248, 250, 252, 0.8);
    }

    /* 点赞项样式 */
    .like-item {
      color: #64748b;
    }

   
    .like-item.liked {
      color: #ef4444;
    }

    .like-item.liked .interact-icon {
      animation: heartBeat 0.5s ease;
    }

    /* 评论项样式 */
    .comment-item-control {
      color: #64748b;
    }

    .comment-item-control:hover, .comment-item-control.active {
      color: #3b82f6;
    }

    /* 图标样式 */
    .interact-icon {
      font-size: 1.2rem;
      transition: transform 0.2s ease;
    }

    .interact-item:hover .interact-icon {
      transform: scale(1.1);
    }

    /* 数字样式 - 放在图标旁边 */
    .interact-count {
      font-size: 0.9rem;
      font-weight: 600;
      min-width: 1.2rem;
      text-align: center;
    }

    .like-item .interact-count {
      color: #ef4444;
    }

    .comment-item-control .interact-count {
      color: #3b82f6;
    }

    /* 分隔线 */
    .interact-divider {
      width: 1px;
      height: 20px;
      background: rgba(226, 232, 240, 0.8);
    }

    /* 评论面板样式 */
    .comment-panel {
      position: fixed;
      width: 320px;
      background: rgba(255,255,255,0.98);
      border-radius: 12px;
      border: 1px solid rgba(2, 6, 23, 0.06);
      box-shadow: 0 24px 48px rgba(2, 6, 23, 0.18);
      padding: 1.1rem;
      max-height: 420px;
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(.2,.8,.2,1), opacity .22s ease;
      z-index: 100;
      backdrop-filter: blur(8px);
    }

    .comment-panel.open {
      transform: scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    /* 评论面板遮罩 */
    .comment-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }

    .comment-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .comment-title {
      font-weight: 600;
      color: #0f172a;
      font-size: 1rem;
      letter-spacing: .2px;
    }

    .close-comment {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 1.1rem;
      border-radius: 8px;
      padding: 2px 6px;
      transition: background-color .15s ease, color .15s ease, transform .12s ease;
    }

    .close-comment:hover {
      background: #f8fafc;
      color: #64748b;
    }

    .close-comment:active {
      transform: scale(0.96);
    }

    .comments-list {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 0.8rem;
      padding-right: 2px;
      scrollbar-width: thin;
      scrollbar-color: rgba(148,163,184,.6) transparent;
    }

    .comments-list::-webkit-scrollbar {
      width: 6px;
    }
    .comments-list::-webkit-scrollbar-thumb {
      background: rgba(148,163,184,.6);
      border-radius: 999px;
    }
    .comments-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .comment-item {
      padding: 0.65rem 0;
      border-bottom: 1px dashed #eef2f7;
      transition: background-color .15s ease;
    }

    .comment-item:hover {
      background: rgba(248, 250, 252, 0.6);
    }

    .comment-author {
      font-size: 0.86rem;
      font-weight: 600;
      color: #4F46E5;
      margin-bottom: 0.2rem;
      display: inline-flex;
      align-items: baseline;
      gap: .4rem;
    }

    .comment-time {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .comment-content {
      font-size: 0.92rem;
      color: #334155;
      line-height: 1.55;
    }

    .comment-input-container {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
    }

    .comment-input {
      flex: 1;
      padding: 0.6rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.92rem;
      resize: none;
      min-height: 48px;
      background: #f8fafc;
      transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
    }

    .comment-input::placeholder {
      color: #9aa3b2;
    }

    .comment-input:focus {
      outline: none;
      background: #ffffff;
      border-color: #8B5CF6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
    }

    .send-comment {
      background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0 0.9rem;
      height: 40px;
      min-width: 44px;
      cursor: pointer;
      font-weight: 500;
      transition: transform .14s ease, box-shadow .18s ease, background .18s ease, opacity .18s ease;
      box-shadow: 0 10px 18px rgba(79, 70, 229, 0.22);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .send-comment:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 26px rgba(79, 70, 229, 0.28);
    }

    .send-comment:active {
      transform: translateY(0) scale(0.98);
      box-shadow: 0 8px 16px rgba(79, 70, 229, 0.18);
    }

    .no-comments {
      color: #94a3b8;
      font-size: 0.9rem;
      text-align: center;
      padding: 0.8rem 0;
    }

    /* 动画效果 */
    @keyframes heartBeat {
      0% { transform: scale(1); }
      14% { transform: scale(1.3); }
      28% { transform: scale(1); }
      42% { transform: scale(1.3); }
      70% { transform: scale(1); }
    }

    /* 小屏适配 */
    @media (max-width: 520px) {
      .comment-panel {
        width: calc(100% - 2rem);
        max-height: 60vh;
      }
      
      .interactive-controls {
        padding: 0.2rem 0.2rem;
        height: 38px;
        gap: 0.6rem;
      }
      
      .interact-item {
        padding: 0.2rem 0.2rem;
      }
      
      .interact-icon {
        font-size: 1.1rem;
      }
      
      .interact-count {
        font-size: 0.85rem;
      }
    }
  }
</style>

<svelte:head>
  <title>{bookTitle}</title>
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
      <div class="py-5 px-3 relative overflow-hidden">
        <!-- 书籍标题 -->
        <h1 class="book-title text-xl font-bold text-gray-800 mb-2 line-clamp-2 relative flex items-center gap-2">
          <span class="text-purple-600 text-lg">《</span>
          {bookTitle}
          <span class="text-purple-600 text-lg">》</span>
          <span class="inline-block w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 mt-1.5 rounded-0 group-hover:w-full-1/2 transition-all duration-300"></span>
        </h1>
        
        <!-- 作者信息 -->
        <p class="book-author text-sm text-gray-600 flex items-center gap-2 mt-1">
          <span class="author-dot"></span>
          <span class="text-gray-500">作者:</span>
          <span class="font-medium text-gray-700 relative group">
            {bookAuthor}
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
          </span>
        </p>
        
        <!-- 装饰分隔线 -->
        <div class="mt-4 h-px bg-gradient-to-r from-purple-300 via-blue-200 to-transparent relative-0"></div>
        
        <!-- 章节统计 -->
        {#if initialOutline.length > 0}
          <div class="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <span class="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <i class="fa fa-list-ul text-[10px]"></i>
            </span>
            <span>共 <span class="font-medium text-purple-600">{initialOutline.length}</span> 个章节</span>
          </div>
        {/if}
        
        <!-- 角落装饰 -->
        <div class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-100 rounded-tr"></div>
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


    <div class="comments-list">
      {#if comments.length > 0}
        {#each comments as comment}
          <div class="comment-item">
            <div class="comment-author">
              {comment.author}
              <span class="comment-time">
                {comment.servertimestamp 
                  ? new Date(comment.servertimestamp).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '未知日期'
                }
              </span>
            </div>
            <div class="comment-content">{comment.data}</div>
          </div>
        {/each}
      {:else}
        <div class="no-comments">暂无评论，快来抢沙发~</div>
      {/if}
    </div>

    <!-- 交互控件容器（已移除拖动事件） -->
    <div 
      id="interactive-controls"
      class="interactive-controls" >
      <!-- 点赞项 -->
      <div 
        class="interact-item like-item {isLiked ? 'liked' : ''}"
        on:click={handleLike}
        title={isLiked ? "取消点赞" : "点赞"}
      >
        <i class="fa {isLiked ? 'fa-heart' : 'fa-heart-o'} interact-icon"></i>
        <span class="interact-count">{likeCount}</span>
      </div>

      <!-- 评论项 -->
      <div 
        class="interact-item comment-item-control {isCommentPanelOpen ? 'active' : ''}"
        on:click={handleCommentToggle}
        title="评论"
      >
        <i class="fa fa-comment-o interact-icon"></i>
        <span class="interact-count">{commentCount}</span>
      </div>
    </div>

  </main>

  <!-- 右侧 TOC 容器 -->
  <aside class="right-toc-container" id="right-toc">
    <!-- TOC 内容将由 ViewMD 生成并插入 -->
  </aside>

  <!-- 评论面板遮罩 -->
  <div class="comment-backdrop {isCommentPanelOpen ? 'open' : ''}" on:click={handleCommentToggle}></div>

  
  <!-- 评论面板 - 居中显示 -->
  <div class="comment-panel {isCommentPanelOpen ? 'open' : ''}">
    <div class="comment-header">
      <h3 class="comment-title">章节评论</h3>
 
    </div>


    <div class="comment-input-container">
      <textarea 
        class="comment-input" 
        placeholder="写下你的评论..."
        bind:value={newComment}
        on:keydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddComment())}
      ></textarea>
      <button class="send-comment" on:click={handleAddComment}>
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>
  </div>
</div>

<div class="outline1-links" aria-hidden="true">
  <h2>{bookTitle} 章节链接</h2>
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