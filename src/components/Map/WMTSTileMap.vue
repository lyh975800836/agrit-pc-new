<template>
  <div class="tile-map-container">

    <!-- 树木筛选控制栏（相对 tile-map-container 定位，不受 tile-grid 滚动影响） -->
    <div v-if="analysisTile" class="map-controls" :class="{ 'map-controls--collapsed': filterCollapsed }">
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
      <div class="tile-grid-inner" :style="tileGridStyle">
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
              <div
                v-if="hasTileImage(tile.key)"
                class="tile-content"
                :style="getTileBackground(tile.key)"
              ></div>
              <div v-else class="tile-placeholder" :data-state="getTileState(tile.key)">
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

              <!-- 瓦片内树冠覆盖层（源像素坐标系，由 treeLayerStyle CSS scale 统一缩放） -->
              <div
                v-if="shouldRenderTreeLayer(tile)"
                class="tile-tree-layer"
                :style="treeLayerStyle"
              >
                <!-- 有冠层多边形的树：每棵树一个独立 SVG，局部定位 -->
                <svg
                  v-for="(item, pi) in getTileTreeLayer(tile).polygons"
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
                    :stroke-width="treeStrokeWidth"
                    stroke-linejoin="round"
                    class="tile-tree-polygon"
                  />
                </svg>

                <!-- 无冠层几何的树：圆形 div 兜底，transform 定位 -->
                <div
                  v-for="item in getTileTreeLayer(tile).circles"
                  :key="`circle-${item.tree.tree_id}`"
                  class="tile-tree-circle"
                  :style="item.style"
                  @click.stop="$emit('tree-click', item.tree)"
                />
              </div>
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
// 静态常量，不随组件状态变化
const TREE_FILTER_OPTIONS = [
    { label: '全部',   value: 'all'     },
    { label: '病树',   value: 'pest'    },
    { label: '健康',   value: 'healthy' },
    { label: '疑似病', value: 'missing' }
];

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
        /** wuda-summary 返回的 analysis_tile 对象；有值时用批次专属底图替代 plot_tiles */
        analysisTile: {
            type: Object,
            default: null
        },
        /** 父组件已经解析好的基础 plot_tiles 信息；传入后本组件不再重复请求 getTileInfo */
        baseTileInfo: {
            type: Object,
            default: null
        },
        /** wuda-tiles/trees 返回的 tiles 数组，用于渲染树冠覆盖层 */
        treeTiles: {
            type: Array,
            default: () => []
        },
        /** 源瓦片尺寸（来自 wuda-tiles/trees 响应的 source_tile_size），默认 512 */
        sourceTileSize: {
            type: Number,
            default: 512
        }
    },
    data() {
        return {
            zoomLevel: 4,
            markers: [],
            markersLoading: false,
            tileImages: {},
            tileImageSources: {},
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
            treeFilter: 'all',
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
        tileSourceKey() {
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

        /** 树冠覆盖层样式：在源像素坐标系中绝对定位，统一 scale 缩放 */
        treeLayerStyle() {
            const sz = this.sourceTileSize + 'px';
            return {
                position: 'absolute',
                top: 0,
                left: 0,
                width: sz,
                height: sz,
                transform: `scale(${this.tileScale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',  // 各子元素自行处理 pointer-events
                '--tree-line-w': this.compensatedLineWidth  // 供子元素通过 CSS 变量读取
            };
        },

        /** SVG 多边形 stroke-width（源像素单位） */
        treeStrokeWidth() {
            return this.compensatedLineWidth;
        },

        /**
         * 每瓦片树冠渲染数据（源像素坐标系，不依赖 tileSizePx）
         * 由 treeLayerStyle 的 CSS scale 统一换算到显示坐标
         * 返回 { "${col}_${row}": { polygons: [...], circles: [...] } }
         */
        tileTreeData() {
            if (!this.analysisTile || !this.treeTiles || !this.treeTiles.length) return {};

            const at = this.analysisTile;
            const pxPerLon = at.pixel_per_lon_degree;
            const pxPerLat = at.pixel_per_lat_degree;
            const srcPxPerTile = this.sourceTileSize;
            // 在源像素坐标系计算（不依赖 tileSizePx），由 CSS transform: scale(tileScale) 统一缩放
            const displayTileSize = srcPxPerTile;
            // 地面分辨率（m/px）用于圆形半径计算
            const metersPerSourcePx = pxPerLat > 0 ? 111320 / pxPerLat : 0;

            const result = {};

            for (const tile of this.treeTiles) {
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
                            ring.map(([px, py]) => `${(px - svgX).toFixed(2)},${(py - svgY).toFixed(2)}`).join(' ')
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
                                transform: `translate(${(cl - crownRadius).toFixed(1)}px, ${(ct - crownRadius).toFixed(1)}px)`,
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
                    result[`${tile.tile_x}_${tile.tile_y}`] = { polygons, circles };
                }
            }

            return result;
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
        treeTiles: {
            handler(newTiles) {
                if (!this.analysisTile || !Array.isArray(newTiles) || !newTiles.length) {
                    return;
                }
                this.$nextTick(() => {
                    const treeBounds = this.getTreeTileBounds();
                    if (treeBounds) {
                        this.centerTileGridOnBounds(treeBounds, 'tree-tiles');
                    }
                    this.loadPriorityTreeTiles();
                });
            },
            deep: true
        }
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
            if (sameplot && this.analysisTile) {
                // 软重置：只重置布局和元数据，保留 tileImages
                this.tileInfo = null;
                this.tileBounds = null;
                this.tileGridRowsCache = [];
                this.maxTileX = null;
                this.maxTileY = null;
                this.displayZoomOffset = 0;
                this.treeFilter = 'all';
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
                this.debugMap('瓦片网格已构建', {
                    plotId: this.plotId,
                    layerName: this.layerName,
                    zoomLevel: this.zoomLevel,
                    tileBounds: this.tileBounds,
                    rows: this.tileGridRowsCache.length,
                    cols: this.tileGridRowsCache[0]?.length || 0,
                    tilePathPrefix: this.tilePathPrefix || ''
                });
                this.centerTileGridOnBounds(this.getTreeTileBounds() || this.tileBounds, 'initial');
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
            this.tileImages = {};
            this.tileImageSources = {};
            this.activeTileTaskKeys = {};
            this.tileInfo = null;
            this.tileBounds = null;
            this.tileGridRowsCache = [];
            this.maxTileX = null;
            this.maxTileY = null;
            this.displayZoomOffset = 0;
            this.treeFilter = 'all';
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
                this.setTileRunState(key, this.hasTileImage(key) ? 'loaded' : 'failed');
                return;
            }

            if (this.activeTileTaskKeys[key]) {
                await this.activeTileTaskKeys[key];
                if (this.isTileSettledForCurrentSource(key)) {
                    this.setTileRunState(key, this.hasTileImage(key) ? 'loaded' : 'failed');
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
                    this.$set(this.tileImages, key, 'error');
                    this.$set(this.tileImageSources, key, this.tileSourceKey);
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
                this.$set(this.tileImages, key, tileUrl);
                this.$set(this.tileImageSources, key, this.tileSourceKey);
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
                    this.$set(this.tileImages, key, 'error');
                    this.$set(this.tileImageSources, key, this.tileSourceKey);
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
                this.loadVisibleTiles(SETTLED_VIEWPORT_TILE_BUFFER);
            }, SCROLL_SETTLE_DELAY);
        },

        loadVisibleTiles(buffer = SETTLED_VIEWPORT_TILE_BUFFER) {
            if (!this.currentRequestToken || !this.tileGridRowsCache.length) {
                return;
            }

            const requestToken = this.currentRequestToken;
            const coordinates = this.getVisibleTileCoordinates(buffer)
                .filter(tile => !this.isTileSettledForCurrentSource(tile.key));
            if (!coordinates.length) {
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

        shouldRenderTreeLayer(tile) {
            return this.hasCurrentTileImage(tile.key) && Boolean(this.getTileTreeLayer(tile));
        },

        getTileTreeLayer(tile) {
            return this.tileTreeData[`${ tile.col }_${ tile.row }`];
        },

        hasCurrentTileImage(key) {
            return this.hasTileImage(key) && this.tileImageSources[key] === this.tileSourceKey;
        },

        isTileSettledForCurrentSource(key) {
            return Boolean(this.tileImages[key]) && this.tileImageSources[key] === this.tileSourceKey;
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

        buildTileUrl(layerName, tileCol, tileRow) {
            return getCDNTileUrl(
                layerName,               // tile_dir / layer_name
                'default',               // style
                'GoogleMapsCompatible',  // tileMatrixSet
                this.zoomLevel,          // tileMatrix（max_zoom_level）
                tileRow,                 // row
                tileCol,                 // col
                this.tileFormat,         // tile_format from API
                this.tilePathPrefix      // analysis_tile.tile_path_prefix（测试环境为 "test"）
            );
        },

        getTileKey(tileCol, tileRow) {
            return `${ tileCol }-${ tileRow }`;
        },

        hasTileImage(key) {
            const value = this.tileImages[key];
            return value && value !== 'error';
        },

        getTileBackground(key) {
            const imageSrc = this.tileImages[key];
            if (!imageSrc || imageSrc === 'error') {
                return {};
            }
            return {
                backgroundImage: `url(${ imageSrc })`
            };
        },

        getTileState(key) {
            return this.tileImages[key] || null;
        },

        updateTileMetrics() {
            // 瓦片指标发送给父组件
            this.$emit('tile-metrics', {
                plotId: this.plotId,
                zoomLevel: this.zoomLevel,
                tileCount: Object.keys(this.tileImages).length,
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

.tile-content {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
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

/* 树冠覆盖层容器：源像素坐标系，CSS scale 统一缩放 */
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
