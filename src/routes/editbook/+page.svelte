<script>
  import { onMount } from 'svelte';
  import NestedTree from '$lib/NestedTree.svelte';


 //封面的显示和隐藏
  let coverdir= "down";
  let hiddencover= "hidden";
 
  // 大纲的选中id号，用来显示大纲的样式渲染。
  // 父组件维护全局唯一的选中ID
  let globalClickId = null;
  let draggedItem = null;
  let dragOverItem = null;
  let dragOverPosition = null;

  // 封面隐藏显示函数
  function togglecover(){
    if (coverdir == "up" ) {
        coverdir= "down";
        hiddencover = "hidden";
    } else {
        coverdir= "up";
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
    draggedItem = item; // 重新赋值触发响应式更新
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
                content: "这本书将引导您完成整个书籍创作过程，从构思到出版的每一个环节。我们将探讨如何规划您的书籍结构，发展您的角色，构建引人入胜的情节，以及如何克服写作障碍。无论您是一位新手作家还是有经验的作者，这本书都将为您提供有价值的见解和实用的技巧。",
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
                        content: "# 第一章：开始创作\n\n在开始您的写作之旅之前，有几个重要的问题需要回答。您为什么要写这本书？您的目标读者是谁？您希望通过这本书传达什么信息？\n\n## 明确写作目的\n\n明确写作目的是写作过程的第一步。您的写作目的可能是教育、娱乐、启发、说服或分享知识。了解您的写作目的将帮助您确定书籍的风格、语气和内容。\n\n## 了解目标读者\n\n了解您的目标读者是成功写作的关键。您需要考虑读者的年龄、兴趣、知识水平和阅读偏好。这将帮助您调整您的写作风格和内容，以满足他们的需求和期望。",
                        type: "chapter"
                    },
                    { 
                        id: 22, 
                        title: "第二章：构建框架", 
                        content: "# 第二章：构建框架\n\n构建一个坚实的框架是成功写作的基础。一个好的框架可以帮助您组织思路，确保内容的连贯性，并为读者提供清晰的阅读路径。\n\n## 书籍结构\n\n大多数书籍遵循一个基本的结构：引言、主体和结论。引言部分介绍主题并吸引读者的兴趣。主体部分是书籍的核心，包含主要内容和论点。结论部分总结要点并提供最后的思考。\n\n## 创建大纲\n\n创建大纲是构建框架的有效方法。大纲可以帮助您规划章节结构，确定每个章节的主要内容，并确保各章节之间的逻辑连贯性。您可以从一个简单的大纲开始，随着写作的进展不断完善。",
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
                        content: "# 第三章：人物塑造\n\n人物是小说的核心。生动、立体的人物可以吸引读者的兴趣，使他们投入到故事中。在本章中，我们将探讨如何创造令人难忘的人物角色。\n\n## 人物背景\n\n了解您的人物的背景是塑造他们的关键。他们的成长环境、家庭、教育和经历都将影响他们的性格和行为。花时间为每个主要人物创建详细的背景故事，即使这些细节不会直接出现在书中。\n\n## 人物性格\n\n人物性格是人物塑造的另一个重要方面。考虑您的人物的性格特征、优点、缺点、价值观和信仰。这些将决定他们如何应对故事中的挑战和冲突。",
                        type: "chapter"
                    },
                    { 
                        id: 32, 
                        title: "第四章：情节设计", 
                        content: "# 第四章：情节设计\n\n一个引人入胜的情节是吸引和保持读者兴趣的关键。在本章中，我们将探讨如何设计一个既有趣又连贯的情节。\n\n## 情节结构\n\n大多数成功的小说遵循一个基本的情节结构：开端、上升动作、高潮、下降动作和结局。开端介绍人物和背景，建立故事的基础。上升动作引入冲突和挑战，增加故事的紧张感。高潮是故事的最高点，是冲突的最激烈时刻。下降动作解决冲突，结局提供解决方案和结束感。\n\n## 冲突与悬念\n\n冲突和悬念是推动情节发展的动力。创造有趣的冲突可以使故事更加引人入胜。悬念可以保持读者的兴趣，使他们想要继续阅读。",
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
                        content: "# 第五章：出版选择\n\n完成写作后，您将面临出版选择。您可以选择传统出版、自出版或混合出版。每种选择都有其优点和缺点，选择哪一种取决于您的目标、资源和偏好。\n\n## 传统出版\n\n传统出版涉及将您的手稿提交给出版社。如果出版社感兴趣，他们将提供出版合同，包括预付款、版税和营销支持。传统出版的优点是可以获得专业的编辑、设计和营销支持，但缺点是过程可能很长，而且竞争激烈。\n\n## 自出版\n\n自出版允许您直接向公众发布您的书籍。您可以控制出版过程的各个方面，包括编辑、设计、定价和营销。自出版的优点是可以更快地出版，保留更多的创意控制权和版税，但缺点是您需要负责所有的出版和营销工作。",
                        type: "chapter"
                    }
                ]
            },
            { 
                id: 6, 
                title: "修订补丁", 
                content: "# 结语\n\n恭喜您完成了这本书！写作是一项具有挑战性但也非常有回报的工作。通过这本书，我们探讨了从构思到出版的整个书籍创作过程。\n\n写作是一种技能，就像任何其他技能一样，需要练习和耐心。不要期望您的第一稿是完美的 - 几乎所有的作家都会经历多次修改和编辑。最重要的是开始写作，并坚持下去。\n\n记住，每一位成功的作家都曾经是初学者。只要有决心和毅力，您也可以实现自己的写作目标。祝您写作愉快！",
                type: "chapter"
            },
            { 
                id: 5, 
                title: "结语", 
                content: "# 结语\n\n恭喜您完成了这本书！写作是一项具有挑战性但也非常有回报的工作。通过这本书，我们探讨了从构思到出版的整个书籍创作过程。\n\n写作是一种技能，就像任何其他技能一样，需要练习和耐心。不要期望您的第一稿是完美的 - 几乎所有的作家都会经历多次修改和编辑。最重要的是开始写作，并坚持下去。\n\n记住，每一位成功的作家都曾经是初学者。只要有决心和毅力，您也可以实现自己的写作目标。祝您写作愉快！",
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
  //saveOutline(); // 保存到本地存储
  
  
  
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
      if (result.index != -1 ) return result;
    }
  }
  return { parent: null, index: -1 };
}
  onMount(async() => {

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
        
 
        


        // 初始化应用
      
            let outline = JSON.parse(localStorage.getItem('bookOutline')) || initialOutline;
            let currentEditId = null;
            let simplemde = null;
            let draggedItem = null;
            let draggedItemData = null;
          
            const outlineContainer = document.getElementById('outlineContainer');
            const editorElement = document.getElementById('editor');
            const editorContainer = document.getElementById('editor-container');
            const currentChapterTitle = document.getElementById('currentChapterTitle');
            const wordCount = document.getElementById('wordCount');
            const lastSaved = document.getElementById('lastSaved');
            const addChapterBtn = document.getElementById('addChapter');
            const addFolderBtn = document.getElementById('addFolder');
            const totalChapters = document.getElementById('totalChapters');
            const totalWords = document.getElementById('totalWords');
            const searchOutline = document.getElementById('searchOutline');
          
            // 初始化SimpleMDE编辑器
            function initEditor() {
                simplemde = new SimpleMDE({ 
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
                            updateWordCount();
                            updateStats();
                        }
                    }
                });
            }
          
            // 渲染大纲
            function renderOutline(items, level = 0) {
                items.forEach(item => {
                    // 创建大纲项容器
                    const itemElement = document.createElement('div');
                    itemElement.className = `outline-item group flex justify-between items-center ${level > 0 ? 'outline-indent' : ''}`;
                    itemElement.dataset.id = item.id;
                    itemElement.draggable = true;
                    
                    // 左侧内容
                    const leftContent = document.createElement('div');
                    leftContent.className = 'flex items-center flex-1';
                    
                    // 缩进
                    const indent = document.createElement('div');
                    indent.className = 'flex-shrink-0';
                    indent.style.width = `${level * 24}px`;
                    leftContent.appendChild(indent);
                    
                    // 图标
                    const icon = document.createElement('i');
                    icon.className = item.type === 'folder' 
                        ? 'fa fa-folder mr-2 mt-0.5 text-sg folder-icon' 
                        : 'fa fa-file-text mr-2 mt-0.5 text-sg chapter-icon';
                    leftContent.appendChild(icon);
                    
                    // 标题
                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'font-medium truncate';
                    titleSpan.textContent = item.title;
                    leftContent.appendChild(titleSpan);
                    
                    // 文件夹展开/折叠按钮
                    if (item.type === 'folder') {
                        const toggleBtn = document.createElement('button');
                        toggleBtn.className = 'ml-2 p-1 text-gray-500 hover:bg-gray-200 rounded-full transition';
                        toggleBtn.innerHTML = item.expanded 
                            ? '<i class="fa fa-chevron-down text-xs"></i>' 
                            : '<i class="fa fa-chevron-right text-xs"></i>';
                        
                        toggleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            item.expanded = !item.expanded;
                            saveOutline();
                            renderFullOutline();
                        });
                        
                        leftContent.appendChild(toggleBtn);
                    }
                  
                    itemElement.appendChild(leftContent);
                  
                    // 操作按钮 - 点状菜单
                    const actions = document.createElement('div');
                    actions.className = 'outline-actions relative';
                  
                    const dotsBtn = document.createElement('div');
                    dotsBtn.className = 'action-dots p-1 rounded-full hover:bg-gray-200';
                    dotsBtn.innerHTML = '<i class="fa fa-ellipsis-v"></i>';
                  
                    const menu = document.createElement('div');
                    menu.className = 'action-menu shadow-xl';
                    
                    const editOption = document.createElement('div');
                    editOption.className = 'menu-item';
                    editOption.innerHTML = '<i class="fa fa-edit menu-icon"></i>编辑';
                    editOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        editChapter(item.id);
                        hideMenu(menu);
                    });
                    
                    const renameOption = document.createElement('div');
                    renameOption.className = 'menu-item';
                    renameOption.innerHTML = '<i class="fa fa-pencil-alt menu-icon"></i>重命名';
                    renameOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        renameChapter(item.id);
                        hideMenu(menu);
                    });
                    
                    const deleteOption = document.createElement('div');
                    deleteOption.className = 'menu-item text-red-500';
                    deleteOption.innerHTML = '<i class="fa fa-trash menu-icon"></i>删除';
                    deleteOption.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteChapter(item.id);
                        hideMenu(menu);
                    });
                    
                    menu.appendChild(editOption);
                    menu.appendChild(renameOption);
                    menu.appendChild(deleteOption);
                    
                    dotsBtn.appendChild(menu);
                    actions.appendChild(dotsBtn);
                    itemElement.appendChild(actions);
                  
                    outlineContainer.appendChild(itemElement);
                  
                    // 点击菜单按钮
                    dotsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const allMenus = document.querySelectorAll('.action-menu');
                        allMenus.forEach(m => m.classList.remove('show'));
                        menu.classList.toggle('show');
                    });
                  
                    itemElement.addEventListener('click', (e) => {
                        if (e.target !== dotsBtn && !menu.contains(e.target)) {
                            if (item.type === 'chapter') {
                                editChapter(item.id);
                            } else {
                                item.expanded = !item.expanded;
                                saveOutline();
                                renderFullOutline();
                            }
                        }
                    });
                  
                    // 双击重命名
                    itemElement.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        if (item.type === 'folder' || item.type === 'chapter') {
                            renameChapter(item.id);
                        }
                    });
                    
                    // 拖拽事件
                    itemElement.addEventListener('dragstart', handleDragStart);
                    itemElement.addEventListener('dragover', handleDragOver);
                    itemElement.addEventListener('dragenter', handleDragEnter);
                    itemElement.addEventListener('dragleave', handleDragLeave);
                    itemElement.addEventListener('drop', handleDrop);
                    itemElement.addEventListener('dragend', handleDragEnd);
                  
                    // 递归渲染子项
                    if (item.type === 'folder' && item.children && item.expanded) {
                        renderOutline(item.children, level + 1);
                    }
                });
            }
            
            // 拖拽功能实现
            function handleDragStart(e) {
                draggedItem = this;
                draggedItemData = findChapter(parseInt(this.dataset.id));
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', this.dataset.id);
            }
          
            function handleDragOver(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
          
            function handleDragEnter(e) {
                e.preventDefault();
                if (draggedItem !== this) {
                    this.classList.add('drag-over');
                }
            }
          
            function handleDragLeave(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            }
          
            function handleDrop(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
              
                if (draggedItem !== this && draggedItemData) {
                    const targetId = parseInt(this.dataset.id);
                    const targetItem = findChapter(targetId);
                    
                    // 确定放置位置
                    if (targetItem.type === 'folder') {
                        // 添加到文件夹
                        if (!targetItem.children) targetItem.children = [];
                        targetItem.children.push(draggedItemData);
                        targetItem.expanded = true; // 展开文件夹
                        
                        // 从原位置移除
                        removeChapter(outline, draggedItemData.id);
                    } else {
                        // 添加到同级位置
                        const targetParent = findParent(outline, targetId);
                        const targetIndex = targetParent.findIndex(item => item.id === targetId);
                        
                        // 从原位置移除
                        removeChapter(outline, draggedItemData.id);
                        
                        // 插入到目标位置
                        targetParent.splice(targetIndex + 1, 0, draggedItemData);
                    }
                    
                    saveOutline();
                    renderFullOutline();
                }
            }
          
            function handleDragEnd() {
                this.classList.remove('dragging');
                document.querySelectorAll('.outline-item').forEach(item => {
                    item.classList.remove('drag-over');
                });
            }
            
            // 查找父级
            function findParent(items, id, parent = outline) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) {
                        return parent;
                    }
                    
                    if (items[i].children) {
                        const found = findParent(items[i].children, id, items[i].children);
                        if (found) return found;
                    }
                }
                return null;
            }
            
            function hideMenu(menu) {
                menu.classList.remove('show');
            }
          
            // 渲染整个大纲
            function renderFullOutline() {
                outlineContainer.innerHTML = '';
                renderOutline(outline);
                updateStats();
                
                // 重新应用当前选中状态
                if (currentEditId !== null) {
                    const currentItem = document.querySelector(`.outline-item[data-id="${currentEditId}"]`);
                    if (currentItem) {
                        currentItem.classList.add('active');
                    }
                }
                
                // 点击文档其他地方关闭所有菜单
                document.addEventListener('click', function(e) {
                    const allMenus = document.querySelectorAll('.action-menu');
                    allMenus.forEach(menu => {
                        if (!menu.contains(e.target) && !e.target.closest('.action-dots')) {
                            menu.classList.remove('show');
                        }
                    });
                });
            }
          
            // 编辑章节
            function editChapter(id) {
                // 移除之前的选中状态
                document.querySelectorAll('.outline-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                const chapter = findChapter(id);
                if (chapter) {
                    currentEditId = id;
                    currentChapterTitle.textContent = chapter.title;
                    
                    // 设置编辑器内容
                    if (simplemde) {
                        simplemde.value(chapter.content || '');
                    }
                    
                    updateWordCount();
                    
                    // 添加选中状态
                    const currentItem = document.querySelector(`.outline-item[data-id="${id}"]`);
                    if (currentItem) {
                        currentItem.classList.add('active');
                    }
                }
            }
          
            // 重命名章节或文件夹
            function renameChapter(id) {
                const item = findChapter(id);
                if (item) {
                    const newTitle = prompt('请输入新的名称', item.title);
                    if (newTitle && newTitle.trim() !== '') {
                        item.title = newTitle.trim();
                        saveOutline();
                        renderFullOutline();
                        
                        if (currentEditId === id) {
                            currentChapterTitle.textContent = item.title;
                        }
                    }
                }
            }
          
            // 删除章节
            function deleteChapter(id) {
                if (id === 1) {
                    alert('前言章节不能删除');
                    return;
                }
                
                if (confirm('确定要删除这个章节吗？')) {
                    if (removeChapter(outline, id)) {
                        saveOutline();
                        renderFullOutline();
                      
                        if (currentEditId === id) {
                            currentEditId = null;
                            currentChapterTitle.textContent = '选择大纲项进行编辑';
                            if (simplemde) {
                                simplemde.value('');
                            }
                        }
                    }
                }
            }
          
            // 递归删除章节
            function removeChapter(items, id) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === id) {
                        items.splice(i, 1);
                        return true;
                    }
                    
                    if (items[i].children) {
                        if (removeChapter(items[i].children, id)) {
                            return true;
                        }
                    }
                }
                return false;
            }
          
            // 添加新章节
            addChapterBtn.addEventListener('click', function() {
                const newId = Date.now();
                const newChapter = {
                    id: newId,
                    title: `新章节 ${newId.toString().slice(-4)}`,
                    content: '# 新章节\n\n在此输入章节内容...',
                    type: "chapter"
                };
              
                // 添加到根目录
                outline.push(newChapter);
                saveOutline();
                renderFullOutline();
                editChapter(newId);
            });
          
            // 添加新文件夹
            addFolderBtn.addEventListener('click', function() {
                const newId = Date.now();
                const newFolder = {
                    id: newId,
                    title: `新文件夹 ${newId.toString().slice(-4)}`,
                    type: "folder",
                    expanded: true,
                    children: []
                };
              
                // 添加到根目录
                outline.push(newFolder);
                saveOutline();
                renderFullOutline();
            });
          
            // 保存大纲到本地存储
            function saveOutline() {
                localStorage.setItem('bookOutline', JSON.stringify(outline));
                lastSaved.textContent = `已保存: ${new Date().toLocaleTimeString()}`;
                
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
            function findChapter(id, items = outline) {
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
            function updateWordCount() {
                if (!simplemde || !simplemde.value()) {
                    wordCount.textContent = "0 字";
                    return;
                }
                
                // 简单计算字数
                const text = simplemde.value().replace(/<[^>]*>/g, ''); // 移除HTML标签
                const count = text.length;
                wordCount.textContent = `${count} 字`;
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
                
                countItems(outline);
                totalChapters.textContent = chapterCount;
                totalWords.textContent = wordCount;
            }
            
            // 大纲搜索功能
             
 
        
        outlineContainer.innerHTML = '';
                   
          
            // 初始渲染
        initEditor();
        //renderFullOutline();
        updateStats();
            
            // 设置初始编辑
            if (outline.length > 0 && outline[0].type === 'chapter') {
                editChapter(outline[0].id);
            }
       


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
            background-color:  
                #f4f3f6;
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
                <div class="p-5 border-b border-gray-200" >
                    <div class="flex justify-between items-center mb-4" >
                        <h2 class="text-xl font-semibold text-primary flex items-center" on:click={togglecover} >
                            <i class="fa fa-image mr-2"></i>书籍封面
                        </h2>
                        <button class="toggle-btn"  on:click={togglecover}> <i class="fa fa-chevron-{coverdir}" ></i></button>
 
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
                            <button class="bg-violet-500 hover:bg-violet-700 text-white px-3 py-2 rounded-lg transition flex items-center justify-center btn-hover text-sm" >
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
                    
                    <!-- 大纲搜索框 -->
                  
 
                    <NestedTree items={initialOutline}     
                        onSetClickId={handleSetClickId}
                        clickId={globalClickId}        
                        onSelect={handleChapterSelect}
                        draggedItem={draggedItem} 
                        dragOverItem={dragOverItem}  
                        dragOverPosition={dragOverPosition}
                        onSetDraggedItem={setDraggedItem} 
                        onSetDragOver={setDragOverState} 
                        onDragEnd={handleDragEnd}/>
                             

                    <!--div id="outlineContainer" class="space-y-1"-->
                        <!-- 大纲项将通过JS动态添加 -->

                    <!--/div-->
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