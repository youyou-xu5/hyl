# Deploy / 部署

## Vercel or Netlify

1. Drag this exported folder into the dashboard, or upload it as a static site.
2. Use the folder root as the publish directory.
3. No build command is required.

## Any static server

Serve this folder with any static file server. For example:

```bash
npx serve .
python3 -m http.server 8080
```

## 中文说明

1. 这是静态站点包，不需要数据库和服务器接口。
2. 上传整个文件夹即可部署。
3. 如果本地直接双击 HTML 后图片或内容没有加载，请用本地静态服务打开。
