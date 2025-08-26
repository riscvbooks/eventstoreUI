import os
import requests
from urllib.parse import urlparse

# 要下载的 CSS 文件列表
css_urls = [
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/base.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/vars.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/fonts.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/icons.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/utils.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/components/custom-block.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/components/vp-code.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/components/vp-doc.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/components/vp-code-group.css",
    "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/styles/components/vp-sponsor.css"
]

# 要下载的字体文件列表
font_files = [
    "inter-italic-cyrillic-ext.woff2",
    "inter-italic-cyrillic.woff2",
    "inter-italic-greek-ext.woff2",
    "inter-italic-greek.woff2",
    "inter-italic-latin-ext.woff2",
    "inter-italic-latin.woff2",
    "inter-italic-vietnamese.woff2",
    "inter-roman-cyrillic-ext.woff2",
    "inter-roman-cyrillic.woff2",
    "inter-roman-greek-ext.woff2",
    "inter-roman-greek.woff2",
    "inter-roman-latin-ext.woff2",
    "inter-roman-latin.woff2",
    "inter-roman-vietnamese.woff2"
]

# 字体文件基础 URL
font_base_url = "https://cdn.jsdelivr.net/npm/vitepress@1.6.4/dist/client/theme-default/fonts/"

# 本地保存的基础目录
base_output_dir = os.path.join(os.getcwd(), "vitepress-assets")

def download_file(url, save_path):
    """下载单个文件并保存到指定路径"""
    try:
        # 发送请求
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # 检查请求是否成功
        
        # 确保目录存在
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        # 写入文件 (二进制模式适用于所有文件类型)
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        return True
    except Exception as e:
        print(f"下载失败 {url}: {str(e)}")
        return False

def download_css_files():
    """下载所有 CSS 文件"""
    print("开始下载 CSS 文件...")
    for url in css_urls:
        try:
            # 解析 URL 路径
            parsed_url = urlparse(url)
            path_parts = parsed_url.path.split('/')
            
            # 找到 'theme-default' 之后的路径部分
            theme_index = path_parts.index('theme-default')
            relative_path = os.path.join(*path_parts[theme_index + 1:])
            
            # 构建本地保存路径
            save_path = os.path.join(base_output_dir, relative_path)
            
            print(f"正在下载: {url.split('/')[-1]}")
            if download_file(url, save_path):
                print(f"已保存: {save_path}")
        except ValueError:
            print(f"无法解析路径 {url}: 未找到 'theme-default'")
        except Exception as e:
            print(f"处理 {url} 时出错: {str(e)}")

def download_font_files():
    """下载所有字体文件"""
    print("\n开始下载字体文件...")
    for font_file in font_files:
        try:
            # 构建完整 URL
            url = f"{font_base_url}{font_file}"
            
            # 构建本地保存路径 (theme-default/fonts/目录下)
            save_path = os.path.join(
                base_output_dir, 
                "fonts", 
                font_file
            )
            
            print(f"正在下载: {font_file}")
            if download_file(url, save_path):
                print(f"已保存: {save_path}")
        except Exception as e:
            print(f"处理 {font_file} 时出错: {str(e)}")

def main():
    # 创建基础目录
    os.makedirs(base_output_dir, exist_ok=True)
    print(f"已创建基础目录: {base_output_dir}")
    
    # 下载 CSS 文件
    download_css_files()
    
    # 下载字体文件
    download_font_files()
    
    print("\n所有文件处理完成!")
    print(f"文件保存位置: {base_output_dir}")

if __name__ == "__main__":
    main()

