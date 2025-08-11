<script>
  import { onMount } from 'svelte';
    
  import { upload_file,save_user_profile ,get_user_profile} from "$lib/esclient";
  import { getKey } from "$lib/getkey";
  import { uploadpath } from "$lib/config";
  import { showNotification } from "$lib/message";

  let Keypriv;
  let Keypub;
  let avatarUrl;
  let avatarImgData = '';
  let isAvatarContainerActive = false; // 用于跟踪鼠标是否在头像容器内
  let username = "";  // 缩短默认用户名
  let title = "前端开发";  // 缩短默认职业
  let bio = "我是   , 一位热爱技术和写作的开发者。\n专注于前端开发和用户体验设计，\n喜欢分享知识和经验。";

  let user_profile;

  onMount(async () => {
    // 加载用户密钥
    const Key = getKey();
    Keypriv = Key.Keypriv;
    Keypub = Key.Keypub;
    
    if (!Keypriv) {
      showNotification("请先登录。", 'warning');
      return;
    }

    // 获取头像容器元素
    const avatarContainer = document.querySelector('.avatar-container');

   await get_user_profile(Keypub,message =>{
        if (message.code == 200){
            user_profile = JSON.parse(message.data);
            title = user_profile.title;
            bio = user_profile.bio;
            username = user_profile.displayName;
            avatarUrl = user_profile.avatarUrl;
            const avatarImg = avatarContainer.querySelector('img');
            avatarImg.src = uploadpath + avatarUrl;
        }
            
          
    }) 


    
    // 监听鼠标进入和离开头像容器的事件
    avatarContainer.addEventListener('mouseenter', () => {
      isAvatarContainerActive = true;
    });
    
    avatarContainer.addEventListener('mouseleave', () => {
      isAvatarContainerActive = false;
    });

    // 监听整个文档的粘贴事件
    document.addEventListener('paste', async function(e) {
      // 检查粘贴事件是否发生在头像容器内
      if (isAvatarContainerActive) {
        e.preventDefault(); // 阻止默认粘贴行为

        // 检查是否有粘贴的图片
        const items = e.clipboardData.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              const blob = items[i].getAsFile();
              // 处理图片 - 显示在头像区域
              const imgUrl = URL.createObjectURL(blob);
              const avatarImg = avatarContainer.querySelector('img');
              avatarImg.src = imgUrl;
              
              // 转换为Uint8Array用于上传
              const reader = new FileReader();
              reader.onload = function(event) {
                const arrayBuffer = event.target.result;
                avatarImgData = new Uint8Array(arrayBuffer);
                 
              };
              
              reader.readAsArrayBuffer(blob);
              break; // 只处理第一个图片
            }
          }
        }
      }
    });

    // 获取文件输入元素
    const fileInput = document.getElementById('avatarInput');
    
    // 监听文件选择事件
    fileInput.addEventListener('change', function(e) {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // 检查是否为图片文件
        if (file.type.indexOf('image') !== -1) {
          // 读取文件并显示
          const reader = new FileReader();
          
          reader.onload = function(e) {
            const imgUrl = e.target.result;
            const avatarImg = avatarContainer.querySelector('img');
            avatarImg.src = imgUrl;
            
            // 转换为Uint8Array
            const base64Data = imgUrl.split(',')[1];
            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const uint8Array = new Uint8Array(len);
            
            for (let i = 0; i < len; i++) {
              uint8Array[i] = binaryString.charCodeAt(i);
            }
            
            avatarImgData = uint8Array;
             
          };
          
          reader.readAsDataURL(file);
        } else {
          showNotification('请选择图片文件', 'error');
        }
      }
    });

    // 重置文件输入，允许重复选择同一文件
    fileInput.addEventListener('click', function() {
      this.value = '';
    });
  });

  // 触发文件选择对话框
  function triggerFileUpload() {
    document.getElementById('avatarInput').click();
  }

  function uploadFilePromise(path, data, key) {
        return new Promise((resolve, reject) => {
            upload_file("user-avatar.png",avatarImgData,Keypub,Keypriv, (message) => {
                
                if (message[2].code == 200){
                    avatarUrl = message[2].fileUrl;
                    
                } else {
                    showNotification(message[2].message,2000,"warning");
                }
                 
                if (message[2].code) resolve(message[2].code);
            });
        });
    }

// 在saveAvatar中使用

  // 保存头像更改
  async function saveAvatar() {
    if (!avatarImgData) {
      showNotification('请先选择或粘贴头像图片', 'warning');
      return;
    }
    
    if (!Keypriv) {
      showNotification('请先登录', 'error');
      return;
    }
    
    const result = await uploadFilePromise( avatarImgData );

    return result;
 
  }

  // 保存所有设置
  async function saveAllSettings() {
    // 先保存头像（如果有更新）
    if (avatarImgData) {
      let result =  await saveAvatar();
      console.log(result)
      if (result != 200){        
        return ;
      }

    }
    let user_profile = {
     displayName : username,
     title : title,   
     bio : bio,
     avatarUrl:avatarUrl,  
    }
    save_user_profile(user_profile,Keypub,Keypriv, (message) => {
        if (message.code){
            if (message.code == 200)
                showNotification('所有设置已保存');
            else {
                showNotification(message.message);
            }
        }

    })
     
    
  }
</script>

<!-- 页面设置 -->
<div class="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
  <div class="border-b border-gray-200 px-6 py-4">
    <h2 class="text-xl font-bold text-gray-800">个人页面设置</h2>
    <p class="text-gray-600 text-sm">自定义您的个人主页展示</p>
  </div>

  <div class="p-6">
    <div class="max-w-3xl mx-auto">
      <!-- 头像区域 -->
      <div class="flex flex-col items-center mb-8">
        <!-- 头像容器 -->
        <div class="avatar-container w-40 h-40 rounded-full bg-gray-200 border-2 border-dashed overflow-hidden mb-4 cursor-pointer hover:border-primary transition-colors duration-200"
             on:click={triggerFileUpload}>
          <!-- 调整为浅蓝色的虚拟头像 -->
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='30' r='20' fill='%23cce5ff'/%3E%3Cpath d='M10 90C10 65 30 55 50 55C70 55 90 65 90 90' fill='%23b8daff'/%3E%3C/svg%3E" 
               alt="个人头像" 
               class="w-full h-full object-cover">
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input type="file" id="avatarInput" accept="image/*" class="hidden">
        
        <div class="flex gap-3 mb-2">
          <button on:click={triggerFileUpload} class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            <i class="fas fa-upload mr-2"></i> 选择图片
          </button>

        </div>
        
        <p class="text-xs text-gray-500 text-center">
          支持 JPG、PNG 格式 | 建议尺寸 400×400 像素 | 可直接粘贴图片
        </p>
      </div>

      <!-- 个人信息区域 -->
      <div class="space-y-6">
        <!-- 用户名 - 使用短输入框 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input 
            type="text" 
            bind:value={username}
            class="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
            maxlength="10"  
          >
        </div>

        <!-- 职业 - 使用短输入框 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">职业</label>
          <input 
            type="text" 
            bind:value={title}
            class="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
            maxlength="20"  
          >
        </div>

        <!-- 个人简介 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
          <textarea 
            bind:value={bio}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
            rows="4" 
            placeholder="介绍一下自己，让读者更了解您..."
          ></textarea>
        </div>
      </div>

      <div class="mt-8 flex justify-end">
        <button on:click={saveAllSettings} class="px-6 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg">
          保存所有设置
        </button>
      </div>
    </div>
  </div>
</div>