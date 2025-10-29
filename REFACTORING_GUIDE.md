# 项目重构指南 - DOM结构、类名命名、图片引入规范

## 1. 问题分析

### 1.1 当前问题

#### A. 通用类名问题（DashboardLayout.vue）
```html
<!-- ❌ 不好：通用、无意义的类名 -->
<div class="group_2">        <!-- 什么是 group_2？ -->
<div class="group_4">        <!-- group_4 和 group_2 的区别是什么？ -->
<div class="group_5">        <!-- 无法从名称了解功能 -->
<div class="section_1">
```

#### B. 混合的CSS类名方案
```html
<!-- 混合了多种命名约定 -->
<div class="panel-shell panel-shell--left">  <!-- BEM命名 -->
<div class="flex-row flex-grow">              <!-- 功能类 -->
<div class="group_4">                         <!-- 通用类 -->
<div class="breadcrumb-item">                 <!-- BEM命名 -->
```

#### C. 图片导入混乱
```javascript
// RightRankingPanel.vue - 使用本地对象
const images = {
    rankingPanelBg: '/images/ranking-panel-bg.png',
    // ...
};

// LeftDataPanel.vue - 使用 mixin
import imageMixin from '@/mixins/imageMixin';
this.getLeftPanelImageStyle('BACKGROUND')
```

#### D. DOM 结构不够语义化
```html
<!-- 使用 div 代替语义化标签 -->
<div class="bottom-navigation">      <!-- 应该是 <nav> -->
<div class="nav-container">          <!-- 应该是 <div> 配合 aria 属性 -->
<div class="breadcrumb-item">        <!-- 应该用 <li> 或 <a> -->
```

---

## 2. 重构方案

### 2.1 第一步：修复通用类名（DashboardLayout.vue）

#### 当前状态 → 新状态映射

| 旧类名 | 含义 | 新类名 | 说明 |
|------|------|------|------|
| `group_2` | 主容器 + 头部包装 | `dashboard-layout__main` | 使用 BEM 块和元素 |
| `group_4` | 主体内容区域 | `dashboard-layout__content` | 明确表示主体区域 |
| `group_5` | 中央地图区域 | `dashboard-layout__map-area` | 明确表示是地图区域 |
| `section_1` | 地图容器 | `map-section` | 独立模块 |

#### 完整重构示例

**DashboardLayout.vue 模板部分 - 旧版**
```vue
<template>
  <div class="page flex-col" :class="layoutClasses">
    <div class="group_2 flex-col">
      <DashboardHeader ... />

      <div class="group_4 flex-row">
        <!-- 左侧面板 -->
        <div :class="leftPanelShellClasses">
          <div :class="leftPanelContainerClasses">
            <slot name="left-panel" />
          </div>
          <button class="panel-toggle panel-toggle--left">
            <span class="panel-toggle__icon">...</span>
          </button>
        </div>

        <!-- 中央地图 -->
        <div class="group_5 flex-grow">
          <div class="section_1 center-content">
            <slot name="center-map" />
          </div>
          <nav v-if="shouldShowBottomNav" class="bottom-navigation">
            ...
          </nav>
        </div>

        <!-- 右侧面板 -->
        <div :class="rightPanelShellClasses">
          ...
        </div>
      </div>
    </div>
  </div>
</template>
```

**DashboardLayout.vue 模板部分 - 新版**
```vue
<template>
  <div class="dashboard-page" :class="layoutClasses">
    <!-- 主容器 -->
    <div class="dashboard-layout__main">
      <!-- 头部 -->
      <header class="dashboard-layout__header">
        <DashboardHeader ... />
      </header>

      <!-- 主体内容区域：包含左侧面板、地图、右侧面板 -->
      <div class="dashboard-layout__content">

        <!-- 左侧边栏面板 -->
        <aside
          v-if="shouldRenderLeftPanel"
          :class="leftPanelClasses"
          role="region"
          aria-label="左侧数据面板"
        >
          <div class="sidebar-panel__content">
            <slot name="left-panel" />
          </div>

          <button
            class="sidebar-toggle sidebar-toggle--left"
            :aria-expanded="!isLeftCollapsed"
            aria-label="切换左侧面板"
            @click="toggleLeftPanel"
          >
            <span class="sidebar-toggle__icon">{{ isLeftCollapsed ? '›' : '‹' }}</span>
          </button>
        </aside>

        <!-- 中央地图区域 -->
        <main class="dashboard-layout__map-area" role="main">
          <div class="map-container">
            <slot name="center-map" />
          </div>

          <!-- 底部导航面包屑 -->
          <nav
            v-if="shouldShowBottomNav"
            class="breadcrumb-navigation"
            aria-label="位置导航"
          >
            <div class="breadcrumb-navigation__container">
              <div class="breadcrumb-navigation__left">
                <button
                  class="breadcrumb-navigation__back-btn"
                  @click="handleBackClick"
                >
                  <span class="breadcrumb-navigation__back-arrow">‹</span>
                  <span class="breadcrumb-navigation__back-text">返回上级</span>
                </button>
              </div>

              <ol class="breadcrumb-list">
                <li
                  v-for="(item, index) in breadcrumbs"
                  :key="index"
                  class="breadcrumb-list__item"
                >
                  <a
                    :href="item.path"
                    :class="['breadcrumb-list__link', { 'is-current': item.current }]"
                    :aria-current="item.current ? 'page' : false"
                    @click.prevent="handleBreadcrumbClick(item)"
                  >
                    {{ item.name }}
                  </a>
                  <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-list__separator" aria-hidden="true">
                    >
                  </span>
                </li>
              </ol>
            </div>
          </nav>
        </main>

        <!-- 右侧边栏面板 -->
        <aside
          v-if="shouldRenderRightPanel"
          :class="rightPanelClasses"
          role="region"
          aria-label="右侧排名面板"
        >
          <button
            class="sidebar-toggle sidebar-toggle--right"
            :aria-expanded="!isRightCollapsed"
            aria-label="切换右侧面板"
            @click="toggleRightPanel"
          >
            <span class="sidebar-toggle__icon">{{ isRightCollapsed ? '‹' : '›' }}</span>
          </button>

          <div class="sidebar-panel__content">
            <slot name="right-panel" />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
```

### 2.2 第二步：CSS 类名规范化

#### BEM 命名约定应用

```less
// ❌ 旧版本混乱
.group_2 { ... }
.group_4 { ... }
.panel-shell { ... }
.panel-shell--left { ... }
.flex-row { ... }
.breadcrumb-item { ... }

// ✅ 新版本：统一使用 BEM
.dashboard-page { ... }
.dashboard-page--full-map { ... }

.dashboard-layout__main { ... }
.dashboard-layout__header { ... }
.dashboard-layout__content { ... }
.dashboard-layout__map-area { ... }

.sidebar-panel { ... }
.sidebar-panel__content { ... }
.sidebar-panel--left { ... }
.sidebar-panel--right { ... }
.sidebar-panel--collapsed { ... }

.sidebar-toggle { ... }
.sidebar-toggle__icon { ... }
.sidebar-toggle--left { ... }
.sidebar-toggle--right { ... }

.breadcrumb-navigation { ... }
.breadcrumb-navigation__container { ... }
.breadcrumb-navigation__back-btn { ... }
.breadcrumb-list { ... }
.breadcrumb-list__item { ... }
.breadcrumb-list__link { ... }
.breadcrumb-list__link.is-current { ... }
.breadcrumb-list__separator { ... }
```

#### LESS 重构示例

```less
// ============================================
// Dashboard Layout 主容器
// ============================================

.dashboard-page {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-bg-primary);

  &--full-map {
    .dashboard-layout__map-area {
      width: 100%;
    }

    .sidebar-panel {
      position: absolute;
      z-index: 20;
    }
  }
}

// 主布局容器
.dashboard-layout {
  &__main {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  &__header {
    flex: 0 0 auto;
    z-index: 10;
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
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    width: auto;
    max-width: none;
    height: 100%;
    min-height: 0;
    padding: 5px;
  }
}

// 侧边栏面板
.sidebar-panel {
  position: relative;
  z-index: 10;
  display: flex;
  overflow: visible;
  flex: 0 0 375px;
  align-items: stretch;
  min-width: 0;
  transition: flex-basis 0.3s ease, width 0.3s ease;

  &--left {
    flex-direction: row;
  }

  &--right {
    flex-direction: row;
    justify-content: flex-end;
  }

  &--collapsed {
    flex: 0 0 42px;
    width: auto;
  }

  &--overlay {
    position: absolute;
    z-index: 20;
    top: 0;
    bottom: calc(50px + 20px);
    flex: 0 0 auto;
    width: min(375px, calc(50% - 40px), calc(100% - 80px));
    pointer-events: auto;

    &.sidebar-panel--left {
      left: 20px;
    }

    &.sidebar-panel--right {
      right: 20px;
    }
  }

  &__content {
    position: relative;
    flex: none;
    width: 375px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

// 侧边栏切换按钮
.sidebar-toggle {
  position: absolute;
  z-index: 25;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 72px;
  margin: 0;
  padding: 0;
  border: 1px solid rgba(76, 253, 235, 0.45);
  color: #C69C6D;
  border-radius: 999px;
  background: rgba(16, 40, 56, 0.9);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  transform: translateY(-50%);
  cursor: pointer;

  &:hover {
    border-color: rgba(76, 253, 235, 0.65);
    background: rgba(28, 72, 90, 0.95);
  }

  &:active {
    transform: translateY(-50%) scale(0.96);
  }

  &--left {
    right: -16px;

    &:hover {
      transform: translateY(-50%) translateX(1px);
    }

    &:active {
      transform: translateY(-50%) translateX(1px) scale(0.96);
    }
  }

  &--right {
    left: -16px;

    &:hover {
      transform: translateY(-50%) translateX(-1px);
    }

    &:active {
      transform: translateY(-50%) translateX(-1px) scale(0.96);
    }
  }

  &__icon {
    font-size: 18px;
    font-weight: 600;
    line-height: 1;
  }
}

// 地图容器
.map-container {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  min-height: 0;
}

// 面包屑导航
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
  background: rgba(16, 40, 56, 0.5);

  &__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    height: 100%;
    margin: 0 auto;
    padding: 0 30px;
  }

  &__left {
    display: flex;
    align-items: center;
  }

  &__back-btn {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border: 1px solid rgba(76, 253, 235, 0.3);
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    color: #C69C6D;
    border-radius: 6px;
    background: rgba(76, 253, 235, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    gap: 8px;

    &:hover {
      border-color: rgba(76, 253, 235, 0.5);
      background: rgba(76, 253, 235, 0.2);
      transform: translateX(-2px);
    }

    &:active {
      transform: translateX(-1px);
    }
  }

  &__back-arrow {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
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
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;
    color: #5dd7ce;
    text-decoration: none;
    transition: color 0.3s ease;
    cursor: pointer;

    &:hover:not(.is-current) {
      color: #C69C6D;
    }

    &.is-current {
      font-weight: 500;
      color: #C69C6D;
      cursor: default;
      pointer-events: none;
    }
  }

  &__separator {
    font-size: 14px;
    color: rgba(93, 215, 206, 0.6);
    user-select: none;
  }
}
```

### 2.3 第三步：图片导入规范

#### 创建统一的图片管理系统

**新文件：`src/utils/imageManager.js`**
```javascript
/**
 * 统一的图片导入管理
 * 所有图片都通过此模块导入，便于维护和修改
 */

// 左侧面板图片
export const leftPanelImages = {
  background: new URL('@/assets/images/left-panel-bg.png', import.meta.url).href,
  leftSlide: new URL('@/assets/images/left-slide.png', import.meta.url).href,
  titleUnderline: new URL('@/assets/images/title-underline.png', import.meta.url).href,
  blockCountCard: new URL('@/assets/images/block-count-card.png', import.meta.url).href,
  cardLabelBlock: new URL('@/assets/images/card-label-block.png', import.meta.url).href,
  totalAreaCard: new URL('@/assets/images/total-area-card.png', import.meta.url).href,
  priceChartBg: new URL('@/assets/images/price-chart-bg.png', import.meta.url).href,
  priceIcon: new URL('@/assets/images/price-icon.png', import.meta.url).href,
  tableDivider: new URL('@/assets/images/table-divider.png', import.meta.url).href,
};

// 右侧面板图片
export const rightPanelImages = {
  background: new URL('@/assets/images/ranking-panel-bg.png', import.meta.url).href,
  productionHeader: new URL('@/assets/images/production-ranking-header.png', import.meta.url).href,
  teamHeader: new URL('@/assets/images/team-ranking-header.png', import.meta.url).href,
  productionUnderline: new URL('@/assets/images/production-underline.png', import.meta.url).href,
  teamUnderline: new URL('@/assets/images/team-underline.png', import.meta.url).href,
  sectionDivider: new URL('@/assets/images/section-divider.png', import.meta.url).href,
  rankingDecoration: new URL('@/assets/images/ranking-decoration.png', import.meta.url).href,

  // 排名奖牌
  firstPlaceBg: new URL('@/assets/images/first-place-bg.png', import.meta.url).href,
  secondPlaceBg: new URL('@/assets/images/second-place-bg.png', import.meta.url).href,
  thirdPlaceBg: new URL('@/assets/images/third-place-bg.png', import.meta.url).href,
  firstPlaceIcon: new URL('@/assets/images/first-place-icon.png', import.meta.url).href,
  secondPlaceIcon: new URL('@/assets/images/second-place-icon.png', import.meta.url).href,
  thirdPlaceIcon: new URL('@/assets/images/third-place-icon.png', import.meta.url).href,

  // 负责人背景
  firstManagerBg: new URL('@/assets/images/first-manager-bg.png', import.meta.url).href,
  secondManagerBg: new URL('@/assets/images/second-manager-bg.png', import.meta.url).href,
  thirdManagerBg: new URL('@/assets/images/third-manager-bg.png', import.meta.url).href,

  // 质量相关
  qualityIcon: new URL('@/assets/images/quality-icon.png', import.meta.url).href,
  qualityDivider: new URL('@/assets/images/quality-divider.png', import.meta.url).href,
  qualityGood: new URL('@/assets/images/quality-good.png', import.meta.url).href,
  qualityAverage: new URL('@/assets/images/quality-average.png', import.meta.url).href,
  qualityPoor: new URL('@/assets/images/quality-poor.png', import.meta.url).href,
};

// 地图相关图片
export const mapImages = {
  // 根据需要添加
};

// 通用工具方法
export const getImage = (category, name) => {
  const categories = {
    leftPanel: leftPanelImages,
    rightPanel: rightPanelImages,
    map: mapImages,
  };

  return categories[category]?.[name] || '';
};
```

#### 在组件中使用

**LeftDataPanel.vue - 旧版本（使用mixin）**
```vue
<template>
  <div class="left-data-panel" :style="getLeftPanelImageStyle('BACKGROUND')">
    <!-- ... -->
  </div>
</template>

<script>
import imageMixin from '@/mixins/imageMixin';

export default {
  mixins: [imageMixin],
  // ...
}
</script>
```

**LeftDataPanel.vue - 新版本（使用统一管理）**
```vue
<template>
  <div class="left-data-panel" :style="{ backgroundImage: `url(${images.background})` }">
    <!-- ... -->
  </div>
</template>

<script>
import { leftPanelImages } from '@/utils/imageManager';

export default {
  data() {
    return {
      images: leftPanelImages,
    };
  },
};
</script>
```

---

## 3. 实施步骤

### 第 1 阶段：准备（1-2 小时）
- [ ] 备份当前代码
- [ ] 创建 `imageManager.js`
- [ ] 准备 BEM 命名规范文档
- [ ] 确认图片资源位置

### 第 2 阶段：重构 DashboardLayout（2-3 小时）
- [ ] 更新模板（用语义化 HTML 和新类名）
- [ ] 更新脚本（更新类名绑定）
- [ ] 更新样式（转换为 BEM）
- [ ] 添加 ARIA 属性

### 第 3 阶段：重构 LeftDataPanel（1-2 小时）
- [ ] 更新模板
- [ ] 使用 imageManager
- [ ] 更新样式
- [ ] 移除 mixin

### 第 4 阶段：重构 RightRankingPanel（1-2 小时）
- [ ] 更新模板
- [ ] 使用 imageManager
- [ ] 更新样式
- [ ] 保持一致

### 第 5 阶段：测试和清理（2-3 小时）
- [ ] 功能测试
- [ ] 样式验证
- [ ] 性能检查
- [ ] 删除过时代码

---

## 4. 类名规范速查表

### BEM 基本结构
```
.block { }                    /* 块 */
.block__element { }           /* 块的元素 */
.block__element--modifier { } /* 块元素的修饰符 */
```

### 应用示例

| 组件 | 块 | 元素 | 修饰符 |
|------|-----|------|--------|
| Dashboard | `dashboard-page` | `__main`, `__header`, `__content`, `__map-area` | `--full-map` |
| Sidebar | `sidebar-panel` | `__content` | `--left`, `--right`, `--collapsed`, `--overlay` |
| Toggle | `sidebar-toggle` | `__icon` | `--left`, `--right` |
| Breadcrumb | `breadcrumb-navigation` | `__container`, `__back-btn` | - |
| List | `breadcrumb-list` | `__item`, `__link`, `__separator` | - |

---

## 5. 图片导入规范

### ✅ 推荐做法
```javascript
// 方法 1：集中管理
import { leftPanelImages } from '@/utils/imageManager';

// 方法 2：直接 import
import bgImage from '@/assets/images/panel-bg.png';
```

### ❌ 避免做法
```javascript
// ❌ 字符串硬编码
:style="{ backgroundImage: 'url(/images/panel-bg.png)' }"

// ❌ 混合多个导入方式
// 在同一项目中既用 mixin 又用本地对象

// ❌ 未统一管理
// 每个组件单独定义 images 对象
```

---

## 6. 检查清单

### 代码审查检查
- [ ] 所有类名遵循 BEM 命名
- [ ] 没有使用通用类名（group_*, section_*）
- [ ] HTML 使用语义化标签（`<header>`, `<main>`, `<aside>`, `<nav>`, `<ol>`, `<li>`）
- [ ] ARIA 属性正确（`role`, `aria-label`, `aria-expanded`, `aria-current`）
- [ ] 所有图片通过 `imageManager` 导入
- [ ] CSS 使用 LESS 变量和 mixin
- [ ] 没有内联样式（除了动态绑定）
- [ ] 没有 CSS 空块或重复

### 性能检查
- [ ] 没有未使用的 CSS
- [ ] 没有重复的选择器
- [ ] 文件大小未增加超过 5%

### 测试检查
- [ ] 所有功能正常工作
- [ ] 响应式设计保持不变
- [ ] 无控制台错误或警告
- [ ] 页面加载时间未显著增加

