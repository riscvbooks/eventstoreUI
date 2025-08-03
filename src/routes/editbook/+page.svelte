<script>
  import { onMount } from 'svelte';
  import NestedTree from '$lib/NestedTree.svelte';


  // 封面的显示和隐藏
  let coverdir = "down";
  let hiddencover = "hidden";
 
  // 大纲的选中id号，用来显示大纲的样式渲染
  let globalClickId = null;
  let draggedItem = null;
  let dragOverItem = null;
  let dragOverPosition = null;

  // 封面隐藏显示函数
  function togglecover() {
    if (coverdir === "up") {
      coverdir = "down";
      hiddencover = "hidden";
    } else {
      coverdir = "up";
      hiddencover = "";
    }
  }

  // 更新全局选中状态的函数
  function handleSetClickId(id) {
    globalClickId = id;
  }
  
  // 处理章节选择
  function handleChapterSelect(item) {
    console.log('选中章节:', item);
  }

  // 回调函数：更新拖动项
  function setDraggedItem(item) {
    draggedItem = item;
  }

  // 回调函数：更新拖动位置状态
  function setDragOverState(overItem, position) {
    dragOverItem = overItem;
    dragOverPosition = position;
  }
   
  let initialOutline = [
    { 
      id: 1, 
      title: "前言", 
      content: "这本书将引导您完成整个书籍创作过程...",
      type: "chapter"
    },
    { 
      id: 2, 
      title: "第一部分：基础知识",
      type: "folder",
      expanded: true,
      children: [
        { 
          id: 21, 
          title: "第一章：开始创作", 
          content: "# 第一章：开始创作\n\n在开始您的写作之旅之前...",
          type: "chapter"
        },
        { 
          id: 22, 
          title: "第二章：构建框架", 
          content: "# 第二章：构建框架\n\n构建一个坚实的框架是成功写作的基础...",
          type: "chapter"
        }
      ]
    },
    { 
      id: 3, 
      title: "第二部分：进阶技巧",
      type: "folder",
      expanded: true,
      children: [
        { 
          id: 31, 
          title: "第三章：人物塑造", 
          content: "# 第三章：人物塑造\n\n人物是小说的核心...",
          type: "chapter"
        },
        { 
          id: 32, 
          title: "第四章：情节设计", 
          content: "# 第四章：情节设计\n\n一个引人入胜的情节是吸引和保持读者兴趣的关键...",
          type: "chapter"
        }
      ]
    },
    { 
      id: 4, 
      title: "第三部分：出版与营销",
      type: "folder",
      expanded: false,
      children: [
        { 
          id: 41, 
          title: "第五章：出版选择", 
          content: "# 第五章：出版选择\n\n完成写作后，您将面临出版选择...",
          type: "chapter"
        }
      ]
    },
    { 
      id: 6, 
      title: "修订补丁", 
      content: "# 结语\n\n恭喜您完成了这本书！写作是一项具有挑战性但也非常有回报的工作...",
      type: "chapter"
    },
    { 
      id: 5, 
      title: "结语", 
      content: "# 结语\n\n恭喜您完成了这本书！写作是一项具有挑战性但也非常有回报的工作...",
      type: "chapter"
    }
  ];

  // 父组件中更新拖动处理函数
  function handleDragEnd(draggedItem, targetItem, position) {
    // 创建数据的深拷贝，确保触发响应式更新
    const updatedOutline = JSON.parse(JSON.stringify(initialOutline));
    
    // 1. 找到拖动项在原数据中的位置并移除
    const { parent: draggedParent, index: draggedIndex } = findItemParentAndIndex(updatedOutline, draggedItem.id);

    // 从原位置移除
    const [removedItem] = draggedParent.splice(draggedIndex, 1);
    
    // 2. 找到目标位置并插入
    const { parent: targetParent, index: targetIndex } = findItemParentAndIndex(updatedOutline, targetItem.id);
 
    if (!draggedParent || draggedIndex === -1) return;
    if (!targetParent) return;

    // 根据位置插入
    if (position === 'inside' && targetItem.type === 'folder') {
      // 找到目标文件夹
      const targetFolder = findItemById(updatedOutline, targetItem.id);
      if (targetFolder) {
        if (!targetFolder.children) targetFolder.children = [];
        targetFolder.children.push(removedItem);
        targetFolder.expanded = true; // 确保文件夹展开
      }
    } else {
      // 计算插入位置
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      targetParent.splice(insertIndex, 0, removedItem);
    }
    
    // 3. 更新数据并触发重新渲染
    initialOutline = updatedOutline;
    console.log(initialOutline)
  }

  // 辅助函数：查找项目
  function findItemById(items, id) {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  // 改进的查找父级和索引的函数
  function findItemParentAndIndex(items, id, parent = null) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === id) {
        return { 
          parent: parent || items, 
          index: i 
        };
      }
      
      if (items[i].children) {
        const result = findItemParentAndIndex(items[i].children, id, items[i].children);
        if (result.index !== -1) return result;
      }
    }
    return { parent: null, index: -1 };
  }

  onMount(async () => {
    function loadSimpleMDE(callback) {
      // 检查是否已加载SimpleMDE
      if (window.SimpleMDE) {
        callback();
        return;
      }
      
      // 加载CSS
      const cssLink = document.createElement('link');
      cssLink.href = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.css';
      cssLink.rel = 'stylesheet';
      document.head.appendChild(cssLink);
      
      // 加载JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.js';
      script.onload = callback;
      document.body.appendChild(script);
    }

    // 初始化SimpleMDE编辑器
    function initEditor() {
      const editorElement = document.getElementById('editor');
      if (!editorElement) return;
      
      const simplemde = new SimpleMDE({ 
        element: editorElement,
        spellChecker: false,
        status: false,
        autosave: {
          enabled: true,
          uniqueId: "bookEditor",
          delay: 1000,
        },
        toolbar: ["bold", "italic", "heading", "|", "code", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
      });
      
      // 监听编辑器变化
      simplemde.codemirror.on("change", function() {
        if (currentEditId !== null) {
          const chapter = findChapter(currentEditId);
          if (chapter) {
            chapter.content = simplemde.value();
            saveOutline();
            updateWordCount(simplemde);
            updateStats();
          }
        }
      });
      
      return simplemde;
    }

    // 保存大纲到本地存储
    function saveOutline() {
      localStorage.setItem('bookOutline', JSON.stringify(initialOutline));
      const lastSaved = document.getElementById('lastSaved');
      if (lastSaved) {
        lastSaved.textContent = `已保存: ${new Date().toLocaleTimeString()}`;
      }
      
      // 显示保存通知
      showNotification('大纲已保存');
    }

    // 显示通知
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-20 opacity-0';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
      }, 100);
      
      setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 2000);
    }

    // 查找章节
    function findChapter(id, items = initialOutline) {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findChapter(id, item.children);
          if (found) return found;
        }
      }
      return null;
    }

    // 更新字数统计
    function updateWordCount(simplemde) {
      const wordCountEl = document.getElementById('wordCount');
      if (!wordCountEl || !simplemde) {
        wordCountEl.textContent = "0 字";
        return;
      }
      
      // 简单计算字数
      const text = simplemde.value().replace(/<[^>]*>/g, ''); // 移除HTML标签
      const count = text.length;
      wordCountEl.textContent = `${count} 字`;
    }

    // 更新统计信息
    function updateStats() {
      let chapterCount = 0;
      let wordCount = 0;
      
      function countItems(items) {
        items.forEach(item => {
          if (item.type === 'chapter') {
            chapterCount++;
            const text = item.content ? item.content.replace(/<[^>]*>/g, '') : '';
            wordCount += text.length;
          }
          if (item.children) {
            countItems(item.children);
          }
        });
      }
      
      countItems(initialOutline);
      
      const totalChaptersEl = document.getElementById('totalChapters');
      const totalWordsEl = document.getElementById('totalWords');
      if (totalChaptersEl) totalChaptersEl.textContent = chapterCount;
      if (totalWordsEl) totalWordsEl.textContent = wordCount;
    }

    // 初始化应用
    let simplemde = null;
    let currentEditId = null;
    
    loadSimpleMDE(() => {
      simplemde = initEditor();
      updateStats();
      
      // 设置初始编辑
      if (initialOutline.length > 0 && initialOutline[0].type === 'chapter') {
        currentEditId = initialOutline[0].id;
        const currentChapterTitle = document.getElementById('currentChapterTitle');
        if (currentChapterTitle && simplemde) {
          const chapter = findChapter(currentEditId);
          if (chapter) {
            currentChapterTitle.textContent = chapter.title;
            simplemde.value(chapter.content || '');
            updateWordCount(simplemde);
          }
        }
      }
    });
  });
</script> 

<style>
  :global {
    .outline-item {
      transition: all 0.3s ease;
      cursor: pointer;
      border-radius: 0.5rem;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .outline-item:hover {
      background-color: #f9fafb;
    }
    .outline-item.active {
      background-color: rgba(79, 70, 229, 0.05);
      border-left: 4px solid #4F46E5;
    }
    .outline-item.dragging {
      opacity: 0.6;
      background-color: #f3f4f6;
    }
    .book-cover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;
    }
    .book-cover:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .editor-header {
      background: linear-gradient(to right, #4F46E5, #6366F1);
      color: white;
      padding: 1rem;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    .btn-hover {
      transition: all 0.2s ease;
    }
    .btn-hover:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .action-dots {
      color: #9CA3AF;
      transition: color 0.2s ease;
      cursor: pointer;
      position: relative;
    }
    .action-menu {
      position: absolute;
      right: 0;
      top: 1.5rem;
      background-color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: 0.5rem;
      padding: 0.5rem 0;
      z-index: 10;
      width: 8rem;
      display: none;
      border: 1px solid #E5E7EB;
    }
    .action-menu.show {
      display: block;
    }
    .menu-item {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    }
    .menu-item:hover {
      background-color: #F3F4F6;
    }
    .menu-icon {
      margin-right: 0.5rem;
      width: 1rem;
      text-align: center;
    }
    .seamless-container {
      display: flex;
      flex-direction: column;
      border: 1px solid #E5E7EB;
      border-radius: 1rem;
      overflow: hidden;
      background-color: white;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      height: calc(100vh - 10rem);
    }
    .left-seamless {
      width: 100%;
      border-right: 1px solid #E5E7EB;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .right-seamless {
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .drag-over {
      background-color: rgba(139, 92, 246, 0.1) !important;
      border: 2px dashed #8B5CF6 !important;
    }
    .custom-scroll::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scroll::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    .custom-scroll::-webkit-scrollbar-thumb {
      background: #c5c5c5;
      border-radius: 4px;
    }
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
    
    /* 自定义文件夹颜色类 */
    .folder-color {
      color: #7E22CE;
    }
    .folder-bg {
      background-color: #7E22CE;
    }
    .bg-accent {
      background-color: #8B5CF6;
    }
   
    .folder-bg:hover {
      background-color: #6B21A8;
    }
    .folder-border {
      border-color: #7E22CE;
    }
    .folder-icon {
      color: #7E22CE;
    }
    .chapter-icon {
      color: #4F46E5;
    }
    @media (min-width: 1024px) {
      .seamless-container {
        flex-direction: row;
      }
      .left-seamless {
        width: 35%;
      }
      .right-seamless {
        width: 65%;
      }
    }

    .toggle-btn {
      background: none;
      border: none;
      color:  #374151;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .toggle-btn:hover {
      background-color: #f4f3f6;
      color: #5e0ce5;
    }

    .icon-with-plus {
      position: relative;
      display: inline-block;
    }
    .icon-with-plus::after {
      content: "+";
      position: absolute;
      top: -8px;
      left: -12px;
      width: 14px;
      height: 14px; 
      border-radius: 50%;
      font-size: 14px;
      line-height: 14px;
      text-align: center;
      font-weight: bold;
      box-shadow: 0 0 2px rgba(0,0,0,0.3);
    }
    .outline-tree-container {
      overflow: visible; /* 避免子项拖动时被裁剪 */
      pointer-events: auto; /* 确保容器可接收事件 */
    }
  }
</style>

<main class="flex-grow flex flex-col max-w-7xl mx-auto px-4 py-6 w-full">
  <div class="seamless-container flex-grow">
    <!-- 左侧面板 - 大纲和封面 -->
    <div class="left-seamless flex flex-col">
      <!-- 书籍封面 -->
      <div class="p-5 border-b border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-primary flex items-center" on:click={togglecover}>
            <i class="fa fa-image mr-2"></i>书籍封面
          </h2>
          <button class="toggle-btn" on:click={togglecover}> 
            <i class="fa fa-chevron-{coverdir}"></i>
          </button>
        </div>
        
        <div class="flex flex-col items-center {hiddencover}">
          <div class="book-cover bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl w-full max-w-xs h-64 mb-4 flex flex-col items-center justify-center text-white p-6 text-center shadow-xl">
            <h3 class="text-2xl font-bold mb-2">书籍创作指南</h3>
            <p class="text-lg opacity-90">专业写作技巧与策略</p>
            <p class="mt-4 font-medium">作者：张三</p>
          </div>
          
          <div class="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
            <label class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer transition flex items-center justify-center btn-hover text-sm">
              <i class="fa fa-upload mr-1"></i>上传封面
              <input type="file" class="hidden">
            </label>
            <button class="bg-violet-500 hover:bg-violet-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center btn-hover text-sm">
              <i class="fa fa-paint-brush mr-1"></i>设计
            </button>
          </div>
          
          <div class="space-y-3 w-full max-w-xs">
            <div>
              <label class="block text-sm font-medium mb-1">书籍标题</label>
              <input type="text" placeholder="输入书籍标题" value="书籍创作指南" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">作者</label>
              <input type="text" placeholder="作者姓名" value="张三" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>
          </div>
        </div>
      </div>

      <!-- 书籍大纲 -->
      <div class="flex-grow p-5 overflow-y-auto custom-scroll">
        <div class="flex justify-between items-center mb-5">
          <h2 class="text-xl font-semibold text-primary flex items-center">
            <i class="fa fa-sitemap mr-2"></i>书籍大纲
          </h2>
          <div class="flex gap-2">
            <button id="addFolder" class="folder-bg text-white rounded-lg w-9 h-9 flex items-center justify-center transition btn-hover">
              <i class="fa fa-folder icon-with-plus"></i>
            </button>
            <button id="addChapter" class="bg-primary hover:bg-indigo-700 text-white rounded-lg w-9 h-9 flex items-center justify-center transition btn-hover">
              <i class="fa fa-file-text icon-with-plus"></i>
            </button>
          </div>
        </div>
        
        <NestedTree 
          items={initialOutline}     
          onSetClickId={handleSetClickId}
          clickId={globalClickId}        
          onSelect={handleChapterSelect}
          draggedItem={draggedItem} 
          dragOverItem={dragOverItem}  
          dragOverPosition={dragOverPosition}
          onSetDraggedItem={setDraggedItem} 
          onSetDragOver={setDragOverState} 
          onDragEnd={handleDragEnd}
        />
      </div>
    </div>
    
    <!-- 分隔线 -->
    <div class="w-0.5 bg-gray-200 cursor-col-resize hover:bg-gray-300"></div>

    <!-- 右侧面板 - 内容编辑 -->
    <div class="right-seamless flex flex-col">
      <div class="editor-header">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold flex items-center">
              <i class="fa fa-edit mr-2"></i>内容编辑
            </h2>
            <h3 id="currentChapterTitle" class="text-lg font-medium mt-1">选择大纲项进行编辑</h3>
          </div>
          <div class="flex gap-2">
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition">
              <i class="fa fa-history"></i>
            </button>
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition">
              <i class="fa fa-search"></i>
            </button>
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition">
              <i class="fa fa-cog"></i>
            </button>
          </div>
        </div>
      </div>
      
      <div class="flex-grow flex flex-col">
        <div class="bg-gray-50 p-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span id="wordCount" class="text-sm text-gray-600 flex items-center">
              <i class="fa fa-file-text mr-1"></i> 0 字
            </span>
            <span id="readingTime" class="text-sm text-gray-600 flex items-center">
              <i class="fa fa-clock-o mr-1"></i> 0 分钟阅读
            </span>
          </div>
          <span id="lastSaved" class="text-sm text-gray-600">尚未保存</span>
        </div>
        
        <!-- 编辑器区域 -->
        <div id="editor-container" class="flex-grow p-4">
          <textarea id="editor"></textarea>
        </div>
      </div>
    </div>
  </div>
</main>

<!-- 页脚 -->
<footer class="bg-white border-t border-gray-200 py-4 mt-8">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="text-center md:text-left mb-3 md:mb-0">
        <p class="text-sm text-gray-500">© 2025 书籍创作编辑器专业版</p>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-500">已保存 <span id="totalChapters">0</span> 个章节</span>
        <span class="text-sm text-gray-500">总计 <span id="totalWords">0</span> 字</span>
      </div>
    </div>
  </div>
</footer>