<script>
  import { onMount } from 'svelte';
  import NestedTree from '$lib/NestedTree.svelte';
  import "$lib/editbook.css";
  
  import {upload_file,
    create_book,
    update_book,
    create_chapter,
    get_book_id,
    get_chapter} from "$lib/esclient";
  
  import {getKey} from "$lib/getkey";
  import {uploadpath} from "$lib/config";


  let Keypriv;
  let Keypub;

  // 封面的显示和隐藏
  let coverdir = "down";
  let hiddencover = "hidden";
  let coverImgData = '';
  let bookTitle  = '';
  let bookAuthor = '';
  let coverImgurl='';
  let bookId = "";
 
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


  let showConfirmModal = false;
  let confirmMessage   = "";
  let confirmcallback  = "";

  let showSavedModal = false;
  let savedMessage = "";
  let savedCallback = "";

  let nextId = 0;

  //编辑内容
  let currentEditId = null;       // 当前编辑的章节ID
  let currentChapterTitle = "";
  let isUnsaved = false;          // 是否有未保存的变动
  let simplemde = null;
 
    

  function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      const bgColor = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : 'bg-primary';
      notification.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300   opacity-0`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => notification.classList.remove('translate-y-20', 'opacity-0'), 100);
      setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 2000);
  }

  // 处理用户确认/取消操作
  function handleConfirm(confirmed) {
       confirmcallback(confirmed);
  }
  
  function handleSavedConfirm(confirmed) {
       savedCallback(confirmed) ;
  }

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

 

  async function handleSetClickId(item) {
    if (globalClickId == item.id) return true;

    if (isUnsaved) {
      const userChoice = await new Promise((resolve) => {
        savedMessage = `内容已经改变是否保存？\n`;
        showSavedModal = true; // 显示模态框
        savedCallback = function(result){
          resolve(result);
        }
         
      });
      savedMessage = "";
      showSavedModal = false;

      // 根据用户选择处理不同逻辑
      switch (userChoice) {
        case 1: // 取消操作：不切换章节
          return false; 
        case 2: // 不保存：直接切换章节（放弃未保存内容）
          isUnsaved = false; // 重置未保存状态
          simplemde.value("");
          break; 
        case 3: // 保存：先执行保存（异步操作），再切换章节
          await saveCurrentChapter(); // 等待保存完成（假设saveCurrentContent返回Promise）
          break;
      }
      
    }
    globalClickId = item.id;
    
    return true;
  }
  
  // 处理章节选择
  function handleChapterSelect(item) {
    console.log('选中章节:', item);
    currentEditId = item.id;
    currentChapterTitle = item.title;

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
      type: "chapter"
    },
    { 
      id: 2, 
      title: "第一部分：基础知识",
      type: "folder",
      expanded: true,
      children: [
 
      ]
    },
   
  ];

  nextId = Math.max(...initialOutline.flatMap(item => [item.id, ...(item.children || []).map(child => child.id)])) + 1;
  
  
  // 添加新文件夹
  function addFolder() {
    const newFolder = {
      id: nextId++ ,
      title: "新建文件夹",
      type: "folder",
      expanded: true,
      children: []
    };
    initialOutline = [...initialOutline, newFolder];
     
  }
  
  // 添加新章节
  function addChapter() {
    const newChapter = {
      id: nextId++  ,
      title: "新建章节",
      type: "chapter"
    };
    initialOutline = [...initialOutline, newChapter];
    
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
      if (!bookId){
         showNotification("请先完善书籍信息!");
         return ;
      }
      
      const dataStr = JSON.stringify(initialOutline, null, 2);
      create_chapter(bookId,dataStr,"outline.md",Keypub,Keypriv,function(message){
        if (message.code == 200)
          showNotification("大纲上传成功");
        
      })
 
    } catch (error) {
      showNotification('导出失败: ' + error.message, 'error');
    }
  }
 
  function submitBookInfo(){
    if (!bookAuthor || !bookTitle || (!coverImgData && !coverImgurl)){
        showNotification("请填写完整的:作者，标题，封面","error");
        return ;
    }
    let filename = `coverimg.png`;
   
    function upload_info(message) {       
        if (message[2].code == 200){
             
            let url = message[2].fileUrl;
            let bookInfo = {
                coverImgurl :url,
                title:bookTitle,
                author:bookAuthor
            }
            if (bookId ){
              update_book(bookInfo,bookId,Keypub,Keypriv,function(msg){
                    if (msg.code == 200) {
                    
                    confirmMessage = `书籍创建成功！\n 确认后编辑大纲!\n`;
                    showConfirmModal = true; // 显示自定义模态框
                    confirmcallback = function(result){
                      if (result){
                          window.location.href= window.location.href
                      }
                      confirmcallback = "";
                      showConfirmModal = false;
                    } 
                  }
              })
            } else {

              let tmpid;
              create_book(bookInfo,Keypub,Keypriv,function(msg){
                  if (msg.code == 201) tmpid = msg.id
                  else {
                    showNotification(msg.message);   
                  }
                  
                  if (msg.code == 200) {
                    bookId = tmpid;
                    confirmMessage = `书籍创建成功！\n 确认后编辑大纲!\n`;
                    showConfirmModal = true; // 显示自定义模态框
                    confirmcallback = function(result){
                      if (result){
                          window.location.href= window.location.href+"?bookid=" + bookId;
                      }
                      confirmcallback = "";
                      showConfirmModal = false;
                    } 
                  }

              })
            }
          

        } else {
            showNotification("正在上传封面"); 
        }
        
    }
    //需要上传图片
    if (!coverImgurl){


      showNotification("正在上传封面"); 
      upload_file(filename,coverImgData,Keypub,Keypriv,upload_info)
    }
    else {
      //无需上传图片，模拟上传成功消息
      upload_info([0,0,{
        code:200,
        message:"",
        fileUrl:coverImgurl
      }])
    }
  }


  function saveCurrentChapter(){
    console.log(currentEditId);
    console.log(simplemde.value());
  }
  function handleRename(item) {
    // 提示用户输入新名称
    const newTitle = prompt('请输入新名称', item.title);
    if (!newTitle || newTitle.trim() === '') return; // 取消或空输入不处理

    // 创建深拷贝避免直接修改源数据
    const updatedOutline = JSON.parse(JSON.stringify(initialOutline));
    // 查找并更新对应项的标题
    const itemToUpdate = findItemById(updatedOutline, item.id);
    if (itemToUpdate) {
      itemToUpdate.title = newTitle.trim();
      initialOutline = updatedOutline; // 更新响应式数据
      

    }
  }

  // 删除章节/文件夹
  function handleDelete(item) {


    if (!confirm(`确定要删除"${item.title}"吗？`)) return;

    // 创建深拷贝
    const updatedOutline = JSON.parse(JSON.stringify(initialOutline));
    // 查找父级并移除当前项
    const { parent, index } = findItemParentAndIndex(updatedOutline, item.id);
    if (parent && index !== -1) {
      parent.splice(index, 1); // 从父级数组中删除
      initialOutline = updatedOutline; // 更新响应式数据
       
     

      // 如果删除的是当前编辑项，重置编辑器
      if (globalClickId === item.id) {
        globalClickId = null;
        currentChapterTitle = "";
        const simplemde = window.SimpleMDEInstances?.[0]; // 假设编辑器实例可访问
        if (simplemde) simplemde.value('');
      }
    }
  }

  

  function getBookId(url1) {
      let url;
      // 处理传入的URL或使用当前页面URL
      if (!url1) {
          url = new URL(window.location.href);
      } else {
          url = new URL(url1);
      }
      
      // 从查询参数中获取bookid（searchParams是处理URL查询参数的API）
      let Id = url.searchParams.get('bookid');
      
      return Id; // 如果不存在会返回null
  }

  onMount(async () => {
    // 加载CodeMirror库
    let Key = getKey();
    
    Keypriv = Key.Keypriv;
    Keypub = Key.Keypub;
    if (!Keypriv){
        showNotification("请先登录。","warning");
        return ;
    }
    
    bookId = getBookId();
    if (bookId) {
       await get_book_id(bookId,function(message){
        if (message != "EOSE"){
           
          bookAuthor = message.data.author;
          bookTitle = message.data.title;
          coverImgurl = message.data.coverImgurl;

          const bookCover = document.querySelector('.book-cover');
                      
                      // 以相同方式显示图片
          bookCover.style.backgroundImage = `url(${uploadpath+coverImgurl})`;
          bookCover.style.backgroundSize = 'cover';
          bookCover.style.backgroundPosition = 'center';
          bookCover.innerHTML = ''; // 清空原有文字
        }
       })

       await get_chapter(bookId,"outline.md",function(message){
           if (message != "EOSE"){
             
            initialOutline = JSON.parse(message.data)
            nextId = Math.max(...initialOutline.flatMap(item => [item.id, ...(item.children || []).map(child => child.id)])) + 1;
          }
       });
    }

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
        toolbar: ["bold", "italic", "heading", "|", "code", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"],
        // 添加编辑器高度配置（部分主题可能需要）
    
      });
      
      // 强制调整编辑器内部高度
      const cmElement = simplemde.codemirror.getWrapperElement();
      if (cmElement) {
         
        cmElement.style.height = '85%';
        cmElement.style.minHeight = '70%';
      }
      
      simplemde.codemirror.on("change", function() {
        if (currentEditId !== null) {
          isUnsaved = true;
          updateStats();
          
        }
      });
      
      return simplemde;
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
            
      const totalChaptersEl = document.getElementById('totalChapters');
      const totalWordsEl = document.getElementById('totalWords');
      if (totalChaptersEl) totalChaptersEl.textContent = chapterCount;
      if (totalWordsEl) totalWordsEl.textContent = wordCount;
    }


    loadSimpleMDE(() => {
      simplemde = initEditor();
      updateStats();
      
      if (initialOutline.length > 0 && initialOutline[0].type === 'chapter') {
        currentEditId = initialOutline[0].id;
        
        if (simplemde) {
          const chapter = findChapter(currentEditId);
          if (chapter) {
            currentChapterTitle  = chapter.title;
            simplemde.value('');
            updateWordCount(simplemde);
          }
        }
      }
    });


    let moveInbookCoverContainer = false;
    const bookCoverContainer = document.getElementById('bookCoverContainer');
    bookCoverContainer.addEventListener('mouseenter', function() {
         
        moveInbookCoverContainer = true;
           
    });

    // 鼠标离开容器时触发
    bookCoverContainer.addEventListener('mouseleave', function() {    
         
        moveInbookCoverContainer = false;
    });
        
    
    // 监听整个文档的粘贴事件
    document.addEventListener('paste', function(e) {
       
        // 检查粘贴事件是否发生在目标容器内
        if (moveInbookCoverContainer) {
             
            e.preventDefault(); // 阻止默认粘贴行为

            // 检查是否有粘贴的图片
            const items = e.clipboardData.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const blob = items[i].getAsFile();
                        // 处理图片 - 这里示例是显示在封面区域
                        const imgUrl = URL.createObjectURL(blob);
                        const bookCover = bookCoverContainer.querySelector('.book-cover');
                        bookCover.style.backgroundImage = `url(${imgUrl})`;
                        bookCover.style.backgroundSize = 'cover';
                        bookCover.style.backgroundPosition = 'center';
                        // 清空原有文字
                        bookCover.innerHTML = '';
                        coverImgurl = "";
                        showNotification('已粘贴图片作为封面');

                        
                        // 2. 读取blob并转换为Uint8Array
                        const reader = new FileReader();
                        
                        // 方法A：通过ArrayBuffer转换（推荐，更直接）
                        reader.onload = function(event) {
                            // event.target.result 是 ArrayBuffer
                            const arrayBuffer = event.target.result;
                             
                            const uint8Array = new Uint8Array(arrayBuffer);
                            
                            coverImgData = uint8Array;
                           
                        };
                        
                        // 读取blob为ArrayBuffer（二进制原始数据）
                        reader.readAsArrayBuffer(blob);

    
                    }
                }
            }
        }
    });

    const fileInput = document.getElementById('coverInputfile');
    

    // 监听文件选择事件
    fileInput.addEventListener('change', function(e) {
        // 检查是否选择了文件
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // 检查是否为图片文件
            if (file.type.indexOf('image') !== -1) {
                // 读取文件并显示
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imgUrl = e.target.result;
                    // 1. 提取Base64数据（去掉DataURL前缀）
                    const base64Data = imgUrl.split(',')[1];
                    
                    // 2. 将Base64转换为Uint8Array（浏览器环境中的二进制数组，可类比Node.js的Buffer）
                    const binaryString = window.atob(base64Data);
                    const len = binaryString.length;
                    const uint8Array = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        uint8Array[i] = binaryString.charCodeAt(i);
                    }
                    
                    // 3. 此时uint8Array与Node.js的Buffer类型兼容（都是二进制数据）
                    coverImgData = uint8Array;

                    const bookCover = bookCoverContainer.querySelector('.book-cover');
                    
                    // 以相同方式显示图片
                    bookCover.style.backgroundImage = `url(${imgUrl})`;
                    bookCover.style.backgroundSize = 'cover';
                    bookCover.style.backgroundPosition = 'center';
                    bookCover.innerHTML = ''; // 清空原有文字
                    coverImgurl = "";
                    
                    // 显示提示
                    showNotification('已上传图片作为封面');
                };
                
                // 读取文件为DataURL
                reader.readAsDataURL(file);
            } else {
                showNotification('请选择图片文件', 'error');
            }
        }
    });

    // 可选：重置文件输入，允许重复选择同一文件
    fileInput.addEventListener('click', function() {
        this.value = '';
    });

    // 清理函数
    return () => {
      destroyCodeMirrorEditor();
    };


  }); //onMount

  // 当模态框关闭时销毁编辑器
  $: if (!showRawOutlineModal && codeMirrorEditor) {
    destroyCodeMirrorEditor();
  }
</script> 

<style>
  :global {
 
  }
</style>

<svelte:head>
    <title>esbook - 创作书籍</title>
</svelte:head>


<main class="flex-grow flex flex-col max-w-7xl mx-auto px-4 py-6 w-full">
  <div class="seamless-container flex-grow">
    <!-- 左侧面板 - 大纲和封面 -->
    <div class="left-seamless flex flex-col">
      <!-- 书籍封面 -->
      <div class="p-5 border-b border-gray-200" >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-primary flex items-center" on:click={togglecover}>
            <i class="fa fa-image mr-2"></i>书籍信息
          </h2>
          <button class="toggle-btn" on:click={togglecover}> 
            <i class="fa fa-chevron-{coverdir}"></i>
          </button>
        </div>
        
        <div class="flex flex-col items-center {hiddencover}" >
          <div class="w-full max-w-xs h-64 mb-4" id="bookCoverContainer">
            
            <div class="book-cover bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl w-full max-w-xs h-64 mb-4 flex flex-col items-center justify-center text-white p-6 text-center shadow-xl" >
                <h3 class="text-2xl font-bold mb-2">点击上传封面</h3>
                <p class="text-lg opacity-90">或者鼠标点击此处后</p>
                <p class="mt-4 font-medium">粘贴截图</p>
            </div>
  

          </div>  
          
          <div class="grid grid-cols-2 gap-3 w-full max-w-xs mb-4">
            <label class="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer transition flex items-center justify-center btn-hover text-sm">
              <i class="fa fa-upload mr-1"></i>上传封面
              <input type="file" class="hidden" id="coverInputfile">
            </label>
            <button class="bg-violet-500 hover:bg-violet-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center btn-hover text-sm" on:click={submitBookInfo}>
              <i class="fa fa-paint-brush mr-1"></i>提交书籍信息
            </button>
          </div>
          
          <div class="space-y-3 w-full max-w-xs">
            <div>
              <label class="block text-sm font-medium mb-1">书籍标题</label>
              <input type="text" placeholder="输入书籍标题" bind:value={bookTitle} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">作者</label>
              <input type="text" placeholder="作者姓名" bind:value={bookAuthor} class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
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
            <i class="fa fa-arrow-up mr-2"></i>上传大纲
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
          onRename={handleRename}   
          onDelete={handleDelete}   
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
            <h3  class="text-lg font-medium mt-1">{currentChapterTitle? currentChapterTitle:"选择大纲项进行编辑"}</h3>
          </div>
          <div class="flex gap-2">
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition">
              <i class="fa fa-history"></i>
            </button>
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition" 
                    data-tooltip="保存为草稿">
              <i class="fa fa-file-excel-o"></i>
            </button>
            <button class="p-2 text-white hover:bg-white/20 rounded-lg transition" 
                    data-tooltip="保存">
              <i class="fa fa-save"></i>
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
          <span id="lastSaved" class="text-sm text-gray-600">{isUnsaved ? '尚未保存' : '无需保存'}</span>
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

{#if showConfirmModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
      <h3 class="text-xl font-bold mb-4 text-primary">提示</h3>
      <p class="text-gray-700 mb-6 whitespace-pre-line">{confirmMessage}</p>
      <div class="flex justify-end gap-3">
        <button 
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          on:click={() => handleConfirm(false)}
        >
          取消
        </button>
        <button 
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
          on:click={() => handleConfirm(true)}
        >
          确定
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showSavedModal}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
      <h3 class="text-xl font-bold mb-4 text-primary">提示</h3>
      <p class="text-gray-700 mb-6 whitespace-pre-line">{savedMessage}</p>
      <div class="flex justify-end gap-3">
        <button 
          class="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 transition"
          on:click={() => handleSavedConfirm(1)}
        >
          取消
        </button>

        <!-- 不保存按钮：危险操作，使用橙色系警告色 -->
        <button 
          class="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100 transition"
          on:click={() => handleSavedConfirm(2)}
        >
          不保存
        </button>

        <!-- 保存按钮：主要操作，使用主色调（这里假设是蓝色系） -->
        <button 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          on:click={() => handleSavedConfirm(3)}
        >
          保存
        </button>
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