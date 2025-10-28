<script>
  import { onMount } from 'svelte';

  // 可配置的轮播选项
  export let interval = 3000;            // 自动轮播间隔(毫秒)
  export let transitionDuration = 3000;  // 过渡动画时间(毫秒，默认3000ms)
  export let width = "450px";            // 轮播宽度
  export let height = "300px";           // 轮播高度

  let currentIndex = 0;
  let timerId;
  let isTransitioning = false;

  // 轮播内容数据（与你原始内容一致）
const slideData = [
    {
      title: "RISC-V 汇编基础示例",
      type: "code",
      content: `# RISC-V 基础指令示例
# 计算斐波那契数列

.text
.globl fib
fib:
    # 输入: a0 = n
    # 输出: a0 = fib(n)
    li t0, 1
    blt a0, t0, fib_base   # if n < 1, 跳转到基础情况
    
    addi sp, sp, -12       # 分配栈空间
    sw ra, 8(sp)           # 保存返回地址
    sw a0, 4(sp)           # 保存 n
    
    addi a0, a0, -1        # n-1
    call fib               # fib(n-1)
    sw a0, 0(sp)           # 保存 fib(n-1)
    
    lw a0, 4(sp)           # 恢复 n
    addi a0, a0, -2        # n-2
    call fib               # fib(n-2)
    
    lw t0, 0(sp)           # 恢复 fib(n-1)
    add a0, t0, a0         # fib(n-1) + fib(n-2)
    
    lw ra, 8(sp)           # 恢复返回地址
    addi sp, sp, 12        # 释放栈空间
    ret

fib_base:
    mv a0, zero            # fib(0) = 0
    ret`
    },
    {
      title: "RISC-V 处理器架构",
      type: "architecture",
      nodes: [
        { title: "指令取指", desc: "Instruction Fetch", icon: "📥", top: "60px", left: "60px" },
        { title: "指令译码", desc: "Instruction Decode", icon: "🔍", top: "60px", left: "200px" },
        { title: "执行单元", desc: "Execution Unit", icon: "⚡", top: "160px", left: "130px" },
        { title: "内存访问", desc: "Memory Access", icon: "💾", top: "160px", left: "270px" },
        { title: "写回", desc: "Write Back", icon: "📤", top: "260px", left: "200px" }
      ],
      connections: [
        { top: "100px", left: "120px", width: "80px", rotation: "0deg" },
        { top: "100px", left: "200px", width: "80px", rotation: "0deg" },
        { top: "160px", left: "170px", width: "60px", rotation: "45deg" },
        { top: "160px", left: "230px", width: "60px", rotation: "-45deg" },
        { top: "220px", left: "200px", width: "80px", rotation: "0deg" }
      ]
    },
    {
      title: "RISC-V 开发环境",
      type: "terminal",
      commands: [
        { prompt: "$", command: "riscv64-unknown-elf-gcc -o hello hello.c" },
        { output: "[INFO] 编译 RISC-V 程序...", type: "info" },
        { prompt: "$", command: "file hello" },
        { output: "hello: ELF 64-bit LSB executable, UCB RISC-V, version 1 (SYSV), statically linked, not stripped" },
        { prompt: "$", command: "qemu-riscv64 hello" },
        { output: "Hello, RISC-V World!" },
        { output: "[SUCCESS] 程序在 RISC-V 模拟器中运行成功", type: "success" },
        { prompt: "$[RISC-V-Books]", cursor: true }
      ]
    },
    {
      title: "RISC-V 特权架构配置",
      type: "code",
      content: `# RISC-V 机器模式配置示例
# 设置异常处理和中断

.section .text.init
.global _start
_start:
    # 设置栈指针
    la sp, _stack_end
    
    # 配置机器模式异常处理
    la t0, trap_handler
    csrw mtvec, t0
    
    # 启用机器模式中断
    li t0, 0x888           # 启用软件、定时器、外部中断
    csrw mie, t0
    li t0, 0x8             # 全局中断使能
    csrw mstatus, t0
    
    # 设置定时器中断
    li t0, 1000000         # 1秒间隔
    csrw mtimecmp, t0
    
    # 跳转到主程序
    call main
    
trap_handler:
    # 保存寄存器
    addi sp, sp, -32
    sw ra, 0(sp)
    sw t0, 4(sp)
    
    # 检查异常原因
    csrr t0, mcause
    bgez t0, handle_exception   # 如果是异常
    
handle_interrupt:
    # 处理中断
    andi t0, t0, 0x7FF
    li t1, 7                    # 机器模式定时器中断
    beq t0, t1, timer_interrupt
    
handle_exception:
    # 处理异常...
    
timer_interrupt:
    # 处理定时器中断
    li t0, 1000000
    add t0, t0, t0
    csrw mtimecmp, t0           # 设置下一个中断
    
    # 恢复寄存器并返回
    lw ra, 0(sp)
    lw t0, 4(sp)
    addi sp, sp, 32
    mret`
    },
    {
      title: "RISC-V 书籍学习路径",
      type: "architecture", 
      nodes: [
        { title: "基础指令集", desc: "RV32I/RV64I", icon: "📖", top: "40px", left: "60px" },
        { title: "扩展指令", desc: "M/A/F/D/C", icon: "🔧", top: "40px", left: "200px" },
        { title: "特权架构", desc: "M/S/U模式", icon: "🛡️", top: "120px", left: "130px" },
        { title: "内存管理", desc: "MMU/页表", icon: "💾", top: "200px", left: "60px" },
        { title: "系统开发", desc: "OS/驱动", icon: "⚙️", top: "200px", left: "200px" },
        { title: "实践项目", desc: "芯片设计", icon: "🚀", top: "280px", left: "130px" }
      ],
      connections: [
        { top: "80px", left: "120px", width: "80px", rotation: "0deg" },
        { top: "120px", left: "150px", width: "40px", rotation: "45deg" },
        { top: "120px", left: "180px", width: "40px", rotation: "-45deg" },
        { top: "160px", left: "100px", width: "60px", rotation: "45deg" },
        { top: "160px", left: "160px", width: "60px", rotation: "-45deg" },
        { top: "240px", left: "100px", width: "60px", rotation: "-45deg" },
        { top: "240px", left: "160px", width: "60px", rotation: "45deg" }
      ]
    }
  ];

  // 显示指定索引的幻灯片（用状态控制，不再直接操作DOM classList）
  function showSlide(index) {
    if (isTransitioning || index === currentIndex) return;
    isTransitioning = true;
    currentIndex = index;
    // 过渡结束后允许再次切换
    setTimeout(() => {
      isTransitioning = false;
    }, transitionDuration);
  }

  // 下一张
  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slideData.length;
    showSlide(nextIndex);
  }

  // 随机化的自动轮播（每次切换后重新安排下一次，真正“随机”）
  function scheduleNextTick() {
    clearTimeout(timerId);
    const jitter = Math.random() * 1000; // 0~1000ms 随机
    timerId = setTimeout(() => {
      nextSlide();
      scheduleNextTick(); // 递归调度下一次
    }, interval + jitter);
  }

  // 点击指示器切换
  function handleIndicatorClick(index) {
    if (index !== currentIndex) {
      clearTimeout(timerId);
      showSlide(index);
      scheduleNextTick();
    }
  }

  onMount(() => {
    // 为连接线添加动画延迟
    //（用事件循环尾部再取，确保节点已渲染）
    setTimeout(() => {
      document.querySelectorAll('.connection').forEach((conn, i) => {
        conn.style.animationDelay = `${i * 0.3}s`;
      });
    });

    // 启动自动轮播
    scheduleNextTick();

    // 清理
    return () => {
      clearTimeout(timerId);
    };
  });
</script>

<!-- 把过渡时长通过CSS变量传入，slide内部使用 var(--duration) -->
<div class="carousel" style="width:{width}; height:{height}; --duration:{transitionDuration}ms;">
  <div class="slides">
    {#each slideData as slide, index}
      <div class="slide" class:active={index === currentIndex}>
        <h3 class="slide-title">{slide.title}</h3>

        {#if slide.type === 'code'}
          <div class="code-editor">
            {#each slide.content.split('\n') as line, lineNum}
              <div class="code-line">
                <div class="line-number">{lineNum + 1}</div>
                <div class="code-content">
                  {#if line.includes('//')}
                    <span class="comment">{line}</span>

                  {:else if line.includes('use ') || line.includes('fn ') || line.includes('impl ') || line.includes('for ') || line.includes('return ')}
                    {#each line.split(' ') as word}
                      {#if word === 'use' || word === 'fn' || word === 'impl' || word === 'for' || word === 'return' || word === 'Ok'}
                        <span class="keyword">{word} </span>
                      {:else if word.startsWith('"')}
                        <span class="string">{word} </span>
                      {:else if word.includes('::') || word.endsWith('!')}
                        <span class="macro">{word} </span>
                      {:else if word === 'KernelModule' || word === 'MyKernelModule' || word === 'Result' || word === 'Self'}
                        <span class="type">{word} </span>
                      {:else if word === 'init'}
                        <span class="function">{word} </span>
                      {:else}
                        {word} 
                      {/if}
                    {/each}

                  {:else if line.includes('"')}
                    {#each line.split('"') as part, i}
                      {#if i % 2 === 1}
                        <!-- 修正：Svelte 中直接写 "{part}"，引号放在模板字面量 -->
                        <span class="string">"{part}"</span>
                      {:else}
                        {part}
                      {/if}
                    {/each}

                  {:else if line.includes('module!')}
                    <span class="macro">{line}</span>

                  {:else}
                    {line}
                  {/if}
                </div>
              </div>
            {/each}
          </div>

        {:else if slide.type === 'architecture'}
          <div class="architecture">
            <div class="connections">
              {#each slide.connections as conn}
                <div
                  class="connection"
                  style="top:{conn.top}; left:{conn.left}; width:{conn.width}; transform:rotate({conn.rotation});"
                ></div>
              {/each}
            </div>

            {#each slide.nodes as node}
              <div class="node" style="top:{node.top}; left:{node.left}; width:150px;">
                <div class="node-title">{node.title}</div>
                <div class="node-desc">{node.desc}</div>
                <div class="node-icon">{node.icon}</div>
              </div>
            {/each}
          </div>

        {:else if slide.type === 'terminal'}
          <div class="terminal">
            {#each slide.commands as cmd}
              {#if cmd.prompt}
                <div class="terminal-line">
                  <span class="prompt">{cmd.prompt}</span>
                  {#if cmd.command}<span>{cmd.command}</span>{/if}
                  {#if cmd.cursor}<span class="cursor"></span>{/if}
                </div>
              {:else if cmd.output}
                <div class="terminal-line">
                  {#if cmd.type === 'info'}
                    <span class="info">{cmd.output}</span>
                  {:else if cmd.type === 'success'}
                    <span class="success">{cmd.output}</span>
                  {:else}
                    <span>{cmd.output}</span>
                  {/if}
                </div>
              {:else}
                <div class="terminal-line"></div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="indicators">
    {#each slideData as _, index}
      <div
        class="indicator"
        class:active={index === currentIndex}
        data-index={index}
        on:click={() => handleIndicatorClick(index)}
      ></div>
    {/each}
  </div>
</div>

<style>
  .carousel {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 25px rgba(0,0,0,0.7), 0 0 30px rgba(56,189,248,0.15);
    background:
      radial-gradient(circle at 30% 30%, rgba(56,189,248,0.15), transparent 60%),
      radial-gradient(circle at 70% 70%, rgba(16,185,129,0.15), transparent 60%),
      #121212;
    border: 1px solid rgba(96, 165, 250, 0.2);
  }

  /* 电路纹理覆盖 */
  .carousel::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  .slides {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 2;
  }

  .slide {
    position: absolute;
    inset: 0;
    background: rgba(30,30,46,0.95);
    color: #e2e8f0;
    padding: 18px;
    box-sizing: border-box;
    border-radius: 8px;
    opacity: 0;
    /* 修正：用 CSS 变量控制过渡时长；提供 3000ms 兜底 */
    transition: opacity var(--duration, 3000ms) ease-in-out;
    pointer-events: none;
  }

  .slide.active {
    opacity: 1;
    pointer-events: auto;
  }

  /* 面板顶部装饰条 */
  .slide::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #38BDF8, #60A5FA, #3b82f6);
    border-radius: 3px 3px 0 0;
  }

  /* 面板标题 */
  .slide-title {
    font-size: 16px;
    margin: 0 0 15px 0;
    color: #38BDF8;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(96, 165, 250, 0.1);
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Segoe UI', 'SF Mono', 'Consolas', monospace;
  }
  .slide-title::before { content: '//'; color: #94A3B8; }

  /* 代码编辑器 */
  .code-editor {
    background: #1e1e2e;
    border-radius: 6px;
    height: calc(100% - 40px);
    color: #e2e8f0;
    font-size: 14px;
    line-height: 1.6em;
    box-shadow: inset 0 0 10px rgba(79,70,229,0.2);
    padding: 15px;
    font-family: 'Segoe UI', 'SF Mono', 'Consolas', monospace;
  }
  .code-line { display: flex; margin-bottom: 4px; }
  .line-number {
    width: 30px; color: #64748b; text-align: right; padding-right: 12px; user-select: none;
  }
  .keyword { color: #38BDF8; font-weight: 500; }
  .string  { color: #A7F3D0; }
  .comment { color: #94A3B8; }
  .function{ color: #FBBF24; }
  .type    { color: #60A5FA; }
  .macro   { color: #C084FC; }

  /* 终端 */
  .terminal {
    background: #111827;
    color: #e2e8f0;
    height: calc(100% - 40px);
    border-radius: 6px;
    box-shadow: inset 0 0 10px rgba(16,185,129,0.2);
    padding: 15px;
    font-size: 14px;
    line-height: 1.6em;
    font-family: 'Segoe UI', 'SF Mono', 'Consolas', monospace;
  }
  .terminal-line { margin-bottom: 6px; }
  .prompt  { color: #10B981; font-weight: 500; }
  .success { color: #10B981; }
  .info    { color: #60A5FA; }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  .cursor {
    display:inline-block; width:8px; height:14px; background:#10B981; animation:blink 1s infinite; margin-left:2px;
  }

  /* 架构图 */
  .architecture { height: calc(100% - 40px); position: relative; padding: 10px; }
  .node {
    position: absolute;
    background: rgba(30,41,59,0.9);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    border: 1px solid rgba(96, 165, 250, 0.3);
    transition: all 0.3s ease;
  }
  .node:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.4), 0 0 10px rgba(56,189,248,0.2);
  }
  .node-title { font-size:14px; color:#38BDF8; margin-bottom:5px; }
  .node-desc  { font-size:12px; color:#94A3B8; }
  .node-icon {
    position:absolute; top:-10px; right:-10px; width:28px; height:28px;
    background:#1e1e2e; border-radius:50%; display:flex; align-items:center; justify-content:center;
    border:1px solid rgba(96,165,250,0.5);
  }
  .connections {
    position:absolute; inset:0; z-index:0; pointer-events:none;
  }
  .connection {
    position:absolute; background:rgba(96,165,250,0.6); transform-origin:left center; height:2px;
    box-shadow:0 0 8px rgba(96,165,250,0.6); animation:pulse 1.5s infinite;
  }
  .connection::after {
    content:''; position:absolute; width:8px; height:8px; background:#60A5FA; border-radius:50%;
    top:-3px; right:0; box-shadow:0 0 8px rgba(96,165,250,0.8);
  }
  @keyframes pulse { 0%{opacity:.6;transform:scale(1);} 50%{opacity:1;transform:scale(1.2);} 100%{opacity:.6;transform:scale(1);} }

  /* 指示器 */
  .indicators {
    position:absolute; bottom:12px; left:50%; transform:translateX(-50%);
    display:flex; gap:8px; z-index:3;
  }
  .indicator {
    width:10px; height:10px; border-radius:50%;
    background:rgba(96,165,250,0.3); cursor:pointer; transition:all .3s;
  }
  .indicator.active {
    background:#38BDF8; box-shadow:0 0 8px rgba(56,189,248,0.8); transform:scale(1.2);
  }
</style>
