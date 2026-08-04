# 项目架构梳理

> 本文档用于后续需求开发前快速对齐项目结构、核心链路和开发注意事项。

## 1. 项目定位

本项目是“八角数据驾驶舱 / 百色农林大数据中心”PC 大屏可视化项目，主要围绕百色区域地图、地块详情、农情动态、价格、质量与生产加工数据展示。

技术栈：

- Vue 2.6
- Vue Router 3
- Vuex 3
- Vue CLI 5
- Less
- ECharts / vue-echarts
- axios 与 fetch 两套请求封装并存
- Leaflet 通过 CDN 注入为 `window.L`

核心入口：

- `src/main.js`：Vue 应用入口，注册 `router`、`store`、全局 `v-chart`
- `src/App.vue`：根容器与全局背景
- `src/router/index.js`：页面路由与登录守卫
- `public/index.html`：注入 Leaflet CSS/JS

## 2. 路由与页面链路

当前主要路由：

| 路由 | 页面组件 | 说明 |
| --- | --- | --- |
| `/login` | `src/views/Login.vue` | 登录页 |
| `/` | `src/views/Dashboard.vue` | 广西 / 百色两级总览图 |
| `/data-dashboard` | `src/views/DataDashboard.vue` | 数据驾驶舱 |
| `/detail/:region` | `src/views/DetailMap.vue` | 区域详情地图 |
| `/plot/:plotId` | `src/modules/plot/PlotDetailV2.vue` | 地块详情页 |

路由当前使用 `hash` 模式。登录态通过 `localStorage.isAuthenticated === 'true'` 判断，未登录会跳转 `/login`。

典型业务跳转链路：

1. `Dashboard.vue`
2. 默认展示广西一级地图 `MapViewGuangxi.vue`
3. 首页非阻塞调用 `api/v2/plot/list`，根据地块 `location_info` 坐标聚合到行政区
4. 有真实地块的地市可切换到该地市区县地图，目前复用 `MapViewBaise.vue` 的区县渲染能力
5. 有真实地块的区县进入 `/detail/:region`，详情页按 `cityAdcode` 加载对应地市区县边界
6. `DetailMap.vue` 渲染 `RegionDetailMap.vue`
7. 点击地块 marker 打开 `PlotDetailPopup`
8. 跳转 `/plot/:plotId?region=xxx&plotName=xxx&type=xxx`
9. `PlotDetailV2.vue` 加载地块详情、瓦片地图、左右业务面板

## 3. 目录分层

```text
src/
├── assets/                 # 静态数据与字体，包含 mapdata GeoJSON
├── components/             # 通用组件、地图组件、弹窗、图表、Dashboard 组件
├── config/                 # 地图、marker、dashboard、farmer、timing、cache 等配置
├── infrastructure/         # axios HTTP client 与较新 API 层
├── mixins/                 # 地图、图片、图表 resize、全局函数兼容等 mixin
├── modules/                # 按业务域拆分的新架构模块
│   ├── dashboard/
│   └── plot/
├── router/                 # 路由
├── services/               # 业务服务，含 fetch apiClient 与地图服务
├── store/                  # Vuex 根 store
├── styles/                 # Less 全局样式、变量、组件样式
└── utils/                  # 地图瓦片、marker、图片、坐标转换等工具
```

后续开发优先遵循现有模块边界：

- 页面级组合放 `views/`
- 可复用展示组件放 `components/`
- 地块详情相关业务放 `modules/plot/`
- 地图 Leaflet 服务能力放 `services/map/`
- 接口封装优先沿用当前业务链路已经使用的客户端
- 静态配置优先放 `config/`
- 纯函数工具放 `utils/`

## 4. 地图架构

地图相关代码主要分两类。

### 4.1 Leaflet 区域地图

相关文件：

- `src/components/Map/MapViewBaise.vue`
- `src/components/Map/MapViewGuangxi.vue`
- `src/components/Map/RegionDetailMap.vue`
- `src/services/map/MapServiceManager.js`
- `src/services/map/MapInitializer.js`
- `src/services/map/BoundaryManager.js`
- `src/services/map/MarkerManager.js`
- `src/services/map/PopupPositioner.js`
- `src/config/mapConfig.js`
- `src/config/markerConfig.js`
- `src/utils/tileDataProcessor.js`
- `src/utils/plotMarkerManager.js`

`RegionDetailMap.vue` 已经完成服务化重构，组件只负责：

- 初始化 `MapServiceManager`
- 加载区域 GeoJSON 与地块列表
- 响应 marker 点击、分类过滤、详情跳转
- 管理弹窗 UI 状态

`MapServiceManager` 负责组合以下服务：

- `MapInitializer`：创建 Leaflet 地图、底图、视图控制、销毁
- `BoundaryManager`：区域边界、遮罩、边界样式、fitBounds
- `MarkerManager`：地块 marker 创建、分类过滤、事件回调
- `PopupPositioner`：弹窗位置计算与视口修正

注意事项：

- Leaflet 不是 npm 依赖，而是 `public/index.html` 通过 CDN 注入。
- 地图服务使用 `window.L`，运行前必须确保 Leaflet CDN 加载成功。
- 首页 `/` 当前由 `Dashboard.vue` 管理地图层级，默认 `guangxi`，点击有地块的地市后切到通用 `city` 层级。
- 首页启用底部导航，`Dashboard.vue` 通过自定义 `breadcrumbItems` 传入“广西 / 当前地市”层级。
- `MapViewGuangxi.vue` 使用静态 `src/assets/mapdata/guangxi-cities.json`。
- 广西 14 个地市区县边界放在 `src/assets/mapdata/guangxi-cities/{adcode}.json`，点击地市时懒加载。
- `api/v2/plot/list` 在首页非阻塞前置加载，使用 `src/utils/adminRegionAggregator.js` 将地块坐标归属到市 / 区县。
- 市级和区县级的高亮、数量标记、下钻权限都来自 `plot/list` 坐标聚合结果，不再硬编码百色。
- 当前一级根节点是广西；后续拓展全国一级地图时，优先复用“行政区 GeoJSON + 地块坐标聚合”的规则，只替换根 GeoJSON 与层级配置。
- `MapViewBaise.vue` 仍保留部分历史全局函数逻辑。
- 地图配置集中在 `src/config/mapConfig.js`，不要在组件里散落硬编码。

### 4.2 WMTS 地块瓦片地图

相关文件：

- `src/components/Map/WMTSTileMap.vue`
- `src/components/Map/TileImageManager.vue`
- `src/components/Map/MockMarkers.vue`
- `src/utils/tileUrlHelper.js`
- `src/services/apiClient.js`

`WMTSTileMap.vue` 不是 Leaflet 地图，而是 DOM 自绘瓦片网格：

- 根据 `plotData.id` 或 `analysisTile` 加载瓦片信息
- 根据瓦片范围构建行列 DOM
- 使用 CDN URL 预加载瓦片图片
- 支持拖拽平移与 CSS scale 缩放
- 支持树冠覆盖层渲染，包括 SVG polygon 与圆形兜底
- 支持瓦片图片数量徽章和图片管理弹窗

该组件异步逻辑较重，改动时要特别注意：

- `AbortController` 用于取消旧请求
- `currentRequestToken` 用于防止旧请求回写新状态
- `analysisTile` 存在时跳过普通 `plot-tiles/info`
- 同一地块切换分析批次时保留旧瓦片以减少闪烁

## 5. 地块详情架构

地块详情新架构集中在 `src/modules/plot/`。

```text
src/modules/plot/
├── PlotDetailV2.vue
├── panels/
│   ├── StarAniseLeftPanel.vue
│   ├── FarmingDynamicsPanel.vue
│   ├── FactoryLeftPanel.vue
│   ├── FactoryRightPanel.vue
│   ├── WarehouseLeftPanel.vue
│   └── WarehouseRightPanel.vue
├── strategies/
│   ├── PlotStrategy.js
│   ├── StarAniseStrategy.js
│   ├── TeaOilStrategy.js
│   ├── FactoryStrategy.js
│   ├── WarehouseStrategy.js
│   └── index.js
└── store/
```

核心设计：

- `PlotDetailV2.vue` 是页面容器
- 父组件负责接口编排、数据转换、加载状态、弹窗状态
- 左右面板只负责展示
- 地块类型差异通过策略类处理
- `PlotStrategyFactory` 根据类型创建策略

当前地块类型映射：

| 后端字段 | 前端类型 | 策略 |
| --- | --- | --- |
| `property_category === 'factory'` | `factory` | `FactoryStrategy` |
| `property_category === 'warehouse'` | `warehouse` | `WarehouseStrategy` |
| `property_type === 'chayou_base'` | `tea-oil` | `TeaOilStrategy` |
| 其他林地 | `star-anise` | `StarAniseStrategy` |

新增地块类型建议步骤：

1. 新增策略类，继承 `PlotStrategy`
2. 在 `strategies/index.js` 注册类型
3. 新增或复用左右面板组件
4. 在 `PlotDetailV2.vue` 的类型映射和模板分支中接入
5. 确认 `config_data` 字段解析与默认值

## 6. API 架构现状

项目目前存在两套请求封装。

### 6.1 当前主业务使用：`src/services/apiClient.js`

这是 fetch 封装，主要服务 `/api/v2/*`，当前 `RegionDetailMap`、`PlotDetailV2`、`WMTSTileMap` 都在用它。

已有接口包括：

- `getPlotsList`
- `getPlotDetail`
- `getTileInfo`
- `getPlotMarkers`
- `getFarmingList`
- `getSpicePrice`
- `getSpicePriceBajiao`
- `getAnalysisList`
- `getWudaSummary`
- `getWudaTileTrees`
- `getWudaTreeDetail`

返回值通常保留后端原始结构，如 `{ code, data }`。

### 6.2 较新封装：`src/infrastructure/`

结构：

```text
src/infrastructure/
├── http/client.js
├── api/
│   ├── dashboardApi.js
│   ├── farmingApi.js
│   ├── mapApi.js
│   ├── plotApi.js
│   └── priceApi.js
└── index.js
```

`http/client.js` 基于 axios，包含：

- baseURL
- token 注入
- 401 处理
- 指数退避重试
- GET/POST/PUT/DELETE/PATCH 方法

但 `infrastructure/api/*` 目前很多接口仍是 `/api/v1/*` 或未被页面实际使用。后续开发时，不要默认认为它就是主链路。

API 开发原则：

- 改现有页面时，优先沿用该页面已经使用的客户端。
- 新增 `/api/v2/*` 地块、瓦片、分析相关接口时，优先放入 `services/apiClient.js`，除非先统一迁移 API 层。
- 如果要接入 `infrastructure`，需先核对导出方式、方法名和返回结构。
- 同一个页面内尽量不要混用两套客户端返回结构。

## 7. 状态管理

根 store：`src/store/index.js`

包含：

- 应用配置
- 用户信息
- 系统设置
- 通知
- 全局 loading
- `dashboard` 模块

Dashboard 模块：`src/modules/dashboard/store/index.js`

主要管理：

- 统计数据
- 图表控制
- 表格数据
- 图片资源

Plot 模块：`src/modules/plot/store/index.js`

包含地块详情缓存和列表状态，但当前 `PlotDetailV2.vue` 主要直接用 `apiClient` 加载，并未完全依赖该 store。

后续原则：

- 页面局部状态优先留在页面组件。
- 跨页面共享、缓存、全局控制再进入 Vuex。
- 如果引入 Vuex 模块，注意注册到根 store，否则不会生效。

## 8. 配置与资源

常用配置：

- `src/config/mapConfig.js`：地图中心点、缩放、底图、弹窗、遮罩配置
- `src/config/markerConfig.js`：Leaflet marker HTML 与 icon 配置
- `src/config/dashboardData.js`：Dashboard 共享展示数据
- `src/config/dashboardConfig.js`：DataDashboard 配置数据
- `src/config/farmerConfig.js`：地块详情默认数据与排名配置
- `src/config/timingConfig.js`：延迟、超时配置
- `src/config/cacheConfig.js`：缓存 TTL

资源目录：

- `public/images/`：大量页面背景、图标、认证图、按钮图
- `src/assets/mapdata/`：GeoJSON、CSV 等地图数据
- `src/assets/fonts/`：字体

图片引用现状：

- 大部分业务图片使用 `/images/xxx.png` 从 `public/images` 加载。
- 构建配置会处理 `src/assets` 中通过 import 引入的图片。

## 9. 全局事件与历史兼容

已有事件总线：

- `src/services/eventBus.js`
- `src/mixins/mapOperationsMixin.js`
- `src/mixins/globalFunctionMixin.js`

文档 `docs/MIGRATION_GUIDE_GLOBAL_FUNCTIONS.md` 建议用 EventBus 替代直接挂 `window`。

当前状态：

- `RegionDetailMap.vue` 已基本服务化。
- `MapViewBaise.vue` 仍注册 `window.zoomToField` 和 `window.showFieldDetails`。
- 后续涉及跨组件地图操作时，优先使用 `mapOperationsMixin` 或 `eventBus`。
- `globalFunctionMixin` 只作为旧逻辑过渡方案。

## 10. 构建与环境

脚本：

```bash
npm run serve
npm run build
npm run lint
```

环境文件：

- `.env.development`
  - `VUE_APP_API_BASE_URL=` 为空，开发环境走代理
- `.env.production`
  - `VUE_APP_API_BASE_URL=https://ms.baiyanai.cn`

开发代理：

- `vue.config.js` 中 `/api` 代理到 `http://47.109.129.99:8081`

构建注意：

- 生产构建会移除 console/debugger
- CSS 生产环境抽离
- 图片和字体会经过 webpack asset 处理
- `public/images` 下资源按公共路径直接访问

## 11. 已知风险点

这些点后续开发前需要优先核对：

1. 本地若没有 `node_modules`，`npm run lint` / `npm run serve` 会因 `vue-cli-service` 不存在而失败。
2. Leaflet 依赖 CDN，网络不可用时地图会初始化失败。
3. `services/apiClient.js` 与 `infrastructure/api/*` 并存，返回结构和接口版本不统一。
4. `RightRankingPanel.vue` 调用 `farmingApi.getFarmingList('standard')`，但当前 `infrastructure/api/farmingApi.js` 未定义该方法。
5. `src/infrastructure/api/dashboardApi.js` 存在导入方式风险，当前 `http/client.js` 是默认导出。
6. `MapViewBaise.vue` 仍有全局函数注册逻辑，未完全迁移到 EventBus。
7. `WMTSTileMap.vue` 异步、缩放、树冠覆盖逻辑复杂，改动时必须验证请求取消和旧数据回写问题。

## 12. 后续开发建议

开发前先判断需求属于哪类：

- 区域地图 / 地块 marker / 分类过滤：优先看 `RegionDetailMap.vue` 与 `services/map/`
- 地块详情左右面板：优先看 `modules/plot/panels/` 与 `strategies/`
- 地块瓦片 / 树冠 / 分析批次：优先看 `WMTSTileMap.vue` 与 `apiClient` 分析接口
- Dashboard 图表或表格：优先看 `modules/dashboard/`、`components/charts/`、`config/dashboardConfig.js`
- API 接口：先看现有页面使用 `services/apiClient.js` 还是 `infrastructure/api/*`
- 全局状态：先确认是否真的需要 Vuex，页面私有状态不要过早上 store

改动原则：

- 保持页面容器负责编排，展示组件保持轻量。
- 优先复用 `config`、`utils`、`services/map` 的已有能力。
- 不在组件里新增大量硬编码地图参数。
- 不随意把 `/api/v2/*` 迁到 `/api/v1/*` 风格 wrapper。
- 地图类改动后至少验证：初始化、marker 点击、分类过滤、详情跳转、销毁重进。
- 瓦片类改动后至少验证：切换地块、切换分析批次、缩放、拖拽、树冠点击、请求取消。
