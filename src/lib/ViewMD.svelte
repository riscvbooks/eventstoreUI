<script lang="ts">
    import { processMarkdownImages,codeCopy} from '$lib/docsify_plugin';
    import { onMount } from 'svelte';
    import { getContext ,afterUpdate} from'svelte';

    export let mdcontent;
    let compiledContent;

    // 配置：最大标题级别（h1~h3）
    const tocMaxLevel = 3;

    // 存储目录项和对应内容的数组
    let tocList = []; // 目录列表：[{ level, text, id, content }, ...]
    let currentHeadings = []; // 临时存储页面所有标题元素

    /**
    * 生成单个目录项的 HTML
    * @param {number} level - 标题级别（1~3）
    * @param {string} text - 标题文本
    * @param {string} id - 标题唯一ID（用于锚点）
    * @returns {string} 目录项HTML
    */
    function generateToC(level, text, id) {
        if (level >= 1 && level <= tocMaxLevel) {
            // 生成带锚点的目录项，级别不同缩进不同
            const indent = (level - 1) * 15; // 每级缩进15px
            return `
            <div class="toc-item lv${level}" style="padding-left: ${indent}px">
                <a href="#${id}" class="toc-link">${text}</a>
            </div>
            `;
        }
        return '';
    }

    /**
    * 提取单个标题的信息并添加到目录
    * @param {HTMLElement} heading - 标题元素（h1~h3）
    */
    function addToToc(heading) {
        // 1. 提取标题级别（h1→1，h2→2，h3→3）
        const level = parseInt(heading.tagName.replace(/h/gi, ''), 10);
        if (isNaN(level) || level < 1 || level > tocMaxLevel) return;

        // 2. 提取标题文本和ID（无ID则自动生成）
        const text = heading.textContent.trim();
        let id = heading.id;
        if (!id) {
            id = `toc-${Date.now()}-${level}`; // 生成唯一ID
            heading.id = id; // 给标题添加ID，用于锚点跳转
        }

        // 3. 提取标题对应的内容（当前标题到下一个同级/高级标题之间的内容）
        const content = extractHeadingContent(heading, level);

        // 4. 添加到目录列表
        tocList.push({ level, text, id, content });
    }

    /**
    * 提取标题对应的内容（当前标题到下一个标题之间的内容）
    * @param {HTMLElement} currentHeading - 当前标题元素
    * @param {number} currentLevel - 当前标题级别
    * @returns {string} 标题对应的HTML内容
    */
    function extractHeadingContent(currentHeading, currentLevel) {

        const contentElements = [];
        let nextSibling = currentHeading.nextElementSibling;

        // 遍历后续元素，直到遇到同级或更高级别的标题为止
        while (nextSibling) {
            // 检查下一个元素是否是标题
            if (nextSibling.tagName.match(/^H[1-3]$/)) {
            const nextLevel = parseInt(nextSibling.tagName.replace(/h/gi, ''), 10);
            // 如果下一个标题级别 ≤ 当前级别，停止收集（说明进入新章节）
            if (nextLevel <= currentLevel) break;
            }
            // 收集内容元素
            contentElements.push(nextSibling.cloneNode(true));
            nextSibling = nextSibling.nextElementSibling;
        }

        // 将收集的元素转换为HTML字符串
        const tempDiv = document.createElement('div');
        contentElements.forEach(el => tempDiv.appendChild(el));
        return tempDiv.innerHTML;
    }

    /**
    * 提取页面中所有h1~h3标题，生成目录和内容
    * @returns {Object} { tocHtml: 目录HTML, tocData: 目录数据数组 }
    */
    function extractHeadingsAndContent() {
        // 重置存储数组
        tocList = [];
        currentHeadings = [];

        // 1. 获取页面中所有h1~h3标题（按出现顺序）
        const allHeadings = document.querySelectorAll('h1, h2, h3');
        currentHeadings = Array.from(allHeadings).filter(heading => {
            // 筛选条件：有id且非空
            return !!heading.id?.trim();
        });

        // 2. 遍历标题，生成目录和提取内容
        currentHeadings.forEach(heading => addToToc(heading));

        // 3. 生成完整目录HTML
        const tocHtml = tocList.map(item => generateToC(item.level, item.text, item.id)).join('');

        // 返回目录HTML和结构化数据
        return {
            tocHtml: `<div class="toc-container" style="margin-left:1rem;">${tocHtml}</div>`,
            tocData: tocList // 包含每个标题的级别、文本、ID、内容
        };
    }



    onMount(async () => {

    

    });

    function formatTimestamp(timestamp) {
        if (String(timestamp).length < 13) {
            timestamp = timestamp * 1000;
        }
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

        // 新增：初始化 TOC 滚动高亮
    function initTocScrollHighlight(tocData) {
        // 移除旧的滚动监听
        window.removeEventListener('scroll', handleTocScroll);
        
        // 添加新的滚动监听
        function handleTocScroll() {
            const scrollY = window.scrollY + 100; // 偏移量，优化高亮时机
            let activeId = '';
            
            // 找到当前可见的标题
            tocData.forEach(item => {
            const heading = document.getElementById(item.id);
            if (heading) {
                const rect = heading.getBoundingClientRect();
                // 标题顶部进入视口
                if (rect.top <= 100 && rect.bottom >= 0) {
                activeId = item.id;
                }
            }
            });
            
            // 更新 TOC 高亮状态
            const links = document.querySelectorAll('.toc-link');
            links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`);
            });
        }
        
        window.addEventListener('scroll', handleTocScroll);
        // 初始触发一次，设置默认高亮
        handleTocScroll();
    }

   $: if (mdcontent) { 
 
        let precontent = processMarkdownImages(mdcontent);
        compiledContent = window.__current_docsify_compiler__.compile(precontent);
         
    }

    let container;
    
    afterUpdate(() => {
        if (container?.innerHTML) {
            codeCopy();
            
            const result = extractHeadingsAndContent();
            
            // 输出目录HTML（可插入到右侧TOC容器）
            console.log('目录HTML:', result.tocHtml);
            
            // 输出结构化数据（包含每个标题的内容）
            console.log('标题数据:', result.tocData);

            // 示例：将目录插入到右侧容器
            const tocContainer = document.getElementById('right-toc');
            if (tocContainer) {
                tocContainer.innerHTML = result.tocHtml;
                initTocScrollHighlight(result.tocData);
            }
        } 

    });

 
 

 

</script>

            <div class="md-content">
                <article class="markdown-section" id="main" bind:this={container}>
                     {@html compiledContent}
                </article>
            </div>