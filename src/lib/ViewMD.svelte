<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { processMarkdownImages, codeCopy } from '$lib/docsify_plugin';

  export let mdcontent: string;
  let compiledContent: string = '';
  let container: HTMLElement;

 
  // TOC 配置
  const tocMaxLevel = 3;
  let tocList: any[] = [];

  // ---------------- Mermaid + Docsify 初始化 ----------------
  async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadDocsifyAndMermaid() {
    // 动态加载 Mermaid
    await loadScript('https://cdn.jsdelivr.net/npm/mermaid@11.9.0/dist/mermaid.min.js');
    // 动态加载 Docsify
    await loadScript('/static/js/docsify.min.js');

    // 初始化 Mermaid
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    });

    // 配置 Docsify 自定义渲染器
    window.$docsify = {
      notFoundPage: false,
      markdown: {
        renderer: {
          code: (code: string, lang: string) => codeBlockRenderer(code, lang)
        }
      }
    };
  }

  // ---------------- Markdown 代码块渲染 ----------------
  function codeBlockRenderer(code: string, lang: string) {
    if (lang === 'mermaid') {
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      return `<div id="${id}" class="mermaid">${code}</div>`; // 先插入代码
    } else {
       
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    }
  }

  // ---------------- TOC 生成函数 ----------------
    function generateToC(level: number, text: string, id: string) {
        const indent = (level - 1) * 20; // 每级缩进20px
        return `
            <div class="toc-item lv${level}" style="padding-left: ${indent}px;">
            <a href="#${id}" class="toc-link">${text}</a>
            </div>
        `;
    }

  function extractHeadingContent(currentHeading: HTMLElement, currentLevel: number) {
    const contentElements: HTMLElement[] = [];
    let nextSibling = currentHeading.nextElementSibling;
    while (nextSibling) {
      if (/H[1-3]/.test(nextSibling.tagName)) {
        const nextLevel = parseInt(nextSibling.tagName.replace('H',''));
        if (nextLevel <= currentLevel) break;
      }
      contentElements.push(nextSibling.cloneNode(true) as HTMLElement);
      nextSibling = nextSibling.nextElementSibling;
    }
    const tempDiv = document.createElement('div');
    contentElements.forEach(el => tempDiv.appendChild(el));
    return tempDiv.innerHTML;
  }

  function extractHeadingsAndContent() {
    tocList = [];
    const allHeadings = container.querySelectorAll('h1, h2, h3');
    allHeadings.forEach(heading => {
      const level = parseInt(heading.tagName.replace('H',''));
      if (level < 1 || level > tocMaxLevel) return;
      const text = heading.textContent.trim();
      if (!heading.id) heading.id = `toc-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
      const id = heading.id;
      const content = extractHeadingContent(heading, level);
      tocList.push({ level, text, id, content });
    });
    const tocHtml = tocList.map(item => generateToC(item.level, item.text, item.id)).join('');
    return { tocHtml: `<div class="toc-container">${tocHtml}</div>`, tocData: tocList };
  }

  function initTocScrollHighlight(tocData: any[]) {
    function handleScroll() {
      const scrollY = window.scrollY + 100;
      let activeId = '';
      tocData.forEach(item => {
        const heading = document.getElementById(item.id);
        if (heading) {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 0) activeId = item.id;
        }
      });
      const links = document.querySelectorAll('.toc-link');
      links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${activeId}`));
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
  }

  function bindTocClickEvents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').replace('#','');
        const el = document.getElementById(targetId);
        if(el) el.scrollIntoView({ behavior:'smooth', block:'start' });
        history.pushState(null,null, `#${targetId}`);
      });
    });
  }

  // ---------------- afterUpdate 渲染 Mermaid + TOC ----------------
  afterUpdate(async () => {
    if (!container) return;

    // 1️⃣ 代码复制
    codeCopy();

    // 2️⃣ TOC
    const tocResult = extractHeadingsAndContent();
    const tocContainer = document.getElementById('right-toc');
    if (tocContainer) {
      tocContainer.innerHTML = tocResult.tocHtml;
      initTocScrollHighlight(tocResult.tocData);
      bindTocClickEvents();
    }

    // 3️⃣ Mermaid 渲染
    if (window.mermaid) {
      const mermaidBlocks = container.querySelectorAll('.mermaid');
      for (const block of mermaidBlocks) {
        const code = block.textContent;
        if (!code) continue;
        const id = block.id || `mermaid-${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
        block.id = id;
        try {
          const obj = await window.mermaid.render(`mermaid-svg-${id}`, code);
          block.innerHTML = obj.svg;
        } catch(err) {
          console.error(`Mermaid render error for ${id}:`, err);
        }
      }
    }
   hljs.highlightAll();
  });

  // ---------------- mdcontent 变化时重新编译 ----------------
    $: if (mdcontent) {
        let precontent = processMarkdownImages(mdcontent);

        if (window.__current_docsify_compiler__ && window.__current_docsify_compiler__.compile) {
           
            compiledContent = window.__current_docsify_compiler__.compile(precontent);
             
        } else {
            
            setTimeout(() => {
                if (window.__current_docsify_compiler__ && window.__current_docsify_compiler__.compile) {          
                    compiledContent = window.__current_docsify_compiler__.compile(precontent);
                } else {
                    console.warn('Docsify 编译器仍未加载完成');
                }
            }, 1000);
        }
    }
  onMount(async () => {
    await loadDocsifyAndMermaid();
  });
</script>

<div class="md-content scrollable-content">
  <article class="markdown-section" bind:this={container}>
    {@html compiledContent}
  </article>
</div>

<style>
  /* 基础容器样式 */
  .md-content {
    width: 100%;
    padding: 2rem;
    padding-bottom: 4rem; /* 底部大留白，确保内容可见 */
    box-sizing: border-box;
    max-height: calc(100vh - 8rem); /* 控制最大高度（视口高度 - 预留空间） */
    background-color: #ffffff;
  }

  /* 滚动控制 - 隐藏滚动条但保留功能 */
  .scrollable-content {
    overflow-y: auto; /* 启用垂直滚动 */
    scrollbar-width: none; /* Firefox 隐藏滚动条 */
    -ms-overflow-style: none; /* IE/Edge 隐藏滚动条 */
  }

  /* Chrome/Safari/Opera 隐藏滚动条 */
  .scrollable-content::-webkit-scrollbar {
    display: none;
  }

  /* Markdown内容样式 */
  .markdown-section {
    min-height: 100%; /* 确保内容区域高度充足 */
    max-width: 800px; /* 限制内容最大宽度，提升可读性 */
    margin: 0 auto; /* 居中显示 */
    margin-bottom: 1rem; /* 内容底部额外缓冲 */
    line-height: 1.8; /* 优化行高，提升阅读体验 */
  }

  .markdown-section p {
    margin-bottom: 1rem;
  }

  .markdown-section img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  .markdown-section blockquote {
    border-left: 4px solid #4f46e5;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    background-color: #f8fafc;
    border-radius: 0 6px 6px 0;
  }

  .markdown-section a {
    color: #4f46e5;
    text-decoration: none;
  }

  .markdown-section a:hover {
    text-decoration: underline;
  }

  /* 响应式适配 */
  @media (max-width: 768px) {
    .md-content {
      max-height: calc(100vh - 8rem); /* 移动端调整高度 */
      padding: 1rem;
      padding-bottom: 1rem; /* 移动端底部留白 */
    }

    .markdown-section {
      max-width: 100%; /* 移动端全屏显示 */
      line-height: 1.7;
    }
  }
</style>
    