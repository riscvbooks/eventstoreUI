<script>
  import { onMount } from 'svelte';
  import { uploadpath } from "$lib/config";
  import { getKey } from "$lib/getkey";
  import { showNotification } from "$lib/message";
  import { upload_file, create_blog, get_blogs, get_books } from "$lib/esclient";
  import EditBlog from '$lib/EditBlog.svelte';

  const borderColors = [
    '#60a5fa', // 亮蓝
    '#a78bfa', // 亮紫
    '#22d3ee', // 亮青
    '#86efac', // 亮绿
    '#fda4af', // 亮粉
  ];

  let Keypriv;
  let Keypub;
 
  // 存储博客基本数据
  let blogData = {
    title: '',
    content: '',
    coverUrl: '',
    labels: [],
  };
  // 模拟博客列表数据（实际项目中可从API获取）
  let blogs = [];

  async function handleSaveSuccess(blog) {
    console.log("保存成功的博客数据：", blog);
    // 保存成功后可以刷新博客列表
    blogs = []
    await get_blogs(Keypub,0,0,10,handle_blogs);
  }

  function getTagValue(tags,t) {
    const dTag = tags.find(tag => Array.isArray(tag) && tag[0] === t);
    return dTag ? dTag[1] : null;
  }

  function handle_blogs(message){
    if (message == "EOSE"){
      ;
    }
    else {
      let temp = blogs;
      message.data = JSON.parse(message.data)
      if (getTagValue(message.tags,'d')){
          message.id = getTagValue(message.tags,'d');
      } 
      temp.push(message)
      blogs = temp;
    }
  }

  onMount(async () => {
    // 初始化用户密钥
    const Key = getKey();
    Keypriv = Key.Keypriv;
    Keypub = Key.Keypub;

    if (!Keypriv) {
      showNotification("请先登录。", "warning");
      return;
    }
    
    // 加载博客列表
    //offset 0, limit 10
    await get_blogs(Keypub,0,0,10,handle_blogs);
  });
</script>

<style>
 
  /* 标题样式 */
  .preview-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #c7d2fe;
  }
  
 
  
  /* 博客列表 */
  .blog-list {
    display: grid;
    gap: 10px;
  }
  
  /* 博客卡片 */
  .blog-card {
    background: white;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    border-left: 4px solid #60a5fa;
    position: relative;
    overflow: hidden;
  }
  
  .blog-card.featured::before {
    content: "推荐";
    position: absolute;
    top: 12px;
    right: -30px;
    width: 100px;
    text-align: center;
    background: #4f46e5;
    color: white;
    font-size: 0.75rem;
    padding: 3px 0;
    transform: rotate(45deg);
  }
  
  .blog-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.15);
    border-left-color: #6366f1;
  }
  
 
  
  .blog-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
 
  .blog-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #94a3b8;
    border-top: 1px solid #f1f5f9;
    padding-top: 12px;
  }
  
  .blog-date {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .blog-author {
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
    color: #475569;
  }
  
  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #94a3b8;
  }
  
  .empty-state i {
    font-size: 2rem;
    margin-bottom: 15px;
    color: #cbd5e1;
  }
</style>

<svelte:head>
  <title>esbook - 博客文章编辑</title>
</svelte:head>

<!-- 主容器 -->
<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-6 max-w-7xl">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">博客管理</h1>
      <p class="text-gray-600 mt-2">创建和编辑你的博客文章</p>
    </div>
    
    <!-- 左右分栏布局 -->
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- 左侧编辑区（占2/3宽度） -->
      <div class="w-full lg:w-2/3">
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6 transform transition-all duration-300 hover:shadow-lg">
          <EditBlog 
            initialBlog={blogData} 
            onSaveSuccess={handleSaveSuccess} 
          />
        </div>
      </div>
      
      <!-- 右侧博客列表（占1/3宽度，大屏幕显示） -->
      <div class="w-full lg:w-1/3">
        <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6 sticky top-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-800">我的博客</h3>
            <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {blogs.length} 篇
            </span>
          </div>
          
            {#if blogs.length > 0}
            <div class="space-y-5 ">
              {#each blogs as blog,index}
                
              <div class="blog-card "  style="border-left: 3px solid {borderColors[index % 5]};">

                <a href={`/editblog/${blog.id}`} class="block group">
                  <div class="flex flex-col sm:flex-row gap-4 bg-gray-50 rounded-lg overflow-hidden transition-all duration-300 hover:bg-gray-100">
                    <!-- 博客封面图 -->
                    <!-- 修改后的封面图片区域代码 -->
                    <div class="w-full sm:w-1/3 h-24 sm:h-auto relative overflow-hidden rounded-lg shadow-sm">
 
                    <img 
                        src={uploadpath + blog.data.coverUrl || 'https://picsum.photos/seed/defaultblog/300/200'} 
                        alt={blog.data.title || '博客封面'} 
                        class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                         
                    />
                    <!-- 轻微渐变遮罩增强文字可读性（如果图片上有文字） -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <!-- 博客信息 -->
                    <div class="w-full sm:w-2/3 p-3 flex flex-col justify-between">
                      <div>
                        <h4 class="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {blog.data.title || '无标题'}
                        </h4>
                        
                        <!-- 标签显示 -->
                        {#if blog.data.labels && blog.data.labels.length > 0}
                          <div class="flex flex-wrap gap-1 mt-1">
                            {#each blog.data.labels.slice(0, 2) as label}
                              <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                {label}
                              </span>
                            {/each}
                            {#if blog.data.labels.length > 2}
                              <span class="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                +{blog.data.labels.length - 2}
                              </span>
                            {/if}
                          </div>
                        {/if}
                      </div>
                      
                      <!-- 日期 -->
                    <div class="blog-meta">
                        <div class="blog-date">
                        <i class="far fa-calendar"></i>
                        {new Date(blog.servertimestamp).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        </div>
                        <div class="blog-author">
                        <i class="far fa-user"></i>
                         
                        </div>
                    </div>
                    </div>
                  </div>
                </a>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-10 bg-gray-50 rounded-lg">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p class="text-gray-500">暂无博客文章</p>
              <p class="text-sm text-gray-400 mt-1">开始创建你的第一篇博客吧</p>
            </div>
          {/if}

 




        </div>
      </div>
    </div>
  </div>
</div>
    