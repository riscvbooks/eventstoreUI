<script>
  import { onMount } from 'svelte';
 
  import {create_user,get_events,get_users,get_permissions} from '$lib/esclient';
 
  import {WebStorage} from '$lib/WebStorage'
  import {getKey} from "$lib/getkey";
  import {getColorClass,getUserName} from "$lib/users";
  import {getPerm } from "$lib/permissions";
  import {selectRandomIcon} from "$lib/events";

  import {    
    generateSecretKey,
    getPublicKey,
    esecEncode,
    esecDecode,
  } from "eventstore-tools/src/key";
     

 

  let Keypriv ;
  let Keypub ;
   
  let isNewAccount = false;
  let emailInput;
  let privateKeyInput;
  let newpriv;
  let showLogin = false;
 

  let events      = [];
  let users       = [];
  let permissions = [];

  let showToast = false;
  let toastMessage = '';
  let toastType = 'success'; // success, error, warning, info

  const showToastMessage = (message, type = 'success') => {
    toastMessage = message;
    toastType = type;
    showToast = true;
    
    // 3秒后自动隐藏
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  function handle_events(e){
    let temp = events;
    e.icon = selectRandomIcon();
    temp.push(e)

    events = [...temp];
    console.log(events)
  }


  function handle_users(e){
    let temp = users;
    temp.push(e)
    users = [...temp]
     
  }

  function handle_permissions(e){
    
    let temp = permissions;
    temp.push(e);
    permissions = [...temp];
     
  }

  const generateKey = () => {
    // 实际项目中应该使用加密库生成私钥
    const keyField = document.getElementById('esecKey');
    newpriv = generateSecretKey()
    keyField.value = esecEncode(newpriv);
    keyField.classList.add('border-green-300', 'bg-green-50');
    setTimeout(() => {
            keyField.classList.remove('border-green-300', 'bg-green-50');
    }, 2000);
    privateKeyInput = keyField.value;
  };

  const toggleCreate = () => {
    isNewAccount = !isNewAccount;
    
    privateKeyInput = ''; // 切换模式时清空输入
    emailInput = '';
  };

  const LoginorCreate = ()=>{
    console.log(privateKeyInput);

    if (!privateKeyInput.startsWith('esec1') || privateKeyInput.length < 48) {
        return alert('无效的私钥格式');
    }
         

    if (isNewAccount){//create

      create_user(emailInput,getPublicKey(newpriv),newpriv,function(message){
        showToastMessage(message[2].message);
        if (message[2].code == 200){
          let storage = new WebStorage(localStorage);
          Keypriv = esecDecode(privateKeyInput)['data']
        
          Keypub = getPublicKey(Keypriv) 
          storage.set("keyPriv", Keypriv);
          showToastMessage(message[2].message);
          setTimeout(() => {
             window.location.reload();
          }, 1000);
          
        } else {
          showToastMessage(message[2].message,"warning");
        }
 

      });
    } else { //login

 
      let storage = new WebStorage(localStorage);
      Keypriv = esecDecode(privateKeyInput)['data']
        
      Keypub = getPublicKey(Keypriv) 
      storage.set("keyPriv", Keypriv);
    }



  }

  const userMenu =()=>{
    if (!Keypub) return ;
    
    const userDropdown = document.getElementById('userDropdown');

    userDropdown.classList.toggle('hidden');

  }

  const Logout = ()=> {
    let storage = new WebStorage(localStorage);
    storage.remove("keyPriv");
    window.location.reload();

  }

  function setupSidebar() {
    const sidebarLinks = document.querySelectorAll('#sidebar nav a');
     
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            
            e.preventDefault();
            
            // 移除所有激活状态
            sidebarLinks.forEach(l => {
                l.classList.remove('sidebar-active');
                l.classList.add('text-gray-700');
                l.querySelector('i').classList.add('text-gray-500');
                l.querySelector('i').classList.remove('text-primary');
            });
            
            // 添加当前激活状态
            link.classList.add('sidebar-active');
            link.classList.remove('text-gray-700');
            link.querySelector('i').classList.remove('text-gray-500');
            link.querySelector('i').classList.add('text-primary');
            
            // 获取链接目标
            const target = link.getAttribute('href').substring(1);
            
            // 更新标题
            if (target === 'users') {
                document.getElementById('usersSection').classList.remove('hidden'); 
                document.getElementById('eventsSection').classList.add('hidden');
                
            } else if (target === 'events') {
                document.getElementById('eventsSection').classList.remove('hidden');
                document.getElementById('usersSection').classList.add('hidden');  
                
            }
        });
    });
  }

  onMount(async() => {
  
    let Key = getKey();
    Keypriv = Key.Keypriv;
    Keypub = Key.Keypub;

    if (!Keypriv) {
      showLogin = true;
      document.getElementById('usersSection').classList.add('hidden');
    } else  {
      document.getElementById('usersSection').classList.remove('hidden');
      
      document.getElementById('adminContent').classList.remove('hidden');
    }

    await get_events(handle_events);

    await get_users(handle_users);

    await get_permissions(handle_permissions);

    
    setupSidebar();
     
  })

</script>



 
  
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%);
      min-height: 100vh;
      transition: all 0.3s ease;
    }
    
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(241, 245, 249, 0.5);
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .sidebar-active {
      background: rgba(22, 93, 255, 0.08);
      color: #165DFF;
      border-left: 4px solid #165DFF;
    }
    
    .status-badge {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 12px;
      overflow: hidden;
      background: white;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    }
    
    .gradient-header {
      background: linear-gradient(135deg, #165DFF 0%, #0e42b8 100%);
    }
    
    .pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(22, 93, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(22, 93, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(22, 93, 255, 0); }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    
    .tab-active {
      border-bottom: 2px solid #165DFF;
      color: #165DFF;
    }
    
    .event-image {
      height: 150px;
      object-fit: cover;
      width: 100%;
      border-radius: 8px;
    }
    
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
    }
    
    .role-badge {
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    /* 新增：提示弹框样式 */
    .toast {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease-in-out;
        display: flex;
        align-items: center;
        max-width: 300px;
        text-align: center;
        justify-content: center;
    }

    .toast.show {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }    
  
  .toast.success {
    background-color: #10B981;
    color: white;
  }
  
  .toast.error {
    background-color: #EF4444;
    color: white;
  }
  
  .toast.warning {
    background-color: #F59E0B;
    color: white;
  }
  
  .toast.info {
    background-color: #3B82F6;
    color: white;
  }
  
  .toast-icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
  
  .toast-message {
    font-size: 0.9rem;
  }
  </style>
 
<svelte:head>
    <title>eventstore - Admin</title>
</svelte:head>

  <!-- 顶部导航栏 -->
  <header id="navbar" class="gradient-header shadow-lg fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-bold text-white flex items-center">
            <i class="fa fa-shield mr-2"></i>
            <span>Admin Dashboard</span>
          </h1>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="relative">
            <button id="notificationBtn" class="p-2 rounded-full hover:bg-white/10 transition-colors text-white">
              <i class="fa fa-bell-o"></i>
              <span class="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border border-white"></span>
            </button>
          </div>
          
          <div id="userMenu" class="relative">
            <button class="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors" on:click={userMenu}>
              <div class="relative">
                <!-- 管理员头像使用虚拟图标 -->
                <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <i class="fa fa-user"></i>
                </div>
              </div>
              <span id="usernameDisplay" class="hidden md:inline-block font-medium text-white">{Keypub ? 'Admin User' : '未登录'}</span>
              <i class="fa fa-chevron-down text-xs text-white/70"></i>
            </button>
            
            <div id="userDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 hidden z-50 overflow-hidden">
              <a href="#" id="profileLink" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                <i class="fa fa-user mr-3 text-primary"></i>Profile
              </a>
              <a href="#" id="settingsLink" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center">
                <i class="fa fa-cog mr-3 text-primary"></i>Settings
              </a>
              <div class="border-t border-gray-100 my-1"></div>
              <a href="#" id="logoutLink" class="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center" on:click={Logout}>
                <i class="fa fa-sign-out mr-3 text-danger"></i>Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="flex pt-16 min-h-screen">
    <!-- 侧边栏 -->
    <aside id="sidebar" class="w-64 bg-white shadow-lg fixed h-full left-0 top-16 transition-all duration-300 transform z-40 border-r border-gray-100">
      <nav class="py-6 px-4">
        <div class="space-y-1">
          <a href="#dashboard" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fa fa-tachometer w-5 text-center mr-3 text-gray-500"></i>
            <span>Dashboard</span>
          </a>
          
          <a href="#users" class="sidebar-active flex items-center px-4 py-3 rounded-lg transition-colors">
            <i class="fa fa-users w-5 text-center mr-3 text-primary"></i>
            <span>Users</span>
            <span class="ml-auto bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">{users.length}</span>
          </a>
          
          <a href="#events" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fa fa-calendar w-5 text-center mr-3 text-gray-500"></i>
            <span>Events</span>
            <span class="ml-auto bg-warning/10 text-warning text-xs font-medium px-2 py-0.5 rounded-full">{events.length}</span>
          </a>
          
          <a href="#permissions" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fa fa-lock w-5 text-center mr-3 text-gray-500"></i>
            <span>Permissions</span>
          </a>
          
          <a href="#analytics" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <i class="fa fa-line-chart w-5 text-center mr-3 text-gray-500"></i>
            <span>Analytics</span>
          </a>
        </div>
        
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="px-4 mb-4">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</p>
          </div>
          
          <div class="space-y-1">
            <a href="#settings" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fa fa-cog w-5 text-center mr-3 text-gray-500"></i>
              <span>System Settings</span>
            </a>
            
            <a href="#security" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fa fa-shield w-5 text-center mr-3 text-gray-500"></i>
              <span>Security</span>
            </a>
            
            <a href="#help" class="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <i class="fa fa-question-circle w-5 text-center mr-3 text-gray-500"></i>
              <span>Help & Support</span>
            </a>
          </div>
        </div>
      </nav>
      
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <i class="fa fa-moon text-primary"></i>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">Dark Mode</p>
            </div>
          </div>
          <div class="relative inline-block w-10 mr-2 align-middle select-none">
            <input type="checkbox" name="darkModeToggle" id="darkModeToggle" class="sr-only">
            <label for="darkModeToggle" class="block h-6 w-10 rounded-full bg-gray-300 cursor-pointer"></label>
            <span class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out"></span>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 ml-64 p-6 transition-all duration-300">
      <!-- 登录表单 (初始显示) -->
      {#if showLogin }
        <div id="loginSection" class="max-w-md mx-auto mt-8">
          <div class="card bg-white shadow-xl overflow-hidden">
            <div class="gradient-header p-6 text-center">
              <div class="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4 animate-float">
                <i class="fa fa-{isNewAccount ? 'user-plus' : 'sign-in'} text-white text-2xl"></i>
              </div>
              <h2 class="text-2xl font-bold text-white">
                {isNewAccount ? '创建新账号' : '已有账号登录'}
              </h2>
              <p class="text-white/80 mt-1">
                {isNewAccount 
                  ? '生成新的密钥对并注册账号' 
                  : '使用已有私钥登录'}
              </p>
            </div>
            
            <div class="p-6">
              <!-- 新建账号模式显示邮箱输入 -->
              {#if isNewAccount}
                <div class="mb-4">
                  <label for="email" class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <i class="fa fa-envelope mr-2 text-primary"></i> 
                    <span>邮箱地址</span>
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    bind:value={emailInput}
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm" 
                    placeholder="your@email.com"
                  />
                  <p class="text-xs text-gray-500 mt-1 flex items-center">
                    <i class="fa fa-info-circle mr-1"></i> 
                    <span>用于接收重要通知和恢复账号</span>
                  </p>
                </div>
              {/if}
              
              <div class="mb-6">
                <label for="esecKey" class="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <i class="fa fa-key mr-2 text-primary"></i> 
                  <span>{isNewAccount ? '生成的私钥' : '已有私钥'}</span>
                </label>
                <div class="relative">
                  <textarea 
                    id="esecKey" 
                    bind:value={privateKeyInput}
                    rows="4" 
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm" 
                    placeholder={isNewAccount 
                      ? "生成新的私钥 (将自动填充)" 
                      : "粘贴您已有的 esec1... 私钥"}
                  ></textarea>
                  {#if isNewAccount}
                    <button 
                      on:click={generateKey} 
                      class="absolute right-3 bottom-3 text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center"
                    >
                      <i class="fa fa-refresh mr-1"></i> 生成新密钥对
                    </button>
                  {/if}
                </div>
                {#if isNewAccount}
                  <p class="text-xs text-gray-500 mt-2 flex items-center">
                    <i class="fa fa-info-circle mr-1"></i> 
                    <span>点击"生成新密钥对"自动创建安全的密钥对</span>
                  </p>
                {:else}
                  <p class="text-xs text-gray-500 mt-2 flex items-center">
                    <i class="fa fa-info-circle mr-1"></i> 
                    <span>从安全存储中粘贴您的私钥</span>
                  </p>
                {/if}
              </div>
              
              <div class="mb-4">
                <button 
                  on:click={LoginorCreate} 
                  class="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <i class="fa fa-{isNewAccount ? 'user-plus' : 'sign-in'} mr-2"></i> 
                  {isNewAccount ? '创建账号' : '登录'}
                </button>
              </div>
              
              <div class="text-center text-sm text-gray-500">
                <button 
                  type="button" 
                  on:click={toggleCreate} 
                  class="text-primary hover:underline font-medium bg-transparent border-none p-0"
                >
                  {isNewAccount 
                    ? '已有账号？点击登录' 
                    : '没有账号？创建一个'}
                </button>
              </div>
              
              <p class="text-warning text-xs mt-4 flex items-center justify-center">
                <i class="fa fa-exclamation-triangle mr-1"></i> 
                <span>私钥将存储在本地浏览器中，请确保您的设备安全</span>
              </p>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- 管理内容区 (默认隐藏) -->
      <div id="adminContent" class="hidden">
        <!-- 用户管理页面 -->
        <div id="usersSection">
          <!-- 页面标题和统计卡片 -->
          <div class="mb-6">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">User Management</h2>
                <p class="text-gray-600 mt-1">Manage all system users and their permissions</p>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Total Users</div>
                  <div class="text-xl font-bold text-primary">142</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Active</div>
                  <div class="text-xl font-bold text-success">128</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Pending</div>
                  <div class="text-xl font-bold text-warning">14</div>
                </div>
              </div>
            </div>
            
            <!-- 操作按钮和搜索 -->
            <div class="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div class="relative flex-1 max-w-md">
                <input type="text" placeholder="Search users..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
              
              <div class="flex space-x-3">
                <button class="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center border border-gray-300">
                  <i class="fa fa-filter mr-2"></i> Filter
                </button>
                <button id="addUserBtn" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center shadow-md hover:shadow-lg">
                  <i class="fa fa-plus mr-2"></i> Add User
                </button>
              </div>
            </div>
          </div>
          
          <!-- 用户表格 -->
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESec Public Key</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <!--th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th-->
                    <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <!-- 用户行数据 -->
                   {#each users as user,index}
                  <tr class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div class="user-avatar {getColorClass(index)} mr-3">{getUserName(user.email).initials}</div>
                        <div>
                          <div class="text-sm font-medium text-gray-900"></div>
                          <div class="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-600">{user.pubkey}</div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="role-badge bg-primary/10 text-primary">{getPerm(permissions,user.pubkey)}</span>
                    </td>
                    <!--td class="px-6 py-4">
                      <span class="status-badge bg-success/10 text-success">Active</span>
                    </td-->
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end space-x-2">
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                          <i class="fa fa-pencil"></i>
                        </button>
                        <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                          <i class="fa fa-trash-o"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                   {/each}
                  
                
                </tbody>
              </table>
            </div>
            
            <!-- 分页 -->
            <div class="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
              <div class="mb-4 sm:mb-0">
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">1</span> to <span class="font-medium">7</span> of <span class="font-medium">142</span> users
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                
                <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">
                  1
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  2
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  3
                </button>
                
                <button class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Events 管理页面 -->
        <div id="eventsSection" class="hidden">
          <div class="mb-6">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">User Events Management</h2>
                <p class="text-gray-600 mt-1">Manage events uploaded by users</p>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Total Events</div>
                  <div class="text-xl font-bold text-primary">87</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Pending</div>
                  <div class="text-xl font-bold text-warning">12</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Published</div>
                  <div class="text-xl font-bold text-success">65</div>
                </div>
              </div>
            </div>
            
            <!-- 事件筛选 -->
            <div class="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div class="flex space-x-2">
                <button class="tab-active px-4 py-2 text-sm font-medium">All Events</button>
                <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Pending</button>
                <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Published</button>
                <button class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Rejected</button>
              </div>
              
              <div class="flex space-x-3">
                <button class="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center border border-gray-300">
                  <i class="fa fa-calendar mr-2"></i> Date Range
                </button>
                <button class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center shadow-md hover:shadow-lg">
                  <i class="fa fa-plus mr-2"></i> New Event
                </button>
              </div>
            </div>
          </div>
          
          <!-- 事件卡片网格 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 事件卡片 1 -->
            <div class="card overflow-hidden">
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <span class="status-badge bg-warning/10 text-warning">Pending</span>
                  <span class="text-xs text-gray-500">Today, 10:30 AM</span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-800 mb-2">Tech Conference 2023</h3>
                <p class="text-gray-600 text-sm mb-4">Annual technology conference featuring industry leaders and innovators.</p>
                
                <div class="bg-gray-100 rounded-lg p-3 mb-4">
                  <div class="flex items-center mb-3">
                    <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <i class="fa fa-user"></i>
                    </div>
                    <div class="ml-2">
                      <p class="text-sm font-medium">John Doe</p>
                      <p class="text-xs text-gray-500">johndoe@example.com</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <i class="fa fa-calendar text-primary mr-2"></i>
                    <span>Oct 15-17, 2023</span>
                  </div>
                  <div class="flex items-center text-xs mt-1">
                    <i class="fa fa-map-marker text-primary mr-2"></i>
                    <span>Convention Center, San Francisco</span>
                  </div>
                </div>
                
                <div class="flex justify-between">
                  <button class="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    <i class="fa fa-edit mr-1"></i> Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors ml-2">
                    <i class="fa fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 事件卡片 2 -->
            <div class="card overflow-hidden">
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <span class="status-badge bg-success/10 text-success">Published</span>
                  <span class="text-xs text-gray-500">Yesterday, 3:45 PM</span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-800 mb-2">Art Exhibition Opening</h3>
                <p class="text-gray-600 text-sm mb-4">Contemporary art exhibition featuring local artists and installations.</p>
                
                <div class="bg-gray-100 rounded-lg p-3 mb-4">
                  <div class="flex items-center mb-3">
                    <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <i class="fa fa-user"></i>
                    </div>
                    <div class="ml-2">
                      <p class="text-sm font-medium">Sarah Johnson</p>
                      <p class="text-xs text-gray-500">sarahj@example.com</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <i class="fa fa-calendar text-primary mr-2"></i>
                    <span>Sep 22 - Oct 30, 2023</span>
                  </div>
                  <div class="flex items-center text-xs mt-1">
                    <i class="fa fa-map-marker text-primary mr-2"></i>
                    <span>City Art Gallery, New York</span>
                  </div>
                </div>
                
                <div class="flex justify-between">
                  <button class="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    <i class="fa fa-edit mr-1"></i> Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors ml-2">
                    <i class="fa fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 事件卡片 3 -->
            <div class="card overflow-hidden">
              <div class="p-5">
                <div class="flex items-center justify-between mb-3">
                  <span class="status-badge bg-danger/10 text-danger">Rejected</span>
                  <span class="text-xs text-gray-500">Sep 5, 2023</span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-800 mb-2">Music Festival</h3>
                <p class="text-gray-600 text-sm mb-4">Annual summer music festival with multiple stages and food vendors.</p>
                
                <div class="bg-gray-100 rounded-lg p-3 mb-4">
                  <div class="flex items-center mb-3">
                    <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <i class="fa fa-user"></i>
                    </div>
                    <div class="ml-2">
                      <p class="text-sm font-medium">Mike Thompson</p>
                      <p class="text-xs text-gray-500">mike@example.com</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <i class="fa fa-calendar text-primary mr-2"></i>
                    <span>Jul 15-17, 2023</span>
                  </div>
                  <div class="flex items-center text-xs mt-1">
                    <i class="fa fa-map-marker text-primary mr-2"></i>
                    <span>Central Park, New York</span>
                  </div>
                </div>
                
                <div class="flex justify-between">
                  <button class="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    <i class="fa fa-edit mr-1"></i> Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors ml-2">
                    <i class="fa fa-trash mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 事件表格 -->
          <div class="card overflow-hidden mt-6">
            <div class="p-5">
              <h3 class="font-medium text-gray-800 mb-4">Events List</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>                  
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">

                   {#each events as event }
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 w-10 h-10 rounded-md {event.icon.bgClass} flex items-center justify-center">
                            <i class="fa {event.icon.iconClass} {event.icon.textClass}"></i>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{JSON.stringify(event.data).substring(0, 20)}</div>
                            <div class="text-sm text-gray-500"> </div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                       {event.code}

                      </td>
                      <td class="px-6 py-4">
                       
                        <div class="text-sm text-gray-500">{event.user.substring(0,10)}...{event.user.substring(54)}</div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-900">{event.servertimestamp.split("T")[0]}</div>
                        <div class="text-sm text-gray-500">{event.servertimestamp.split("T")[1]}</div>
                      </td>
                   
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end space-x-2">
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <i class="fa fa-eye"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-100 transition-colors">
                            <i class="fa fa-check"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <i class="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/each}
           
                    
                    
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
              <div class="mb-4 sm:mb-0">
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">1</span> to <span class="font-medium">4</span> of <span class="font-medium">87</span> events
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                
                <button class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-sm font-medium">
                  1
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  2
                </button>
                <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 text-sm font-medium">
                  3
                </button>
                
                <button class="px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Permissions 列表页面 -->
        <div id="permissionsSection" class="hidden">
          <div class="mb-6">
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">Permissions Management</h2>
                <p class="text-gray-600 mt-1">Define and manage user access permissions</p>
              </div>
              
              <div class="flex items-center space-x-3">
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Total Roles</div>
                  <div class="text-xl font-bold text-primary">6</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Active Permissions</div>
                  <div class="text-xl font-bold text-success">42</div>
                </div>
                <div class="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
                  <div class="text-xs text-gray-500">Custom Rules</div>
                  <div class="text-xl font-bold text-secondary">18</div>
                </div>
              </div>
            </div>
            
            <!-- 权限操作 -->
            <div class="flex flex-wrap items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm">
              <div class="relative flex-1 max-w-md">
                <input type="text" placeholder="Search permissions..." class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors">
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
              
              <div class="flex space-x-3">
                <button class="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center border border-gray-300">
                  <i class="fa fa-filter mr-2"></i> Filter
                </button>
                <button class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center shadow-md hover:shadow-lg">
                  <i class="fa fa-plus mr-2"></i> Add Permission
                </button>
              </div>
            </div>
          </div>
          
          <!-- 权限卡片网格 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 管理员权限 -->
            <div class="card overflow-hidden">
              <div class="gradient-header p-4 flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <i class="fa fa-shield text-white"></i>
                </div>
                <div class="ml-3">
                  <h3 class="font-bold text-white">Administrator</h3>
                  <p class="text-white/80 text-xs">Full system access</p>
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-sm text-gray-600">Users: 3</span>
                  <span class="status-badge bg-green-100 text-green-800">Active</span>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">Full system access</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">User management</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">Permission control</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">System configuration</span>
                  </div>
                </div>
                
                <div class="mt-4 flex space-x-2">
                  <button class="flex-1 bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                    Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Users
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 编辑权限 -->
            <div class="card overflow-hidden">
              <div class="bg-secondary p-4 flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <i class="fa fa-edit text-white"></i>
                </div>
                <div class="ml-3">
                  <h3 class="font-bold text-white">Editor</h3>
                  <p class="text-white/80 text-xs">Content management</p>
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-sm text-gray-600">Users: 8</span>
                  <span class="status-badge bg-green-100 text-green-800">Active</span>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">Create and edit content</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">Media management</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-times-circle text-gray-300 mr-2"></i>
                    <span class="text-sm">User management</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-times-circle text-gray-300 mr-2"></i>
                    <span class="text-sm">System configuration</span>
                  </div>
                </div>
                
                <div class="mt-4 flex space-x-2">
                  <button class="flex-1 bg-secondary/10 text-secondary px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors">
                    Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Users
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 查看权限 -->
            <div class="card overflow-hidden">
              <div class="bg-gray-700 p-4 flex items-center">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <i class="fa fa-eye text-white"></i>
                </div>
                <div class="ml-3">
                  <h3 class="font-bold text-white">Viewer</h3>
                  <p class="text-white/80 text-xs">Read-only access</p>
                </div>
              </div>
              <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-sm text-gray-600">Users: 24</span>
                  <span class="status-badge bg-green-100 text-green-800">Active</span>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center">
                    <i class="fa fa-check-circle text-success mr-2"></i>
                    <span class="text-sm">View all content</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-times-circle text-gray-300 mr-2"></i>
                    <span class="text-sm">Edit content</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-times-circle text-gray-300 mr-2"></i>
                    <span class="text-sm">User management</span>
                  </div>
                  <div class="flex items-center">
                    <i class="fa fa-times-circle text-gray-300 mr-2"></i>
                    <span class="text-sm">System configuration</span>
                  </div>
                </div>
                
                <div class="mt-4 flex space-x-2">
                  <button class="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors">
                    Edit
                  </button>
                  <button class="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    View Users
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 权限表格 -->
          <div class="card overflow-hidden mt-6">
            <div class="p-5">
              <h3 class="font-medium text-gray-800 mb-4">Detailed Permission List</h3>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class="fa fa-user text-primary mr-2"></i>
                          <span class="text-sm font-medium text-gray-900">user.create</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-600">Create new users</div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-primary/10 text-primary">Admin</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-green-100 text-green-800">Active</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end space-x-2">
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <i class="fa fa-pencil"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <i class="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class="fa fa-lock text-warning mr-2"></i>
                          <span class="text-sm font-medium text-gray-900">permission.manage</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-600">Manage permissions</div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-primary/10 text-primary">Admin</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-green-100 text-green-800">Active</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end space-x-2">
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <i class="fa fa-pencil"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <i class="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class="fa fa-file-text text-secondary mr-2"></i>
                          <span class="text-sm font-medium text-gray-900">content.edit</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-600">Edit system content</div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-secondary/10 text-secondary">Editor</span>
                        <span class="status-badge bg-primary/10 text-primary ml-1">Admin</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-green-100 text-green-800">Active</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end space-x-2">
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <i class="fa fa-pencil"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <i class="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="flex items-center">
                          <i class="fa fa-cog text-purple-600 mr-2"></i>
                          <span class="text-sm font-medium text-gray-900">system.configure</span>
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <div class="text-sm text-gray-600">Configure system settings</div>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-primary/10 text-primary">Admin</span>
                      </td>
                      <td class="px-6 py-4">
                        <span class="status-badge bg-yellow-100 text-yellow-800">Pending Review</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="flex justify-end space-x-2">
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-colors">
                            <i class="fa fa-pencil"></i>
                          </button>
                          <button class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <i class="fa fa-trash-o"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 底部信息 -->
        <div class="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 eventstore Admin Dashboard. All rights reserved.</p>
          <p class="mt-1"> </p>
        </div>
      </div>
    </main>
  </div>
  
 
<!-- 新增：提示弹框组件 -->
{#if showToast}
 
  <div class="toast {toastType} show">
    <div class="toast-icon">
      {#if toastType === 'success'}
        <i class="fa fa-check-circle"></i>
      {:else if toastType === 'error'}
        <i class="fa fa-times-circle"></i>
      {:else if toastType === 'warning'}
        <i class="fa fa-exclamation-triangle"></i>
      {:else if toastType === 'info'}
        <i class="fa fa-info-circle"></i>
      {/if}
    </div>
    <div class="toast-message">{toastMessage}</div>
  </div>
  
{/if} 