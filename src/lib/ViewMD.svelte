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

<style>


</style>

<div class="md-content">
  <article class="markdown-section" bind:this={container}>
    {@html compiledContent}
  </article>
</div>
