<!-- src/routes/creator/+page.svelte -->
<script>
  // 页面特有脚本（如有）
  // 例如：编辑器交互、表单提交等逻辑
</script>

<style>
  /* 页面特有样式 */
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

  .editor-content {
    min-height: 500px;
    border: 1px solid #E5E7EB;
  }

  .editor-content:focus {
    outline: none;
    border-color: #4F46E5;
  }
</style>

<!-- 页面具体内容 -->
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
          <div class="w-16 h-16 bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center text-gray-400">
            <i class="fas fa-image"></i>
          </div>
          <button class="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
            <i class="fas fa-upload mr-2"></i> 上传封面
          </button>
        </div>
      </div>

      <div class="mb-6">
        <div class="editor-toolbar flex items-center border border-gray-300 rounded-t-lg p-2">
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-heading"></i>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-bold"></i>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-italic"></i>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-list-ul"></i>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-link"></i>
          </button>
          <button class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded">
            <i class="fas fa-image"></i>
          </button>
          <div class="ml-auto">
            <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">
              <i class="fas fa-eye mr-1"></i> 预览
            </button>
          </div>
        </div>
        <div 
          contenteditable="true" 
          class="editor-content p-4 rounded-b-lg bg-white"
          placeholder="在此撰写您的博客内容..."
        ><h1>欢迎使用创作中心</h1><p>在这里，您可以创作博客文章、编写书籍，并管理您的所有内容。</p><p>请开始撰写您的第一篇博客吧！</p></div>
      </div>

      <div class="flex justify-end space-x-3">
        <button class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
          保存草稿
        </button>
        <button class="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg">
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
          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Blog cover" class="w-full h-full object-cover">
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">现代前端开发实践指南</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>技术 · 2023-10-15</span>
                  <span class="mx-2">|</span>
                  <span><i class="fas fa-eye mr-1"></i> 1,258</span>
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

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Blog cover" class="w-full h-full object-cover">
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">自然摄影的艺术与技巧</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>摄影 · 2023-10-10</span>
                  <span class="mx-2">|</span>
                  <span><i class="fas fa-eye mr-1"></i> 892</span>
                </div>
              </div>
              <div class="ml-auto flex items-center">
                <span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">草稿</span>
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

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Blog cover" class="w-full h-full object-cover">
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">探索未知：我的荒野之旅</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>旅行 · 2023-10-05</span>
                  <span class="mx-2">|</span>
                  <span><i class="fas fa-eye mr-1"></i> 2,451</span>
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
          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                <i class="fas fa-book text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">JavaScript高级程序设计</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>技术 · 12章</span>
                  <span class="mx-2">|</span>
                  <span>已完成 65%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 65%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white">
                <i class="fas fa-book text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">摄影的艺术与灵魂</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>摄影 · 8章</span>
                  <span class="mx-2">|</span>
                  <span>已完成 30%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 30%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex">
              <div class="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                <i class="fas fa-book text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="font-bold text-gray-800">世界美食之旅</h3>
                <div class="flex items-center mt-1 text-sm text-gray-500">
                  <span>美食 · 15章</span>
                  <span class="mx-2">|</span>
                  <span>已完成 10%</span>
                </div>
                <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" style="width: 10%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-card bg-white border border-gray-200 rounded-lg p-4 hover:border-primary">
            <div class="flex items-center justify-center h-full">
              <button class="flex flex-col items-center text-gray-400 hover:text-primary">
                <div class="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
                  <i class="fas fa-plus text-xl"></i>
                </div>
                <span>新建书籍</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

