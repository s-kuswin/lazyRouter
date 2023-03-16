## 安装依赖

```bash
npm install -g lazy-router-transform
```

## 介绍

- 可以自定义输出文件夹名字;
- 可分文件

## 如何使用

 1. 获取路由文件绝对路径或者文件
 2. 输入命令行，根据提示操作
  

```bash
lazyrouter create

? 请选择路由数据获取方式
? 是否根据路径分割文件
? 输入生成文件名字（router）
? 请把路由文件拖拽到这里 /Users/***/router.js
   create router
```

注意：`router.js`中`routes`中暂时不支持有注释或者方法，请提前将`routes`对象中`方法属性`和`注释`手动清除，不然会引发错误中断