<script>
  import { onMount } from 'svelte';
  import NestedTree from '$lib/NestedTree.svelte';
  import "$lib/editbook.css";

  // 封面的显示和隐藏
  let coverdir = "down";
  let hiddencover = "hidden";
 
  // 大纲的选中id号，用来显示大纲的样式渲染
  let globalClickId = null;
  let draggedItem = null;
  let dragOverItem = null;
  let dragOverPosition = null;

  // 原始大纲编辑模态框状态
  let showRawOutlineModal = false;
  let rawOutlineContent = '';
  let jsonFormatError = '';
  let codeMirrorEditor = null; // CodeMirror编辑器实例

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

  let nextId = Math.max(...initialOutline.flatMap(item => [item.id, ...(item.children || []).map(child => child.id)])) + 1;
  
  // 添加新文件夹
  function addFolder() {
    const newFolder = {
      id: nextId++,
      title: "新建文件夹",
      type: "folder",
      expanded: true,
      children: []
    };
    initialOutline = [...initialOutline, newFolder];
    saveOutline();
  }
  
  // 添加新章节
  function addChapter() {
    const newChapter = {
      id: nextId++,
      title: "新建章节",
      content: "# 新建章节\n\n在这里开始编写您的内容...",
      type: "chapter"
    };
    initialOutline = [...initialOutline, newChapter];
    saveOutline();
  }
  

  // 父组件中更新拖动处理函数
  function handleDragEnd(draggedItem, targetItem, position) {
    const updatedOutline = JSON.parse(JSON.stringify(initialOutline));
    const { parent: draggedParent, index: draggedIndex } = findItemParentAndIndex(updatedOutline, draggedItem.id);

    const [removedItem] = draggedParent.splice(draggedIndex, 1);
    const { parent: targetParent, index: targetIndex } = findItemParentAndIndex(updatedOutline, targetItem.id);
 
    if (!draggedParent || draggedIndex === -1 || !targetParent) return;

    if (position === 'inside' && targetItem.type === 'folder') {
      const targetFolder = findItemById(updatedOutline, targetItem.id);
      if (targetFolder) {
        if (!targetFolder.children) targetFolder.children = [];
        targetFolder.children.push(removedItem);
        targetFolder.expanded = true;
      }
    } else {
      const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
      targetParent.splice(insertIndex, 0, removedItem);
    }
    
    initialOutline = updatedOutline;
    saveOutline();
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

  // 打开原始大纲编辑模态框
  function openRawOutlineEditor() {
    try {
      // 格式化JSON以便阅读和编辑
      rawOutlineContent = JSON.stringify(initialOutline, null, 2);
      jsonFormatError = '';
      showRawOutlineModal = true;
      
      // 等待模态框渲染完成后初始化CodeMirror
      setTimeout(initCodeMirrorEditor, 100);
    } catch (error) {
      jsonFormatError = '无法加载大纲数据: ' + error.message;
      showRawOutlineModal = true;
    }
  }

  // 初始化CodeMirror编辑器（带行号功能）
  function initCodeMirrorEditor() {
    const textarea = document.getElementById('json-editor');
    if (!textarea || codeMirrorEditor) return;

    // 初始化CodeMirror编辑器
    codeMirrorEditor = CodeMirror.fromTextArea(textarea, {
      lineNumbers: true,          // 显示行号
      mode: 'application/json',   // JSON语法高亮
      indentUnit: 2,              // 缩进单位
      indentWithTabs: false,      // 使用空格缩进
      lineWrapping: true,         // 自动换行
      matchBrackets: true,        // 括号匹配高亮
      autoCloseBrackets: true,    // 自动闭合括号
      theme: 'default',           // 默认主题
      viewportMargin: Infinity    // 适应容器高度
    });

    // 设置初始内容
    codeMirrorEditor.setValue(rawOutlineContent);
    
    // 监听内容变化，同步到文本框
    codeMirrorEditor.on('change', () => {
      rawOutlineContent = codeMirrorEditor.getValue();
    });
  }

  // 销毁CodeMirror编辑器实例
  function destroyCodeMirrorEditor() {
    if (codeMirrorEditor) {
      codeMirrorEditor.toTextArea(); // 还原为普通文本框
      codeMirrorEditor = null;
    }
  }

  // 验证并应用原始大纲修改
  function applyRawOutlineChanges() {
    try {
      // 从编辑器获取最新内容
      const content = codeMirrorEditor ? codeMirrorEditor.getValue() : rawOutlineContent;
      
      // 验证JSON格式
      const parsed = JSON.parse(content);
      
      // 简单结构验证
      if (!Array.isArray(parsed)) {
        throw new Error('大纲必须是数组格式');
      }
      
      // 检查是否包含必要字段
      parsed.forEach(item => {
        if (!item.id || !item.title || !item.type) {
          throw new Error(`项目 "${item.title || '未知项目'}" 缺少必要字段(id/title/type)`);
        }
        if (item.type === 'folder' && item.children && !Array.isArray(item.children)) {
          throw new Error(`文件夹 "${item.title}" 的children必须是数组`);
        }
      });
      
      // 应用修改
      initialOutline = parsed;
      nextId = Math.max(...initialOutline.flatMap(item => [item.id, ...(item.children || []).map(child => child.id)])) + 1;
      jsonFormatError = '';
      showRawOutlineModal = false;
      destroyCodeMirrorEditor(); // 关闭时销毁编辑器
      saveOutline();
      showNotification('大纲已更新');
    } catch (error) {
      jsonFormatError = '格式错误: ' + error.message;
      // 显示错误行号（如果有）
      if (error.message.includes('at position')) {
        const positionMatch = error.message.match(/at position (\d+)/);
        if (positionMatch && positionMatch[1]) {
          const pos = parseInt(positionMatch[1]);
          // 尝试定位到错误位置
          if (codeMirrorEditor) {
            const doc = codeMirrorEditor.getDoc();
            const line = doc.posFromIndex(pos).line + 1; // 转换为行号（+1是因为行号从1开始）
            jsonFormatError += `，大约在第 ${line} 行`;
          }
        }
      }
      // 滚动到错误提示
      setTimeout(() => {
        document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  // 导出大纲为JSON文件
  function submitOutline() {
    try {
      const dataStr = JSON.stringify(initialOutline, null, 2);
 
 
    } catch (error) {
      showNotification('导出失败: ' + error.message, 'error');
    }
  }

  onMount(async () => {
    // 加载CodeMirror库
    await Promise.all([
      new Promise(resolve => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css';
        link.onload = resolve;
        document.head.appendChild(link);
      }),
      new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js';
        script.onload = resolve;
        document.body.appendChild(script);
      }),
      new Promise(resolve => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js';
        script.onload = resolve;
        document.body.appendChild(script);
      })
    ]);

    // 尝试从本地存储加载大纲
    const savedOutline = localStorage.getItem('bookOutline');
    if (savedOutline) {
      try {
        initialOutline = JSON.parse(savedOutline);
        nextId = Math.max(...initialOutline.flatMap(item => [item.id, ...(item.children || []).map(child => child.id)])) + 1;
      } catch (error) {
        console.error('Failed to load saved outline:', error);
        showNotification('加载保存的大纲失败，使用默认大纲', 'warning');
      }
    }

    function loadSimpleMDE(callback) {
      if (window.SimpleMDE) {
        callback();
        return;
      }
      
      const cssLink = document.createElement('link');
      cssLink.href = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.css';
      cssLink.rel = 'stylesheet';
      document.head.appendChild(cssLink);
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.js';
      script.onload = callback;
      document.body.appendChild(script);
    }

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

    function saveOutline() {
      localStorage.setItem('bookOutline', JSON.stringify(initialOutline));
      const lastSaved = document.getElementById('lastSaved');
      if (lastSaved) {
        lastSaved.textContent = `已保存: ${new Date().toLocaleTimeString()}`;
      }
    }

    function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-primary';
      notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-y-20 opacity-0`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.remove('translate-y-20', 'opacity-0'), 100);
      setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
    }

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

    function updateWordCount(simplemde) {
      const wordCountEl = document.getElementById('wordCount');
      if (!wordCountEl || !simplemde) {
        wordCountEl.textContent = "0 字";
        return;
      }
      
      const text = simplemde.value().replace(/<[^>]*>/g, '');
      const count = text.length;
      wordCountEl.textContent = `${count} 字`;
    }

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
          if (item.children) countItems(item.children);
        });
      }
      
      countItems(initialOutline);
      
      const totalChaptersEl = document.getElementById('totalChapters');
      const totalWordsEl = document.getElementById('totalWords');
      if (totalChaptersEl) totalChaptersEl.textContent = chapterCount;
      if (totalWordsEl) totalWordsEl.textContent = wordCount;
    }

    let simplemde = null;
    let currentEditId = null;
    
    loadSimpleMDE(() => {
      simplemde = initEditor();
      updateStats();
      
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

    // 清理函数
    return () => {
      destroyCodeMirrorEditor();
    };
  });

  // 当模态框关闭时销毁编辑器
  $: if (!showRawOutlineModal && codeMirrorEditor) {
    destroyCodeMirrorEditor();
  }
</script> 

<style>
  :global {
 
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

          </div>
        </div>
        
        <!-- 大纲操作按钮 -->
        <div class="outline-actions-extra">
          <button 
            class="btn btn-secondary flex items-center" 
            on:click={openRawOutlineEditor}
          >
            <i class="fa fa-code mr-2"></i>编辑大纲
          </button>
          <button 
            class="btn btn-primary flex items-center" 
            on:click={submitOutline}
          >
            <i class="fa fa-up mr-2"></i>上传大纲
          </button>

            <button id="addFolder" class="folder-bg text-white rounded-lg w-9 h-9 flex items-center justify-center transition btn-hover " on:click={addFolder}>
                <i class="fas fa-folder-plus"></i>
            </button>
            <button id="addChapter" class="bg-primary hover:bg-indigo-700 text-white rounded-lg w-9 h-9 flex items-center justify-center transition btn-hover " on:click={addChapter}>
                <i class="fas fa-file-circle-plus"></i>
            </button>
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

<!-- 原始大纲编辑模态框 -->
{#if showRawOutlineModal}
  <div class="modal-overlay" on:click={() => showRawOutlineModal = false}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h3 class="modal-title">编辑原始大纲 (JSON格式)</h3>
        <button class="modal-close" on:click={() => showRawOutlineModal = false}>&times;</button>
      </div>
      <div class="modal-body">
        <p class="text-sm text-gray-500 mb-3">
          您可以直接编辑大纲的JSON结构。编辑器已提供行号、语法高亮和括号匹配功能。
        </p>
        <!-- 隐藏的文本框，用于CodeMirror绑定 -->
        <textarea id="json-editor" class="hidden" bind:value={rawOutlineContent}></textarea>
        <!-- CodeMirror将在这里渲染 -->
        <div class="json-editor-container"></div>
        
        {#if jsonFormatError}
          <div class="error-message">{jsonFormatError}</div>
        {/if}
        <p class="text-xs text-gray-400 mt-3">
          提示：每个项目需包含id、title和type字段；文件夹类型(folder)可包含children数组。
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" on:click={() => showRawOutlineModal = false}>取消</button>
        <button class="btn btn-primary" on:click={applyRawOutlineChanges}>应用更改</button>
      </div>
    </div>
  </div>
{/if}

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