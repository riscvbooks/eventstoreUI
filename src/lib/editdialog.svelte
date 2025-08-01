<script>
    import { onMount } from 'svelte';
    export let isOpenEditDialog = false;
    export let onClose;
    export let onOK;
    export let eventData ; // 默认数据结构

    // 双向绑定变量
    let editedEvent = { ...eventData };

    const handleClose = () => {
                  
        if (onClose) {
            onClose();
        }
    };

    const handleOK = () => {
  
        if (onOK) {
             
            onOK(JSON.stringify(editedEvent)); // 将编辑后的数据传递给父组件
        }
    };

    onMount(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && isOpenEditDialog) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleEscKey);

        return () => {
            window.removeEventListener('keydown', handleEscKey);
        };
    });

    // 当弹窗打开时重置编辑数据
    $: if (isOpenEditDialog) {
        editedEvent = { ...eventData };
    }
</script>

{#if isOpenEditDialog}
<div class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50" style="background-color: rgba(47, 44, 46, 0.75); ">
    <div class="bg-white p-8 rounded shadow-lg w-2/5 min-h-96 border border-primary relative">
        <div class="pt-4 pb-2 px-4 border-b border-gray-200">
             
        </div>
        <div class="p-4 space-y-4">
 
            
            <!-- 事件描述 -->
            <div>
                <label for="event-description" class="block text-sm font-medium text-gray-700 mb-1">事件</label>
                <slot name="textarea"/>
            </div>
 
        </div>
        <div class="absolute top-3 right-4">
            <button
                class="text-gray-500 hover:text-gray-700 focus:outline-none"
                on:click={handleClose} aria-label="关闭"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
        <div class="absolute space-x-4 px-4 pb-4 bottom-6 right-6">
            <button
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                on:click={handleClose}  
            >
                关闭
            </button>
            <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                on:click={handleOK}  
            >
                确定
            </button>
        </div>
    </div>
</div>
{/if}
