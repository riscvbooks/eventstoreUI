<script>
  export let items;
  export let level = 1;
  export let onSelect;
  export let expanded = [];
  export let clickId;
  export let onSetClickId;
  export let onEdit;
  export let onRename;
  export let onDelete;
  export let onDragEnd;
  export let draggedItem ;
  export let dragOverItem  ;
  export let dragOverPosition;
  export let onSetDraggedItem; // 父组件回调：更新draggedItem
  export let onSetDragOver;    // 父组件回调：更新dragOver状态
  import NestedTree from './NestedTree.svelte';
  import { afterUpdate } from 'svelte';

  let currentExpandId = "";
  let activeMenuId = null;

  

  // 切换文件夹展开/折叠状态
  function toggleFolder(event, item) {
    event.stopPropagation();
    currentExpandId = currentExpandId === item.id ? "" : item.id;
  }

  // 处理项目点击
  function handleItemClick(item) {
    if (item.type === 'folder') {
      currentExpandId = currentExpandId === item.id ? "" : item.id;
    } else if (item.type === 'chapter' && onSelect) {
      onSelect(item);
    }
    activeMenuId = null;
  }

  // 切换菜单显示/隐藏
  function toggleMenu(event, itemId) {
    event.stopPropagation();
    activeMenuId = activeMenuId === itemId ? null : itemId;
  }

  function clickItem(item) {
    onSetClickId(item.id);
    handleItemClick(item);
  }

  // 拖动事件处理
  function handleDragStart(event, item) {
 
    onSetDraggedItem(item); // 调用父组件回调，更新全局状态
    event.dataTransfer.setData('text/plain', item.id);
    setTimeout(() => {
      const element = event.target.closest('.outline-item');
      if (element) element.classList.add('dragging');
    }, 0);
  }

  function handleDragOver(event, item) {
    
    event.preventDefault();
  
    if (!draggedItem || draggedItem.id === item.id) return;

    const rect = event.target.closest('.outline-item').getBoundingClientRect();
    const offset = event.clientY - rect.top;
    const height = rect.height;

    if (item.type === 'folder') {
      if (offset > height * 0.7) {
        dragOverPosition = 'inside';
      } else if (offset < height * 0.3) {
        dragOverPosition = 'before';
      } else {
        dragOverPosition = 'after';
      }
    } else {
      dragOverPosition = offset < height / 2 ? 'before' : 'after';
    }

     onSetDragOver(item, dragOverPosition);
  }

  function handleDragEnter(event) {
    event.preventDefault();
     
  }

  function handleDragLeave(event, item) {
     
    if (dragOverItem === item) {
        onSetDragOver(null, null);
    }
  }

  function handleDrop(event, item) {
    event.preventDefault();
   
    
    if (!draggedItem || draggedItem.id === item.id) return;

    onDragEnd?.(draggedItem, item, dragOverPosition);
    resetDragState();
  }

  function handleDragEnd(event) {
     
    resetDragState();
  }

  function resetDragState() {
    const elements = document.querySelectorAll('.outline-item.dragging');
    elements.forEach(el => el.classList.remove('dragging'));
    onSetDraggedItem(null); // 重置全局draggedItem
    onSetDragOver(null, null); // 重置全局dragOver状态
    activeMenuId = null;
  }

  afterUpdate(() => {
    const handleClickOutside = (event) => {
      const menu = document.querySelector('.action-menu.show');
      const dots = document.querySelector('.action-dots:hover');
      if (menu && !menu.contains(event.target) && !dots) {
        activeMenuId = null;
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="outline-tree transition-all duration-200">
  {#each items as item (item.id)} <!-- 添加唯一key确保重新排序能被正确识别 -->
    <div 
      class="outline-item group flex justify-between items-center {clickId == item.id ? 'active':''} {dragOverItem?.id === item.id ? 'drag-over' : ''} {dragOverItem?.id === item.id && dragOverPosition === 'before' ? 'drag-over-before' : ''} {dragOverItem?.id === item.id && dragOverPosition === 'after' ? 'drag-over-after' : ''} {dragOverItem?.id === item.id && dragOverPosition === 'inside' ? 'drag-over-inside' : ''}" 
      data-id={item.id} 
      on:click={() => clickItem(item)}
      draggable={true}
      on:dragstart={(e) => handleDragStart(e, item)}
      on:dragover={(e) => handleDragOver(e, item)}
      on:dragenter={handleDragEnter}
      on:dragleave={(e) => handleDragLeave(e, item)}
      on:drop={(e) => handleDrop(e, item)}
      on:dragend={handleDragEnd}
    >
      <!-- 项目内容区 -->
      <div class="flex items-center p-2.5 hover:bg-gray-50 rounded-md cursor-pointer w-full transition-colors duration-200">
        <!-- 层级缩进 -->
        <div class={`w-${level > 1 ? '8' : '0'} md:w-${level > 1 ? '10' : '0'} flex-shrink-0`}></div>
        
        <!-- 图标和折叠/展开按钮 -->
        {#if item.type === 'folder'}
          <i class={`fa fa-folder folder-icon mr-2 mt-0.5 transition-colors duration-200 ${currentExpandId === item.id ? 'text-folderHover' : ''}`}></i>
          
          <button 
            class="p-0.5 text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
            on:click={(e) => toggleFolder(e, item)}
            aria-label={currentExpandId === item.id ? "折叠" : "展开"}
          >
            <i class={`fa fa-chevron-${currentExpandId === item.id ? 'down' : 'right'} text-xs transition-transform duration-200`}></i>
          </button>
        {:else}
          <i class="fa fa-file-text-o chapter-icon mr-3 mt-0.5"></i>
        {/if}
        
        <!-- 标题 -->
        <span class="text-gray-800 font-medium">{item.title}</span>
      </div>

      <!-- 三点菜单按钮 -->
      <div class="outline-actions relative ml-2">
        <button 
          class="action-dots p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200"
          on:click={(e) => toggleMenu(e, item.id)}
          aria-label="操作菜单"
          on:dragstart={(e) => e.stopPropagation()}
        >
          <i class="fa fa-ellipsis-v text-gray-500"></i>
        </button>

        <!-- 菜单内容 -->
        <div 
          class="action-menu shadow-xl"
          class:show={activeMenuId === item.id}
        >
          {#if item.type === 'chapter'}
            <div 
              class="menu-item"
              on:click={(e) => { e.stopPropagation(); onEdit?.(item); activeMenuId = null; }}
            >
              <i class="fa fa-edit menu-icon"></i>编辑内容
            </div>
          {/if}
          
          <div 
            class="menu-item"
            on:click={(e) => { e.stopPropagation(); onRename?.(item); activeMenuId = null; }}
          >
            <i class="fa fa-pencil-alt menu-icon"></i>重命名
          </div>
          
          <div 
            class="menu-item text-red-500"
            on:click={(e) => { e.stopPropagation(); onDelete?.(item); activeMenuId = null; }}
            disabled={item.id === 1}  
          >
            <i class="fa fa-trash menu-icon"></i>删除
          </div>
        </div>
      </div>
    </div>
      
    <!-- 子项渲染 -->
    {#if item.type === 'folder' && item.children && currentExpandId === item.id}
      <div class="pl-4 md:pl-6 overflow-hidden transition-all duration-300 ease-in-out">
        <NestedTree 
          items={item.children} 
          level={level + 1} 
          onSelect={onSelect}
          expanded={expanded}
          clickId={clickId}
          onSetClickId={onSetClickId}
          onEdit={onEdit}
          onRename={onRename}
          onDelete={onDelete}
          onDragEnd={onDragEnd}
          draggedItem={draggedItem} 
          dragOverItem={dragOverItem}  
        dragOverPosition={dragOverPosition}
        onSetDraggedItem={onSetDraggedItem}
        onSetDragOver={onSetDragOver}
        />
      </div>
    {/if}
  {/each}
</div>

<style>
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
    transform: scale(1.01);
  }
  .outline-item.drag-over {
    background-color: rgba(79, 70, 229, 0.08);
  }
  .outline-item.drag-over-before {
    border-top: 2px dashed #4F46E5;
    padding-top: calc(2.5px - 2px); /* 调整 padding 补偿边框 */
  }
  .outline-item.drag-over-after {
    border-bottom: 2px dashed #4F46E5;
    padding-bottom: calc(2.5px - 2px); /* 调整 padding 补偿边框 */
  }
  .outline-item.drag-over-inside {
    background-color: rgba(79, 70, 229, 0.12);
    border: 2px dashed #4F46E5;
  }
  
  .outline-item + .outline-tree {
    position: relative;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.2s ease-out;
  }
  
  .outline-item + .outline-tree::before {
    content: '';
    position: absolute;
    left: 4px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #e5e7eb;
  }
  
  .outline-item + .outline-tree.visible {
    max-height: 2000px;
    opacity: 1;
  }

  .outline-actions {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .outline-item:hover .outline-actions {
    opacity: 1;
  }
  
  .action-menu.show {
    display: block;
  }
  
  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .outline-item {
    transition: all 0.2s ease;
  }
</style>
