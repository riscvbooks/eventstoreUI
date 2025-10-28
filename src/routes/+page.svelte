<script>
  import { onMount } from 'svelte';

  import {uploadpath} from "$lib/config";
  import {get_books,get_blogs,get_users_profile} from "$lib/esclient";
  import Carousel from "$lib/Carousel.svelte";
 
  export let data;
 

  function getTagValue(tags,t) {
    const dTag = tags.find(tag => Array.isArray(tag) && tag[0] === t);
    return dTag ? dTag[1] : null;
  }


  let books = data.books;
  let blogs = data.blogs;;
   
  let users_profile = data.users_profile;

  let displayedBooks = data.books;
 

    function goTobook(bookId){
        window.location.href = "/viewbooks/" + bookId;
    }
    
 
    onMount(async () => {
 
 
    });

 

 

  onMount(() => {
    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        navbar.classList.add('shadow-md', 'bg-gray-900/95');
        navbar.classList.remove('bg-gray-900');
      } else {
        navbar.classList.remove('shadow-md', 'bg-gray-900/95');
        navbar.classList.add('bg-gray-900');
      }
    });

    // 移动端菜单切换
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // 搜索模态框
    const searchBtn = document.getElementById('search-btn');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchModalContent = document.getElementById('search-modal-content');

    searchBtn.addEventListener('click', () => {
      searchModal.classList.remove('hidden');
      setTimeout(() => {
        searchModalContent.classList.remove('scale-95', 'opacity-0');
        searchModalContent.classList.add('scale-100', 'opacity-100');
      }, 10);
    });

    closeSearchBtn.addEventListener('click', () => {
      searchModalContent.classList.remove('scale-100', 'opacity-100');
      searchModalContent.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        searchModal.classList.add('hidden');
      }, 300);
    });

    // 点击模态框外部关闭
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModalContent.classList.remove('scale-100', 'opacity-100');
        searchModalContent.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
          searchModal.classList.add('hidden');
        }, 300);
      }
    });

    // 平滑滚动



  });
</script>

<style>
.logo-title {
    font-size: 2.5rem;
    font-weight: 800;
    background: linear-gradient(90deg, #00a0de, #3b82f6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
    line-height: 1;
    text-shadow: 0 5px 15px rgba(0, 160, 222, 0.3);
    letter-spacing: -0.5px;
}
</style>


<svelte:head>
  <title>RiscvBooks 资料中心 - RISC-V架构与芯片开发技术资源</title>
</svelte:head>

<main class="font-inter bg-gray-50 text-gray-900 antialiased">
  <!-- 导航栏 -->
  <header id="navbar" class="fixed w-full top-0 z-50 transition-all duration-300 bg-gray-900">
    <div class="border-b border-gray-800">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a href="/" class="flex items-center">
              
              <span class="logo-title">RiscvBooks</span>
            </a>
          </div>

          <!-- 导航链接 - 桌面版 -->
          <nav class="hidden md:flex space-x-8">
            <a href="/" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">首页</a>
            <a href="#books" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">技术书籍</a>
            <a href="#blogs" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">开发指南</a>
            <a href="#resources" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">开发工具</a>
          </nav>

          <!-- 右侧操作区 -->
          <div class="flex items-center space-x-4">
            <button id="search-btn" class="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              <i class="fa fa-search text-gray-400"></i>
            </button>
            <button id="mobile-menu-btn" class="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200">
              <i class="fa fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div id="mobile-menu" class="hidden md:hidden bg-gray-800 border-b border-gray-700 shadow-lg">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a href="#home" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">首页</a>
        <a href="#books" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">技术书籍</a>
        <a href="#blogs" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">开发指南</a>
        <a href="#resources" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">开发工具</a>
      </div>
    </div>
  </header>

  <!-- 搜索模态框 -->
  <div id="search-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-center justify-center p-4">
    <div class="bg-gray-800 rounded-xl w-full max-w-3xl p-6 shadow-xl transform transition-all duration-300 scale-95 opacity-0" id="search-modal-content">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold text-white">RISC-V技术资源搜索</h3>
        <button id="close-search-btn" class="text-gray-400 hover:text-white transition-colors duration-200">
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>
      <div class="relative">
        <input type="text" placeholder="搜索RISC-V架构、芯片设计、系统软件开发相关资源..." class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>
      <div class="mt-6">
        <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">热门技术搜索</h4>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">RISC-V架构</span>
          <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">芯片设计</span>
          <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">系统软件</span>
          <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">OpenSBI</span>
          <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">U-Boot移植</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 主内容区 -->
  <main class="pt-16">
    <!-- 英雄区域 -->
    <section id="home" class="bg-gradient-to-br from-gray-800 to-gray-700 text-white py-16 md:py-24 relative">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden opacity-10">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <!-- 曲线弧度分割线 -->
      <div class="absolute bottom-0 left-0 right-0">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" class="w-full h-16">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="fill-gray-50"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="fill-gray-50"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="fill-gray-50"></path>
          </svg>
      </div>
      
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-10 md:mb-0">
                <div class="inline-block px-4 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full mb-6 border border-blue-500/30">
                  <span class="flex items-center text-sm font-medium">
                      <i class="fa fa-microchip mr-2 text-blue-400"></i> RISC-V技术资源平台
                  </span>
                </div>
                <div class="group"> 
                  <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-4 relative inline-block group">
                      <span class="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-200">探索</span>
                      <span class="text-blue-400 relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500">RISC-V</span>
                      <span class="bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-200">架构世界</span>
                      
                      <!-- 文字渐变与阴影效果 -->
                      <span class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 blur-xl opacity-70 -z-10 transform -rotate-1"></span>
                      
                      <!-- 装饰性下划线 -->
                      <span class="block w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mt-1 transform transition-transform duration-500 group-hover:scale-x-100 scale-x-75 origin-left"></span>
                  </h1>
                </div>
                <p class="text-gray-300 text-lg md:text-xl mb-8 max-w-lg text-balance">
                  汇聚RISC-V架构、芯片设计、系统软件开发的专业文档、书籍和实战指南
                </p>
                <div class="flex flex-wrap gap-4">
                  <a href="#books" class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow">
                      技术文档
                  </a>
                  <a href="#blogs" class="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
                      开发指南
                  </a>
                </div>
            </div>
            <div class="md:w-1/2 flex justify-center md:justify-end relative">
              <div class="relative w-full max-w-md">
                <!-- 背景渐变 -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl blur-xl opacity-70"></div>
                
                <!-- Carousel -->
                <div class="relative z-10">
                  <Carousel />
                </div>

                <!-- 左下角统计卡，向左下移动更多 -->
                <div class="absolute -bottom-10 -left-10 bg-white p-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-2 z-20">
                  <div class="text-blue-600">
                    <i class="fa fa-book text-2xl"></i>
                  </div>
                  <div>
                    <p class="text-gray-900 font-semibold">80+</p>
                    <p class="text-xs text-gray-500">技术文档</p>
                  </div>
                </div>

                <!-- 右上角统计卡，向右上移动更多 -->
                <div class="absolute -top-10 -right-10 bg-white p-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-2 z-20">
                  <div class="text-indigo-600">
                    <i class="fa fa-file-text text-2xl"></i>
                  </div>
                  <div>
                    <p class="text-gray-900 font-semibold">50+</p>
                    <p class="text-xs text-gray-500">开发指南</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </section>

    <!-- 技术文档展示区 -->
    <section id="books" class="py-16 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <!-- 图片容器 - 添加右边距控制间距 -->
          <div class="mb-4 md:mb-0 md:mr-6 lg:mr-8">
            <img src="/riscvbooks.png" alt="riscvbooks" class="h-20 w-20 object-contain">
          </div>
          
          <!-- 文字内容区域 - 占据主要空间 -->
          <div class="flex-1 min-w-0">
            <h2 class="text-3xl font-bold mb-3">RISC-V技术文档</h2>
            <p class="text-gray-600 max-w-2xl">精选RISC-V架构、芯片设计与系统开发的高质量技术书籍</p>
          </div>

          <!-- 筛选器区域 -->
          <div class="mt-6 md:mt-0 md:ml-6">
            <div class="relative">
              <select class="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200">
                <option>全部文档</option>
                <option>RISC-V架构</option>
                <option>芯片设计</option>
                <option>系统软件</option>
                <option>开发工具</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <i class="fa fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {#each displayedBooks as book}
            <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col" on:click={goTobook(book.id)}>
              <!-- 4:3比例图片 -->
              <div class="relative" style="padding-top: 100%;">  
                <img src={uploadpath + book.data.coverImgurl} alt={book.data.title} class="absolute inset-0 w-full h-full object-cover">
              </div>
              <div class="p-5">
                <h3 class="font-semibold text-lg mb-3">{book.data.title}</h3>
                <a href="/viewbooks/{book.id}"></a>
                <div class="flex flex-wrap gap-2 mb-4">
                  {#each book.labels as label}
                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {label}
                    </span>
                  {/each}
                </div>
                <div class="flex justify-end">
                  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                    阅读文档
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-12 text-center">
          <a href="#" class="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
            查看更多文档
            <i class="fa fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- 核心技术领域 -->
    <section id="topics" class="py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">核心技术领域</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">聚焦RISC-V芯片开发与系统软件的核心技术方向</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- RISC-V架构开发 -->
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
            <div class="w-14 h-14 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <i class="fa fa-microchip text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">RISC-V架构开发</h3>
            <p class="text-gray-600 mb-4">深入理解RISC-V指令集架构，掌握芯片底层开发与优化技术</p>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-blue-500 mr-2"></i>
                <span>RISC-V指令集详解</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-blue-500 mr-2"></i>
                <span>芯片架构设计与优化</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-blue-500 mr-2"></i>
                <span>性能分析与调优</span>
              </li>
            </ul>
            <a href="#" class="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition-colors">
              进入专题 <i class="fa fa-arrow-right ml-1"></i>
            </a>
          </div>

          <!-- 芯片驱动开发 -->
          <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-md transition-all duration-300">
            <div class="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
              <i class="fa fa-cogs text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">芯片驱动开发</h3>
            <p class="text-gray-600 mb-4">掌握各类外设驱动开发技术，包括存储、网络、显示等芯片驱动</p>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-indigo-500 mr-2"></i>
                <span>设备树配置与驱动绑定</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-indigo-500 mr-2"></i>
                <span>中断处理与DMA传输</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-indigo-500 mr-2"></i>
                <span>驱动调试与性能优化</span>
              </li>
            </ul>
            <a href="#" class="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
              进入专题 <i class="fa fa-arrow-right ml-1"></i>
            </a>
          </div>

          <!-- 系统软件开发 -->
          <div class="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-300">
            <div class="w-14 h-14 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-6">
              <i class="fa fa-code text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold mb-3">系统软件开发</h3>
            <p class="text-gray-600 mb-4">开发Bootloader、内核移植、系统服务等底层软件组件</p>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-teal-500 mr-2"></i>
                <span>OpenSBI/U-Boot开发</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-teal-500 mr-2"></i>
                <span>Linux内核移植与定制</span>
              </li>
              <li class="flex items-center text-sm text-gray-700">
                <i class="fa fa-check-circle text-teal-500 mr-2"></i>
                <span>系统服务与中间件</span>
              </li>
            </ul>
            <a href="#" class="inline-flex items-center text-teal-600 font-medium hover:text-teal-700 transition-colors">
              进入专题 <i class="fa fa-arrow-right ml-1"></i>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 开发指南区 -->
    <section id="blogs" class="py-16 bg-gray-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 class="text-3xl font-bold mb-4">开发指南与教程</h2>
            <p class="text-gray-600 max-w-2xl">RISC-V芯片开发与系统软件实现的实用指南</p>
          </div>
          <div class="mt-4 md:mt-0">
            <div class="relative">
              <select class="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200">
                <option>最新发布</option>
                <option>RISC-V架构</option>
                <option>驱动开发</option>
                <option>系统移植</option>
                <option>热门指南</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <i class="fa fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {#each blogs as blog}
            <article class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
              <div class="p-5">
                <div class="flex items-start mb-4">
                  <!-- 120x120正方形小图片 -->
                  <div class="w-28 h-28 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                    <img src={uploadpath+blog.data.coverUrl} alt={blog.data.title} class="w-full h-full object-cover">
                  </div>
                  
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors duration-200">
                      <a href="/viewblog?blogid={blog.id}">{blog.data.title}</a>
                    </h3>
                    <div class="flex items-center text-sm text-gray-500 mb-1">
                      <span class="flex items-center mr-3">
                        <i class="fa fa-calendar-o mr-1"></i> {blog.servertimestamp.split("T")[0] }
                      </span>
                      <span class="flex items-center">
                         
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  {#each blog.labels as label}
                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {label}
                    </span>
                  {/each}
                </div>
                
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                 {#if users_profile[blog.user]}
                  <div class="flex items-center">
                    <img src={uploadpath + users_profile[blog.user].data.avatarUrl}   class="w-8 h-8 rounded-full mr-2">
                    <span class="text-sm text-gray-700">{users_profile[blog.user].data.displayName}</span>
                  </div>
                  {/if}
                  <a href="/viewblog?blogid={blog.id}" class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                    阅读全文
                    <i class="fa fa-angle-right ml-1"></i>
                  </a>
                </div>
              </div>
            </article>
          {/each}
        </div>

        <div class="mt-12 text-center">
          <a href="#" class="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
            查看更多指南
            <i class="fa fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- 开发工具区 -->
    <section id="resources" class="py-16 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">开发工具与资源</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">RISC-V芯片开发所需的工具链、SDK和实用资源</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                <i class="fa fa-wrench text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">RISC-V工具链</h3>
                <p class="text-gray-600">完整的交叉编译工具链与开发环境</p>
              </div>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>GCC交叉编译器</span>
              </li>
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>OpenOCD调试工具</span>
              </li>
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>QEMU模拟器配置</span>
              </li>
            </ul>
            <button class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center">
              <i class="fa fa-download mr-2"></i> 下载工具链
            </button>
          </div>
          
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                <i class="fa fa-cube text-xl"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold">SDK与开发板支持包</h3>
                <p class="text-gray-600">RISC-V开发板的完整SDK和BSP</p>
              </div>
            </div>
            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>开发板BSP包</span>
              </li>
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>外设驱动库</span>
              </li>
              <li class="flex items-center">
                <i class="fa fa-check text-green-500 mr-2"></i>
                <span>示例代码与项目模板</span>
              </li>
            </ul>
            <button class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium flex items-center">
              <i class="fa fa-download mr-2"></i> 获取SDK
            </button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- 页脚 -->
  <footer class="bg-gray-900 text-white pt-16 pb-8">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div>
          <a href="/" class="inline-block mb-4">
            <span class="text-white text-2xl font-bold">RiscvBooks<span class="text-blue-400">资料中心</span></span>
          </a>
          <p class="text-gray-400 mb-6">专注于RISC-V架构、芯片设计与系统软件开发的专业文档资源平台，助力开发者深入技术核心。</p>
          <div class="flex space-x-4">
 
          </div>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">内容导航</h4>
          <ul class="space-y-2">
            <li><a href="#books" class="text-gray-400 hover:text-white transition-colors duration-200">技术文档</a></li>
            <li><a href="#blogs" class="text-gray-400 hover:text-white transition-colors duration-200">开发指南</a></li>
            <li><a href="#topics" class="text-gray-400 hover:text-white transition-colors duration-200">技术领域</a></li>
            <li><a href="#resources" class="text-gray-400 hover:text-white transition-colors duration-200">开发工具</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">开发者社区</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">技术领域</h4>
          <ul class="space-y-2">
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">RISC-V架构</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">芯片设计</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">系统软件</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">驱动开发</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">开发工具链</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-lg font-semibold mb-4">联系我们</h4>
          <ul class="space-y-3">
            <li class="flex items-start">
              <i class="fa fa-envelope mt-1 mr-3 text-gray-400"></i>
              <span class="text-gray-400">contact@riscvbooks.com</span>
            </li>
            <li class="flex items-start">
              <i class="fab fa-github mt-1 mr-3 text-gray-400"></i>
              <span class="text-gray-400">https://github.com/riscvbooks</span>
            </li>
            <li class="flex items-start">
              <i class="fa fa-globe mt-1 mr-3 text-gray-400"></i>
              <span class="text-gray-400">https://riscvbooks.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="border-t border-gray-800 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-gray-400 text-sm mb-4 md:mb-0">© 2025 RiscvBooks 资料中心. 保留所有权利。</p>
          <div class="flex space-x-6">
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">隐私政策</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">使用条款</a>
            <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">内容声明</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</main>