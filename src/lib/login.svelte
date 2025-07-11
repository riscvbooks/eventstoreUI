<script>
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition'; // 正确的导入方式
  // 模态框状态
  export let showLogin = false;
  let activeTab = 'login';
  let generatedKey = '';
  let keyDisplayed = true;
  
  // 生成随机ESEC密钥
  function generateEsecKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let key = 'esec_';
    
    for (let i = 0; i < 40; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
      if ((i + 1) % 10 === 0 && i < 39) {
        key += '-';
      }
    }
    
    generatedKey = key;
    keyDisplayed = true;
    return key;
  }
  
  // 切换标签页
  function switchTab(tabName) {
    activeTab = tabName;
  }
  
  // 关闭模态框
  function closeAuthModal() {
    showLogin = false;
    
    // 重置表单状态
    generatedKey = '';
    keyDisplayed = false;
    activeTab = 'login';
  }
  
  // 复制密钥到剪贴板
  function copyKey() {
    navigator.clipboard.writeText(generatedKey).then(() => {
      const copyBtn = document.getElementById('copy-key-btn');
      if (copyBtn) {
        copyBtn.textContent = '已复制!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
          copyBtn.textContent = '复制密钥';
          copyBtn.classList.remove('copied');
        }, 2000);
      }
    });
  }
  
  onMount(() => {
    // 事件监听
    const loginBtn = document.getElementById('login-btn');
    const demoLoginBtn = document.getElementById('demo-login-btn');
    
    if (loginBtn) loginBtn.addEventListener('click', () => showLogin = true);
    if (demoLoginBtn) demoLoginBtn.addEventListener('click', () => showLogin = true);
    
    return () => {
      // 清理事件监听器
      if (loginBtn) loginBtn.removeEventListener('click', () => showLogin = true);
      if (demoLoginBtn) demoLoginBtn.removeEventListener('click', () => showLogin = true);
    };
  });
</script>

{#if showLogin}
  <!-- 登录/注册模态框 -->
  <div class="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" transition:fade>
    <div class="bg-white rounded-xl w-full max-w-md shadow-2xl transition-all duration-300" in:scale={{ duration: 300 }} out:scale={{ duration: 300 }}>
      <div class="p-1">
              <!-- 关闭按钮 -->
              <button class="absolute top-20 right-20 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200 z-10" on:click={closeAuthModal}>
          <i class="fa fa-times text-xl"></i>
        </button>
        <!-- 标签页导航 -->
        <div class="flex border-b auth-tabs">
          <button class="flex-1 py-4 px-2 text-center font-medium text-gray-500 {activeTab === 'login' ? 'active' : ''}" on:click={() => switchTab('login')}>
            登录
          </button>
          <button class="flex-1 py-4 px-2 text-center font-medium text-gray-500 {activeTab === 'register' ? 'active' : ''}" on:click={() => switchTab('register')}>
            注册
          </button>
        </div>
        

 
        
        <!-- 登录表单 -->
        {#if activeTab === 'login'}
          <div class="p-6">
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-center mb-2">ESEC密钥登录</h3>
              <p class="text-muted text-center">使用您的ESEC密钥进行安全认证</p>
            </div>
            
            <div class="space-y-4">

              
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block text-sm font-medium text-gray-700">ESEC密钥</label>
                  <span class="text-xs text-gray-500">密钥将用于安全加密传输(只保留在本地)</span>
                </div>
                <textarea placeholder="粘贴您的ESEC密钥" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-techBlue focus:border-techBlue outline-none transition-all duration-200 esec-key"></textarea>
              </div>
              
              <div class="pt-2">
                <button class="w-full px-4 py-3 bg-techBlue text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200">
                  登录账号
                </button>
              </div>
              
              <div class="text-center text-sm text-gray-500 pt-4">
                <p>忘记密钥？<a href="#" class="text-techBlue hover:underline">联系支持团队</a></p>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- 注册表单 -->
        {#if activeTab === 'register'}
          <div class="p-6">
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-center mb-2">注册akaebook账号</h3>
              <p class="text-muted text-center">创建您的ESEC安全密钥</p>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">电子邮箱</label>
                <input type="email" placeholder="输入您的邮箱" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-techBlue focus:border-techBlue outline-none transition-all duration-200">
              </div>
              
              <div class="pt-2">
                <button class="w-full px-4 py-3 bg-techBlue/10 text-techBlue font-medium rounded-lg hover:bg-techBlue/20 transition-all duration-200 flex items-center justify-center" on:click={generateEsecKey}>
                  <i class="fa fa-key mr-2"></i>生成ESEC密钥
                </button>
              </div>
              
              {#if keyDisplayed}
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="block text-sm font-medium text-gray-700">您的ESEC密钥</label>
                    <button id="copy-key-btn" class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded copy-btn" on:click={copyKey}>
                      复制密钥
                    </button>
                  </div>
                  <div class="relative">
                    <textarea id="esec-key-field" rows="3"  class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg esec-key font-mono text-sm">{generatedKey}</textarea>
                    <div class="absolute top-2 right-2 text-gray-400">
                      <i class="fa fa-lock"></i>
                    </div>
                  </div>
                  <div class="text-xs text-red-500 mt-2">
                    <i class="fa fa-exclamation-triangle mr-1"></i>
                    请务必安全保存此密钥！丢失后将无法恢复账户访问权限
                  </div>
                </div>
              {/if}
              
              {#if keyDisplayed}
                <div class="pt-2">
                  <button class="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200">
                    开始注册
                  </button>
                </div>
              {/if}
              
              <div class="text-center text-sm text-gray-500 pt-4">
                <p>注册即表示您同意我们的<a href="#" class="text-techBlue hover:underline">服务条款</a>和<a href="#" class="text-techBlue hover:underline">隐私政策</a></p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
