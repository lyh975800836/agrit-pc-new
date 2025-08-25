# 八角数据驾驶舱部署指南

## 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0 或 yarn >= 1.22.0

## 快速部署

### 1. 安装依赖
```bash
npm install
```

### 2. 生产环境构建
```bash
npm run build:prod
```

### 3. 预览构建结果
```bash
npm run preview
```

## 构建脚本说明

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build:prod` | 生产环境构建 |
| `npm run build:dev` | 开发环境构建 |
| `npm run build:analyze` | 构建分析报告 |
| `npm run lint:fix` | 自动修复代码规范问题 |
| `npm run clean` | 清理构建缓存 |

## 部署配置

### 环境变量配置

#### 生产环境 (.env.production)
- `VUE_APP_API_BASE_URL`: API服务地址
- `VUE_APP_IMAGES_PATH`: 图片资源路径
- `VUE_APP_TITLE`: 应用标题

#### 开发环境 (.env.development)
- 开发服务器端口: 8080
- 热重载: 已启用
- Source Map: 已启用

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;
    
    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;
    
    # 缓存策略
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 前端路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://your-api-server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 性能优化

### 已实施的优化措施

1. **代码分割**
   - Vendor库单独打包
   - ECharts单独分包
   - 路由懒加载

2. **资源压缩**
   - JavaScript/CSS压缩
   - 图片压缩优化
   - Gzip压缩支持

3. **缓存策略**
   - 智能数据缓存
   - 图片资源缓存
   - HTTP缓存头设置

4. **生产环境清理**
   - 移除console.log
   - 移除source map
   - 压缩HTML

### 建议的额外优化

1. **CDN部署**
   - 将静态资源部署到CDN
   - 配置合适的缓存策略

2. **图片优化**
   - 使用WebP格式
   - 实现响应式图片
   - 图片懒加载

3. **监控告警**
   - 集成错误监控服务
   - 性能监控和告警
   - 用户行为分析

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存重新构建
   npm run clean
   npm install
   npm run build:prod
   ```

2. **路由404错误**
   - 确认nginx配置了前端路由支持
   - 检查publicPath配置

3. **API请求失败**
   - 检查API服务地址配置
   - 确认跨域设置

4. **图片资源加载失败**
   - 检查图片路径配置
   - 确认静态资源部署正确

### 性能检查

```bash
# 构建分析
npm run build:analyze

# 检查打包体积
npm list --depth=0

# 检查依赖安全性
npm audit
```

## 版本发布

### 发布流程

1. 代码检查和测试
2. 版本号更新
3. 生产环境构建
4. 部署前验证
5. 正式部署上线
6. 监控和回滚准备

### 版本管理

- 遵循语义化版本规范
- 维护CHANGELOG.md
- 创建Git标签

## 联系支持

如需技术支持，请联系开发团队或查看项目文档。