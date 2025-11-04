# 代码重构指南

## 📋 已完成的工作

### 1. 配置文件（/src/config）

#### `regions.js`
- 区域坐标配置
- 区域adcode映射
- 缩放级别配置
- 辅助函数：`getRegionCoordinates()`、`getRegionAdcode()`、`getRegionZoom()`

#### `mapSettings.js`
- 地图初始化参数
- 多边形样式配置
- 标记样式配置
- WMTS参数配置

#### `plotTypes.js`
- 地块类型常量
- 地块类型判断辅助函数
- 状态标签配置
- 工厂特定标签配置

### 2. 常量文件（/src/constants）

#### `geography.js`
- 地理常数（地球半径、面积转换系数）
- 面积转换函数集合
- 坐标距离计算函数

#### `colors.js`
- 主题颜色配置
- 地块类型颜色映射
- 状态颜色映射
- 图表颜色集

### 3. 可复用组件（/src/components）

#### Plot Components (`/components/plot/`)
- **FarmerProfile.vue** - 农户/所有人信息卡片
  - Props: farmerName, avatarUrl, backgroundImage, profileLabel, ageLabel, showStatusTags, statusTags
  - 支持状态标签可选显示

- **PlotStatistics.vue** - 地块统计数据组件
  - Props: statistics (数组), backgroundImage
  - 灵活支持任意数量的统计项

- **PriceInfo.vue** - 价格信息组件
  - Props: priceLabel, price, unit, backgroundImage, showArrow
  - 通用于多种价格显示场景

- **ConstructionCalendar.vue** - 施工计划日历
  - Props: month, totalDays, scheduleDays
  - 可配置有施工安排的日期

- **HealthIndicators.vue** - 健康指标圆形图表
  - Props: indicators (数组)
  - 支持多指标展示

#### Dashboard Components (`/components/dashboard/`)
- **StatCard.vue** - 统计卡片
  - Props: title, value, trend, icon, backgroundImage
  - 可选显示趋势和图标

### 4. 工具函数（/src/utils）

#### `validationHelpers.js`
- `isFiniteNumber()` - 检查有效数字
- `safeGet()` - 安全获取嵌套属性
- `hasData()` - 检查数据是否存在
- `isMapValid()` - 检查地图实例
- `isValidCoordinates()` - 坐标验证
- `isValidPolygon()` - 多边形验证
- `defensiveWrapper()` - 防御性包装器
- `isRequestCancelled()` - 请求取消检查
- `hasRequiredProps()` - 属性验证
- `createComputedCache()` - 计算缓存

---

## 🔄 使用指南

### 在Vue组件中使用配置

```javascript
// 引入配置
import { REGIONS, getRegionCoordinates } from '@/config/regions';
import { MAP_CONFIG, POLYGON_STYLES } from '@/config/mapSettings';
import { PLOT_TYPES, plotTypeHelpers, FACTORY_TAGS } from '@/config/plotTypes';
import { THEME_COLORS } from '@/constants/colors';
import { areaConverters, calculateDistance } from '@/constants/geography';

// 使用配置
const regionCoords = getRegionCoordinates('百色市');
const coordinates = REGIONS.右江区.coordinates;
const isFactory = plotTypeHelpers.isFactory(plotType);
```

### 使用验证辅助函数

```javascript
import { isFiniteNumber, safeGet, hasData, isValidCoordinates } from '@/utils/validationHelpers';

// 简化条件判断
// 原：if (Number.isFinite(value) && value !== null)
// 新：if (isFiniteNumber(value))

// 安全访问嵌套属性
// 原：if (data && data.properties && data.properties.name)
// 新：if (safeGet(data, 'properties.name'))

// 检查数据存在性
// 原：if (array && array.length > 0)
// 新：if (hasData(array))
```

### 使用可复用组件

```vue
<template>
  <!-- FarmerProfile 示例 -->
  <FarmerProfile
    :farmerName="plotData.farmerName"
    :avatarUrl="farmerAvatarUrl"
    :backgroundImage="images.farmerProfile"
    profileLabel="农户"
    ageLabel="年龄：54岁"
    :showStatusTags="true"
    :statusTags="[{class: 'status-general', text: '一般户'}]"
  />

  <!-- PlotStatistics 示例 -->
  <PlotStatistics
    :statistics="[
      {label: '总面积(亩)', value: '100.00'},
      {label: '产量(万斤)', value: '48'}
    ]"
    :backgroundImage="images.statItem"
  />

  <!-- PriceInfo 示例 -->
  <PriceInfo
    priceLabel="加工价格"
    :price="'4.10'"
    unit="元/斤"
    :backgroundImage="images.priceInfo"
    :showArrow="true"
  />

  <!-- ConstructionCalendar 示例 -->
  <ConstructionCalendar
    month="11月"
    :totalDays="30"
    :scheduleDays="[5, 10, 15, 20, 25]"
  />

  <!-- HealthIndicators 示例 -->
  <HealthIndicators
    :indicators="[
      {id: 1, label: '存储量', percentage: 78, color: '#c69c6d'},
      {id: 2, label: '容积占比', percentage: 65, color: '#ffa500'}
    ]"
  />

  <!-- StatCard 示例 -->
  <StatCard
    title="种植面积"
    :value="'1,258 亩'"
    :trend="+5.8"
    icon="/images/area-icon.png"
    :backgroundImage="images.statCard"
  />
</template>
```

---

## 📊 后续优化建议

### Phase 1（短期 - 立即执行）
- [ ] 在PlotDetail.vue中使用新的组件
- [ ] 将PlotDetail.vue中的hardcoded值替换为配置引用
- [ ] 在复杂条件判断处使用验证辅助函数

### Phase 2（中期 - 1-2周内）
- [ ] 拆分PlotDetail.vue为FactoryPanel、WarehousePanel、StaAnisePlot等子组件
- [ ] 拆分DataDashboard.vue的各个面板为独立组件
- [ ] 创建StatTable等通用表格组件

### Phase 3（长期 - 月度计划）
- [ ] 重构RegionDetailMap.vue（提取配置、组件化）
- [ ] 统一状态管理（Vuex/Pinia）
- [ ] 完整的国际化支持

---

## ⚙️ 扩展性优化原则

### 1. 配置优先于代码
```javascript
// ❌ 不好：硬编码
if (type === 'factory' || type === 'warehouse') {
  // ...
}

// ✅ 好：使用配置和辅助函数
if (plotTypeHelpers.isFactory(type) || plotTypeHelpers.isWarehouse(type)) {
  // ...
}
```

### 2. Props驱动，避免Props穿透
```javascript
// ❌ 不好：多层传递相同Props
<Component1 :data="data" :config="config" :style="style">
  <Component2 :data="data" :config="config" :style="style" />
</Component1>

// ✅ 好：使用provide/inject或slot scope
provide('plotConfig', config);
```

### 3. 数据分离，关注点分离
```javascript
// ❌ 不好：逻辑、数据、视图混在一起
// ✅ 好：
// - 数据在config/ 或 store/
// - 逻辑在methods/ 或 utils/
// - 视图纯粹展示
```

### 4. 条件判断简化
```javascript
// ❌ 不好：多重嵌套判断
if (data && data.plot && data.plot.type &&
    (data.plot.type === 'factory' || data.plot.type === 'warehouse') &&
    data.plot.properties && data.plot.properties.name) {
  // ...
}

// ✅ 好：使用辅助函数
if (safeGet(data, 'plot.properties.name') &&
    plotTypeHelpers.isFactory(data.plot.type)) {
  // ...
}

// ✅ 更好：使用computed
computed: {
  isValidFactory() {
    return this.plotName && plotTypeHelpers.isFactory(this.plotType);
  }
}
```

---

## 📈 预期收益

| 指标 | 现状 | 目标 | 预期改进 |
|------|------|------|---------|
| 最大组件行数 | 3613 | <500 | ↓ 86% |
| if语句重复率 | 高 | 低 | ↓ 50% |
| 代码可维护性 | 低 | 高 | ↑ 70% |
| 组件复用度 | 低 | 高 | ↑ 80% |
| 配置管理 | 分散 | 集中 | 100% 覆盖 |

---

## 📝 注意事项

1. **不影响现有功能** - 所有重构都基于现有代码，只是重新组织
2. **渐进式迁移** - 可以逐个组件进行迁移，不需要一次性重写
3. **向后兼容** - 新组件设计时考虑了现有数据结构
4. **测试先行** - 建议在使用新组件前进行单元测试

---

## 🔗 文件引用

### 配置文件位置
```
src/config/
  ├── regions.js
  ├── mapSettings.js
  └── plotTypes.js
```

### 常量文件位置
```
src/constants/
  ├── geography.js
  └── colors.js
```

### 组件位置
```
src/components/
  ├── plot/
  │   ├── FarmerProfile.vue
  │   ├── PlotStatistics.vue
  │   ├── PriceInfo.vue
  │   ├── ConstructionCalendar.vue
  │   └── HealthIndicators.vue
  └── dashboard/
      └── StatCard.vue
```

### 工具函数位置
```
src/utils/
  └── validationHelpers.js
```
