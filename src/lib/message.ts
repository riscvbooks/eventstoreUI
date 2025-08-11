export function showNotification(message, timeout=2000,type = 'info') {
    // 创建背景遮罩
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 opacity-0';
    document.body.appendChild(backdrop);
    
    // 创建通知弹框
    const notification = document.createElement('div');
    // 根据类型设置背景色
    // 改进的背景色方案，使用更柔和的色调
    const bgColor = type === 'error' 
    ? 'bg-red-500/95 dark:bg-red-600/95' 
    : type === 'warning' 
    ? 'bg-amber-500/95 dark:bg-amber-600/95' 
    : 'bg-blue-500 dark:bg-primary-dark/95';

    // 为不同类型添加图标类
    const iconClass = type === 'error' 
    ? 'fa-times-circle text-red-100' 
    : type === 'warning' 
    ? 'fa-exclamation-triangle text-amber-100' 
    : 'fa-check-circle text-blue-100';

    notification.className = `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${bgColor} text-white px-8 py-6 rounded-2xl shadow-xl shadow-black/20 z-50 transform transition-all duration-400 scale-95 opacity-0 max-w-md w-full mx-4 overflow-hidden`;

    // 更丰富的内部结构，增加层次感
    notification.innerHTML = `
    <div class="flex items-start gap-4">
        <div class="mt-1 text-3xl">
        <i class="fas ${iconClass}"></i>
        </div>
        <div class="flex-1">
        <h3 class="text-xl font-semibold mb-2 capitalize">${type}</h3>
        <p class="text-white/90 leading-relaxed">${message}</p>
        </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 h-1 ${type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-amber-600' : 'bg-primary-dark'}"></div>
    `;
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        backdrop.classList.remove('opacity-0');
        notification.classList.remove('scale-90', 'opacity-0');
        notification.classList.add('scale-100', 'opacity-100');
    }, 100);
    
    // 隐藏动画
    setTimeout(() => {
        backdrop.classList.add('opacity-0');
        notification.classList.remove('scale-100', 'opacity-100');
        notification.classList.add('scale-90', 'opacity-0');
        
        // 移除元素
        setTimeout(() => {
        document.body.removeChild(notification);
        document.body.removeChild(backdrop);
        }, 300);
    }, timeout);
  }