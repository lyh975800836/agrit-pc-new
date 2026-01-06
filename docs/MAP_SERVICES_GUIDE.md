# 地图服务使用指南

## 概述

本指南说明如何使用新创建的地图服务类重构地图组件。这些服务类遵循单一职责原则，将复杂的地图逻辑分解为可复用、可测试的模块。

## 服务架构

```
src/services/map/
├── MapInitializer.js      - 地图初始化服务
├── BoundaryManager.js     - 边界管理服务
├── MarkerManager.js       - 标记管理服务
└── PopupPositioner.js     - 弹窗定位服务
```

## 核心服务类

### 1. MapInitializer - 地图初始化服务

**职责**: 创建和配置 Leaflet 地图实例

**主要功能**:
- 初始化地图及配置
- 管理瓦片图层
- 提供地图视图操作
- 处理地图销毁

**API**:
```javascript
import { MapInitializer } from '@/services/map/MapInitializer';

const initializer = new MapInitializer({
  containerId: 'map',           // 地图容器ID
  config: MAP_CONFIG,           // 地图配置
  tileProvider: TILE_PROVIDER   // 瓦片提供商
});

// 初始化地图
const map = await initializer.initialize();

// 视图操作
initializer.setView([23.9, 106.6], 14);
initializer.fitBounds(bounds, { padding: [50, 50] });
initializer.flyTo([23.9, 106.6], 15);

// 刷新地图大小
initializer.invalidateSize();

// 销毁地图
initializer.destroy();
```

### 2. BoundaryManager - 边界管理服务

**职责**: 管理区域边界和遮罩效果

**主要功能**:
- 渲染 GeoJSON 边界
- 创建区域外遮罩
- 适配地图视图到边界
- 边界样式管理

**API**:
```javascript
import { BoundaryManager } from '@/services/map/BoundaryManager';

const boundaryManager = new BoundaryManager({
  config: REGION_DETAIL_MAP_CONFIG
});

// 设置地图
boundaryManager.setMap(map);

// 添加区域边界
const regionLayer = boundaryManager.addRegionBoundary(regionFeature, {
  style: {
    color: '#c69c6d',
    weight: 3,
    fillOpacity: 0.1
  }
});

// 添加区域外遮罩
const maskLayer = boundaryManager.addRegionMask();

// 适配视图到边界
boundaryManager.fitBounds({ padding: [50, 50] });

// 获取边界
const bounds = boundaryManager.getBounds();

// 更新样式
boundaryManager.updateBoundaryStyle({ color: '#ff0000' });

// 显示/隐藏
boundaryManager.setBoundaryVisible(true);
boundaryManager.setMaskVisible(false);

// 清除所有边界
boundaryManager.clear();
```

### 3. MarkerManager - 标记管理服务

**职责**: 管理地图标记的创建、过滤和交互

**主要功能**:
- 批量创建地块标记
- 按分类过滤标记
- 管理标记可见性
- 处理标记事件

**API**:
```javascript
import { MarkerManager } from '@/services/map/MarkerManager';

const markerManager = new MarkerManager({
  autoFit: true,              // 自动适配视图
  enableInteraction: true     // 启用交互
});

// 设置地图
markerManager.setMap(map);

// 设置事件处理器
markerManager.setEventHandlers({
  onClick: (marker, plotData, event) => {
    console.log('标记被点击:', plotData);
  },
  onHover: (marker, plotData, event) => {
    console.log('标记悬停:', plotData);
  }
});

// 从瓦片数据添加标记
const tilesData = await apiClient.getPlotsList();
const markers = await markerManager.addPlotMarkersFromTiles(tilesData);

// 按分类过滤
markerManager.filterByCategory('forest');  // 只显示林业
markerManager.filterByCategory('all');     // 显示全部

// 获取标记
const allMarkers = markerManager.getMarkers();
const visibleMarkers = markerManager.getVisibleMarkers();
const forestMarkers = markerManager.getMarkersByCategory('forest');

// 查找标记
const marker = markerManager.findMarker(m => m.plotData.name === '测试地块');

// 高亮标记
markerManager.highlightMarker(marker, { scale: 1.2 });
markerManager.unhighlightMarker(marker);

// 适配视图
markerManager.fitBounds();

// 清除所有标记
markerManager.clear();
```

### 4. PopupPositioner - 弹窗定位服务

**职责**: 计算弹窗最佳显示位置

**主要功能**:
- 智能计算弹窗位置
- 确保弹窗在可视区域内
- 支持多种定位模式
- 自动选择最佳方向

**API**:
```javascript
import { PopupPositioner } from '@/services/map/PopupPositioner';

const positioner = new PopupPositioner({
  config: REGION_DETAIL_MAP_CONFIG
});

// 设置地图
positioner.setMap(map, 'map-container');

// 计算弹窗位置(绝对定位)
const position = positioner.calculatePosition([23.9, 106.6], {
  popupWidth: 300,
  popupHeight: 200,
  offsetAbove: 20,
  margin: 10
});

// 计算相对位置(相对于地图容器)
const relativePos = positioner.calculateRelativePosition([23.9, 106.6]);

// 智能定位(自动选择最佳方向)
const { position, placement } = positioner.calculateSmartPosition([23.9, 106.6]);
console.log('放置方向:', placement); // 'top', 'bottom', 'left', 'right'

// 检查坐标是否在视口内
const isVisible = positioner.isInViewport([23.9, 106.6]);

// 将坐标平移到视口中心
positioner.panToView([23.9, 106.6], { animate: true });

// 获取容器尺寸
const containerSize = positioner.getContainerSize();
const viewportSize = positioner.getViewportSize();
```

## 统一管理器

为了简化服务的使用，我们创建了 `MapServiceManager` 统一管理所有服务:

```javascript
import { MapServiceManager } from '@/services/map/MapServiceManager';

const serviceManager = new MapServiceManager({
  containerId: 'map',
  config: REGION_DETAIL_MAP_CONFIG
});

// 初始化所有服务
await serviceManager.initialize();

// 访问各个服务
const {
  mapInitializer,
  boundaryManager,
  markerManager,
  popupPositioner
} = serviceManager.getServices();

// 或直接调用统一接口
await serviceManager.loadRegionData(regionFeature, tilesData);
serviceManager.filterMarkers('forest');
const position = serviceManager.calculatePopupPosition([23.9, 106.6]);

// 销毁所有服务
serviceManager.destroy();
```

## 组件重构示例

### 重构前 (RegionDetailMap.vue)

```vue
<script>
export default {
  data() {
    return {
      map: null,
      plotLayers: [],
      plotMarkerLayers: []
    };
  },

  mounted() {
    this.initMap();
  },

  methods: {
    initMap() {
      // 200+ 行混杂的初始化代码
      this.map = L.map('leaflet-map', { /* ... */ });
      // 添加瓦片层
      // 加载边界
      // 添加标记
      // ...
    },

    addRegionBoundary(feature) {
      // 100+ 行边界处理代码
    },

    addPlotMarkers() {
      // 150+ 行标记处理代码
    },

    setPlotDetailPopup(show, center, data) {
      // 50+ 行弹窗定位代码
    }
  }
};
</script>
```

### 重构后 (使用服务)

```vue
<script>
import { MapServiceManager } from '@/services/map/MapServiceManager';
import { REGION_DETAIL_MAP_CONFIG } from '@/config/mapConfig';
import apiClient from '@/services/apiClient';

export default {
  data() {
    return {
      serviceManager: null,
      isLoading: true,
      showDetailPopup: false,
      popupPosition: { top: 0, left: 0 },
      popupData: null
    };
  },

  async mounted() {
    await this.initializeMap();
  },

  methods: {
    async initializeMap() {
      try {
        // 创建服务管理器
        this.serviceManager = new MapServiceManager({
          containerId: 'leaflet-map',
          config: REGION_DETAIL_MAP_CONFIG
        });

        // 初始化地图
        await this.serviceManager.initialize();

        // 设置标记点击事件
        this.serviceManager.setMarkerEventHandlers({
          onClick: this.handleMarkerClick
        });

        // 加载数据
        await this.loadRegionData();

        this.isLoading = false;
      } catch (error) {
        this.handleError('地图初始化失败', error);
      }
    },

    async loadRegionData() {
      try {
        // 加载边界数据
        const regionFeature = await this.loadRegionFeature();

        // 加载地块数据
        const tilesData = await apiClient.getPlotsList();

        // 使用服务管理器加载所有数据
        await this.serviceManager.loadRegionData(regionFeature, tilesData);
      } catch (error) {
        this.handleError('加载数据失败', error);
      }
    },

    handleMarkerClick(marker, plotData) {
      // 使用服务计算弹窗位置
      const { position } = this.serviceManager.calculatePopupPosition(
        marker.getLatLng()
      );

      this.popupPosition = position;
      this.popupData = plotData;
      this.showDetailPopup = true;
    },

    filterMapByCategory(category) {
      this.serviceManager.filterMarkers(category.type);
    },

    handleError(message, error) {
      console.error(message, error);
      this.$notify({ title: '提示', message, type: 'warning' });
    }
  },

  beforeDestroy() {
    this.serviceManager?.destroy();
  }
};
</script>
```

## 优势对比

### 代码行数减少
- **重构前**: RegionDetailMap.vue ~1,800 行
- **重构后**:
  - RegionDetailMap.vue ~300 行
  - 服务类 ~1,450 行(可复用)

### 可维护性提升
- ✅ 逻辑分离,职责清晰
- ✅ 每个服务独立测试
- ✅ 修改影响范围可控
- ✅ 代码复用性高

### 可测试性提升
```javascript
// 服务类易于单元测试
describe('BoundaryManager', () => {
  it('should add region boundary', () => {
    const manager = new BoundaryManager();
    manager.setMap(mockMap);
    const layer = manager.addRegionBoundary(mockFeature);
    expect(layer).toBeDefined();
  });
});
```

## 最佳实践

### 1. 服务生命周期管理

```javascript
export default {
  data() {
    return {
      serviceManager: null
    };
  },

  async mounted() {
    // 初始化
    this.serviceManager = new MapServiceManager({ /* ... */ });
    await this.serviceManager.initialize();
  },

  beforeDestroy() {
    // 清理资源,防止内存泄漏
    if (this.serviceManager) {
      this.serviceManager.destroy();
      this.serviceManager = null;
    }
  }
};
```

### 2. 错误处理

```javascript
async initializeMap() {
  try {
    await this.serviceManager.initialize();
  } catch (error) {
    console.error('[Map] 初始化失败:', error);
    this.handleError('地图初始化失败,请刷新页面');
  }
}
```

### 3. 配置复用

```javascript
// mapConfig.js
export const REGION_MAP_OPTIONS = {
  containerId: 'map',
  config: REGION_DETAIL_MAP_CONFIG,
  markerOptions: {
    autoFit: true,
    enableInteraction: true
  }
};

// 组件中
import { REGION_MAP_OPTIONS } from '@/config/mapConfig';

this.serviceManager = new MapServiceManager(REGION_MAP_OPTIONS);
```

### 4. 事件解耦

```javascript
// 使用服务的事件系统而非全局函数
this.serviceManager.setMarkerEventHandlers({
  onClick: this.handleMarkerClick,
  onHover: this.handleMarkerHover
});

// 而非
window.showFieldDetails = this.showFieldDetails; // ❌
```

## 迁移检查清单

- [ ] 创建 MapServiceManager 实例
- [ ] 替换 initMap() 为 serviceManager.initialize()
- [ ] 替换边界处理为 boundaryManager 调用
- [ ] 替换标记处理为 markerManager 调用
- [ ] 替换弹窗定位为 popupPositioner 调用
- [ ] 移除手动的图层管理代码
- [ ] 添加 beforeDestroy 钩子清理资源
- [ ] 测试功能是否正常
- [ ] 验证内存是否正确释放

## 常见问题

### Q: 服务类会增加性能开销吗?
A: 不会。服务类只是对现有逻辑的封装,不会引入额外的性能开销。相反,通过更好的资源管理,可能会提升性能。

### Q: 如何在多个组件间共享地图实例?
A: 可以通过 Vuex 或 provide/inject 共享 serviceManager:
```javascript
// 父组件
provide() {
  return {
    mapServiceManager: this.serviceManager
  };
}

// 子组件
inject: ['mapServiceManager']
```

### Q: 服务类支持自定义配置吗?
A: 支持。所有服务类都接受 options 参数进行自定义:
```javascript
const markerManager = new MarkerManager({
  autoFit: false,
  enableInteraction: true,
  customOption: 'value'
});
```

### Q: 如何调试服务类?
A: 所有服务类都包含详细的日志输出:
```javascript
// 开发环境下查看日志
console.log('[MapInitializer] 地图初始化完成');
console.warn('[BoundaryManager] 地图未初始化');
console.error('[MarkerManager] 添加标记失败:', error);
```

## 参考资料

- [MapInitializer.js](../src/services/map/MapInitializer.js)
- [BoundaryManager.js](../src/services/map/BoundaryManager.js)
- [MarkerManager.js](../src/services/map/MarkerManager.js)
- [PopupPositioner.js](../src/services/map/PopupPositioner.js)
- [PROJECT_ARCHITECTURE_ANALYSIS.md](./PROJECT_ARCHITECTURE_ANALYSIS.md)
