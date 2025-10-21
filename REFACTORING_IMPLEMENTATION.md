# 重构实施工具包

## 快速开始：选择你的重构路径

### 路径 A：快速修复（推荐新手）- 1-2 天
1. 只修复最关键的问题
2. DashboardLayout.vue 类名修复
3. 图片导入标准化
4. 保持其他代码不变

### 路径 B：完整重构（推荐完美主义者）- 3-5 天
1. 所有三个文件完全重构
2. BEM 命名应用到所有 CSS
3. 语义 HTML 更新
4. 完整的 ARIA 属性添加

---

## 路径 A 详细步骤（快速修复）

### 第 1 步：创建图片管理模块（15 分钟）

**文件：`src/utils/imageManager.js`**

```javascript
/**
 * 集中管理所有图片导入
 * 确保整个项目的图片引入方式一致
 */

// 左侧面板图片
export const leftPanelImages = {
  background: require('@/assets/images/left-panel-bg.png'),
  leftSlide: require('@/assets/images/left-slide.png'),
  titleUnderline: require('@/assets/images/title-underline.png'),
  blockCountCard: require('@/assets/images/block-count-card.png'),
  cardLabelBlock: require('@/assets/images/card-label-block.png'),
  totalAreaCard: require('@/assets/images/total-area-card.png'),
  priceChartBg: require('@/assets/images/price-chart-bg.png'),
  priceIcon: require('@/assets/images/price-icon.png'),
  tableDivider: require('@/assets/images/table-divider.png'),
};

// 右侧面板图片
export const rightPanelImages = {
  background: require('@/assets/images/ranking-panel-bg.png'),
  productionHeader: require('@/assets/images/production-ranking-header.png'),
  teamHeader: require('@/assets/images/team-ranking-header.png'),
  productionUnderline: require('@/assets/images/production-underline.png'),
  teamUnderline: require('@/assets/images/team-underline.png'),
  sectionDivider: require('@/assets/images/section-divider.png'),
  rankingDecoration: require('@/assets/images/ranking-decoration.png'),
  firstPlaceBg: require('@/assets/images/first-place-bg.png'),
  secondPlaceBg: require('@/assets/images/second-place-bg.png'),
  thirdPlaceBg: require('@/assets/images/third-place-bg.png'),
  firstPlaceIcon: require('@/assets/images/first-place-icon.png'),
  secondPlaceIcon: require('@/assets/images/second-place-icon.png'),
  thirdPlaceIcon: require('@/assets/images/third-place-icon.png'),
  firstManagerBg: require('@/assets/images/first-manager-bg.png'),
  secondManagerBg: require('@/assets/images/second-manager-bg.png'),
  thirdManagerBg: require('@/assets/images/third-manager-bg.png'),
  qualityIcon: require('@/assets/images/quality-icon.png'),
  qualityDivider: require('@/assets/images/quality-divider.png'),
  qualityGood: require('@/assets/images/quality-good.png'),
  qualityAverage: require('@/assets/images/quality-average.png'),
  qualityPoor: require('@/assets/images/quality-poor.png'),
};
```

### 第 2 步：修复 DashboardLayout 类名（30 分钟）

**关键修改：**

从这个：
```vue
<div class="group_2 flex-col">
  <div class="group_4 flex-row">
    <div class="group_5 flex-grow">
      <div class="section_1 center-content">
```

改为这个：
```vue
<div class="dashboard-layout__main">
  <div class="dashboard-layout__content">
    <div class="dashboard-layout__map-area">
      <div class="map-container">
```

**LESS 样式更新：**

```less
// 用这个替换掉所有 .group_* 和 .section_1
.dashboard-layout {
  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    min-height: 0;
    padding: 0 10px;
    gap: 10px;
  }

  &__map-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 5px;
  }
}

.map-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  min-height: 0;
}
```

### 第 3 步：重命名面板相关类（30 分钟）

从这个：
```vue
<div :class="leftPanelShellClasses">  <!-- 使用 panel-shell -->
  <div :class="leftPanelContainerClasses">
    <button class="panel-toggle panel-toggle--left">
```

改为这个：
```vue
<aside :class="leftSidebarClasses">  <!-- 使用 sidebar-panel -->
  <div class="sidebar-panel__content">
    <button class="sidebar-toggle sidebar-toggle--left">
```

**计算属性更新：**

```javascript
computed: {
  leftSidebarClasses() {
    return [
      'sidebar-panel',
      'sidebar-panel--left',
      {
        'sidebar-panel--overlay': this.fullScreenMap,
        'sidebar-panel--overlay-left': this.fullScreenMap,
        'sidebar-panel--collapsed': this.isLeftCollapsed
      }
    ];
  },
  rightSidebarClasses() {
    return [
      'sidebar-panel',
      'sidebar-panel--right',
      {
        'sidebar-panel--overlay': this.fullScreenMap,
        'sidebar-panel--overlay-right': this.fullScreenMap,
        'sidebar-panel--collapsed': this.isRightCollapsed
      }
    ];
  }
}
```

### 第 4 步：优化底部导航类名（20 分钟）

从这个：
```vue
<div class="nav-container">
  <div class="nav-left">
    <button class="back-btn">
      <span class="back-arrow">‹</span>
      <span class="back-text">返回上级</span>
    </button>
  </div>
  <div class="nav-breadcrumb">
    <span class="breadcrumb-item">{{ item.name }}</span>
    <span class="breadcrumb-separator">></span>
  </div>
</div>
```

改为这个：
```vue
<nav class="breadcrumb-navigation">
  <div class="breadcrumb-navigation__container">
    <div class="breadcrumb-navigation__left">
      <button class="breadcrumb-navigation__back-btn">
        <span class="breadcrumb-navigation__back-arrow">‹</span>
        <span class="breadcrumb-navigation__back-text">返回上级</span>
      </button>
    </div>
    <ol class="breadcrumb-list">
      <li class="breadcrumb-list__item">
        <a class="breadcrumb-list__link">{{ item.name }}</a>
        <span class="breadcrumb-list__separator" aria-hidden="true">></span>
      </li>
    </ol>
  </div>
</nav>
```

**对应的 LESS：**

```less
.breadcrumb-navigation {
  position: absolute;
  z-index: 10;
  right: 0;
  bottom: 0;
  left: 0;
  height: 50px;
  border-top: 1px solid rgba(76, 253, 235, 0.3);
  opacity: 0.8;
  backdrop-filter: blur(10px);

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    height: 100%;
    margin: 0 auto;
    padding: 0 30px;
  }

  &__back-btn {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid rgba(76, 253, 235, 0.3);
    color: #4cfcea;
    border-radius: 6px;
    background: rgba(76, 253, 235, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    gap: 8px;

    &:hover {
      background: rgba(76, 253, 235, 0.2);
      transform: translateX(-2px);
    }
  }

  &__back-arrow {
    font-size: 18px;
    font-weight: bold;
  }

  &__back-text {
    font-size: 14px;
    font-weight: 500;
  }
}

.breadcrumb-list {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__link {
    color: #5dd7ce;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #4cfcea;
    }

    &.is-current {
      color: #4cfcea;
      cursor: default;
    }
  }

  &__separator {
    color: rgba(93, 215, 206, 0.6);
    user-select: none;
  }
}
```

### 第 5 步：测试（30 分钟）

在浏览器中测试：
- [ ] 所有面板切换功能工作正常
- [ ] 响应式设计没有破坏
- [ ] 样式没有改变
- [ ] 控制台没有错误警告

---

## 路径 B 详细步骤（完整重构）

如果选择完整重构，按以下顺序执行：

### 第一阶段：准备工作（1小时）
1. ✅ 创建 imageManager.js
2. ✅ 创建新的 LESS 样式文件框架
3. ✅ 备份当前代码
4. ✅ 在 git 中创建新分支

### 第二阶段：重构 DashboardLayout（1.5-2小时）
1. 更新模板（用语义化 HTML）
2. 更新类名绑定（在计算属性中）
3. 重写所有 LESS 样式（BEM 命名）
4. 添加 ARIA 属性
5. 测试并验证

### 第三阶段：重构 LeftDataPanel（1-1.5小时）
1. 替换 mixin 为 imageManager
2. 更新类名为 BEM
3. 优化模板结构
4. 重写样式

### 第四阶段：重构 RightRankingPanel（1-1.5小时）
1. 统一图片导入
2. 更新类名为 BEM
3. 优化模板结构
4. 重写样式

### 第五阶段：收尾和测试（1-1.5小时）
1. 删除过时的 mixin 和样式
2. 完整功能测试
3. 性能检查
4. 代码审查

---

## 常见问题解答

### Q: 如何处理已有的 !important 标记？
**A:** 在 BEM 重构中逐步移除。通过提高选择器的特异性来取代 !important：
```less
// ❌ 旧版本
.group_4 {
  display: flex !important;
}

// ✅ 新版本 - 更具体的选择器
.dashboard-layout__content {
  display: flex;
}

.dashboard-page--full-map .dashboard-layout__content {
  // 针对特定状态的覆盖
}
```

### Q: 如何处理现有的功能类（flex-row, flex-grow）？
**A:** 保留功能类用于通用布局，但让 BEM 类处理组件特定的样式：
```less
// ✅ 可以保留功能类作为辅助
<div class="dashboard-layout__content flex-row">

// 但核心样式应该在 BEM 块中
.dashboard-layout__content {
  display: flex;
  flex-direction: row;
}
```

### Q: 图片导入用 require 还是 import？
**A:** 使用 `require()` 以支持所有构建工具：
```javascript
// ✅ 推荐 - 支持 webpack
export const images = {
  bg: require('@/assets/images/bg.png'),
};

// 如果使用 Vite，则用 import
import bg from '@/assets/images/bg.png';
export const images = { bg };
```

### Q: 如何处理已有的样式变量？
**A:** 将所有颜色值提取到 `variables.less`：
```less
@color-primary: #4cfcea;
@color-secondary: #5dd7ce;
@color-bg-dark: rgba(16, 40, 56, 0.9);

.sidebar-toggle {
  color: @color-primary;
}
```

---

## 验收标准

重构完成后，需要满足以下所有条件：

### 代码质量
- [ ] 所有类名遵循 BEM 或功能类命名
- [ ] 没有通用类名（group_*, section_*）
- [ ] CSS 嵌套深度不超过 3 级
- [ ] 没有 !important（除非必要）

### 功能性
- [ ] 所有原有功能保持不变
- [ ] 面板切换、收起、展开都正常
- [ ] 响应式设计工作正常
- [ ] 地图正确显示

### 可维护性
- [ ] 类名易于理解
- [ ] 样式易于定位
- [ ] 添加新功能时易于扩展
- [ ] 代码审查通过

### 性能
- [ ] CSS 文件大小无明显增加
- [ ] 页面加载时间未增加
- [ ] 没有渲染性能问题

---

## 回滚计划

如果重构出现问题，可以快速回滚：

```bash
# 1. 如果使用了 git 分支
git checkout main
git branch -D refactor-feature

# 2. 如果有备份文件
cp DashboardLayout.vue.backup DashboardLayout.vue
cp LeftDataPanel.vue.backup LeftDataPanel.vue
cp RightRankingPanel.vue.backup RightRankingPanel.vue

# 3. 清理临时文件
rm -f src/utils/imageManager.js
```

---

## 下一步

完成重构后的建议：

1. **代码审查** - 让同事审查重构代码
2. **自动化测试** - 添加单元测试确保功能
3. **性能监测** - 监测生产环境的性能指标
4. **文档更新** - 更新项目文档中关于命名规范的部分
5. **知识分享** - 与团队分享新的命名规范

