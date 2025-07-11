<script>
  import { onMount } from 'svelte';
  import Login from '$lib/login.svelte';
   

 const code = `
    #include <linux/init.h>
    #include <linux/module.h>
    #include <linux/kernel.h>

    static int __init hello_init(void) {
        printk(KERN_INFO "Hello, Kernel World!\\n");
        return 0;
    }

    static void __exit hello_exit(void) {
        printk(KERN_INFO "Goodbye, Kernel World.\\n");
    }   

    module_init(hello_init);
    module_exit(hello_exit);

    MODULE_LICENSE("GPL");
    MODULE_AUTHOR("akaebook");
    MODULE_DESCRIPTION("A simple Linux kernel module");`;



  let showLogin = false; // 控制登录组件显示的状态
  let Logined = false; 
  // 切换登录组件显示状态
  function toggleLogin() {
    showLogin = !showLogin;
  }
  
 onMount(() => {
    // 导航栏滚动效果
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                navbar.classList.add('shadow-md');
            } else {
                navbar.classList.remove('shadow-md');
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
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // 关闭移动端菜单
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });

    });

</script>


<svelte:head>
    <title>akaebook - 计算技术专业资源平台</title>
</svelte:head>

<main class="font-inter bg-light text-dark antialiased">
    <!-- 导航栏 -->
    <header class="fixed w-full top-0 z-50 transition-all duration-300 bg-gray-900" id="navbar">
        <div class="bg-gray-900/90 bg-blur border-b border-gray-800">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <!-- Logo -->
                    <div class="flex items-center">
                        <a href="#" class="flex items-center">
                            <span class="text-white text-2xl font-bold">aka<span class="text-accent">ebook</span></span>
                        </a>
                    </div>

                    <!-- 导航链接 - 桌面版 -->
                    <nav class="hidden md:flex space-x-8">
                        <a href="#books" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">技术书籍</a>
                        <a href="#os-section" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">操作系统</a>
                        <a href="#hardware-section" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">硬件驱动</a>
                        <a href="#cpu-section" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">CPU架构</a>
                        <a href="#blog" class="text-gray-300 hover:text-white font-medium transition-colors duration-200">技术博客</a>
                    </nav>

                    <!-- 右侧操作区 -->
                    <div class="flex items-center space-x-4">
                        <button id="search-btn" class="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
                            <i class="fa fa-search text-gray-400"></i>
                        </button>
                        <button id="login-btn" class="px-4 py-2 bg-techBlue text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow" on:click={toggleLogin} >
                            {Logined ? '注销' : '登录'}  
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
                <a href="#books" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">技术书籍</a>
                <a href="#os-section" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">操作系统</a>
                <a href="#hardware-section" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">硬件驱动</a>
                <a href="#cpu-section" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">CPU架构</a>
                <a href="#blog" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 text-white transition-colors duration-200">技术博客</a>
            </div>
        </div>
    </header>

    <!-- 搜索模态框 -->
    <div id="search-modal" class="fixed inset-0 bg-black/70 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-gray-800 rounded-xl w-full max-w-3xl p-6 shadow-xl transform transition-all duration-300 scale-95 opacity-0" id="search-modal-content">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-white">技术资源搜索</h3>
                <button id="close-search-btn" class="text-gray-400 hover:text-white transition-colors duration-200">
                    <i class="fa fa-times text-xl"></i>
                </button>
            </div>
            <div class="relative">
                <input type="text" placeholder="搜索编程书籍、操作系统资料、硬件文档..." class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-techBlue focus:border-techBlue outline-none transition-all duration-200">
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <div class="mt-6">
                <h4 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">热门技术搜索</h4>
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">Linux内核</span>
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">设备驱动</span>
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">x86架构</span>
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">操作系统设计</span>
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">嵌入式开发</span>
                    <span class="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600 cursor-pointer transition-colors duration-200">Rust系统编程</span>
                </div>
            </div>
        </div>
    </div>

    <!-- 主内容区 -->
    <main class="pt-16">
        <!-- 重新设计的英雄区域 - 添加曲线弧度 -->
        <section class="bg-gradient-hero text-white py-16 md:py-24 hero-pattern relative">
            <!-- 曲线弧度分割线 -->
            <div class="curve-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="shape-fill"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="shape-fill"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="shape-fill"></path>
                </svg>
            </div>
            
            <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div class="flex flex-col md:flex-row items-center">
                    <div class="md:w-1/2 mb-10 md:mb-0">
                        <div class="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
                            <span class="flex items-center text-sm font-medium">
                                <i class="fa fa-star mr-2 text-yellow-300"></i> 专业技术资源平台
                            </span>
                        </div>
                        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight mb-4">
                            深入<span class="text-accent">计算技术</span>核心
                        </h1>
                        <p class="text-white/90 text-lg md:text-xl mb-8 max-w-lg text-balance">
                            探索操作系统、硬件驱动、CPU架构与编程技术的专业资源
                        </p>
                        <div class="flex flex-wrap gap-4">
                            <a href="#books" class="px-6 py-3 bg-white text-electricBlue font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow">
                                浏览技术书籍
                            </a>
                            <a href="#blog" class="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200">
                                阅读技术博客
                            </a>
                        </div>
                        
                        <div class="mt-8 flex items-center">
                            <div class="flex -space-x-2 mr-4">
                                <img class="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="用户头像">
                                <img class="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="用户头像">
                                <img class="w-10 h-10 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/67.jpg" alt="用户头像">
                            </div>
                            <div>
                                <p class="text-sm text-white/90">已有 <span class="font-bold text-white">3,500+</span> 开发者加入</p>
                                <div class="flex items-center text-yellow-400 text-sm">
                                    <i class="fa fa-star"></i>
                                    <i class="fa fa-star"></i>
                                    <i class="fa fa-star"></i>
                                    <i class="fa fa-star"></i>
                                    <i class="fa fa-star-half-o"></i>
                                    <span class="ml-1 text-white/80">4.8/5.0 用户评分</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="md:w-1/2 flex justify-center md:justify-end">
                        <div class="relative w-full max-w-md floating">
                            <div class="relative">
                                <div class="absolute inset-0 bg-gradient-to-br from-electricBlue/20 to-purple-500/20 rounded-xl blur-xl opacity-70"></div>
                                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" alt="计算技术" class="relative rounded-xl shadow-xl w-full h-auto object-cover border-4 border-white/30">
                            </div>
                            <div class="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                <div class="flex items-center gap-2">
                                    <div class="text-electricBlue">
                                        <i class="fa fa-microchip text-2xl"></i>
                                    </div>
                                    <div>
                                        <p class="text-dark font-semibold">800+</p>
                                        <p class="text-xs text-gray-500">硬件技术资源</p>
                                    </div>
                                </div>
                            </div>
                            <div class="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                                <div class="flex items-center gap-2">
                                    <div class="text-accent">
                                        <i class="fa fa-code text-2xl"></i>
                                    </div>
                                    <div>
                                        <p class="text-dark font-semibold">1200+</p>
                                        <p class="text-xs text-gray-500">编程技术资源</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 技术书籍展示区 -->
        <section id="books" class="py-16 bg-gray-50">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div>
                        <h2 class="text-3xl font-bold mb-4">专业技术书籍</h2>
                        <p class="text-muted max-w-2xl">深入操作系统、硬件驱动和CPU架构的核心技术</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <div class="relative">
                            <select class="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-techBlue/20 focus:border-techBlue transition-all duration-200">
                                <option>热门推荐</option>
                                <option>最新上架</option>
                                <option>操作系统</option>
                                <option>硬件驱动</option>
                                <option>CPU架构</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
                                <i class="fa fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <!-- 书籍卡片 1 -->
                    <div class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="操作系统概念" class="w-full h-64 object-cover">
                            <div class="absolute top-3 left-3 bg-techBlue text-white text-xs font-semibold px-2 py-1 rounded">操作系统</div>
                            <div class="absolute top-3 right-3 bg-accent text-white text-xs font-semibold px-2 py-1 rounded">电子书</div>
                        </div>
                        <div class="p-5">
                            <div class="flex items-center text-yellow-400 text-sm mb-2">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star-half-o"></i>
                                <span class="ml-1 text-muted">(4.7)</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-1">操作系统：精髓与设计原理</h3>
                            <p class="text-muted text-sm mb-3 line-clamp-2">深入解析操作系统核心概念，涵盖进程管理、内存分配和文件系统设计</p>
                            <div class="flex flex-wrap gap-2 mb-3">
                                <span class="chip chip-blue">内核</span>
                                <span class="chip chip-green">进程调度</span>
                                <span class="chip chip-purple">内存管理</span>
                            </div>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-techBlue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                                    免费阅读
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 书籍卡片 2 -->
                    <div class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Linux设备驱动开发" class="w-full h-64 object-cover">
                            <div class="absolute top-3 left-3 bg-hardwarePurple text-white text-xs font-semibold px-2 py-1 rounded">硬件驱动</div>
                            <div class="absolute top-3 right-3 bg-accent text-white text-xs font-semibold px-2 py-1 rounded">电子书</div>
                        </div>
                        <div class="p-5">
                            <div class="flex items-center text-yellow-400 text-sm mb-2">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <span class="ml-1 text-muted">(4.9)</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-1">Linux设备驱动开发详解</h3>
                            <p class="text-muted text-sm mb-3 line-clamp-2">全面讲解Linux内核设备驱动开发技术，涵盖字符设备、块设备和网络设备驱动</p>
                            <div class="flex flex-wrap gap-2 mb-3">
                                <span class="chip chip-purple">内核模块</span>
                                <span class="chip chip-red">硬件交互</span>
                                <span class="chip chip-blue">驱动调试</span>
                            </div>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-techBlue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                                    免费阅读
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 书籍卡片 3 -->
                    <div class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="现代处理器设计" class="w-full h-64 object-cover">
                            <div class="absolute top-3 left-3 bg-cpuRed text-white text-xs font-semibold px-2 py-1 rounded">CPU架构</div>
                            <div class="absolute top-3 right-3 bg-accent text-white text-xs font-semibold px-2 py-1 rounded">电子书</div>
                        </div>
                        <div class="p-5">
                            <div class="flex items-center text-yellow-400 text-sm mb-2">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star-o"></i>
                                <span class="ml-1 text-muted">(4.2)</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-1">现代处理器设计：CPU架构实践</h3>
                            <p class="text-muted text-sm mb-3 line-clamp-2">深入解析x86和ARM架构，探讨超标量、乱序执行和缓存优化技术</p>
                            <div class="flex flex-wrap gap-2 mb-3">
                                <span class="chip chip-red">微架构</span>
                                <span class="chip chip-green">指令集</span>
                                <span class="chip chip-blue">性能优化</span>
                            </div>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-techBlue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                                    免费阅读
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 书籍卡片 4 -->
                    <div class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="系统编程实践" class="w-full h-64 object-cover">
                            <div class="absolute top-3 left-3 bg-osGreen text-white text-xs font-semibold px-2 py-1 rounded">系统编程</div>
                            <div class="absolute top-3 right-3 bg-accent text-white text-xs font-semibold px-2 py-1 rounded">电子书</div>
                        </div>
                        <div class="p-5">
                            <div class="flex items-center text-yellow-400 text-sm mb-2">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star-half-o"></i>
                                <span class="ml-1 text-muted">(4.6)</span>
                            </div>
                            <h3 class="font-semibold text-lg mb-1">系统编程实战：Rust与C++</h3>
                            <p class="text-muted text-sm mb-3 line-clamp-2">使用现代编程语言进行系统级开发，涵盖内存管理、并发和硬件交互</p>
                            <div class="flex flex-wrap gap-2 mb-3">
                                <span class="chip chip-blue">Rust</span>
                                <span class="chip chip-green">并发编程</span>
                                <span class="chip chip-purple">系统调用</span>
                            </div>
                            <div class="flex justify-end">
                                <button class="px-4 py-2 bg-techBlue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                                    免费阅读
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-12 text-center">
                    <a href="#" class="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-dark font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
                        查看更多技术书籍
                        <i class="fa fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        </section>

        <!-- 操作系统专区 -->
        <section id="os-section" class="py-16 bg-white">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">操作系统核心技术</h2>
                    <p class="text-muted max-w-2xl mx-auto">深入理解操作系统内核、进程管理和内存分配机制</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-gray-50 rounded-xl p-8 border border-gray-200">
                        <div class="flex items-center mb-6">
                            <div class="w-12 h-12 rounded-full bg-osGreen/10 flex items-center justify-center text-osGreen mr-4">
                                <i class="fa fa-cogs text-xl"></i>
                            </div>
                            <h3 class="text-xl font-bold">内核开发</h3>
                        </div>
                        <p class="text-muted mb-6">探索操作系统内核的设计与实现，包括进程调度、中断处理和系统调用等核心机制。</p>
                        <div class="space-y-4">
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>Linux内核源码分析</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>ArceOS 架构解析</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>实时操作系统(RTOS)设计</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-8 border border-gray-200">
                        <div class="flex items-center mb-6">
                            <div class="w-12 h-12 rounded-full bg-osGreen/10 flex items-center justify-center text-osGreen mr-4">
                                <i class="fa fa-microchip text-xl"></i>
                            </div>
                            <h3 class="text-xl font-bold">内存管理</h3>
                        </div>
                        <p class="text-muted mb-6">深入研究虚拟内存、分页机制和内存分配算法，优化系统资源利用效率。</p>
                        <div class="space-y-4">
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>虚拟地址空间管理</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>内存分配算法比较</span>
                            </div>
                            <div class="flex items-center">
                                <i class="fa fa-check-circle text-osGreen mr-2"></i>
                                <span>缓存优化策略</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-12 bg-gray-800 rounded-xl p-6">
                    <h3 class="text-xl font-bold text-white mb-4">内核模块开发示例</h3>
                    <div class="code-block">
                    <pre class="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                          <code>{@html code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
                    </pre> 

                    </div>
                </div>
            </div>
        </section>

        <!-- 硬件驱动专区 -->
        <section id="hardware-section" class="py-16 bg-gray-50">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">硬件驱动开发</h2>
                    <p class="text-muted max-w-2xl mx-auto">掌握设备驱动开发核心技术，实现硬件与操作系统的无缝交互</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white rounded-xl p-6 shadow-card">
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fa fa-usb"></i>
                        </div>
                        <h3 class="font-semibold text-xl mb-2">外设驱动开发</h3>
                        <p class="text-muted mb-4">开发USB、PCIe、I2C等接口设备的驱动程序，实现硬件功能扩展。</p>
                        <ul class="space-y-2 text-muted text-sm">
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>设备枚举与识别</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>DMA数据传输</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>中断处理机制</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-card">
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fa fa-microchip"></i>
                        </div>
                        <h3 class="font-semibold text-xl mb-2">嵌入式驱动开发</h3>
                        <p class="text-muted mb-4">为嵌入式系统开发定制驱动程序，优化资源受限环境下的硬件交互。</p>
                        <ul class="space-y-2 text-muted text-sm">
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>裸机驱动开发</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>实时系统驱动</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>低功耗优化</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="bg-white rounded-xl p-6 shadow-card">
                        <div class="text-purple-600 text-4xl mb-4">
                            <i class="fa fa-bug"></i>
                        </div>
                        <h3 class="font-semibold text-xl mb-2">驱动调试与优化</h3>
                        <p class="text-muted mb-4">掌握驱动调试技术，提升驱动程序的稳定性和性能表现。</p>
                        <ul class="space-y-2 text-muted text-sm">
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>内核调试工具</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>性能分析</span>
                            </li>
                            <li class="flex items-center">
                                <i class="fa fa-check-circle text-purple-600 mr-2"></i>
                                <span>稳定性测试</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CPU架构专区 -->
        <section id="cpu-section" class="py-16 bg-white">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">CPU架构深入解析</h2>
                    <p class="text-muted max-w-2xl mx-auto">探索现代处理器设计原理，理解指令集、微架构和性能优化</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <div class="flex items-center mb-6">
                            <div class="w-16 h-16 rounded-full bg-cpuRed/10 flex items-center justify-center text-cpuRed mr-4">
                                <i class="fa fa-microchip text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">x86与ARM架构对比</h3>
                                <p class="text-muted">深入比较主流处理器架构的设计哲学和实现差异</p>
                            </div>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">特性</th>
                                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">x86</th>
                                        <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ARM</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium">指令集</td>
                                        <td class="px-4 py-3 text-sm text-muted">CISC</td>
                                        <td class="px-4 py-3 text-sm text-muted">RISC</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium">设计目标</td>
                                        <td class="px-4 py-3 text-sm text-muted">高性能计算</td>
                                        <td class="px-4 py-3 text-sm text-muted">能效比</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium">执行模式</td>
                                        <td class="px-4 py-3 text-sm text-muted">乱序执行</td>
                                        <td class="px-4 py-3 text-sm text-muted">有序执行</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-3 text-sm font-medium">应用领域</td>
                                        <td class="px-4 py-3 text-sm text-muted">服务器、桌面</td>
                                        <td class="px-4 py-3 text-sm text-muted">移动、嵌入式</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <div class="flex items-center mb-6">
                            <div class="w-16 h-16 rounded-full bg-cpuRed/10 flex items-center justify-center text-cpuRed mr-4">
                                <i class="fa fa-bolt text-2xl"></i>
                            </div>
                            <div>
                                <h3 class="text-xl font-bold">性能优化技术</h3>
                                <p class="text-muted">现代处理器的性能提升关键技术和实现原理</p>
                            </div>
                        </div>
                        
                        <div class="space-y-4">
                            <div class="flex items-start">
                                <div class="mt-1 mr-4 text-cpuRed">
                                    <i class="fa fa-check-circle text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold">超标量架构</h4>
                                    <p class="text-muted text-sm">同时执行多条指令，提高指令级并行性</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <div class="mt-1 mr-4 text-cpuRed">
                                    <i class="fa fa-check-circle text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold">分支预测</h4>
                                    <p class="text-muted text-sm">提前预测分支路径，减少流水线停顿</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <div class="mt-1 mr-4 text-cpuRed">
                                    <i class="fa fa-check-circle text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold">推测执行</h4>
                                    <p class="text-muted text-sm">提前执行可能需要的指令，提高效率</p>
                                </div>
                            </div>
                            <div class="flex items-start">
                                <div class="mt-1 mr-4 text-cpuRed">
                                    <i class="fa fa-check-circle text-xl"></i>
                                </div>
                                <div>
                                    <h4 class="font-semibold">多级缓存</h4>
                                    <p class="text-muted text-sm">减少内存访问延迟，提高数据访问速度</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 技术博客区 -->
        <section id="blog" class="py-16 bg-gray-50">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <div>
                        <h2 class="text-3xl font-bold mb-4">技术深度博客</h2>
                        <p class="text-muted max-w-2xl">操作系统、硬件驱动和CPU架构的深度解析</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <div class="relative">
                            <select class="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-techBlue/20 focus:border-techBlue transition-all duration-200">
                                <option>最新发布</option>
                                <option>操作系统</option>
                                <option>硬件驱动</option>
                                <option>CPU架构</option>
                                <option>编程技术</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted">
                                <i class="fa fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- 博客卡片 1 -->
                    <article class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Linux内核驱动开发" class="w-full h-48 object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div class="flex items-center text-white text-sm">
                                    <span class="flex items-center mr-3">
                                        <i class="fa fa-calendar-o mr-1"></i> 2025-07-15
                                    </span>
                                    <span class="flex items-center">
                                        <i class="fa fa-eye mr-1"></i> 3.2k
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center mb-3">
                                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="作者头像" class="w-8 h-8 rounded-full mr-2">
                                <span class="text-sm text-muted">张工 · 内核开发工程师</span>
                            </div>
                            <h3 class="font-semibold text-xl mb-2 hover:text-techBlue transition-colors duration-200">
                                <a href="#">Linux内核驱动开发实战：从入门到精通</a>
                            </h3>
                            <p class="text-muted mb-4 line-clamp-3">深入解析Linux设备驱动开发的核心技术，涵盖字符设备、块设备和网络设备驱动的实现原理与最佳实践...</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="chip chip-purple">设备驱动</span>
                                <span class="chip chip-blue">Linux内核</span>
                                <span class="chip chip-green">系统编程</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-muted">阅读时间: 15分钟</span>
                                <a href="#" class="text-techBlue hover:text-blue-700 font-medium text-sm flex items-center">
                                    阅读全文
                                    <i class="fa fa-long-arrow-right ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </article>

                    <!-- 博客卡片 2 -->
                    <article class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1586769852044-692d6e3703f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="ARM架构解析" class="w-full h-48 object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div class="flex items-center text-white text-sm">
                                    <span class="flex items-center mr-3">
                                        <i class="fa fa-calendar-o mr-1"></i> 2025-06-28
                                    </span>
                                    <span class="flex items-center">
                                        <i class="fa fa-eye mr-1"></i> 2.8k
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center mb-3">
                                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="作者头像" class="w-8 h-8 rounded-full mr-2">
                                <span class="text-sm text-muted">李教授 · 计算机体系结构</span>
                            </div>
                            <h3 class="font-semibold text-xl mb-2 hover:text-techBlue transition-colors duration-200">
                                <a href="#">ARM架构深入解析：从Cortex-M到Neoverse</a>
                            </h3>
                            <p class="text-muted mb-4 line-clamp-3">全面探讨ARM处理器架构的演变，分析不同系列的设计特点，以及如何为不同应用场景选择最优的ARM核心...</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="chip chip-red">CPU架构</span>
                                <span class="chip chip-green">ARM</span>
                                <span class="chip chip-blue">嵌入式系统</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-muted">阅读时间: 20分钟</span>
                                <a href="#" class="text-techBlue hover:text-blue-700 font-medium text-sm flex items-center">
                                    阅读全文
                                    <i class="fa fa-long-arrow-right ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </article>

                    <!-- 博客卡片 3 -->
                    <article class="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                        <div class="relative">
                            <img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" alt="Rust系统编程" class="w-full h-48 object-cover">
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <div class="flex items-center text-white text-sm">
                                    <span class="flex items-center mr-3">
                                        <i class="fa fa-calendar-o mr-1"></i> 2025-07-03
                                    </span>
                                    <span class="flex items-center">
                                        <i class="fa fa-eye mr-1"></i> 4.1k
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center mb-3">
                                <img src="https://randomuser.me/api/portraits/men/67.jpg" alt="作者头像" class="w-8 h-8 rounded-full mr-2">
                                <span class="text-sm text-muted">王工 · Rust系统开发</span>
                            </div>
                            <h3 class="font-semibold text-xl mb-2 hover:text-techBlue transition-colors duration-200">
                                <a href="#">Rust系统编程实践：构建安全高效的驱动与内核模块</a>
                            </h3>
                            <p class="text-muted mb-4 line-clamp-3">探索如何使用Rust语言进行系统级编程，开发安全、高效的设备驱动和内核模块，避免传统C/C++开发中的内存安全问题...</p>
                            <div class="flex flex-wrap gap-2 mb-4">
                                <span class="chip chip-blue">Rust</span>
                                <span class="chip chip-purple">系统编程</span>
                                <span class="chip chip-green">内存安全</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-muted">阅读时间: 18分钟</span>
                                <a href="#" class="text-techBlue hover:text-blue-700 font-medium text-sm flex items-center">
                                    阅读全文
                                    <i class="fa fa-long-arrow-right ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </article>
                </div>

                <div class="mt-12 text-center">
                    <a href="#" class="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-dark font-medium rounded-lg hover:bg-gray-50 transition-all duration-200">
                        查看更多技术博客
                        <i class="fa fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        </section>


        <!-- 关于我们 -->
        <section class="py-16 bg-white">
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-12">
                    <h2 class="text-3xl font-bold mb-4">关于 akaebook</h2>
                    <p class="text-muted max-w-2xl mx-auto">专注于计算技术的专业资源平台</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-gray-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-techBlue/10 text-techBlue rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa fa-book text-2xl"></i>
                        </div>
                        <h3 class="font-semibold text-lg mb-2">专业技术资源</h3>
                        <p class="text-muted">精选操作系统、硬件驱动和CPU架构领域的高质量书籍和文档</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-techBlue/10 text-techBlue rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa fa-users text-2xl"></i>
                        </div>
                        <h3 class="font-semibold text-lg mb-2">专家作者团队</h3>
                        <p class="text-muted">来自内核开发、硬件设计和系统架构领域的专业作者</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-xl p-6 text-center">
                        <div class="w-16 h-16 bg-techBlue/10 text-techBlue rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa fa-code text-2xl"></i>
                        </div>
                        <h3 class="font-semibold text-lg mb-2">实践代码示例</h3>
                        <p class="text-muted">提供可直接运行的代码示例和实践项目，加深技术理解</p>
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
                    <a href="#" class="inline-block mb-4">
                        <span class="text-white text-2xl font-bold">aka<span class="text-accent">ebook</span></span>
                    </a>
                    <p class="text-gray-400 mb-6">深入计算技术核心，探索操作系统、硬件驱动和CPU架构的专业资源平台。</p>
                    <div class="flex space-x-4">
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-techBlue transition-colors duration-200">
                            <i class="fa fa-github"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-techBlue transition-colors duration-200">
                            <i class="fa fa-twitter"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-techBlue transition-colors duration-200">
                            <i class="fa fa-linkedin"></i>
                        </a>
                        <a href="#" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-techBlue transition-colors duration-200">
                            <i class="fa fa-youtube"></i>
                        </a>
                    </div>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">技术资源</h4>
                    <ul class="space-y-2">
                        <li><a href="#books" class="text-gray-400 hover:text-white transition-colors duration-200">技术书籍</a></li>
                        <li><a href="#os-section" class="text-gray-400 hover:text-white transition-colors duration-200">操作系统</a></li>
                        <li><a href="#hardware-section" class="text-gray-400 hover:text-white transition-colors duration-200">硬件驱动</a></li>
                        <li><a href="#cpu-section" class="text-gray-400 hover:text-white transition-colors duration-200">CPU架构</a></li>
                        <li><a href="#blog" class="text-gray-400 hover:text-white transition-colors duration-200">技术博客</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">学习路径</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">操作系统开发</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">设备驱动开发</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">CPU架构设计</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">嵌入式系统</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors duration-200">系统编程</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">联系我们</h4>
                    <ul class="space-y-3">
                        <li class="flex items-start">
                            <i class="fa fa-envelope mt-1 mr-3 text-gray-400"></i>
                            <span class="text-gray-400">asmcos@jeapedu.com</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fa fa-github mt-1 mr-3 text-gray-400"></i>
                            <span class="text-gray-400">https://github.com/akae-cn</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fa fa-book mt-1 mr-3 text-gray-400"></i>
                            <span class="text-gray-400">ebook.akaedu.cn</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <p class="text-gray-400 text-sm mb-4 md:mb-0">© 2025 akaebook. 保留所有权利。</p>
                    <div class="flex space-x-6">
                        <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">隐私政策</a>
                        <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">服务条款</a>
                        <a href="#" class="text-gray-400 hover:text-white text-sm transition-colors duration-200">版权声明</a>
                    </div>
                </div>
            </div>
        </div>
    </footer>
    
      {#if showLogin}
        <Login bind:showLogin={showLogin}/>
      {/if}    
</main>
