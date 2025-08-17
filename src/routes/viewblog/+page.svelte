<script>
  import { onMount } from 'svelte';
  import { uploadpath } from "$lib/config";
  import { getKey } from "$lib/getkey";
  import { showNotification } from "$lib/message";
  import {  get_blog_id,get_user_profile } from "$lib/esclient";
 
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
  let blogId =  "";
  // 存储博客基本数据
  let blogData = {
    title: '',
    content: '',
    coverUrl: '',
    labels: [],
  };
  let currentContent = "";
  let user_profile;


  function getBlogId( ) {
      let url;
      // 处理传入的URL或使用当前页面URL
    
      url = new URL(window.location.href);
   
      let Id = url.searchParams.get('blogid');
      
      return Id; // 如果不存在会返回null
  }
 
  onMount(async () => {

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = '/static/css/vue.css';
        document.head.appendChild(css);

        // 动态加载 JS
        const js = document.createElement('script');
        js.src = '/static/js/docsify.min.js';
        document.body.appendChild(js);

    blogId = getBlogId();

    if (blogId) {
        await get_blog_id(blogId,message =>{
            if (message.code == 200){
                let b = JSON.parse(message.data);
                blogData = b;
                blogData.servertimestamp = message.servertimestamp; 
                currentContent = blogData.content;
                console.log(currentContent);
                
                get_user_profile(message.user,msg =>{
                    if (msg.code == 200){
                        user_profile = JSON.parse(msg.data)
                        console.log(user_profile)
                    }
                })
            }
        })
    }

  });
</script>

    <style>
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
    </style>

<svelte:head>
  <title>esbook - {blogData.title} ? blogData.title:"博客文章"</title>
</svelte:head>

 <!-- 博客内容 -->
<div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- 标题区域 -->
    <div class="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div class="w-full md:w-auto flex-shrink-0">
            <!-- 小封面图片 (100x100) -->
            <img 
                src={blogData.coverUrl ? `${uploadpath}${blogData.coverUrl}` : 'https://picsum.photos/seed/blogcover/200/200'} 
                alt={blogData.title || '博客封面'} 
                class="w-24 h-24 md:w:w-28 md:h-28 rounded-lg object-cover shadow-md"
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
                <div class="flex items-center">
 
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
    <div class="bg-white rounded rounded roundedrounded-xl shadow-md p-6 mb-8">
        <div class="blog-content">
            {#if currentContent}
                <ViewMD mdcontent={currentContent} />
            {:else}
                <div class="text-center py-10 text-gray-500">
                    <p>暂无博客内容</p>
                </div>
            {/if}
        </div>
    </div>
</div>

