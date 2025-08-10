<script>
  import { onMount } from 'svelte';
  import {getKey} from "$lib/getkey";
  import {uploadpath} from "$lib/config";
  import {    
    generateSecretKey,
    getPublicKey,
    esecEncode,
    esecDecode,
  } from "eventstore-tools/src/key";
     
  import {create_user, 
    get_users,
  } from '$lib/esclient';

  import {WebStorage} from '$lib/WebStorage'

  let Keypriv;
  let Keypub;

  let emailInput;
  let privateKeyInput;
  let isNewAccount = false;

  let newpriv;

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

  const generateKey = () => {
    // 实际项目中应该使用加密库生成私钥
    const keyField = document.getElementById('esecKey');
    newpriv = generateSecretKey()
    keyField.value = esecEncode(newpriv);
    keyField.classList.add('border-green-300', 'bg-green-50');
    setTimeout(() => {return { code: 200, message: '用户创建成功' };
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
      showToastMessage("登录成功！")
      setTimeout(() => {
             window.location.reload();
          }, 1000);
    }



  }

  const Logout = ()=> {
    let storage = new WebStorage(localStorage);
    storage.remove("keyPriv");
    window.location.reload();

  }

  onMount(async () => {
    // 加载CodeMirror库
        let Key = getKey();
        
        Keypriv = Key.Keypriv;
        Keypub = Key.Keypub;
        if (!Keypriv){
            showNotification("请先登录。","warning");
            return ;
        }
    })
  </script>
<style>

    
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
    <title>eventstore - login</title>
</svelte:head>
 
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
