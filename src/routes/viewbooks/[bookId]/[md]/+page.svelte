<script>
   
  // 直接使用预取的HTML内容
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    let currentChapterContent;
    
    import ViewMD from '$lib/ViewMD.svelte';
    onMount(async () => {
 
      let bookId = $page.params.bookId; // 对应 URL 中的 "c6e2d978..."
      let chapterId = $page.params.md; // 对应 URL 中的 "1.md"
        // 动态加载 JS
      const response = await fetch(`/viewbooks/${bookId}/${chapterId}`);
      let text = await response.text();
     
      currentChapterContent = text;

    })


</script>

<style>
:global {

  .chapter-content{
    padding:2rem;
  }

  .chapter-content p {
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }
  
  .chapter-content h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.5rem;
    padding-bottom: 0.5rem;
    
  }
  
  .chapter-content blockquote {
    border-left: 4px solid #4f46e5;
    padding: 1rem 1.5rem;
    background-color: #f8fafc;
    margin: 2rem 0;
    font-style: italic;
    border-radius: 0 6px 6px 0;
  }

  /* 主布局容器 */
  .main-container {
    display: flex;
    min-height: calc(100vh - 2rem);
    gap: 2rem;
    padding: 1rem;
  }

  /* 博客内容区域 */
  .blog-content-container {
    flex: 1;
    max-width: 100%;
  }

  /* 右侧 TOC 容器 */
  .right-toc-container {
    width: 280px;
    flex-shrink: 0;
    height: calc(100vh - 4rem);
    padding: 1.8rem 1rem;
    overflow-y: auto;
    position: sticky;
    top: 2rem;
    border-left: 1px solid #e2e8f0;
  }

  /* TOC 内容样式 */
  .right-toc-container .toc {
    list-style: none;
    padding-left: 1rem;
  }

  .right-toc-container .toc-item {
    margin-bottom: 0.8rem;
  }

  .right-toc-container .toc-link {
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
    font-size: 0.95rem;
  }

  .right-toc-container .toc-link:hover,
  .right-toc-container .toc-link.active {
    color: #4f46e5;
    font-weight: 500;
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .main-container {
      flex-direction: column;
      gap: 1rem;
    }

    .right-toc-container {
      width: 100%;
      height: auto;
      max-height: 300px;
      position: static;
      border-left: none;
      border-top: 1px solid #e2e8f0;
      margin-top: 1rem;
      padding: 1rem;
    }
  }

  @media (max-width: 768px) {
    .main-container {
      padding: 0.5rem;
    }

    .blog-content-container {
      padding: 0 0.5rem;
    }
  }

  .toc-container {
  background: #f9f9f9;       /* 背景色 */
  border-left: 3px solid #4CAF50; /* 左边装饰线 */
  padding: 10px 15px;
  border-radius: 6px;
  font-family: "Segoe UI", sans-serif;
  font-size: 14px;
}

.toc-item {
  margin: 5px 0;
  transition: all 0.2s;
}

.toc-link {
  text-decoration: none;
  color: #333;
  display: inline-block;
  width: 100%;
}

.toc-link:hover {
  color: #4CAF50;
  font-weight: bold;
}

.toc-link.active {
  color: #4CAF50;
  font-weight: bold;
  position: relative;
}

.toc-link.active::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background-color: #4CAF50;
  border-radius: 50%;
}

  /* 隔离横条容器 */
  .blog-divider {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 12px; /* 线条与圆点间距 */
    opacity: 0.8;
    transition: opacity 0.3s ease;
  }

  /* 鼠标悬停时增强显示 */
  .blog-divider:hover {
    opacity: 1;
  }

  /* 线条样式 - 渐变效果 */
  .divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, 
      rgba(79, 70, 229, 0) 0%, 
      rgba(79, 70, 229, 0.6) 50%, 
      rgba(79, 70, 229, 0) 100%
    );
    transition: all 0.5s ease;
  }

  /* 中间圆点装饰 */
  .divider-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #4F46E5; /* 主色调圆点 */
    position: relative;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    transition: transform 0.3s ease;
  }

  /* 圆点呼吸效果 */
  .divider-dot::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: rgba(79, 70, 229, 0.2);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.6;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 0.9;
    }
    100% {
      transform: translate(-50%, -50%) scale(0.8);
      opacity: 0.6;
    }
  }

  /* 顶部底部横条差异化 */
  .top-divider .divider-line {
    background: linear-gradient(90deg, 
      rgba(79, 70, 229, 0) 0%, 
      rgba(79, 70, 229, 0.6) 50%, 
      rgba(79, 70, 229, 0) 100%
    );
  }

  .bottom-divider .divider-line {
    background: linear-gradient(90deg, 
      rgba(139, 92, 246, 0) 0%, 
      rgba(139, 92, 246, 0.6) 50%, 
      rgba(139, 92, 246, 0) 100%
    );
  }

  .bottom-divider .divider-dot {
    background-color: #8B5CF6; /* 底部使用辅助色 */
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }

  .bottom-divider .divider-dot::after {
    background-color: rgba(139, 92, 246, 0.2);
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .blog-divider {
      gap: 8px;
    }
    
    .top-divider {
      margin-bottom: 4rem;
    }
    
    .bottom-divider {
      margin-top: 4rem;
    }
  }


}
</style>

<div class="chapter-content">
<a href="/" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow"> 回到主页</a>
          {#if       currentChapterContent  }
            <ViewMD mdcontent={currentChapterContent} />
          {:else}
            <div class="text-center py-10 text-gray-500">
              <p>内容加载中</p>
            </div>
          {/if}
</div>

  <aside class="right-toc-container" id="right-toc">
    <!-- TOC 内容将由 ViewMD 生成并插入 -->
    <div class="toc-loading" hidden>
      <p class="text-gray-500 text-sm">加载目录中...</p>
    </div>
  </aside>