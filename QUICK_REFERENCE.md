# 快速参考卡片 - 项目重构

## 三个主要问题

### 1️⃣ 通用类名
```
❌ .group_2, .group_4, .group_5, .section_1
✅ .dashboard-layout__main, .dashboard-layout__content, .map-container
```

### 2️⃣ 图片导入混乱
```
❌ const images = { bg: '/images/bg.png' }
✅ import { leftPanelImages } from '@/utils/imageManager'
```

### 3️⃣ 缺乏语义 HTML
```
❌ <div class="breadcrumb-item">
✅ <nav><ol><li><a aria-current="page">
```

---

## 命名规范（BEM）

```
Block.Element--Modifier

.dashboard-layout              Block
.dashboard-layout__main        Element
.dashboard-layout__main--dark  Modifier
```

---

## 类名对照表

| 旧名称 | 新名称 | 用途 |
|--------|--------|------|
| `.group_2` | `.dashboard-layout__main` | 主容器 |
| `.group_4` | `.dashboard-layout__content` | 内容区 |
| `.group_5` | `.dashboard-layout__map-area` | 地图区 |
| `.section_1` | `.map-container` | 地图容器 |
| `.panel-shell` | `.sidebar-panel` | 侧边栏 |
| `.panel-toggle` | `.sidebar-toggle` | 切换按钮 |
| `.nav-container` | `.breadcrumb-navigation__container` | 导航容器 |
| `.breadcrumb-item` | `.breadcrumb-list__link` | 导航项 |

---

## 快速修复清单

- [ ] 创建 `src/utils/imageManager.js`
- [ ] 替换 `.group_2` → `.dashboard-layout__main`
- [ ] 替换 `.group_4` → `.dashboard-layout__content`
- [ ] 替换 `.group_5` → `.dashboard-layout__map-area`
- [ ] 替换 `.section_1` → `.map-container`
- [ ] 替换 `.panel-toggle` → `.sidebar-toggle`
- [ ] 替换 `.nav-container` → `.breadcrumb-navigation__container`
- [ ] 更新所有 LESS 样式
- [ ] 测试所有功能
- [ ] 提交 PR

---

## 时间估计

| 任务 | 时间 |
|------|------|
| 快速修复 | 1-2 天 |
| 完整重构 | 3-5 天 |
| 测试与审查 | 1-2 天 |
| **总计** | **5-9 天** |

---

## 验收标准

✅ 功能完全保留
✅ 没有通用类名
✅ 图片导入统一
✅ 语义 HTML
✅ 代码审查通过
✅ 所有测试通过

---

## 文档导航

📖 **REFACTORING_GUIDE.md** - 详细指南
📖 **REFACTORING_IMPLEMENTATION.md** - 步骤指导
📖 **REFACTORING_SUMMARY.md** - 完整总结
📖 **QUICK_REFERENCE.md** - 本文档

---

## 问题排查

| 问题 | 解决方案 |
|------|---------|
| 样式失效 | 检查类名是否正确替换 |
| 功能破坏 | 查看浏览器控制台的错误信息 |
| 不确定如何开始 | 选择"快速修复"路径 |
| 需要更多帮助 | 查看 REFACTORING_IMPLEMENTATION.md |

---

## 关键命令

```bash
# 创建分支
git checkout -b refactor/improve-naming

# 安装依赖（如需）
npm install

# 运行开发服务器
npm run dev

# 运行测试
npm run test

# 提交更改
git add .
git commit -m "refactor: improve CSS naming and HTML semantics"

# 推送分支
git push -u origin refactor/improve-naming
```

---

## 记住这三点

1. **BEM** - 使用块-元素-修饰符命名法
2. **集中** - 图片导入统一管理
3. **语义** - 使用正确的 HTML 标签

---

**准备好了吗？** → 打开 **REFACTORING_IMPLEMENTATION.md** 开始！

