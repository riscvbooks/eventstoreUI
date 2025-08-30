import { createMarkdownRenderer} from 'vitepress';
import type { MarkdownOptions } from 'vitepress';

 
/**
 * 创建Markdown渲染器并返回其实例
 * @param root 文档根目录，默认当前工作目录
 * @param options Markdown配置选项
 * @returns 自动推断为createMarkdownRenderer返回的类型
 */
export async function createRenderer(
  root: string = '.',
  options: Partial<MarkdownOptions> = {}
) {
 
  // 省略返回值类型标注，让TS自动推断
  const md =  await createMarkdownRenderer(
    root,
    { markdown: options }
  );
  return md;
}