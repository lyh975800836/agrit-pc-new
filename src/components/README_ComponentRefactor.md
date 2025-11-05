# RegionDetailMap 组件拆分指南

## 概述

将原始的 `RegionDetailMap.vue` (3200+ 行) 进行了组件和模块拆分，提高代码可维护性、可读性和可复用性。

## 📦 新增组件

### 1. **MapLoadingOverlay.vue**
**路径:** `src/components/MapLoadingOverlay.vue`

**用途:** 地图加载状态指示器

**Props:**
- `isLoading` (Boolean): 是否显示加载状态
- `loadingText` (String): 加载提示文本

**使用示例:**
```vue
<MapLoadingOverlay
  :isLoading="isLoading"
  :loading-text="loadingText"
/>
```

---

### 2. **CategorySidebar.vue**
**路径:** `src/components/CategorySidebar.vue`

**用途:** 分类过滤侧边栏（全部/林/厂/仓）

**Props:**
- `categories` (Array): 分类列表
- `selectedCategoryType` (String): 当前选中的分类类型
- `isPlotDetailPage` (Boolean): 是否在地块详情页

**事件:**
- `@category-filter`: 分类过滤事件

**使用示例:**
```vue
<CategorySidebar
  :categories="categories"
  :selected-category-type="selectedCategoryType"
  :is-plot-detail-page="isPlotDetailPage"
  @category-filter="filterMapByCategory"
/>
```

---

### 3. **CategoryPopup.vue**
**路径:** `src/components/CategoryPopup.vue`

**用途:** 分类信息弹窗

**Props:**
- `selectedCategory` (Object): 选中的分类对象

**事件:**
- `@close`: 关闭弹窗
- `@navigate`: 导航到详情页

**使用示例:**
```vue
<CategoryPopup
  :selected-category="selectedCategory"
  @close="selectedCategory = null"
  @navigate="navigateToTertiaryMap"
/>
```

---

### 4. **PlotDetailPopup.vue**
**路径:** `src/components/PlotDetailPopup.vue`

**用途:** 地块/设施详情弹窗

**Props:**
- `popupData` (Object): 弹窗数据
- `popupPosition` (Object): 弹窗位置 `{top, left}`
- `regionName` (String): 区域名称

**事件:**
- `@close`: 关闭弹窗
- `@navigate`: 导航到地块详情页

**使用示例:**
```vue
<PlotDetailPopup
  :popup-data="popupData"
  :popup-position="popupPosition"
  :region-name="regionName"
  @close="showDetailPopup = false"
  @navigate="goToPlotDetail"
/>
```

---

## 🛠 新增工具模块

### 1. **coordinateUtils.js**
**路径:** `src/utils/coordinateUtils.js`

**功能:** 坐标转换和几何计算

**导出函数:**
- `wgs84ToGcj02(lng, lat)` - WGS84 转 GCJ-02
- `outOfChina(lng, lat)` - 判断点是否在中国范围外
- `transformlat(lng, lat)` - 转换纬度
- `transformlng(lng, lat)` - 转换经度
- `pointInPolygon(point, polygonCoordinates)` - 点是否在多边形内
- `calculatePolygonCenter(coordinates)` - 计算多边形质心
- `calculateSimpleCenter(coordinates)` - 计算平均中心

**使用示例:**
```javascript
import { wgs84ToGcj02, pointInPolygon } from '@/utils/coordinateUtils';

const gcj02Coords = wgs84ToGcj02(120.5, 30.5);
const isInside = pointInPolygon([120.5, 30.5], polygonCoords);
```

---

### 2. **plotMarkerManager.js**
**路径:** `src/utils/plotMarkerManager.js`

**功能:** 地块标记管理和配置

**导出函数:**
- `normalizePlotType(plotType)` - 规范化地块类型
- `getPlotMarkerVisualConfig(plotType)` - 获取视觉配置
- `getCategoryIcon(plotType)` - 获取分类图标
- `isPlotMatchCategory(plotType, categoryType, mapping)` - 检查类型是否匹配
- `createPlotMarkerHtml(plot, plotType)` - 创建标记 HTML
- `applyPlotFilter(layers, categoryType, filter, mapping)` - 应用过滤
- `updateMarkerVisibility(entry, categoryType, filter, mapping)` - 更新可见性

**使用示例:**
```javascript
import {
  normalizePlotType,
  getPlotMarkerVisualConfig
} from '@/utils/plotMarkerManager';

const normalizedType = normalizePlotType('star-anise');
const config = getPlotMarkerVisualConfig(normalizedType);
```

---

### 3. **mapNavigationUtils.js**
**路径:** `src/utils/mapNavigationUtils.js`

**功能:** 地图导航和视图管理

**导出函数:**
- `calculateBoundsFromFeatures(features)` - 根据特征计算边界
- `getFeatureCenter(feature)` - 获取特征中心点
- `fitMapToFeatures(map, features, padding)` - 适配地图到特征
- `zoomToLocation(map, center, zoom)` - 缩放到位置
- `fitMapToMarkers(map, plotMarkerLayers)` - 适配地图到标记

**使用示例:**
```javascript
import { fitMapToFeatures, zoomToLocation } from '@/utils/mapNavigationUtils';

fitMapToFeatures(this.map, features);
zoomToLocation(this.map, [120.5, 30.5], 14);
```

---

## 📝 使用指南

### 在 RegionDetailMap.vue 中导入新组件

```javascript
import MapLoadingOverlay from '@/components/MapLoadingOverlay.vue';
import CategorySidebar from '@/components/CategorySidebar.vue';
import CategoryPopup from '@/components/CategoryPopup.vue';
import PlotDetailPopup from '@/components/PlotDetailPopup.vue';

// 在 components 对象中注册
components: {
    MapLoadingOverlay,
    CategorySidebar,
    CategoryPopup,
    PlotDetailPopup
}
```

### 在模板中使用

```vue
<template>
  <div class="region-detail-map">
    <!-- 加载指示器 -->
    <MapLoadingOverlay
      :isLoading="isLoading"
      :loading-text="loadingText"
    />

    <!-- 分类侧边栏 -->
    <CategorySidebar
      :categories="categories"
      :selected-category-type="selectedCategoryType"
      :is-plot-detail-page="isPlotDetailPage"
      @category-filter="filterMapByCategory"
    />

    <!-- 地图容器 -->
    <div id="leaflet-map"></div>

    <!-- 分类弹窗 -->
    <CategoryPopup
      :selected-category="selectedCategory"
      @close="selectedCategory = null"
      @navigate="navigateToTertiaryMap"
    />

    <!-- 地块详情弹窗 -->
    <PlotDetailPopup
      :popup-data="popupData"
      :popup-position="popupPosition"
      :region-name="regionName"
      @close="showDetailPopup = false"
      @navigate="goToPlotDetail"
    />
  </div>
</template>
```

### 导入和使用工具函数

```javascript
// 导入坐标工具
import {
  wgs84ToGcj02,
  pointInPolygon
} from '@/utils/coordinateUtils';

// 导入标记管理器
import {
  normalizePlotType,
  getPlotMarkerVisualConfig
} from '@/utils/plotMarkerManager';

// 导入导航工具
import {
  fitMapToFeatures,
  zoomToLocation
} from '@/utils/mapNavigationUtils';

// 在方法中使用
methods: {
    initPlotMarkers() {
        this.plotMarkerLayers.forEach(entry => {
            const type = normalizePlotType(entry.type);
            const config = getPlotMarkerVisualConfig(type);
            // ... 处理标记
        });
    },

    adjustMapView() {
        fitMapToFeatures(this.map, this.features);
    }
}
```

---

## 📊 项目结构对比

### 之前
```
src/components/
├── RegionDetailMap.vue (3200+ 行)
└── ...
```

### 之后
```
src/components/
├── RegionDetailMap.vue (减少到 ~1500 行)
├── MapLoadingOverlay.vue
├── CategorySidebar.vue
├── CategoryPopup.vue
├── PlotDetailPopup.vue
└── ...

src/utils/
├── coordinateUtils.js
├── plotMarkerManager.js
├── mapNavigationUtils.js
├── plotConfig.js
└── ...
```

---

## ✅ 优势

1. **代码可维护性提升**: 每个文件职责清晰，易于维护
2. **可复用性**: 组件和工具函数可在其他组件中复用
3. **可测试性**: 小文件更容易编写单元测试
4. **性能优化**: 支持代码分割和懒加载
5. **团队协作**: 不同开发者可并行开发不同模块
6. **类型安全**: 工具函数职责明确，易于添加类型检查

---

## ⚠️ 注意事项

1. **保持现有逻辑**: 所有拆分都保持了原有功能逻辑不变
2. **依赖关系**: 新组件和工具模块之间已解耦，可独立使用
3. **样式隔离**: 每个组件使用 `scoped` 样式，避免样式冲突
4. **兼容性**: 确保在升级后进行充分的测试

---

## 🔄 迁移检查清单

- [ ] 在 RegionDetailMap.vue 中导入所有新组件
- [ ] 在模板中替换对应的 HTML 片段为新组件
- [ ] 在 script 中导入并使用工具函数
- [ ] 更新所有事件处理方法
- [ ] 运行应用测试所有功能
- [ ] 检查浏览器控制台是否有错误
- [ ] 测试各个分类过滤功能
- [ ] 测试弹窗的显示/隐藏
- [ ] 测试导航功能

---

## 📚 相关文件

- 原始组件: `src/components/RegionDetailMap.vue`
- 新增组件: 见上方详细说明
- 新增工具: 见上方详细说明

---

**最后更新**: 2024 年 11 月 5 日
**状态**: ✅ 拆分完成，待集成测试
