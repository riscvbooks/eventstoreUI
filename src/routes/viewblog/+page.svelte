<script>
  import { onMount } from 'svelte';
  import { uploadpath } from "$lib/config";
  import { getKey } from "$lib/getkey";
  import { showNotification } from "$lib/message";
  import { get_blog_id, get_user_profile } from "$lib/esclient";
  import ViewMD from '$lib/ViewMD.svelte';

  const colorPool = [
    { bgClass: "bg-blue-100", textClass: "text-blue-800" },
    { bgClass: "bg-green-100", textClass: "text-green-800" },
    { bgClass: "bg-yellow-100", textClass: "text-yellow-800" },
    { bgClass: "bg-purple-100", textClass: "text-purple-800" },
    { bgClass: "bg-orange-100", textClass: "text-orange-800" },
    { bgClass: "bg-pink-100", textClass: "text-pink-800" },
    { bgClass: "bg-teal-100", textClass: "text-teal-800" }
  ];
  
  export let data;
  const { blogId, blogData, userProfile, error } = data;

 
   
  let currentContent = blogData?.content || "";
  let user_profile = userProfile;
  let loaded = false;

  function getBlogId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('blogid');
  }

  onMount(async () => {
    // 加载样式和脚本


    loaded = true;

  });
</script>

<style>
:global {


  .blog-content p {
    margin-bottom: 1.5rem;
    line-height: 1.7;
  }
  
  .blog-content h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: #1e293b;
    font-size: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .blog-content blockquote {
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

<svelte:head>
  <title>esbook - {blogData.title || "博客文章"}</title>
</svelte:head>

<!-- 主布局容器 -->
<div class="main-container">
  <!-- 左侧博客内容区域 -->
  <div class="blog-content-container">
    <div class="container mx-auto px-4 py-8 max-w-4xl">
      <!-- 标题区域 -->
      <div class="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div class="w-full md:w-auto flex-shrink-0">
          <img 
            src={blogData.coverUrl ? `${uploadpath}${blogData.coverUrl}` : 'https://picsum.photos/seed/blogcover/200/200'} 
            alt={blogData.title || '博客封面'} 
            class="w-24 h-24 md:w-28 md:h-28 rounded-lg object-cover shadow-md"
          >
        </div>
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blogData.title || '无标题'}</h1>
          <div class="flex flex-wrap items-center gap-4 text-gray-600">
            <div class="flex items-center">
              <img 
                src={user_profile?.avatarUrl ? `${uploadpath}${user_profile.avatarUrl}` : 'https://picsum.photos/seed/author/100/100'} 
                alt={user_profile?.displayName || '作者头像'} 
                class="w-8 h-8 rounded-full mr-2"
              >
              <span>{user_profile?.displayName || '未知作者'}</span>
            </div>
            <div class="flex items-center">
              <i class="far fa-calendar mr-2"></i>
              <span>
                {blogData.servertimestamp 
                  ? new Date(blogData.servertimestamp).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '未知日期'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签 -->
      {#if blogData.labels && blogData.labels.length > 0}
        <div class="flex flex-wrap gap-2 mb-8">
          {#each blogData.labels.slice(0, 5) as label, index}
            <span class="text-xs {colorPool[index].bgClass} {colorPool[index].textClass} px-2 py-0.5 rounded">
              {label}
            </span>
          {/each}
        </div>
      {/if}

      <!-- 博客内容 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="blog-divider top-divider mb-6">
          <div class="divider-line"></div>
          <div class="divider-dot"></div>
          <div class="divider-line"></div>
        </div>

        <div class="blog-content ">
          {#if currentContent && loaded }
            <ViewMD mdcontent={currentContent} />
          {:else}
            <div class="text-center py-10 text-gray-500">
              <p>暂无博客内容</p>
            </div>
          {/if}
        </div>
      </div>
        <div class="blog-divider top-divider mb-6">
          <div class="divider-line"></div>
          <div class="divider-dot"></div>
          <div class="divider-line"></div>
        </div>

    </div>
  </div>

  <!-- 右侧 TOC 容器 -->
  <aside class="right-toc-container" id="right-toc">
    <!-- TOC 内容将由 ViewMD 生成并插入 -->
    <div class="toc-loading" hidden>
      <p class="text-gray-500 text-sm">加载目录中...</p>
    </div>
  </aside>
</div>