# 图片标注工具

一个简单的基于网页的工具，用于上传、标注和批量下载图片。

## 功能特点

- 一次最多上传50张图片
- 为每张图片添加文本注释
- 删除单张图片
- 将所有图片批量下载为ZIP压缩包
- 下载时可选择统一命名方式

## 使用方法

1. **打开工具**：只需在任何现代浏览器中打开`index.html`文件。

2. **上传图片**：
   - 点击"选择文件"按钮从您的设备中选择图片
   - 您一次最多可以选择50张图片
   - 点击"上传图片"按钮将它们添加到图片库

3. **标注图片**：
   - 对于图片库中的每张图片，您可以在图片下方的文本框中添加注释
   - 注释会在您输入时自动保存

4. **删除图片**：
   - 要删除图片，点击图片卡片上的"删除"按钮

5. **下载图片**：
   - 点击"下载全部(ZIP)"按钮下载所有图片及其注释
   - 在下载选项弹窗中：
     - 选择是否为所有图片使用统一命名
     - 如果使用统一命名，您可以指定基本文件名
     - 点击"下载"创建并下载ZIP文件

## 技术细节

- 该工具完全在浏览器中运行 - 无需服务器
- 图片在会话期间存储在浏览器的内存中
- 下载时，图片使用JSZip打包成ZIP文件
- 如果图片有注释，相应的文本文件会包含在ZIP中

## 系统要求

- 现代网页浏览器（Chrome、Firefox、Safari、Edge）
- 启用JavaScript

## 使用的库

- [JSZip](https://stuk.github.io/jszip/) - 用于创建ZIP文件
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - 用于保存文件 