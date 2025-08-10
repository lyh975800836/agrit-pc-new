# 部署指南 - 解决图片跨域问题

## 问题描述
项目使用的lanhu图床在生产环境下会出现403跨域错误，导致背景图片无法加载。

## 解决方案

### 方案一：Nginx代理（推荐）

1. 使用提供的 `nginx.conf` 配置文件
2. 在Nginx中添加图片代理配置：

```nginx
# 图片代理配置 - 解决lanhu跨域问题
location /api/lanhu/ {
    proxy_pass https://lanhu-oss-proxy.lanhuapp.com/;
    add_header Access-Control-Allow-Origin *;
    proxy_set_header Host lanhu-oss-proxy.lanhuapp.com;
    proxy_set_header Referer https://lanhuapp.com;
    proxy_ssl_server_name on;
    proxy_ssl_verify off;
}
```

### 方案二：CDN/对象存储

将图片迁移至自己的CDN或对象存储服务：

1. 下载所有lanhu图片到本地
2. 上传到阿里云OSS/腾讯云COS等
3. 替换项目中的图片URL

### 方案三：本地化图片

```bash
# 创建图片目录
mkdir -p src/assets/images

# 下载图片并替换URL引用
# 手动下载或使用脚本批量下载
```

## 当前项目状态

✅ 已完成：
- RightRankingPanel组件图片URL已更新为代理路径
- Nginx配置文件已准备
- Vue代理配置已添加

⏳ 待处理：
- 其他组件的图片URL需要类似处理
- 生产环境部署时需要配置Nginx代理

## 部署步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置Nginx**
   - 使用提供的 `nginx.conf` 文件
   - 或在现有配置中添加代理规则

3. **部署验证**
   - 检查图片是否正常加载
   - 验证代理路径是否工作

## 注意事项

- 开发环境和生产环境都使用相同的代理路径 `/api/lanhu/`
- Nginx配置中设置了适当的缓存和CORS头
- 代理配置包含了必要的SSL和超时设置