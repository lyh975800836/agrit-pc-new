<template>
  <div class="tile-map-container">

    <!-- 树木筛选控制栏（相对 tile-map-container 定位，不受 tile-grid 滚动影响） -->
    <div
      v-if="analysisTile || hasExtraControls"
      class="map-controls"
      :class="{ 'map-controls--collapsed': filterCollapsed }"
    >
      <template v-if="analysisTile">
        <button class="filter-toggle" @click="filterCollapsed = !filterCollapsed">
          <span class="filter-toggle-icon">{{ filterCollapsed ? '▼' : '▲' }}</span>
        </button>
        <template v-if="!filterCollapsed">
          <button
            v-for="f in treeFilterOptions"
            :key="f.value"
            class="filter-btn"
            :class="{ 'filter-btn--active': treeFilter === f.value }"
            @click="treeFilter = f.value"
          >{{ f.label }}</button>
          <div class="controls-divider"></div>
          <button class="zoom-btn" :disabled="!canZoomOut" @click="zoomOut">−</button>
          <span class="zoom-label">{{ zoomLabel }}</span>
          <button class="zoom-btn" :disabled="!canZoomIn" @click="zoomIn">+</button>
        </template>
        <div v-if="hasExtraControls" class="controls-divider"></div>
      </template>

      <!-- 由父级挂载的额外控件（如巡飞节点开关），与筛选栏同处一行、整体居中 -->
      <slot name="controls-extra"></slot>
    </div>

    <div
      class="tile-grid"
      ref="tileGrid"
      @pointerdown="onPanStart"
      @pointermove="onPanMove"
      @pointerup="onPanEnd"
      @pointercancel="onPanEnd"
      @scroll="handleTileGridScroll"
    >
      <!-- 露出哪个批次由容器上这一个 class 决定，切换只 patch 这一个元素，
           上千格的显隐交给 CSS —— 别改回逐格绑定 :class -->
      <div class="tile-grid-inner" :class="activeLayerClass" :style="tileGridStyle">
        <template v-if="tileGridRows.length">
          <div
            v-for="(row, rowIndex) in tileGridRows"
            :key="`row-${rowIndex}`"
            class="tile-row"
          >
            <div
              v-for="tile in row"
              :key="tile.key"
              class="tile"
              :data-x="tile.col"
              :data-y="tile.row"
            >
              <!-- 每个已挂载批次在同一格里各占一层，只有 active 那层显示。
                   切批次不重建 DOM、不重新下图，所以能瞬时来回对比 -->
              <template v-for="(layer, li) in mountedLayers">
                <div
                  v-if="layerHasTile(layer.sourceKey, tile.key)"
                  :key="layer.sourceKey"
                  class="tile-content"
                  :class="`tile-content--l${ li }`"
                  :style="getTileBackground(layer.sourceKey, tile.key)"
                ></div>
              </template>
              <div
                v-if="!layerHasTile(activeSourceKey, tile.key)"
                class="tile-placeholder"
                :data-state="getTileState(tile.key)"
              >
                <span v-if="getTileState(tile.key) === 'error'">{{ tilePlaceholderError }}</span>
              </div>

              <!-- 瓦片图片数量徽章 -->
              <div
                v-if="getTileImageCount(tile.col, tile.row) > 0"
                class="tile-image-count"
                :id="`imageCount_${ tile.col }_${ tile.row }`"
                @click="openTileImageManager(tile.col, tile.row)"
                :title="`点击管理该瓦片的 ${ getTileImageCount(tile.col, tile.row) } 张图片`"
              >
                {{ getTileImageCount(tile.col, tile.row) }}
              </div>

              <!-- 瓦片内树冠覆盖层（源像素坐标系，由 treeLayerStyle CSS scale 统一缩放）。
                   同样按批次分层，但只挂 treeWindow 内的格子：SVG 数量只跟屏幕大小相关，
                   与地块规模和批次数都无关 -->
              <template v-for="(layer, li) in mountedLayers">
                <div
                  v-if="shouldRenderTreeLayer(layer, tile)"
                  :key="`tree-${ layer.sourceKey }`"
                  class="tile-tree-layer"
                  :class="`tile-tree-layer--l${ li }`"
                  :style="treeLayerStyleByLayer[layer.sourceKey]"
                >
                  <!-- 有冠层多边形的树：每棵树一个独立 SVG，局部定位 -->
                  <svg
                    v-for="(item, pi) in getTileTreeLayer(layer, tile).polygons"
                    :key="`poly-${item.tree.tree_id}-${pi}`"
                    :width="item.svgW"
                    :height="item.svgH"
                    class="tile-tree-svg"
                    :style="{
                      left: item.svgX + 'px',
                      top:  item.svgY + 'px',
                    }"
                    @click.stop="$emit('tree-click', item.tree)"
                  >
                    <polygon
                      v-for="(pts, ri) in item.pointsAttrs"
                      :key="ri"
                      :points="pts"
                      fill="transparent"
                      :stroke="item.color"
                      :stroke-width="getTreeStrokeWidth(layer)"
                      stroke-linejoin="round"
                      class="tile-tree-polygon"
                    />
                  </svg>

                  <!-- 无冠层几何的树：圆形 div 兜底，transform 定位 -->
                  <div
                    v-for="item in getTileTreeLayer(layer, tile).circles"
                    :key="`circle-${item.tree.tree_id}`"
                    class="tile-tree-circle"
                    :style="item.style"
                    @click.stop="$emit('tree-click', item.tree)"
                  />
                </div>
              </template>
            </div>
          </div>
        </template>

        <!-- Mock 标记点组件 - 仅在"那色"地块显示 -->
        <MockMarkers
          :plot-data="plotData"
          :tile-size="tileSize"
        />
      </div>
    </div>

    <!-- 瓦片图片管理弹窗 -->
    <TileImageManager
      ref="tileImageManager"
      :visible="showTileImageModal"
      :images="currentTileImages"
      :tile-position="currentTilePosition"
      @close="closeTileImageManager"
    />
  </div>
</template>

<script>
import TileImageManager from '@/components/Map/TileImageManager.vue';
import MockMarkers from '@/components/Map/MockMarkers.vue';
import apiClient from '@/services/apiClient';
import { getCDNTileUrl, preloadTileImage } from '@/utils/tileUrlHelper';

const TILE_PLACEHOLDER_ERROR = '加载失败';
const OVER_ZOOM_MAX  = 2; // 允许超过 maxZoomLevel 2 层（CSS scale 放大）
const UNDER_ZOOM_MAX = 4; // 允许低于 maxZoomLevel 4 层（CSS scale 缩小）
const TILE_LOAD_CONCURRENCY = 12;
const TILE_IMAGE_TIMEOUT = 12000;
const ACTIVE_VIEWPORT_TILE_BUFFER = 1;
const SETTLED_VIEWPORT_TILE_BUFFER = 4;
const SCROLL_SETTLE_DELAY = 140;
// 同时驻留 DOM 的批次图层数上限，超出按 LRU 卸载。
// 需与样式里的 @mounted-layer-limit 保持一致
const MOUNTED_LAYER_LIMIT = 4;
// 单个批次后台预载的瓦片张数上限（约一屏 + 少量余量）。
// 别改成全网格：实测约 50 张/秒，上千格 × 几个批次要好几十秒，还会把当前批次的带宽抢光
const PRELOAD_TILES_PER_LAYER = 200;
// 后台补图并发数，必须明显小于 TILE_LOAD_CONCURRENCY：
// 后台补的是"以后可能要看"的批次，抢不过当前正在看的那张
const PRELOAD_CONCURRENCY = 4;
// 树冠渲染窗口在可视区外多留几格，滚动时先有图再补框，不至于边滚边空
const TREE_WINDOW_BUFFER = 2;
// 切到没预载过的批次时最多吊着旧图多久，超时就把已下好的先亮出来
const TILE_SWAP_TIMEOUT = 2500;
// 静态常量，不随组件状态变化
const TREE_FILTER_OPTIONS = [
    { label: '全部',   value: 'all'     },
    { label: '病树',   value: 'pest'    },
    { label: '健康',   value: 'healthy' },
    { label: '疑似病', value: 'missing' }
];

// 进页面和换批次后默认落在哪个筛选上。病树是巡飞真正要看的对象，
// 默认全部会把几千棵健康树的框一起画出来，既盖住病树也拖慢渲染
const DEFAULT_TREE_FILTER = 'pest';

// 瓦片加载模式配置
// 'cdn' - 直接从CDN加载（推荐，性能更好）
// 'proxy' - 通过后端代理加载（兼容旧系统）

export default {
    name: 'WMTSTileMap',
    components: {
        TileImageManager,
        MockMarkers
    },
    props: {
        plotData: {
            type: Object,
            default: () => ({})
        },
        /** plot-analysis/summary 返回的 analysis_tile 对象；有值时用批次专属底图替代 plot_tiles */
        analysisTile: {
            type: Object,
            default: null
        },
        /** 父组件已经解析好的基础 plot_tiles 信息；传入后本组件不再重复请求 getTileInfo */
        baseTileInfo: {
            type: Object,
            default: null
        },
        /** plot-analysis/tiles/trees 返回的 tiles 数组，用于渲染树冠覆盖层 */
        treeTiles: {
            type: Array,
            default: () => []
        },
        /** 源瓦片尺寸（来自 plot-analysis/tiles/trees 响应的 source_tile_size），默认 512 */
        sourceTileSize: {
            type: Number,
            default: 512
        },
        /**
         * 父级是否往 controls-extra 插槽塞了内容
         * 没有 analysisTile 时控制栏本会整条隐藏，靠这个标记让插槽内容仍有容身之处，
         * 否则选中无专属底图的批次后开关会一起消失，用户切不回其它批次
         */
        hasExtraControls: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            zoomLevel: 4,
            markers: [],
            markersLoading: false,
            // 瓦片表的版本号。真正的表 this.tileLayers 是裸对象、刻意不做成响应式，
            // 落图后由 bumpTileRevision 每帧最多改一次这个数来触发重渲，详见 commitLayerTile
            tileRevision: 0,
            // 已挂载的批次图层，注册顺序稳定（决定 tile-content--l{i} 的下标）。
            // LRU 顺序另用非响应式的 _layerLru 记，避免每次访问都触发全网格重渲染
            mountedLayers: [],
            // 当前露出的图层
            activeSourceKey: null,
            // 正在补齐、还不够格露出的图层；期间 activeSourceKey 保持不动，旧图继续垫着
            pendingSourceKey: null,
            // 树冠只渲染这个瓦片窗口内的格子：{ minCol, maxCol, minRow, maxRow }
            treeWindow: null,
            tileInfo: null,
            tileBounds: null,
            tileGridRowsCache: [],
            tileLoading: false,
            tilePlaceholderError: TILE_PLACEHOLDER_ERROR,
            tileLoadSummary: {
                total: 0,
                loaded: 0,
                failed: 0
            },
            currentRequestToken: null,
            // 请求取消控制器 - 用于在组件销毁时取消所有待处理的请求
            requestAbortController: null,
            // 瓦片图片管理相关
            showTileImageModal: false,
            currentTilePosition: { x: 0, y: 0, z: 0 },
            currentTileImages: [],
            // 响应式瓦片尺寸
            tileSizePx: 120,
            resizeObserver: null,
            // 从API获取的最大瓦片坐标（用于动态计算网格大小）
            maxTileX: null,
            maxTileY: null,
            // 缩放偏移量（相对于 effectiveMaxZoomLevel，0 = native size）
            displayZoomOffset: 0,
            // 树木筛选：'all' | 'pest' | 'healthy' | 'missing'
            treeFilter: DEFAULT_TREE_FILTER,
            filterCollapsed: false,
            treeFilterOptions: TREE_FILTER_OPTIONS,
            // 拖拽平移状态
            panActive: false,
            panStartX: 0,
            panStartY: 0,
            panScrollLeft: 0,
            panScrollTop: 0,
            activeTileTaskKeys: {},
            visibleTileLoadGeneration: 0,
            visibleTileAbortController: null
        };
    },
    computed: {
        /**
         * 模板读瓦片用的入口
         *
         * tileLayers 是裸对象读不到变化，靠一起返回的 revision 建立渲染依赖。
         * 逻辑代码不必走这里，直接读 this.tileLayers 永远是最新的
         */
        tileStore() {
            return { revision: this.tileRevision, layers: this.tileLayers };
        },

        plotId() {
            const rawId = this.plotData?.id;
            const normalizedId = typeof rawId === 'string' ? rawId.trim() : rawId;

            // 1. 如果已经是数字ID，直接返回
            if (normalizedId !== undefined && normalizedId !== null) {
                if (typeof normalizedId === 'number') {
                    return normalizedId > 0 ? normalizedId : null;
                }
                if (typeof normalizedId === 'string' && !normalizedId) {
                    return null;
                }
                const numericId = Number(normalizedId);
                if (Number.isFinite(numericId) && numericId > 0) {
                    return numericId;
                }
            }

            // 2. 默认返回 plotData.name，不返回1000来避免不必要的API请求
            const name = typeof this.plotData?.name === 'string'
                ? this.plotData.name.trim()
                : this.plotData?.name;

            return name || null;
        },
        layerName() {
            if (this.analysisTile?.tile_dir) {
                return this.analysisTile.tile_dir;
            }
            if (this.analysisTile?.layer_name) {
                return this.analysisTile.layer_name;
            }
            if (this.tileInfo?.tile_dir) {
                return this.tileInfo.tile_dir;
            }
            if (this.tileInfo?.layer_name) {
                return this.tileInfo.layer_name;
            }
            return this.plotId ? `plot_${ this.plotId }` : null;
        },
        tilePathPrefix() {
            return this.analysisTile?.tile_path_prefix || '';
        },
        tileFormat() {
            return this.analysisTile?.tile_format || this.tileInfo?.tile_format || 'png';
        },
        /**
         * 加载调度当前服务的图层
         *
         * 优先补正在等着露出的那层，其次是已露出的那层。
         * 以图层而不是 props 为准：切换时 setActiveLayer 先于 props 赋值发生，
         * 跟着 props 走会把新批次的瓦片下进旧图层
         */
        loadTargetLayer() {
            const key = this.pendingSourceKey || this.activeSourceKey;
            if (!key) return null;
            return this.mountedLayers.find(layer => layer.sourceKey === key) || null;
        },

        tileSourceKey() {
            if (this.loadTargetLayer) {
                return this.loadTargetLayer.sourceKey;
            }
            return [
                this.layerName || '',
                this.zoomLevel,
                this.tileFormat || '',
                this.tilePathPrefix || ''
            ].join('|');
        },

        /** 有效最大缩放级别（来自批次底图或 plot_tiles） */
        effectiveMaxZoomLevel() {
            return this.analysisTile?.max_zoom_level ?? this.tileInfo?.max_zoom_level ?? this.zoomLevel;
        },
        /** 当前 CSS scale 值 */
        displayScale() {
            return Math.pow(2, this.displayZoomOffset);
        },
        canZoomIn() {
            return this.displayZoomOffset < OVER_ZOOM_MAX;
        },
        canZoomOut() {
            return this.displayZoomOffset > -UNDER_ZOOM_MAX;
        },
        zoomLabel() {
            return Math.round(this.displayScale * 100) + '%';
        },
        /** 源像素坐标系 → 显示像素的 scale 因子（已含 zoom） */
        tileScale() {
            return this.tileSize / this.sourceTileSize;
        },

        /** 线宽补偿值：源像素单位，保证视觉宽度约 2.5px（tileScale 已含 zoom 因子） */
        compensatedLineWidth() {
            return Math.max(0.5, 2.5 / this.tileScale);
        },

        /**
         * 每个图层的树冠覆盖层样式：{ [sourceKey]: style }
         *
         * 各批次的 source_tile_size 可能不同，scale 因子得各算各的。
         * 做成表而不是方法：方法每次调用都返回新对象，1350 格 × N 层会让 Vue 每帧重设 style
         */
        treeLayerStyleByLayer() {
            const result = {};
            this.mountedLayers.forEach(layer => {
                const srcPxPerTile = layer.sourceTileSize;
                const scale = this.tileSize / srcPxPerTile;
                const sz = srcPxPerTile + 'px';
                result[layer.sourceKey] = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: sz,
                    height: sz,
                    transform: `scale(${ scale })`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',  // 各子元素自行处理 pointer-events
                    '--tree-line-w': Math.max(0.5, 2.5 / scale)  // 供子元素通过 CSS 变量读取
                };
            });
            return Object.freeze(result);
        },

        /**
         * 每个图层的每瓦片树冠渲染数据：{ [sourceKey]: { "col_row": { polygons, circles } } }
         *
         * freeze 掉：几何数据只整体替换、不逐棵改，冻结后 Vue 不会为上万个点位对象
         * 挨个 defineProperty 建 Dep
         */
        treeDataByLayer() {
            const result = {};
            this.mountedLayers.forEach(layer => {
                result[layer.sourceKey] = this.buildLayerTreeData(layer);
            });
            return Object.freeze(result);
        },

        /**
         * 露出哪个图层
         *
         * 挂在网格容器上，切批次只 patch 这一个元素的 class；
         * 逐格绑定 :class 会让一次切换产生上千次 patch，正是要避免的
         */
        activeLayerClass() {
            const index = this.mountedLayers.findIndex(layer => layer.sourceKey === this.activeSourceKey);
            return index >= 0 ? `tile-grid-inner--active-l${ index }` : null;
        },

        markerCountByTile() {
            const counts = {};
            this.markers.forEach(marker => {
                if (marker.zoom_level !== this.zoomLevel) {
                    return;
                }
                const key = this.getTileKey(marker.tile_x, marker.tile_y);
                counts[key] = (counts[key] || 0) + 1;
            });
            return counts;
        },
        treeTileCoordinates() {
            if (!Array.isArray(this.treeTiles) || !this.treeTiles.length) {
                return [];
            }

            const seen = new Set();
            const coordinates = [];
            this.treeTiles.forEach(tile => {
                const col = Number(tile?.tile_x);
                const row = Number(tile?.tile_y);
                if (!Number.isFinite(col) || !Number.isFinite(row)) {
                    return;
                }

                const key = this.getTileKey(col, row);
                if (seen.has(key)) {
                    return;
                }
                seen.add(key);
                coordinates.push({ key, col, row });
            });
            return coordinates;
        },
        treeTileBounds() {
            if (!this.treeTileCoordinates.length) {
                return null;
            }

            return this.treeTileCoordinates.reduce((bounds, tile) => ({
                minX: Math.min(bounds.minX, tile.col),
                minY: Math.min(bounds.minY, tile.row),
                maxX: Math.max(bounds.maxX, tile.col),
                maxY: Math.max(bounds.maxY, tile.row)
            }), {
                minX: Infinity,
                minY: Infinity,
                maxX: -Infinity,
                maxY: -Infinity
            });
        },
        treeTileKeySet() {
            return new Set(this.treeTileCoordinates.map(tile => tile.key));
        },
        /** 显示尺寸 = 基础尺寸 × zoom 倍数，物理撑大 grid，使 overflow:auto 产生真正的可滚动溢出 */
        tileSize() {
            return this.tileSizePx * this.displayScale;
        },
        tileGridRows() {
            return this.tileGridRowsCache;
        },
        tileColumnCount() {
            // 优先使用API返回的最大瓦片X坐标
            if (Number.isFinite(this.maxTileX)) {
                return this.maxTileX + 1; // +1因为坐标是从0开始
            }
            // 其次使用计算得到的tileBounds
            if (this.tileBounds) {
                return this.tileBounds.maxX - this.tileBounds.minX + 1;
            }
            // 最后使用容器可见列数
            return this.visibleCols;
        },
        tileRowCount() {
            // 优先使用API返回的最大瓦片Y坐标
            if (Number.isFinite(this.maxTileY)) {
                return this.maxTileY + 1; // +1因为坐标是从0开始
            }
            // 其次使用计算得到的tileBounds
            if (this.tileBounds) {
                return this.tileBounds.maxY - this.tileBounds.minY + 1;
            }
            // 最后使用容器可见行数
            return this.visibleRows;
        },
        mapDimensions() {
            const sizeValue = `${ this.tileSize }px`;
            const width = this.tileColumnCount * this.tileSize;
            const height = this.tileRowCount * this.tileSize;
            return {
                'width': `${ width }px`,
                'height': `${ height }px`,
                '--tile-size': sizeValue
            };
        },
        tileGridStyle() {
            return {
                ...this.mapDimensions,
                transition: 'width 0.2s ease-out, height 0.2s ease-out'
            };
        },
        visibleCols() {
            if (!this.$refs.tileGrid) {
                return 12;
            }
            const containerWidth = this.$refs.tileGrid.clientWidth;
            return Math.ceil(containerWidth / this.tileSize) + 2;
        },
        visibleRows() {
            if (!this.$refs.tileGrid) {
                return 8;
            }
            const containerHeight = this.$refs.tileGrid.clientHeight;
            return Math.ceil(containerHeight / this.tileSize) + 2;
        }
    },
    watch: {
        plotData: {
            handler() {
                this.scheduleLoadMapData();
            },
            deep: true,
            immediate: true
        },
        analysisTile: {
            handler() {
                this.scheduleLoadMapData();
            },
            deep: true
        },
        baseTileInfo: {
            handler() {
                this.scheduleLoadMapData();
            },
            deep: true
        },
        // 缩放和 resize 都会改 tileSize，树冠窗口是按格子算的，尺寸一变就得重算
        tileSize() {
            this.$nextTick(() => this.updateTreeWindow());
        },
        treeTiles: {
            handler(newTiles) {
                if (!this.analysisTile || !Array.isArray(newTiles) || !newTiles.length) {
                    return;
                }
                this.$nextTick(() => {
                    // 只在还没按树冠范围定过位时定一次。这里原来判的是 mountedLayers.length，
                    // 但图层在 loadMapData 里就登记好了、永远非空，等于把首屏定位整个跳过 ——
                    // 地图会停在网格中心那片没有树的空地上
                    if (!this._hasCenteredOnTrees) {
                        const treeBounds = this.getTreeTileBounds();
                        if (treeBounds) {
                            this.centerTileGridOnBounds(treeBounds, 'tree-tiles');
                            this._hasCenteredOnTrees = true;
                        }
                    }
                    this.updateTreeWindow();
                    this.loadPriorityTreeTiles();
                });
            },
            deep: true
        }
    },
    created() {
        // 按批次分层的瓦片表：{ [sourceKey]: { [tileKey]: url | 'error' } }。
        // 每个批次独立成层、同时驻留，切换只是换露出哪一层。
        // 放在 created 而不是 data 里，就是为了不让 Vue 观察它
        this.tileLayers = {};
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
        this.$nextTick(() => {
            this.observeTileGrid();
            this.recalculateTileSize();
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
        clearTimeout(this._loadMapDataTimer);
        clearTimeout(this._resizeDebouncTimer);
        clearTimeout(this._visibleTileLoadTimer);
        clearTimeout(this._settledTileLoadTimer);
        clearTimeout(this._pendingLayerTimer);
        cancelAnimationFrame(this._tileRevisionFrame);
        this.abortVisibleTileLoad();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        // 取消所有待处理的请求
        if (this.requestAbortController) {
            this.requestAbortController.abort();
        }
    },
    methods: {
        // ---- 拖拽平移（pointer drag to pan） ----
        onPanStart(e) {
            // 只响应主键（鼠标左键 / 单指触摸）；忽略发生在交互子元素上的点击
            if (e.button !== undefined && e.button !== 0) return;
            if (e.target.closest('.tile-image-count, .filter-btn, .zoom-btn, .filter-toggle, .tile-tree-polygon, .tile-tree-circle')) return;

            const el = this.$refs.tileGrid;
            if (!el) return;

            this.panActive = true;
            this.panStartX = e.clientX;
            this.panStartY = e.clientY;
            this.panScrollLeft = el.scrollLeft;
            this.panScrollTop = el.scrollTop;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = 'grabbing';
        },

        onPanMove(e) {
            if (!this.panActive) return;
            const el = this.$refs.tileGrid;
            if (!el) return;

            const dx = e.clientX - this.panStartX;
            const dy = e.clientY - this.panStartY;
            el.scrollLeft = this.panScrollLeft - dx;
            el.scrollTop  = this.panScrollTop  - dy;
        },

        onPanEnd(e) {
            if (!this.panActive) return;
            this.panActive = false;
            const el = this.$refs.tileGrid;
            if (!el) return;
            el.releasePointerCapture(e.pointerId);
            el.style.cursor = '';
        },

        /** 防抖：plotData 和 analysisTile 同帧变化时只触发一次 loadMapData */
        scheduleLoadMapData() {
            clearTimeout(this._loadMapDataTimer);
            this._loadMapDataTimer = setTimeout(() => {
                this.loadMapData();
            }, 0);
        },

        async loadMapData() {
            if (!this.analysisTile && !this.plotId) {
                this.debugMap('缺少有效 plot_id，跳过瓦片接口', {
                    plotName: this.plotData?.name || '',
                    rawId: this.plotData?.id || '',
                    region: this.plotData?.district
                });
                return;
            }

            const requestToken = Symbol('tile-load');
            const previousAbortController = this.requestAbortController;
            this.currentRequestToken = requestToken;
            // 创建新的 AbortController
            this.requestAbortController = new AbortController();
            if (previousAbortController) {
                previousAbortController.abort();
            }
            this.abortVisibleTileLoad();
            this.activeTileTaskKeys = {};

            // 同一地块切换分析批次时：保留旧瓦片图片以避免闪烁，允许新图覆盖
            // 切换地块时：完全重置，防止显示上一个地块的内容
            const sameplot = this._lastLoadedPlotId !== null && this._lastLoadedPlotId === String(this.plotId);
            this._lastLoadedPlotId = String(this.plotId);
            // 已按树冠范围定过位 = 同一套网格里换批次，视角必须保持不动才谈得上来回对比。
            // 注意别拿 mountedLayers.length 当条件：图层在本方法里就登记了，一直非空，
            // 首屏那次定位会被一并跳掉
            //
            // 但网格几何变了就必须重新定位：行列号换了一套算法，同一个 scrollLeft
            // 指的已经不是同一块地。保持不动会把视角丢在新批次没有树的空地上，
            // 树冠窗口跟着算空 —— 表现就是"切到 3 月 22 日一个圈都没有"
            const gridUnchanged = this.isGridCompatible(this.tileInfo, this.analysisTile);
            const keepViewport = sameplot && this._hasCenteredOnTrees && gridUnchanged;
            if (!gridUnchanged) {
                this._hasCenteredOnTrees = false;
            }
            if (sameplot && this.analysisTile) {
                // 软重置：只重置布局和元数据，各批次图层的瓦片各自留着
                this.tileInfo = null;
                this.tileBounds = null;
                this.tileGridRowsCache = [];
                this.maxTileX = null;
                this.maxTileY = null;
                this.displayZoomOffset = 0;
                this.treeFilter = DEFAULT_TREE_FILTER;
                this.filterCollapsed = false;
                this.resetTileLoadSummary();
                this._forceReloadTiles = true;
            } else {
                this.resetTileState();
                this._forceReloadTiles = false;
            }

            try {
                this.tileLoading = true;
                this.debugMap('开始加载地图瓦片', {
                    plotId: this.plotId,
                    source: this.analysisTile ? 'analysis_tile' : (this.baseTileInfo ? 'base_tile_info' : 'plot_tiles_api'),
                    analysisLayerName: this.analysisTile?.layer_name,
                    analysisTileDir: this.analysisTile?.tile_dir,
                    baseLayerName: this.baseTileInfo?.layer_name,
                    baseTileDir: this.baseTileInfo?.tile_dir
                });

                if (this.analysisTile) {
                    // 批次专属底图：直接用 analysis_tile 信息，跳过 plot-tiles 接口
                    this.applyAnalysisTileInfo(this.analysisTile);
                } else if (this.baseTileInfo) {
                    this.applyBaseTileInfo(this.baseTileInfo);
                    await this.loadMarkers(requestToken);
                    if (this.currentRequestToken !== requestToken) {
                        return;
                    }
                } else {
                    await this.loadTileInfo(requestToken);
                    if (this.currentRequestToken !== requestToken) {
                        return;
                    }
                    await this.loadMarkers(requestToken);
                    if (this.currentRequestToken !== requestToken) {
                        return;
                    }
                }

                this.buildTileGrid();
                this.ensureCurrentLayer();
                this.debugMap('瓦片网格已构建', {
                    plotId: this.plotId,
                    layerName: this.layerName,
                    zoomLevel: this.zoomLevel,
                    tileBounds: this.tileBounds,
                    rows: this.tileGridRowsCache.length,
                    cols: this.tileGridRowsCache[0]?.length || 0,
                    tilePathPrefix: this.tilePathPrefix || ''
                });
                // 同一套网格里换批次时保持视角不动：重新居中会让来回对比的两张图对不上
                if (!keepViewport) {
                    const treeBounds = this.getTreeTileBounds();
                    this.centerTileGridOnBounds(treeBounds || this.tileBounds, 'initial');
                    // 只有按树冠范围定过位才算定完；这会儿常常还没拿到树冠瓦片，
                    // 退而求其次按整块网格居中，等 treeTiles 到了由 watcher 补一次
                    if (treeBounds) {
                        this._hasCenteredOnTrees = true;
                    }
                }
                this.$nextTick(() => {
                    this.updateTreeWindow();
                });
                this.scheduleVisibleTileLoad(120);

                // 在后台加载瓦片，不阻塞主流程
                this.loadAllTiles(requestToken).then(() => {
                    if (this.currentRequestToken === requestToken) {
                        this.updateTileMetrics();
                    }
                })
                    .catch(error => {
                    // eslint-disable-next-line no-console
                        console.error('[loadAllTiles] error:', error);
                    });
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('[loadMapData] ERROR:', error);
                throw error;
            }
            finally {
                if (this.currentRequestToken === requestToken) {
                    this.tileLoading = false;
                }
            }
        },

        /** 将 analysis_tile 对象应用为当前瓦片信息，跳过 plot-tiles 接口调用 */
        applyAnalysisTileInfo(at) {
            this.tileInfo = at;
            const maxZoom = Number(at.max_zoom_level);
            const maxTileX = Number(at.max_tile_x);
            const maxTileY = Number(at.max_tile_y);
            if (Number.isFinite(maxZoom)) {
                this.zoomLevel = maxZoom;
            }
            this.maxTileX = Number.isFinite(maxTileX) ? maxTileX : null;
            this.maxTileY = Number.isFinite(maxTileY) ? maxTileY : null;
            this.tileBounds = {
                minX: 0,
                minY: 0,
                maxX: this.maxTileX || 0,
                maxY: this.maxTileY || 0
            };
        },

        applyBaseTileInfo(tileInfo) {
            this.tileInfo = tileInfo;
            const maxZoom = Number(tileInfo.max_zoom_level);
            if (Number.isFinite(maxZoom)) {
                this.zoomLevel = maxZoom;
            }

            const maxTileX = Number(tileInfo.max_tile_x);
            const maxTileY = Number(tileInfo.max_tile_y);
            if (Number.isFinite(maxTileX)) {
                this.maxTileX = maxTileX;
            }
            if (Number.isFinite(maxTileY)) {
                this.maxTileY = maxTileY;
            }
            if (Number.isFinite(maxTileX) && Number.isFinite(maxTileY)) {
                this.tileBounds = {
                    minX: 0,
                    minY: 0,
                    maxX: maxTileX,
                    maxY: maxTileY
                };
            }
        },

        /** 解析 crown_geometry_json 为本地坐标环数组 */
        parseCrownRings(geomJson) {
            if (!geomJson) return null;
            try {
                const g = JSON.parse(geomJson);
                if (g && g.type === 'Polygon' && Array.isArray(g.coordinates)) {
                    return g.coordinates;
                }
                if (g && g.type === 'MultiPolygon' && Array.isArray(g.coordinates)) {
                    return g.coordinates.reduce((acc, poly) => acc.concat(poly), []);
                }
            } catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn('[parseCrownRings] JSON parse failed', e);
                }
            }
            return null;
        },

        resetTileState() {
            this.activeTileTaskKeys = {};
            // 换地块是硬重置，上个地块的图层一层都不该留
            this.clearPendingLayer();
            this.tileLayers = {};
            this.notifyTileStore(true);
            this.mountedLayers = [];
            this.activeSourceKey = null;
            this.treeWindow = null;
            this._layerLru = [];
            this._preloadedLayerViewports = new Map();
            // 换地块要重新按新地块的树冠范围定位
            this._hasCenteredOnTrees = false;
            this.tileInfo = null;
            this.tileBounds = null;
            this.tileGridRowsCache = [];
            this.maxTileX = null;
            this.maxTileY = null;
            this.displayZoomOffset = 0;
            this.treeFilter = DEFAULT_TREE_FILTER;
            this.filterCollapsed = false;
            this.resetTileLoadSummary();
        },

        zoomIn() {
            if (this.canZoomIn) {
                this.displayZoomOffset = Math.min(OVER_ZOOM_MAX, this.displayZoomOffset + 1);
                this.scheduleVisibleTileLoad(120);
            }
        },

        zoomOut() {
            if (this.canZoomOut) {
                this.displayZoomOffset = Math.max(-UNDER_ZOOM_MAX, this.displayZoomOffset - 1);
                this.scheduleVisibleTileLoad(120);
            }
        },

        async loadTileInfo(requestToken) {
            try {
                const result = await apiClient.getTileInfo(String(this.plotId), {
                    signal: this.requestAbortController?.signal
                });

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (result && result.code === 0 && result.data) {
                    this.tileInfo = result.data;
                    const maxZoom = Number(result.data.max_zoom_level);
                    if (Number.isFinite(maxZoom)) {
                        this.zoomLevel = maxZoom;
                    }
                    // 从API响应中获取最大瓦片坐标，用于动态计算网格大小
                    const maxTileX = Number(result.data.max_tile_x);
                    const maxTileY = Number(result.data.max_tile_y);

                    if (Number.isFinite(maxTileX)) {
                        this.maxTileX = maxTileX;
                    }
                    if (Number.isFinite(maxTileY)) {
                        this.maxTileY = maxTileY;
                    }

                    // 瓦片从(0,0)开始到(maxTileX, maxTileY)
                    if (Number.isFinite(maxTileX) && Number.isFinite(maxTileY)) {
                        this.tileBounds = {
                            minX: 0,
                            minY: 0,
                            maxX: maxTileX,
                            maxY: maxTileY
                        };
                    }
                }
            }
            catch (error) {
                // 如果请求被取消，不输出错误日志
                if (error.name === 'AbortError') {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error('加载瓦片信息失败:', error);
                if (this.currentRequestToken === requestToken) {
                    this.tileInfo = null;
                    this.tileBounds = null;
                }
            }
        },

        async loadMarkers(requestToken) {
            this.markersLoading = true;
            try {
                const result = await apiClient.getPlotMarkers(this.plotId, {
                    signal: this.requestAbortController?.signal
                });

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (result && result.code === 0) {
                    this.markers = result.data || [];
                }
                else {
                    this.markers = [];
                }
            }
            catch (error) {
                // 如果请求被取消，不输出错误日志
                if (error.name === 'AbortError') {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error('加载标点失败:', error);
                if (this.currentRequestToken === requestToken) {
                    this.markers = [];
                }
            }
            finally {
                if (this.currentRequestToken === requestToken) {
                    this.markersLoading = false;
                }
            }
        },


        buildTileGrid() {
            if (this.tileBounds) {
                const rows = [];
                for (let row = this.tileBounds.minY; row <= this.tileBounds.maxY; row += 1) {
                    const cols = [];
                    for (let col = this.tileBounds.minX; col <= this.tileBounds.maxX; col += 1) {
                        cols.push({ key: this.getTileKey(col, row), col, row });
                    }
                    rows.push(cols);
                }
                this.tileGridRowsCache = rows;
                this.recalculateTileSize();
                return;
            }

            const fallbackRows = [];
            for (let y = 0; y < this.visibleRows; y += 1) {
                const rowTiles = [];
                for (let x = 0; x < this.visibleCols; x += 1) {
                    rowTiles.push({ key: this.getTileKey(x, y), col: x, row: y });
                }
                fallbackRows.push(rowTiles);
            }
            this.tileGridRowsCache = fallbackRows;
            this.recalculateTileSize();
        },

        async loadAllTiles(requestToken) {
            const coordinates = this.getAllTileCoordinates();

            if (!coordinates.length) {
                return;
            }

            const visibleCoordinates = this.getVisibleTileCoordinates(SETTLED_VIEWPORT_TILE_BUFFER);
            this.beginTileLoadRun(coordinates);
            await this.startVisibleTileLoad(visibleCoordinates, requestToken);
            if (this.currentRequestToken !== requestToken) {
                return;
            }

            if (this.currentRequestToken === requestToken) {
                this._forceReloadTiles = false;
                this.debugMap('瓦片加载汇总', {
                    plotId: this.plotId,
                    layerName: this.layerName,
                    zoomLevel: this.zoomLevel,
                    ...this.tileLoadSummary
                });
            }
        },

        getPrioritizedTileCoordinates(coordinates) {
            const treeBounds = this.getTreeTileBounds();
            const targetBounds = treeBounds || this.tileBounds;
            if (!targetBounds) {
                return coordinates;
            }

            const centerX = (targetBounds.minX + targetBounds.maxX) / 2;
            const centerY = (targetBounds.minY + targetBounds.maxY) / 2;
            const treeKeys = this.treeTileKeySet;

            return [...coordinates].sort((a, b) => {
                const aHasTree = treeKeys.has(a.key) ? 0 : 1;
                const bHasTree = treeKeys.has(b.key) ? 0 : 1;
                if (aHasTree !== bHasTree) {
                    return aHasTree - bHasTree;
                }

                const aDistance = Math.abs(a.col - centerX) + Math.abs(a.row - centerY);
                const bDistance = Math.abs(b.col - centerX) + Math.abs(b.row - centerY);
                return aDistance - bDistance;
            });
        },

        getTreeTileCoordinates() {
            return this.treeTileCoordinates;
        },

        getTreeTileBounds() {
            return this.treeTileBounds;
        },

        centerTileGridOnBounds(bounds, reason) {
            if (!bounds) {
                return;
            }

            this.$nextTick(() => {
                const container = this.$refs.tileGrid;
                if (!container) {
                    return;
                }

                const centerX = (bounds.minX + bounds.maxX + 1) / 2 * this.tileSize;
                const centerY = (bounds.minY + bounds.maxY + 1) / 2 * this.tileSize;
                container.scrollLeft = Math.max(0, centerX - container.clientWidth / 2);
                container.scrollTop = Math.max(0, centerY - container.clientHeight / 2);
                // 视角刚挪过，树冠窗口立刻跟上。等 scroll 事件收口也能对，
                // 但那要多等一个 SCROLL_SETTLE_DELAY，首屏会先空一下
                this.updateTreeWindow();
                this.debugMap('地图视图已定位到有效区域', {
                    plotId: this.plotId,
                    reason,
                    bounds,
                    scrollLeft: container.scrollLeft,
                    scrollTop: container.scrollTop
                });
            });
        },

        loadPriorityTreeTiles() {
            if (!this.analysisTile || !this.currentRequestToken || !this.tileGridRowsCache.length) {
                return;
            }

            const coordinates = this.getVisibleTileCoordinates(SETTLED_VIEWPORT_TILE_BUFFER)
                .filter(tile => this.treeTileKeySet.has(tile.key));
            if (!coordinates.length) {
                return;
            }

            const requestToken = this.currentRequestToken;
            this.debugMap('优先加载树冠所在瓦片', {
                plotId: this.plotId,
                count: coordinates.length,
                bounds: this.getTreeTileBounds()
            });
            this.startVisibleTileLoad(coordinates, requestToken).catch(error => {
                // eslint-disable-next-line no-console
                console.warn('[WMTSTileMap] 优先瓦片加载失败', error);
            });
        },

        async loadTileImage(tileCol, tileRow, requestToken, loadSignal = null) {
            const key = this.getTileKey(tileCol, tileRow);
            if (this.isTileSettledForCurrentSource(key)) {
                this.setTileRunState(key, this.layerHasTile(this.tileSourceKey, key) ? 'loaded' : 'failed');
                this.settlePendingTile(key);
                return;
            }

            if (this.activeTileTaskKeys[key]) {
                await this.activeTileTaskKeys[key];
                if (this.isTileSettledForCurrentSource(key)) {
                    this.setTileRunState(key, this.layerHasTile(this.tileSourceKey, key) ? 'loaded' : 'failed');
                    this.settlePendingTile(key);
                    return;
                }
            }

            const task = this.loadTileFromCDN(tileCol, tileRow, requestToken, key, loadSignal);
            this.$set(this.activeTileTaskKeys, key, task);
            try {
                await task;
            } finally {
                if (this.activeTileTaskKeys[key] === task) {
                    this.$delete(this.activeTileTaskKeys, key);
                }
            }
        },

        async loadTileFromCDN(tileCol, tileRow, requestToken, key, loadSignal = null) {
            try {
                if (!this.layerName) {
                    this.commitLayerTile(this.tileSourceKey, key, 'error');
                    this.setTileRunState(key, 'failed');
                    return;
                }

                const tileUrl = this.buildTileUrl(this.layerName, tileCol, tileRow);
                if (!this._firstTileUrlLogged) {
                    this._firstTileUrlLogged = true;
                    this.debugMap('瓦片 URL 样例', {
                        plotId: this.plotId,
                        url: tileUrl
                    });
                }

                // 预加载图片
                await preloadTileImage(tileUrl, loadSignal || this.requestAbortController?.signal, TILE_IMAGE_TIMEOUT);

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                // 直接使用URL（浏览器会缓存）
                this.commitLayerTile(this.tileSourceKey, key, tileUrl);
                this.setTileRunState(key, 'loaded');
            }
            catch (error) {
                // 如果请求被取消，不输出错误日志
                if (error.name === 'AbortError' || error.message?.includes('aborted')) {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error(`从CDN获取瓦片失败 (${ this.zoomLevel }/${ tileRow }/${ tileCol }):`, error);
                if (this.currentRequestToken === requestToken) {
                    // 失败的瓦片也算"有结论"，否则一张 404 会把切换卡到超时
                    this.commitLayerTile(this.tileSourceKey, key, 'error');
                    this.setTileRunState(key, 'failed');
                }
            }
        },

        beginTileLoadRun(coordinates) {
            this._tileLoadRunStates = {};
            coordinates.forEach(tile => {
                this._tileLoadRunStates[tile.key] = null;
            });
            this.tileLoadSummary = {
                total: coordinates.length,
                loaded: 0,
                failed: 0
            };
            this._firstTileUrlLogged = false;

            // 切换只等可视区这一屏，外围 buffer 留给后台慢慢下。
            // 可视区坐标在这里算一次就存成待办，之后每张瓦片落地时 O(1) 划掉，
            // 千万别改回每张瓦片都重算——那会读 scrollLeft 强制同步布局并给上千格排序。
            // 一次切换只登记一次：滚动和外围补图会各起一轮调度并 abort 掉上一轮，
            // 跟着每轮重建待办就会一直凑不齐，最后只能吊到超时才亮图
            if (this.pendingSourceKey && !this._pendingLayerKeys) {
                this._pendingLayerKeys = new Set(
                    this.getVisibleTileCoordinates(0)
                        .map(tile => tile.key)
                        // 这层已有的格子不会再走加载流程，留着就没人划账
                        .filter(key => !this.isTileSettledForCurrentSource(key))
                );
                // 可视区全是现成的（预载命中），这一屏不用等
                this.checkPendingLayerReady();
            }
        },

        resetTileLoadSummary() {
            this._tileLoadRunStates = {};
            this.tileLoadSummary = {
                total: 0,
                loaded: 0,
                failed: 0
            };
            this._firstTileUrlLogged = false;
        },

        getAllTileCoordinates() {
            const coordinates = [];
            this.tileGridRowsCache.forEach(row => {
                row.forEach(tile => {
                    coordinates.push(tile);
                });
            });
            return coordinates;
        },

        getVisibleTileCoordinates(buffer = 0) {
            const container = this.$refs.tileGrid;
            const tileSize = this.tileSize;
            if (!container || !tileSize || !this.tileGridRowsCache.length) {
                return [];
            }

            const minCol = Math.max(this.tileBounds?.minX ?? 0, Math.floor(container.scrollLeft / tileSize) - buffer);
            const minRow = Math.max(this.tileBounds?.minY ?? 0, Math.floor(container.scrollTop / tileSize) - buffer);
            const maxCol = Math.min(
                this.tileBounds?.maxX ?? this.tileColumnCount - 1,
                Math.ceil((container.scrollLeft + container.clientWidth) / tileSize) + buffer
            );
            const maxRow = Math.min(
                this.tileBounds?.maxY ?? this.tileRowCount - 1,
                Math.ceil((container.scrollTop + container.clientHeight) / tileSize) + buffer
            );
            const centerCol = (container.scrollLeft + container.clientWidth / 2) / tileSize;
            const centerRow = (container.scrollTop + container.clientHeight / 2) / tileSize;
            const visibleMinCol = Math.floor(container.scrollLeft / tileSize);
            const visibleMinRow = Math.floor(container.scrollTop / tileSize);
            const visibleMaxCol = Math.ceil((container.scrollLeft + container.clientWidth) / tileSize);
            const visibleMaxRow = Math.ceil((container.scrollTop + container.clientHeight) / tileSize);

            const coordinates = [];
            for (let row = minRow; row <= maxRow; row += 1) {
                for (let col = minCol; col <= maxCol; col += 1) {
                    coordinates.push({ key: this.getTileKey(col, row), col, row });
                }
            }
            const treeKeys = this.treeTileKeySet;
            return coordinates.sort((a, b) => {
                const aVisible = a.col >= visibleMinCol && a.col <= visibleMaxCol && a.row >= visibleMinRow && a.row <= visibleMaxRow ? 0 : 1;
                const bVisible = b.col >= visibleMinCol && b.col <= visibleMaxCol && b.row >= visibleMinRow && b.row <= visibleMaxRow ? 0 : 1;
                if (aVisible !== bVisible) {
                    return aVisible - bVisible;
                }

                const aHasTree = treeKeys.has(a.key) ? 0 : 1;
                const bHasTree = treeKeys.has(b.key) ? 0 : 1;
                if (aHasTree !== bHasTree) {
                    return aHasTree - bHasTree;
                }

                const aDistance = Math.abs(a.col - centerCol) + Math.abs(a.row - centerRow);
                const bDistance = Math.abs(b.col - centerCol) + Math.abs(b.row - centerRow);
                return aDistance - bDistance;
            });
        },

        mergeUniqueTileCoordinates(coordinates) {
            const seen = new Set();
            const result = [];
            coordinates.forEach(tile => {
                if (!tile || seen.has(tile.key)) {
                    return;
                }
                seen.add(tile.key);
                result.push(tile);
            });
            return result;
        },

        async runTileTasksWithConcurrency(coordinates, requestToken, concurrency = TILE_LOAD_CONCURRENCY, visibleGeneration = null, loadSignal = null) {
            if (!coordinates.length) {
                return;
            }
            let cursor = 0;
            const canContinue = () => this.currentRequestToken === requestToken
                && (visibleGeneration === null || this.visibleTileLoadGeneration === visibleGeneration)
                && (!loadSignal || !loadSignal.aborted);
            const worker = async () => {
                while (cursor < coordinates.length && canContinue()) {
                    const tile = coordinates[cursor];
                    cursor += 1;
                    await this.loadTileImage(tile.col, tile.row, requestToken, loadSignal);
                }
            };

            const workers = Array.from(
                { length: Math.min(concurrency, coordinates.length) },
                () => worker()
            );
            await Promise.all(workers);
        },

        async startVisibleTileLoad(coordinates, requestToken, concurrency = TILE_LOAD_CONCURRENCY) {
            const pendingCoordinates = coordinates.filter(tile => !this.isTileSettledForCurrentSource(tile.key));
            if (!pendingCoordinates.length) {
                // 预载过的图层一张都不用下，切换不必再等
                this.checkPendingLayerReady(true);
                return;
            }

            this.abortVisibleTileLoad();
            const generation = this.nextVisibleTileLoadGeneration();
            const controller = new AbortController();
            this.visibleTileAbortController = controller;

            try {
                await this.runTileTasksWithConcurrency(
                    pendingCoordinates,
                    requestToken,
                    concurrency,
                    generation,
                    controller.signal
                );
            } finally {
                if (this.visibleTileAbortController === controller) {
                    this.visibleTileAbortController = null;
                    // 这一轮跑完且没被新一轮抢占：该下的瓦片都有结论了
                    this.checkPendingLayerReady(true);
                }
            }
        },

        abortVisibleTileLoad() {
            if (this.visibleTileAbortController) {
                this.visibleTileAbortController.abort();
                this.visibleTileAbortController = null;
            }
        },

        handleTileGridScroll() {
            this.scheduleVisibleTileLoad(16, ACTIVE_VIEWPORT_TILE_BUFFER);
            this.scheduleSettledTileLoad();
        },

        scheduleVisibleTileLoad(delay = 0, buffer = SETTLED_VIEWPORT_TILE_BUFFER) {
            clearTimeout(this._visibleTileLoadTimer);
            this._visibleTileLoadTimer = setTimeout(() => {
                this.loadVisibleTiles(buffer);
            }, delay);
        },

        scheduleSettledTileLoad() {
            clearTimeout(this._settledTileLoadTimer);
            this._settledTileLoadTimer = setTimeout(() => {
                // 停稳这一拍统一读一次布局：树冠窗口和各图层的补图都靠它
                this.updateTreeWindow();
                this.loadVisibleTiles(SETTLED_VIEWPORT_TILE_BUFFER);
                this.preloadInactiveLayers();
            }, SCROLL_SETTLE_DELAY);
        },

        /**
         * 给非当前图层补当前视口的图
         *
         * 放在滚动停稳后：当前图层先下完，别抢它的带宽
         */
        preloadInactiveLayers() {
            this.mountedLayers.forEach(layer => {
                if (layer.sourceKey === this.tileSourceKey) return;
                this.preloadLayer(layer);
            });
        },

        loadVisibleTiles(buffer = SETTLED_VIEWPORT_TILE_BUFFER) {
            if (!this.currentRequestToken || !this.tileGridRowsCache.length) {
                return;
            }

            const requestToken = this.currentRequestToken;
            const coordinates = this.getVisibleTileCoordinates(buffer)
                .filter(tile => !this.isTileSettledForCurrentSource(tile.key));
            if (!coordinates.length) {
                // 一张都不缺，等着露出的图层可以直接亮了
                this.checkPendingLayerReady(true);
                return;
            }

            this.startVisibleTileLoad(coordinates, requestToken).catch(error => {
                // eslint-disable-next-line no-console
                console.warn('[WMTSTileMap] 可视区域瓦片加载失败', error);
            });
        },

        nextVisibleTileLoadGeneration() {
            this.visibleTileLoadGeneration += 1;
            return this.visibleTileLoadGeneration;
        },

        isTileInBounds(tile, bounds) {
            if (!bounds) {
                return true;
            }
            return tile.col >= bounds.minX
                && tile.col <= bounds.maxX
                && tile.row >= bounds.minY
                && tile.row <= bounds.maxY;
        },

        /**
         * 这格这一层要不要挂树冠 DOM
         *
         * 树冠是 DOM 大头（单批次实测 3000+ 个 SVG），分层后不设限就是 ×N。
         * 靠 treeWindow 把 SVG 总数压到只跟屏幕大小相关，与地块规模、批次数都无关。
         *
         * 这里不按缩放倍率做 LOD：源瓦片 512px 显示成 80px 时倍率才 0.16，
         * 但线宽有补偿（见 treeLayerStyleByLayer），框在默认视角下是看得清的，
         * 按倍率砍会直接把默认视角的树冠全砍没。
         *
         * 全部 O(1)：这里每格每层都会调到，绝不能碰 getVisibleTileCoordinates —
         * 那个会读 scrollLeft 触发强制同步布局，正是之前点节点卡死的根因
         *
         * @param {Object} layer - 图层描述
         * @param {Object} tile - 瓦片坐标
         * @returns {boolean}
         */
        shouldRenderTreeLayer(layer, tile) {
            if (!this.isTileInTreeWindow(tile)) return false;
            if (!this.layerHasTile(layer.sourceKey, tile.key)) return false;
            return Boolean(this.getTileTreeLayer(layer, tile));
        },

        /** 树冠只渲染窗口内的格子；窗口未算出来时不挂，等滚动停稳那一拍补上 */
        isTileInTreeWindow(tile) {
            const win = this.treeWindow;
            if (!win) return false;
            return tile.col >= win.minCol
                && tile.col <= win.maxCol
                && tile.row >= win.minRow
                && tile.row <= win.maxRow;
        },

        getTileTreeLayer(layer, tile) {
            return this.treeDataByLayer[layer.sourceKey]?.[`${ tile.col }_${ tile.row }`];
        },

        getTreeStrokeWidth(layer) {
            return Math.max(0.5, 2.5 / (this.tileSize / layer.sourceTileSize));
        },

        /**
         * 重算树冠渲染窗口
         *
         * 只在滚动停稳 / 缩放 / resize 后调用——这里确实要读一次布局，
         * 但一次交互只读一次，和之前每格都读是两回事
         */
        updateTreeWindow() {
            const grid = this.$refs.tileGrid;
            if (!grid || !this.tileSize) {
                this.treeWindow = null;
                return;
            }

            const buffer = TREE_WINDOW_BUFFER;
            const minCol = Math.max(0, Math.floor(grid.scrollLeft / this.tileSize) - buffer);
            const maxCol = Math.floor((grid.scrollLeft + grid.clientWidth) / this.tileSize) + buffer;
            const minRow = Math.max(0, Math.floor(grid.scrollTop / this.tileSize) - buffer);
            const maxRow = Math.floor((grid.scrollTop + grid.clientHeight) / this.tileSize) + buffer;

            const next = this.treeWindow;
            if (next && next.minCol === minCol && next.maxCol === maxCol
                && next.minRow === minRow && next.maxRow === maxRow) {
                return;
            }
            this.treeWindow = { minCol, maxCol, minRow, maxRow };
        },

        /**
         * 算一个批次的每瓦片树冠渲染数据（源像素坐标系，不依赖 tileSizePx）
         * 由 treeLayerStyleByLayer 的 CSS scale 统一换算到显示坐标
         *
         * @param {Object} layer - 图层描述（含 analysisTile / treeTiles / sourceTileSize）
         * @returns {Object} { "${col}_${row}": { polygons: [...], circles: [...] } }
         */
        buildLayerTreeData(layer) {
            const at = layer.analysisTile;
            const treeTiles = layer.treeTiles;
            if (!at || !treeTiles || !treeTiles.length) return {};

            const pxPerLon = at.pixel_per_lon_degree;
            const pxPerLat = at.pixel_per_lat_degree;
            const srcPxPerTile = layer.sourceTileSize;
            // 在源像素坐标系计算（不依赖 tileSizePx），由 CSS transform: scale() 统一缩放
            const displayTileSize = srcPxPerTile;
            // 地面分辨率（m/px）用于圆形半径计算
            const metersPerSourcePx = pxPerLat > 0 ? 111320 / pxPerLat : 0;

            const result = {};

            for (const tile of treeTiles) {
                const tileOriginX = tile.tile_x * srcPxPerTile;
                const tileOriginY = tile.tile_y * srcPxPerTile;

                // 经纬度 → 瓦片内局部像素坐标（源像素坐标系）
                const lonLatToLocal = (lon, lat) => [
                    (lon - at.min_lon) * pxPerLon - tileOriginX,
                    (at.max_lat - lat) * pxPerLat - tileOriginY
                ];

                const polygons = [];
                const circles  = [];

                for (const tree of (tile.trees || [])) {
                    // 筛选逻辑
                    if (this.treeFilter === 'pest'    && !tree.pest) continue;
                    if (this.treeFilter === 'healthy' &&  tree.pest) continue;
                    if (this.treeFilter === 'missing' && !(tree.pest && !tree.has_detection_geometry)) continue;

                    const color = tree.pest
                        ? (tree.has_detection_geometry ? '#ff1744' : '#ff9100')
                        : '#00c853';

                    const rings = this.parseCrownRings(tree.crown_geometry_json);
                    if (rings && rings.length) {
                        // --- 多边形渲染 ---
                        const localRings = rings.map(ring =>
                            ring.map(([lon, lat]) => lonLatToLocal(lon, lat))
                        );

                        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                        localRings.forEach(ring => ring.forEach(([px, py]) => {
                            if (px < minX) minX = px; if (py < minY) minY = py;
                            if (px > maxX) maxX = px; if (py > maxY) maxY = py;
                        }));

                        const pad  = 1;
                        const svgX = minX - pad;
                        const svgY = minY - pad;
                        const svgW = (maxX - minX) + pad * 2;
                        const svgH = (maxY - minY) + pad * 2;

                        // 完全在瓦片外则跳过
                        if (svgX + svgW < 0 || svgY + svgH < 0 || svgX > displayTileSize || svgY > displayTileSize) continue;

                        const pointsAttrs = localRings.map(ring =>
                            ring.map(([px, py]) => `${ (px - svgX).toFixed(2) },${ (py - svgY).toFixed(2) }`).join(' ')
                        );

                        polygons.push({ tree, color, svgX, svgY, svgW, svgH, pointsAttrs });
                    } else {
                        // --- 圆形兜底 ---
                        // pixel_x/pixel_y 已是瓦片内局部坐标（0 ~ sourceTileSize），直接使用
                        const pointX = tree.pixel_x ?? 0;
                        const pointY = tree.pixel_y ?? 0;

                        // 用 tree_area（m²）推算冠幅半径（源像素单位），最小 6px 保证可点击
                        let crownRadius = 6;
                        if (tree.tree_area > 0 && metersPerSourcePx > 0) {
                            const radiusM = Math.sqrt(tree.tree_area / Math.PI);
                            crownRadius = Math.max(6, radiusM / metersPerSourcePx);
                        }

                        const sz = crownRadius * 2;
                        // 避免超出瓦片边界
                        const cl = Math.max(crownRadius, Math.min(displayTileSize - crownRadius, pointX));
                        const ct = Math.max(crownRadius, Math.min(displayTileSize - crownRadius, pointY));

                        circles.push({
                            tree,
                            style: {
                                position: 'absolute',
                                boxSizing: 'border-box',
                                left: 0,
                                top: 0,
                                transform: `translate(${ (cl - crownRadius).toFixed(1) }px, ${ (ct - crownRadius).toFixed(1) }px)`,
                                width: sz + 'px',
                                height: sz + 'px',
                                zIndex: 45,
                                borderRadius: '50%',
                                borderStyle: 'solid',
                                borderColor: color,
                                background: 'transparent',
                                cursor: 'pointer',
                                pointerEvents: 'auto'
                            }
                        });
                    }
                }

                if (polygons.length || circles.length) {
                    result[`${ tile.tile_x }_${ tile.tile_y }`] = { polygons, circles };
                }
            }

            // freeze 掉：几何数据只整体替换、不逐棵改，冻结后 Vue 不会为上万个点位对象
            // 挨个 defineProperty 建 Dep
            return Object.freeze(result);
        },

        hasCurrentTileImage(key) {
            return this.layerHasTile(this.activeSourceKey, key);
        },

        /**
         * 这格在「正在补齐的图层」里有结论了没
         *
         * 加载调度只服务 pendingSourceKey（没有则是 activeSourceKey）；
         * 其它图层的格子由 preloadLayer 后台补，不走这条队列
         */
        isTileSettledForCurrentSource(key) {
            return Boolean(this.tileLayers[this.tileSourceKey]?.[key]);
        },

        setTileRunState(key, nextState) {
            if (!this._tileLoadRunStates || !Object.prototype.hasOwnProperty.call(this._tileLoadRunStates, key)) {
                return;
            }

            const previousState = this._tileLoadRunStates[key];
            if (previousState === nextState) {
                return;
            }
            if (previousState === 'loaded') {
                this.tileLoadSummary.loaded = Math.max(0, this.tileLoadSummary.loaded - 1);
            }
            if (previousState === 'failed') {
                this.tileLoadSummary.failed = Math.max(0, this.tileLoadSummary.failed - 1);
            }

            this._tileLoadRunStates[key] = nextState;
            if (nextState === 'loaded') {
                this.tileLoadSummary.loaded += 1;
            }
            if (nextState === 'failed') {
                this.tileLoadSummary.failed += 1;
            }

        },

        /**
         * 这格有结论了（成功、失败都算），从待露出图层的待办里划掉
         *
         * 单独一个方法而不是挂在 setTileRunState 里：那边只认本轮调度登记过的 key，
         * 而待办是按可视区登记的，两边对不齐的格子就永远划不掉账
         *
         * @param {string} key - 瓦片键
         */
        settlePendingTile(key) {
            if (!this._pendingLayerKeys) return;
            if (!this._pendingLayerKeys.delete(key)) return;
            this.checkPendingLayerReady();
        },

        /**
         * 把一个批次登记成常驻图层，并在后台补齐它当前视口的瓦片（父级调用）
         *
         * 这是"三张图都画好、来回点即时对比"的入口：每个批次在 DOM 里各占一层，
         * 切换只改露出哪一层，不重下图、不重建 DOM。
         *
         * @param {Object} bundle - 批次整包（analysisBatchCache 的产物）
         * @param {Object} bundle.analysisTile - 批次底图元信息
         * @param {Object[]} [bundle.treeTiles] - 树冠瓦片
         * @param {number} [bundle.sourceTileSize] - 源瓦片边长
         * @returns {string|null} 图层主键；几何不兼容时返回 null（调用方应走重载路径）
         */
        registerBatchLayer(bundle) {
            const layer = this.buildLayerDescriptor(bundle);
            if (!layer) return null;

            const existing = this.mountedLayers.find(item => item.sourceKey === layer.sourceKey);
            if (existing) {
                // 同一批次重复登记（父级每次切换都会预取邻居），只更新树冠数据
                if (bundle.treeTiles && bundle.treeTiles !== existing.treeTiles) {
                    this.$set(this.mountedLayers, this.mountedLayers.indexOf(existing), layer);
                }
                this.touchLayer(layer.sourceKey);
                this.preloadLayer(layer);
                return layer.sourceKey;
            }

            // 几何对不上的批次不能共用这套行列号，硬叠会串图 —— 交给调用方重载整个网格
            const reference = this.mountedLayers[0];
            if (reference && !this.isGridCompatible(reference.analysisTile, layer.analysisTile)) {
                this.debugMap('批次几何不兼容，不参与叠层', {
                    plotId: this.plotId,
                    sourceKey: layer.sourceKey
                });
                return null;
            }

            this.mountedLayers.push(layer);
            this.tileLayers[layer.sourceKey] = {};
            this.notifyTileStore(true);
            this.touchLayer(layer.sourceKey);
            this.evictLayersBeyondLimit();
            this.preloadLayer(layer);
            return layer.sourceKey;
        },

        /**
         * 保证 props 指向的批次已登记成图层
         *
         * 渲染只认 mountedLayers + activeSourceKey，没登记就是一片空白。
         * 首屏、无专属底图的地块底图、以及父级没走 registerBatchLayer 的路径都靠它兜底
         */
        ensureCurrentLayer() {
            if (!this.layerName) return;

            const sourceKey = [
                this.layerName,
                this.zoomLevel,
                this.tileFormat || '',
                this.tilePathPrefix || ''
            ].join('|');

            const index = this.mountedLayers.findIndex(layer => layer.sourceKey === sourceKey);
            const layer = Object.freeze({
                sourceKey,
                layerName: this.layerName,
                zoom: this.zoomLevel,
                format: this.tileFormat || 'png',
                prefix: this.tilePathPrefix || '',
                analysisTile: this.analysisTile || this.tileInfo,
                treeTiles: this.treeTiles || [],
                sourceTileSize: this.sourceTileSize || 512
            });

            if (index >= 0) {
                // 树冠数据可能是底图之后才到的，补上
                if (this.mountedLayers[index].treeTiles !== layer.treeTiles) {
                    this.$set(this.mountedLayers, index, layer);
                }
            } else {
                // 网格几何变了（换地块底图、批次层级不同）：旧图层的行列号已经对不上，
                // 留着就会串图，整批卸掉重来
                const stale = this.mountedLayers.filter(item =>
                    !this.isGridCompatible(item.analysisTile, layer.analysisTile));
                if (stale.length) {
                    this.clearPendingLayer();
                    stale.forEach(item => this.unmountLayer(item.sourceKey));
                    if (!this.mountedLayers.some(item => item.sourceKey === this.activeSourceKey)) {
                        this.activeSourceKey = null;
                    }
                }
                this.mountedLayers.push(layer);
                if (!this.tileLayers[sourceKey]) {
                    this.tileLayers[sourceKey] = {};
                    this.notifyTileStore(true);
                }
            }
            this.touchLayer(sourceKey);
            this.evictLayersBeyondLimit();

            if (!this.activeSourceKey) {
                // 首屏：直接露出，瓦片下一张显一张，保持原来的渐进观感
                this.activeSourceKey = sourceKey;
                return;
            }
            this.setActiveLayer(sourceKey);
        },

        /**
         * 两个批次能不能共用同一套瓦片网格
         *
         * 叠层的前提是同一个 (col,row) 在两个批次里指向同一块地面。
         * 层级、网格尺寸、地理原点、每度像素数有一项对不上就不能叠
         *
         * @returns {boolean}
         */
        isGridCompatible(a, b) {
            if (!a || !b) return false;
            const fields = [
                'max_zoom_level',
                'max_tile_x',
                'max_tile_y',
                'min_lon',
                'max_lat',
                'pixel_per_lon_degree',
                'pixel_per_lat_degree'
            ];
            return fields.every(field => {
                const left = Number(a[field]);
                const right = Number(b[field]);
                if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
                // 经纬度和每度像素数是浮点，按相对误差比
                return Math.abs(left - right) <= Math.max(1e-9, Math.abs(left) * 1e-9);
            });
        },

        /**
         * 从批次整包构造图层描述
         *
         * @returns {Object|null} 缺图层名或层级对不上当前网格时返回 null
         */
        buildLayerDescriptor(bundle) {
            const at = bundle?.analysisTile;
            const layerName = at?.tile_dir || at?.layer_name;
            const zoom = Number(at?.max_zoom_level);
            if (!layerName || !Number.isFinite(zoom)) return null;

            const format = at.tile_format || 'png';
            const prefix = at.tile_path_prefix || '';
            return Object.freeze({
                sourceKey: `${ layerName }|${ zoom }|${ format }|${ prefix }`,
                layerName,
                zoom,
                format,
                prefix,
                analysisTile: at,
                treeTiles: bundle.treeTiles || [],
                sourceTileSize: bundle.sourceTileSize || 512
            });
        },

        /**
         * 标记图层刚被用过
         *
         * LRU 顺序记在非响应式的 _layerLru 上：mountedLayers 一动就会让上千格
         * 重新求值 v-for，而"谁最近用过"跟渲染无关
         */
        touchLayer(sourceKey) {
            if (!this._layerLru) this._layerLru = [];
            const index = this._layerLru.indexOf(sourceKey);
            if (index >= 0) this._layerLru.splice(index, 1);
            this._layerLru.push(sourceKey);
        },

        /** 超出驻留上限时按 LRU 卸载，护住 DOM 规模和内存 */
        evictLayersBeyondLimit() {
            while (this.mountedLayers.length > MOUNTED_LAYER_LIMIT) {
                const victim = (this._layerLru || []).find(key =>
                    key !== this.activeSourceKey
                    && key !== this.pendingSourceKey
                    && this.mountedLayers.some(layer => layer.sourceKey === key)
                );
                if (!victim) break;
                this.unmountLayer(victim);
            }
        },

        unmountLayer(sourceKey) {
            const index = this.mountedLayers.findIndex(layer => layer.sourceKey === sourceKey);
            if (index >= 0) this.mountedLayers.splice(index, 1);
            delete this.tileLayers[sourceKey];
            this.notifyTileStore(true);
            if (this._layerLru) {
                const lruIndex = this._layerLru.indexOf(sourceKey);
                if (lruIndex >= 0) this._layerLru.splice(lruIndex, 1);
            }
            this._preloadedLayerViewports?.delete(sourceKey);
        },

        /**
         * 后台补齐某图层当前视口的瓦片
         *
         * 只补视口、不碰全网格：实测约 50 张/秒，1350 格 × 几个批次要几十秒，
         * 还会把当前批次的带宽抢光。上限由 PRELOAD_TILES_PER_LAYER 兜底，
         * 与地块规模、批次数都无关
         *
         * @param {Object} layer - 图层描述
         */
        preloadLayer(layer) {
            if (layer.zoom !== this.zoomLevel) return;
            if (!this._preloadedLayerViewports) this._preloadedLayerViewports = new Map();

            const grid = this.$refs.tileGrid;
            // 视口没变就别重复扫；变了才值得再补一轮
            const viewportKey = grid
                ? `${ Math.round(grid.scrollLeft) }_${ Math.round(grid.scrollTop) }_${ this.tileSize }`
                : 'init';
            if (this._preloadedLayerViewports.get(layer.sourceKey) === viewportKey) return;
            this._preloadedLayerViewports.set(layer.sourceKey, viewportKey);

            const maxCol = Number(layer.analysisTile.max_tile_x);
            const maxRow = Number(layer.analysisTile.max_tile_y);
            const store = this.tileLayers[layer.sourceKey];
            if (!store) return;

            const coordinates = this.getVisibleTileCoordinates(0)
                .filter(tile => !(Number.isFinite(maxCol) && tile.col > maxCol))
                .filter(tile => !(Number.isFinite(maxRow) && tile.row > maxRow))
                .filter(tile => !store[tile.key])
                .slice(0, PRELOAD_TILES_PER_LAYER);
            if (!coordinates.length) return;

            this.runLayerPreload(layer, coordinates, viewportKey);
        },

        /**
         * 限并发地补一轮图，并在没补齐时撤掉视口标记以便重试
         *
         * 别改回一次性 forEach 起全部请求：那会把当前批次的加载队列（并发 12）挤到饿死，
         * 大量瓦片超时失败；失败又不写回状态，这层就永远差几格、切过去只能吊到超时才亮
         * —— 实测一次切换 4710ms
         *
         * @param {Object} layer - 图层描述
         * @param {Object[]} coordinates - 待补的瓦片坐标
         * @param {string} viewportKey - 本轮对应的视口指纹
         */
        async runLayerPreload(layer, coordinates, viewportKey) {
            const queue = [...coordinates];
            let failed = 0;

            const worker = async () => {
                while (queue.length) {
                    // 图层可能中途被 LRU 卸载，别再往下下
                    if (!this.tileLayers[layer.sourceKey]) return;

                    const tile = queue.shift();
                    const url = getCDNTileUrl(
                        layer.layerName,
                        'default',
                        'GoogleMapsCompatible',
                        layer.zoom,
                        tile.row,
                        tile.col,
                        layer.format,
                        layer.prefix
                    );
                    try {
                        await preloadTileImage(url, null, TILE_IMAGE_TIMEOUT);
                        this.commitLayerTile(layer.sourceKey, tile.key, url);
                    }
                    catch (error) {
                        // 后台补图失败不写 'error'：那会在这层留个永久占位，挡住重试
                        failed += 1;
                    }
                }
            };

            await Promise.all(
                Array.from({ length: Math.min(PRELOAD_CONCURRENCY, coordinates.length) }, worker)
            );

            // 没补齐就撤掉标记，让下次滚动停稳或再次切过来时重来一轮
            if (failed && this._preloadedLayerViewports?.get(layer.sourceKey) === viewportKey) {
                this._preloadedLayerViewports.delete(layer.sourceKey);
            }

            this.debugMap('批次图层后台补图', {
                plotId: this.plotId,
                sourceKey: layer.sourceKey,
                count: coordinates.length,
                failed
            });
        },

        /**
         * 把一格的结果写进对应图层
         *
         * @param {string} sourceKey - 图层主键
         * @param {string} key - 瓦片键
         * @param {string} value - 图片 URL 或 'error'
         */
        commitLayerTile(sourceKey, key, value) {
            const store = this.tileLayers[sourceKey];
            // 图层可能已被 LRU 卸载，晚到的结果直接丢弃
            if (!store) return;
            if (store[key] === value) return;

            // 裸写 + 每帧统一通知，别改回 $set：
            // 逐张触发响应式意味着每落一张图就把上千格的网格整体重排重绘一遍。
            // 实测切一次批次落 164 张瓦片 = 170 次重渲，主线程被占满 4.9s，
            // 而那 164 张全在 HTTP 缓存里、每张只要 2ms —— 时间全花在重复渲染上
            store[key] = value;
            this.notifyTileStore();

            if (sourceKey === this.tileSourceKey) {
                this.settlePendingTile(key);
            }
        },

        /**
         * 通知模板"瓦片表变了"
         *
         * 攒到下一帧的好处是重渲次数只跟帧数有关，与瓦片数、网格大小、批次数都无关
         *
         * @param {boolean} [immediate] - 图层增删、整表重置这类结构性变化要立刻通知：
         *                                tileStore 是 computed，晚一帧会让它继续缓存旧的表对象
         */
        notifyTileStore(immediate = false) {
            if (immediate) {
                cancelAnimationFrame(this._tileRevisionFrame);
                this._tileRevisionFrame = null;
                this.tileRevision += 1;
                return;
            }
            if (this._tileRevisionFrame) return;
            this._tileRevisionFrame = requestAnimationFrame(() => {
                this._tileRevisionFrame = null;
                this.tileRevision += 1;
            });
        },

        /**
         * 切到某个图层
         *
         * 已就绪的图层瞬时露出（只 patch 容器上一个 class）；
         * 还没补齐的图层先挂 pending，旧图继续垫着，等可视区凑齐或超时再露出 ——
         * 这正是原来冻结快照想达到的效果，但不用复制、不用遮罩
         *
         * @param {string} sourceKey - 目标图层主键
         * @returns {boolean} 是否已立即露出
         */
        setActiveLayer(sourceKey) {
            const layer = this.mountedLayers.find(item => item.sourceKey === sourceKey);
            if (!layer) return false;

            this.touchLayer(sourceKey);
            if (sourceKey === this.activeSourceKey) {
                this.clearPendingLayer();
                return true;
            }

            // 一次切换会走两遍这里（父级先 setActiveLayer，随后 props 更新又触发
            // loadMapData → ensureCurrentLayer）。重新 begin 会把超时定时器清了重开，
            // 等待上限直接翻倍 —— 实测 2500ms 的兜底变成 4710ms
            if (sourceKey === this.pendingSourceKey) {
                return false;
            }

            if (this.isLayerReadyForViewport(layer)) {
                this.clearPendingLayer();
                this.activeSourceKey = sourceKey;
                this.debugMap('批次切换即时完成', { plotId: this.plotId, sourceKey });
                return true;
            }

            this.beginLayerActivation(layer);
            return false;
        },

        /** 图层在当前视口是不是已经能整屏亮出来 */
        isLayerReadyForViewport(layer) {
            const store = this.tileLayers[layer.sourceKey];
            if (!store) return false;
            const maxCol = Number(layer.analysisTile.max_tile_x);
            const maxRow = Number(layer.analysisTile.max_tile_y);
            return this.getVisibleTileCoordinates(0)
                .filter(tile => !(Number.isFinite(maxCol) && tile.col > maxCol))
                .filter(tile => !(Number.isFinite(maxRow) && tile.row > maxRow))
                .every(tile => Boolean(store[tile.key]));
        },

        /** 挂起一次切换：登记待办，走正常加载队列，就绪或超时后露出 */
        beginLayerActivation(layer) {
            this.clearPendingLayer();
            this.pendingSourceKey = layer.sourceKey;
            this._pendingLayerKeys = null;

            // 个别瓦片慢或缺图时不能一直吊着旧图，到点就把已下好的先亮出来
            this._pendingLayerTimer = setTimeout(() => {
                this.finishLayerActivation('timeout');
            }, TILE_SWAP_TIMEOUT);

            this.loadVisibleTiles(ACTIVE_VIEWPORT_TILE_BUFFER);
        },

        /**
         * 待露出图层能不能收尾了
         *
         * 必须 O(1)：每张瓦片落地都会调到。之前在这里现算可视区坐标
         * （读 scrollLeft 强制同步布局 + 上千格排序），一次切换就能把主线程占满
         *
         * @param {boolean} [scheduleSettled] - 由加载调度收口触发的兜底。被 abort 和
         *   令牌作废的瓦片不会回来划账，光等待办清空可能一直差几张
         */
        checkPendingLayerReady(scheduleSettled = false) {
            if (!this.pendingSourceKey) return;

            if (!scheduleSettled) {
                const pending = this._pendingLayerKeys;
                if (!pending || pending.size) return;
            }

            this.finishLayerActivation(scheduleSettled ? 'load-settled' : 'ready');
        },

        finishLayerActivation(reason) {
            const sourceKey = this.pendingSourceKey;
            if (!sourceKey) return;

            this.clearPendingLayer();
            // 图层可能在等待期间被卸载
            if (!this.mountedLayers.some(layer => layer.sourceKey === sourceKey)) return;

            this.activeSourceKey = sourceKey;
            this.debugMap('批次切换完成', { plotId: this.plotId, reason, sourceKey });
        },

        clearPendingLayer() {
            clearTimeout(this._pendingLayerTimer);
            this._pendingLayerTimer = null;
            this._pendingLayerKeys = null;
            this.pendingSourceKey = null;
        },

        buildTileUrl(layerName, tileCol, tileRow) {
            // 图层名和格式必须来自同一个来源，否则会拿 A 批次的名字配 B 批次的前缀
            const target = this.loadTargetLayer;
            return getCDNTileUrl(
                target?.layerName || layerName,          // tile_dir / layer_name
                'default',                               // style
                'GoogleMapsCompatible',                  // tileMatrixSet
                target?.zoom ?? this.zoomLevel,          // tileMatrix（max_zoom_level）
                tileRow,                                 // row
                tileCol,                                 // col
                target?.format || this.tileFormat,       // tile_format from API
                target?.prefix ?? this.tilePathPrefix    // analysis_tile.tile_path_prefix（测试环境为 "test"）
            );
        },

        getTileKey(tileCol, tileRow) {
            return `${ tileCol }-${ tileRow }`;
        },

        /** 某图层的某格有没有可用图（'error' 不算） */
        layerHasTile(sourceKey, key) {
            if (!sourceKey) return false;
            const value = this.tileStore.layers[sourceKey]?.[key];
            return Boolean(value) && value !== 'error';
        },

        getTileBackground(sourceKey, key) {
            const imageSrc = this.tileStore.layers[sourceKey]?.[key];
            if (!imageSrc || imageSrc === 'error') {
                return {};
            }
            return {
                backgroundImage: `url(${ imageSrc })`
            };
        },

        getTileState(key) {
            return this.tileStore.layers[this.activeSourceKey]?.[key] || null;
        },

        updateTileMetrics() {
            // 瓦片指标发送给父组件
            this.$emit('tile-metrics', {
                plotId: this.plotId,
                zoomLevel: this.zoomLevel,
                tileCount: Object.keys(this.tileLayers[this.activeSourceKey] || {}).length,
                declaredTileCount: this.tileInfo?.tile_count || null
            });
        },

        debugMap(message, payload = {}) {
            if (process.env.NODE_ENV === 'production') {
                return;
            }
            // eslint-disable-next-line no-console
            console.info(`[WMTSTileMap] ${ message }`, payload);
        },

        handleResize() {
            clearTimeout(this._resizeDebouncTimer);
            this._resizeDebouncTimer = setTimeout(() => {
                this.recalculateTileSize();
            }, 80);
        },

        // 瓦片图片管理相关方法
        getTileImageCount(x, y) {
            return this.markerCountByTile[this.getTileKey(x, y)] || 0;
        },

        async openTileImageManager(x, y) {
            this.currentTilePosition = {
                x,
                y,
                z: this.zoomLevel
            };
            this.showTileImageModal = true;

            // 加载该瓦片的图片列表
            await this.loadTileImages(x, y);

            // 加载图片后，自动跳转到预览模式，显示第一张图片
            this.$nextTick(() => {
                if (this.$refs.tileImageManager && this.currentTileImages.length > 0) {
                    // 调用 TileImageManager 的 openPreview 方法，直接显示预览
                    this.$refs.tileImageManager.openPreview(0);
                }
            });
        },

        loadTileImages(x, y) {
            // 直接从 markers 数据中筛选该瓦片位置的所有标点
            this.currentTileImages = this.markers.filter(marker =>
                marker.zoom_level === this.zoomLevel
                && marker.tile_x === x
                && marker.tile_y === y);
        },

        closeTileImageManager() {
            this.showTileImageModal = false;
            this.currentTileImages = [];
        },

        observeTileGrid() {
            const container = this.$refs.tileGrid;
            if (!container || typeof ResizeObserver === 'undefined') {
                return;
            }
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            this.resizeObserver = new ResizeObserver(() => {
                // 防抖：避免 ResizeObserver 连续触发导致 tileTreeData 级联重算
                clearTimeout(this._resizeDebouncTimer);
                this._resizeDebouncTimer = setTimeout(() => {
                    this.recalculateTileSize();
                }, 80);
            });
            this.resizeObserver.observe(container);
        },

        recalculateTileSize() {
            this.$nextTick(() => {
                const container = this.$refs.tileGrid;
                const columns = (this.tileGridRows && this.tileGridRows[0]?.length) || this.tileColumnCount || 0;
                if (!container || !columns) {
                    return;
                }
                let availableWidth = container.clientWidth;

                // 如果容器宽度无法获取，尝试从父容器或视口宽度计算
                if (!availableWidth || availableWidth < 100) {
                    const parentWidth = container.parentElement?.clientWidth;
                    if (parentWidth && parentWidth > 100) {
                        availableWidth = parentWidth;
                    }
                    else {
                        // 最后的fallback：使用视口宽度的80%
                        availableWidth = Math.max(window.innerWidth * 0.8, 400);
                    }
                }

                const newSize = Math.max(80, availableWidth / columns);
                if (Math.abs(newSize - this.tileSizePx) > 0.5) {
                    this.tileSizePx = newSize;
                }
            });
        }
    }
};
</script>

<style scoped>
.tile-map-container {
    position: relative;
    width: 100%;
    height: 100%;
    font-family: "Helvetica Neue", Arial, sans-serif;

    background: transparent;
}

.tile-grid {
    position: relative;
    overflow: auto;
    width: 100%;
    height: 100%;
    cursor: grab;

    background: transparent;
}

.tile-grid-inner {
    position: relative;
    display: inline-block;
    /* 不设 min-height: 100%，避免缩小时布局盒子撑满容器导致空白区域 */
    min-width: min-content;
}

.tile-row {
    display: flex;
    white-space: nowrap;
}

.tile {
    position: relative;
    flex-shrink: 0;
    width: var(--tile-size, 120px);
    height: var(--tile-size, 120px);

    background: transparent;
}

/* 每个已挂载批次在同一格里各占一层，同一时刻只露出一层 */
.tile-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
}

/* 非 active 的批次图层留在 DOM 里但不渲染。
   用 display:none 而不是 opacity:0：上千格常驻绘制会一直吃合成开销。
   不加过渡——A/B 对比要的就是瞬时闪变，渐变反而看不出差异。

   露出哪一层由 .tile-grid-inner 上的一个 class 决定：
   切批次只 patch 这一个元素，上千格的显隐全交给下面这些后代选择器。
   千万别改回逐格绑定 :class，那是 1350 × N 次 patch */
.tile-content,
.tile-tree-layer {
    display: none;
}

/* 下标与 mountedLayers 一一对应。规则条数须与 JS 里的 MOUNTED_LAYER_LIMIT 一致，
   加图层上限时记得在这里补一组（本块是纯 CSS，没有循环可用） */
.tile-grid-inner--active-l0 .tile-content--l0,
.tile-grid-inner--active-l0 .tile-tree-layer--l0,
.tile-grid-inner--active-l1 .tile-content--l1,
.tile-grid-inner--active-l1 .tile-tree-layer--l1,
.tile-grid-inner--active-l2 .tile-content--l2,
.tile-grid-inner--active-l2 .tile-tree-layer--l2,
.tile-grid-inner--active-l3 .tile-content--l3,
.tile-grid-inner--active-l3 .tile-tree-layer--l3 {
    display: block;
}

.tile-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: rgba(10, 20, 32, .22);
}

.tile-placeholder span {
    font-size: 12px;
    color: #ff6b6b;
}

/* 筛选控制栏 — 绝对定位居中，悬浮在瓦片格顶部，不受左右面板遮挡影响 */
.map-controls {
    position: absolute;
    top: 8px;
    left: 50%;
    z-index: 30;
    display: flex;
    align-items: center;
    padding: 3px 6px;
    border: 1px solid rgba(198, 156, 109, 0.3);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.65);
    gap: 6px;
    transform: translateX(-50%);
    white-space: nowrap;
    pointer-events: auto;
    backdrop-filter: blur(4px);
}

/* 展开/收起触发按钮 */
.filter-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}

.filter-toggle-icon {
    font-size: 9px;
    color: rgba(198, 156, 109, 0.8);
    transition: color 0.15s;
}

.filter-toggle:hover .filter-toggle-icon {
    color: #c69c6d;
}

.filter-btn {
    padding: 2px 10px;
    border: 1px solid rgba(198, 156, 109, 0.4);
    border-radius: 3px;
    font-size: 11px;
    color: rgba(198, 156, 109, 0.7);
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        border-color: #c69c6d;
        color: #c69c6d;
    }
}

.filter-btn--active {
    border-color: #c69c6d;
    color: #0d2a28;
    background: #c69c6d;
}

/* 筛选区与缩放区之间的分隔线 */
.controls-divider {
    width: 1px;
    height: 16px;
    background: rgba(198, 156, 109, 0.3);
}

.zoom-btn {
    width: 24px;
    height: 24px;
    border: 1px solid rgba(198, 156, 109, 0.4);
    border-radius: 3px;
    font-size: 16px;
    line-height: 1;
    color: #c69c6d;
    background: transparent;
    cursor: pointer;
    transition: all 0.15s;

    &:hover:not(:disabled) {
        border-color: #c69c6d;
        background: rgba(198, 156, 109, 0.15);
    }

    &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
    }
}

.zoom-label {
    font-size: 11px;
    color: rgba(198, 156, 109, 0.7);
    min-width: 36px;
    text-align: center;
}

/* 树冠覆盖层容器：源像素坐标系，CSS scale 统一缩放。
   显隐规则见上面 .tile-content 处的图层可见性 mixin */
.tile-tree-layer {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none; /* 各子元素自行处理 */
}

/* 瓦片内树冠 SVG（每棵树独立定位，局部坐标） */
.tile-tree-svg {
    position: absolute;
    overflow: visible;
    cursor: pointer;
    pointer-events: all; /* SVG bbox 即点击区域，无需依赖 polygon 冒泡 */
    z-index: 45;
}

.tile-tree-polygon {
    transition: stroke-width 0.15s ease;

    &:hover {
        stroke-width: calc(var(--tree-line-w, 3) * 1.6);
    }
}

/* 圆形兜底（无冠层几何）*/
.tile-tree-circle {
    position: absolute;
    box-sizing: border-box;
    z-index: 45;
    /* border-width 由 --tree-line-w CSS 变量（来自 treeLayerStyle）控制，补偿 CSS scale 压缩 */
    border-width: calc(var(--tree-line-w, 3) * 1px);
    pointer-events: auto;
    transition: border-width 0.15s ease;

    &:hover {
        border-width: calc(var(--tree-line-w, 3) * 1.6px) !important;
    }
}

/* 瓦片图片数量徽章样式 */
.tile-image-count {
    position: absolute;
    z-index: 10;
    right: 6px;
    bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 37px;
    height: 37px;
    font-size: 14px;
    font-weight: 700;

    color: #fff;
    background: url("/public/images/mark-point.png") no-repeat center/contain;
    transition: transform .2s ease, filter .2s ease;
    cursor: pointer;

    filter: drop-shadow(0 2px 6px #ff475773);
}

.tile-image-count:hover {
    transform: scale(1.08);
    filter: drop-shadow(0 4px 10px #ff47578c);
}

</style>
