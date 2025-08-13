<script>
  import { onMount } from 'svelte';
  import { uploadpath } from "$lib/config";
  import { getKey } from "$lib/getkey";
  import { showNotification } from "$lib/message";
  import { upload_file,create_blog,get_blogs,get_books } from "$lib/esclient";

  let Keypriv;
  let Keypub;
  let simplemde;
  
  let blogs = [];
  let books = [];

  // 存储封面图片的Uint8Array数据
  let coverImageData = null;
  // 存储博客基本数据
  let blogData = {
    title: '',
    content: '',
    coverUrl: '',
    labels:[],
  };

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
      temp.push(message)
      blogs = temp;
    }
  }

  function handle_books(message){
    if (message == "EOSE"){
      console.log(books);
    }
    else {
      let temp = books;
      if (getTagValue(message.tags,'d')){
            message.id = getTagValue(message.tags,'d');
      } 
      temp.push(message)
      books = temp;
    }
  }

  // DataURL转换为Uint8Array
  function dataUrlToUint8Array(dataUrl, callback) {
    // 解析DataURL
    const [header, base64Data] = dataUrl.split(',');
    // 解码base64
    const binaryString = atob(base64Data);
    // 转换为Uint8Array
    const len = binaryString.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    callback(uint8Array);
  }

  // 处理图片文件：显示预览并转换为Uint8Array
  function handleImageFile(blob) {
    const uploadArea = document.getElementById('imageUploadArea');
    const previewImage = document.getElementById('previewImage');
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadArea.querySelector('i').classList.add('hidden');
      previewImage.src = event.target.result;
      previewImage.classList.remove('hidden');
      
      // 转换为Uint8Array
      const dataUrl = event.target.result;
      dataUrlToUint8Array(dataUrl, (uint8Array) => {
        coverImageData = uint8Array;
        showNotification("封面图片已准备好上传",2000 ,"info");
      });
    };
    reader.onerror = () => {
      showNotification("图片处理失败",2000 ,"error");
    };
    reader.readAsDataURL(blob);
  }

  // 保存博客核心逻辑
  async function saveBlog(isPublish = false) {
    // 1. 收集博客内容
    blogData.content = simplemde.value(); // 获取编辑器内容
    if (!blogData.title.trim()) {
      showNotification("请输入文章标题",1000,"warning");
      return;
    }

    // 2. 上传封面图片（如果有）
    if (coverImageData) {
      try {
        // 调用上传接口
        const uploadResult = await new Promise((resolve) => {
          upload_file(
            `cover-${Date.now()}.png`, // 文件名带时间戳避免重复
            coverImageData, 
            Keypub, 
            Keypriv, 
            (message) => resolve(message)
          );
        });

        if (uploadResult[2]?.code === 200) {
          blogData.coverUrl =   uploadResult[2].fileUrl;
           
        } else {
           
          return;
        }
      } catch (error) {
        showNotification("封面上传出错",2000 ,"error");
        return;
      }
    }

    // 3. 提交博客数据（这里替换为你的实际保存接口）
    try {
      create_blog(JSON.stringify(blogData),Keypub,Keypriv,(message) => {
          if (message.code == 200) {
            showNotification("blog保存成功");
          }
      })
    } catch (error) {
      showNotification("保存失败", 2000,"error");
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
    // 0 表示获取所有的blog
    await get_blogs(Keypub,0,handle_blogs);
    await get_books(Keypub,handle_books);

    // 初始化编辑器
    if (window.SimpleMDE) {
      initEditor(window.SimpleMDE);
    } else {
      // 动态加载SimpleMDE编辑器资源
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.css';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/simplemde@1.11.2/dist/simplemde.min.js';
      script.onload = () => initEditor(window.SimpleMDE);
      document.body.appendChild(script);
    }

    // 获取DOM元素
    const uploadArea = document.getElementById('imageUploadArea');
    const previewImage = document.getElementById('previewImage');
    const titleInput = document.querySelector('input[placeholder="输入文章标题..."]');
    const fileInput = document.getElementById('coverFileInput');
    let isMouseInArea = false;

    // 监听标题输入
    titleInput.addEventListener('input', (e) => {
      blogData.title = e.target.value;
    });

    // 处理文件选择
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.includes('image')) {
        handleImageFile(file);
      }
      // 重置文件输入，允许重复选择同一文件
      e.target.value = '';
    });

    // 处理上传区域粘贴事件
    function handleUploadAreaPaste(e) {
      if (!isMouseInArea || !e.clipboardData?.items) return;

      // 遍历剪贴板内容寻找图片
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.includes('image')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            e.stopPropagation();
            handleImageFile(blob);
            break;
          }
        }
      }
    }

    // 处理编辑器粘贴事件
    function handleEditorPaste(e) {
      if (!simplemde || !simplemde.codemirror.hasFocus()) return;

      const clipboardData = e.clipboardData;
      if (!clipboardData?.items) return;

      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.includes('image')) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            const reader = new FileReader();
            
            reader.onload = (event) => {
              const uint8Array = new Uint8Array(event.target.result);
              
              upload_file("paste.png", uint8Array, Keypub, Keypriv, (message) => {
                if (message[2]?.code === 200) {
                  const url = message[2].fileUrl;
                  const cm = simplemde.codemirror;
                  const cursor = cm.getCursor();
                  cm.replaceRange(`![图片](${uploadpath + url})\n`, cursor);
                  cm.setCursor(cursor.line + 1, 0);
                  showNotification("图片上传成功", "success");
                } else {
                  showNotification("图片上传失败", "error");
                }
              });
            };
            reader.readAsArrayBuffer(blob);
            break;
          }
        }
      }
    }

    // 鼠标状态监听
    uploadArea.addEventListener('mouseenter', () => {
      isMouseInArea = true;
    });

    uploadArea.addEventListener('mouseleave', () => {
      isMouseInArea = false;
    });

    // 全局粘贴事件监听
    document.addEventListener('paste', (e) => {
      handleEditorPaste(e);
      handleUploadAreaPaste(e);
    });



    // 组件卸载时清理事件
    return () => {
      document.removeEventListener('paste', () => {});
      uploadArea.removeEventListener('mouseenter', () => {});
      uploadArea.removeEventListener('mouseleave', () => {});
      titleInput.removeEventListener('input', () => {});
      fileInput.removeEventListener('change', () => {});
      document.querySelector('button:contains("保存草稿")')?.removeEventListener('click', () => {});
      document.querySelector('button:contains("发布文章")')?.removeEventListener('click', () => {});
    };
  });

  // 初始化编辑器配置
  function initEditor(SimpleMDE) {
    simplemde = new SimpleMDE({
      element: document.getElementById('blogEditor'),
      autoDownloadFontAwesome: false,
      spellChecker: false,
      toolbar: [
        'heading-1', 'heading-2', 'heading-3', '|',
        'bold', 'italic', 'strikethrough', '|',
        'unordered-list', 'ordered-list', '|',
        'link', 'image', 'table', '|',
        'quote', 'code', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ],
      initialValue: `# 欢迎使用创作中心\n\n在这里，您可以创作博客文章、编写书籍，并管理您的所有内容。\n\n请开始撰写您的第一篇博客吧！`
    });
  }
</script>

<style>
  /* 页面核心样式 */
  .editor-toolbar {
    background: linear-gradient(to bottom, #F9FAFB, #E5E7EB);
  }

  .content-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .content-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .markdown-body {
    font-family: 'Noto Serif SC', serif;
    line-height: 1.8;
    font-size: 17px;
  }

  .markdown-body h1, .markdown-body h2, .markdown-body h3 {
    font-weight: 700;
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    color: #1F2937;
  }

  .markdown-body h1 {
    font-size: 2.2rem;
    border-bottom: 2px solid #E5E7EB;
    padding-bottom: 0.3em;
  }

  .markdown-body h2 {
    font-size: 1.8rem;
  }

  .markdown-body h3 {
    font-size: 1.5rem;
  }

  .markdown-body p {
    margin-bottom: 1.2em;
  }

  .markdown-body blockquote {
    border-left: 4px solid #4F46E5;
    padding: 0 1em;
    color: #4B5563;
    margin: 1.5em 0;
  }

  /* 编辑器样式 */
  .CodeMirror {
    min-height: 500px !important;
    border: 1px solid #E5E7EB !important;
    border-radius: 0 0 0.5rem 0.5rem !important;
  }

  .editor-toolbar {
    border-radius: 0.5rem 0.5rem 0 0 !important;
  }

  /* 图片上传区域样式 */
  #previewImage {
    object-fit: cover;
  }
  
  .border-primary {
    border-color: #4F46E5;
  }
  
  /* 隐藏文件输入框 */
  #coverFileInput {
    display: none;
  }

    /* 书籍封面基础样式 */
  .book-cover {
    /* 保持封面的固定尺寸，与布局匹配 */
    width: 64px; /* 16rem 转换为具体像素 */
    height: 80px; /* 20rem 转换为具体像素 */
    
    /* 确保封面图正确显示 */
    background-color: #f3f4f6; /* 加载前的占位背景 */
    border-radius: 4px; /* 轻微圆角，增加质感 */
    overflow: hidden; /* 裁剪超出封面的内容 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 轻微阴影，增强立体感 */
    
    /* 封面悬停效果 */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  /* 悬停动画 */
  .book-cover:hover {
    transform: translateY(-2px); /* 轻微上浮 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 增强阴影 */
  }

  /* 书籍封面丝带效果（如果需要标记新书/热门等） */
  .book-ribbon {
    position: relative;
  }

  /* 可选：右上角丝带标记样式 */
  .book-ribbon::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 0 20px 20px 0;
    border-color: transparent #4f46e5 transparent transparent; /* 主色调丝带 */
    opacity: 0.8;
  }

  /* 封面图片容器样式 */
  .book-cover > div {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover; /* 覆盖整个容器，可能裁剪部分内容 */
    transition: background-image 0.3s ease; /* 图片切换动画 */
  }

  /* 加载失败时的默认图标容器 */
  .book-cover > div:last-child {
    background-color: #9ca3af; /* 加载失败时的背景色 */
  }

  /* 适配不同屏幕尺寸 */
  @media (max-width: 640px) {
    .book-cover {
      width: 56px;
      height: 70px;
    }
  }
</style>

<!-- 页面内容 -->
<!-- 顶部统计卡片 -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center">
      <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
        <i class="fas fa-file-alt text-blue-500 text-xl"></i>
      </div>
      <div>
        <h3 class="text-sm text-gray-500">博客文章</h3>
        <p class="text-2xl font-bold text-gray-800">12 篇</p>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>已发布</span>
        <span>8</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-blue-500 h-2 rounded-full" style="width: 66%"></div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center">
      <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
        <i class="fas fa-book text-green-500 text-xl"></i>
      </div>
      <div>
        <h3 class="text-sm text-gray-500">书籍作品</h3>
        <p class="text-2xl font-bold text-gray-800">3 本</p>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>已完成</span>
        <span>1</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-green-500 h-2 rounded-full" style="width: 33%"></div>
      </div>
    </div>
  </div>

  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center">
      <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
        <i class="fas fa-eye text-purple-500 text-xl"></i>
      </div>
      <div>
        <h3 class="text-sm text-gray-500">今日阅读</h3>
        <p class="text-2xl font-bold text-gray-800">1,258 次</p>
      </div>
    </div>
    <div class="mt-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>总阅读量</span>
        <span>28.9K</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div class="bg-purple-500 h-2 rounded-full" style="width: 45%"></div>
      </div>
    </div>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <!-- 博客编辑器 -->
  <div class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="border-b border-gray-200 px-6 py-4">
      <h2 class="text-xl font-bold text-gray-800">创作新博客</h2>
      <p class="text-gray-600 text-sm">撰写并发布新的博客文章</p>
    </div>

    <div class="p-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文章标题</label>
        <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="输入文章标题...">
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文章分类</label>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">技术</span>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">生活</span>
          <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">旅行</span>
          <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">读书</span>
          <button class="text-primary text-sm">
            <i class="fas fa-plus mr-1"></i> 添加分类
          </button>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">文章封面</label>
        <div class="flex items-center">
          <!-- 图片上传区域 -->
          <div class="relative group">
            <div 
              id="imageUploadArea"
              class="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden"
            >
              <i class="fas fa-image text-xl"></i>
              <img id="previewImage" class="hidden w-full h-full object-cover" alt="粘贴的图片预览">
            </div>
            
            <!-- 提示框 -->
            <div class="absolute top-[-50%] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              点击粘贴截图
              <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-[-4px]">
                <div class="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          
          <!-- 使用label关联隐藏的文件输入框 -->
          <label for="coverFileInput" class="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 cursor-pointer transition-colors">
            <i class="fas fa-upload mr-2"></i> 上传封面
          </label>
          <!-- 隐藏的文件输入框 -->
          <input id="coverFileInput" type="file" accept="image/*" />
        </div>
      </div>

      <!-- 编辑器容器 -->
      <div class="mb-6">
        <textarea id="blogEditor" class="hidden"></textarea>
      </div>

      <div class="flex justify-end space-x-3">
        <button class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50" on:click={ ()=>saveBlog(false)}>
          保存草稿
        </button>
        <button class="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg" on:click={ ()=>saveBlog(true)}>
          发布文章
        </button>
      </div>
    </div>
  </div>

  <!-- 内容管理 -->
  <div class="space-y-8">
    <!-- 近期博客 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">近期博客</h2>
          <a href="#" class="text-primary text-sm hover:underline">查看全部</a>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-4">
         {#each blogs as blog}
          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img src="{uploadpath + blog.data.coverUrl}" alt="博客封面" class="w-full h-full object-cover">
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">{blog.data.title}</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>技术 · {blog.servertimestamp.split("T")[0]}</span>
                  <span class="mx-2">|</span>
                  <span><i class="fas fa-eye mr-1"></i>  </span>
                </div>
              </div>
              <div class="ml-auto flex items-center">
                <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">已发布</span>
              </div>
            </div>
            <div class="mt-3 flex space-x-2">
              <button class="text-sm text-gray-600 hover:text-primary">
                <i class="fas fa-edit mr-1"></i> 编辑
              </button>
              <button class="text-sm text-gray-600 hover:text-red-500">
                <i class="fas fa-trash-alt mr-1"></i> 删除
              </button>
              <button class="text-sm text-gray-600 hover:text-green-500">
                <i class="fas fa-chart-line mr-1"></i> 数据
              </button>
            </div>
          </div>
          {/each}

 
 
        </div>
      </div>
    </div>

    <!-- 我的书籍 -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">我的书籍</h2>
          <a href="#" class="text-primary text-sm hover:underline">新建书籍</a>
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
        {#each books as book}
          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <!-- 使用书籍封面图替换纯色背景 -->
              <div class="book-cover book-ribbon relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden">
                <!-- 背景图使用书籍的封面图片 -->
                <div style="background-image: url('{uploadpath + book.data.coverImgurl}'); 
                            background-size: cover; 
                            background-position: center; 
                            width: 100%; 
                            height: 100%;">
                </div>
                <!-- 当封面图加载失败时显示默认图标 -->
                <div class="absolute inset-0 flex items-center justify-center text-white bg-gray-400 hidden" 
                    on:error|once="{e => e.currentTarget.classList.remove('hidden')}">
                  <i class="fas fa-book text-2xl"></i>
                </div>
              </div>
              
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">{book.data.title}</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>{book.data.category || '未分类'}</span>
                  <span class="mx-2">|</span>
                  <span>已完成 {book.data.progress || 30}%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: {book.data.progress || 30}%"></div>
                </div>
              </div>
            </div>
          </div>
        {/each}
 

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <a href="/editbook">
              <div class="flex items-center justify-center h-full">
                <button class="flex flex-col items-center text-gray-400 hover:text-primary">
                  <div class="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                    <i class="fas fa-plus text-xl"></i>
                  </div>
                  <span>新建书籍</span>
                </button>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
