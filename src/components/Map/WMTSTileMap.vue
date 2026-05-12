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

    <div class="tile-grid" ref="tileGrid">
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
                v-if="tileTreeData[`${tile.col}_${tile.row}`]"
                class="tile-tree-layer"
                :style="treeLayerStyle"
              >
                <!-- 有冠层多边形的树：每棵树一个独立 SVG，局部定位 -->
                <svg
                  v-for="(item, pi) in tileTreeData[`${tile.col}_${tile.row}`].polygons"
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
                  v-for="item in tileTreeData[`${tile.col}_${tile.row}`].circles"
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
            tileInfo: null,
            tileBounds: null,
            tileGridRowsCache: [],
            tileLoading: false,
            tilePlaceholderError: TILE_PLACEHOLDER_ERROR,
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
            treeFilterOptions: TREE_FILTER_OPTIONS
        };
    },
    computed: {
        plotId() {
            const rawId = this.plotData?.id;
            const normalizedId = typeof rawId === 'string' ? rawId.trim() : rawId;

            // 1. 如果已经是数字ID，直接返回
            if (normalizedId !== undefined && normalizedId !== null) {
                if (typeof normalizedId === 'number') {
                    return normalizedId;
                }
                const numericId = Number(normalizedId);
                if (Number.isFinite(numericId)) {
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
            // 批次专属底图优先
            if (this.analysisTile?.layer_name) {
                return this.analysisTile.layer_name;
            }
            // 优先使用 tile_dir（CDN 存储目录），其次 layer_name
            if (this.tileInfo?.tile_dir) {
                return this.tileInfo.tile_dir;
            }
            if (this.tileInfo?.layer_name) {
                return this.tileInfo.layer_name;
            }
            // 兜底：按约定格式构造（仅使用数字 ID，避免中文导致 CDN 404）
            return `plot_${ this.plotId }`;
        },
        tilePathPrefix() {
            return this.analysisTile?.tile_path_prefix || '';
        },
        tileFormat() {
            return this.analysisTile?.tile_format || this.tileInfo?.tile_format || 'png';
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
        /** CSS scale 因子：将源像素坐标系映射到显示像素 */
        tileScale() {
            return this.tileSizePx / this.sourceTileSize;
        },

        /** 线宽补偿值：源像素单位，保证显示坐标系下约 2.5px 宽
         *  需同时除以 displayScale：treeLayerStyle 做一次 scale(tileScale)，
         *  tileGridStyle 再做一次 scale(displayScale)，两者叠乘才是最终视觉宽度。
         */
        compensatedLineWidth() {
            return Math.max(0.5, 2.5 / (this.tileScale * this.displayScale));
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
        tileSize() {
            return this.tileSizePx;
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
                transform: `scale(${ this.displayScale })`,
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease-out'
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
        /** 防抖：plotData 和 analysisTile 同帧变化时只触发一次 loadMapData */
        scheduleLoadMapData() {
            clearTimeout(this._loadMapDataTimer);
            this._loadMapDataTimer = setTimeout(() => {
                this.loadMapData();
            }, 0);
        },

        async loadMapData() {
            if (!this.analysisTile && !this.plotId) {
                return;
            }

            // 取消之前的请求
            if (this.requestAbortController) {
                this.requestAbortController.abort();
            }
            // 创建新的 AbortController
            this.requestAbortController = new AbortController();

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
                this._forceReloadTiles = true;
            } else {
                this.resetTileState();
                this._forceReloadTiles = false;
            }

            const requestToken = Symbol('tile-load');
            this.currentRequestToken = requestToken;

            try {
                this.tileLoading = true;

                if (this.analysisTile) {
                    // 批次专属底图：直接用 analysis_tile 信息，跳过 plot-tiles 接口
                    this.applyAnalysisTileInfo(this.analysisTile);
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
            this.zoomLevel = at.max_zoom_level;
            this.maxTileX = at.max_tile_x;
            this.maxTileY = at.max_tile_y;
            this.tileBounds = {
                minX: 0,
                minY: 0,
                maxX: at.max_tile_x,
                maxY: at.max_tile_y
            };
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
            this.tileInfo = null;
            this.tileBounds = null;
            this.tileGridRowsCache = [];
            this.maxTileX = null;
            this.maxTileY = null;
            this.displayZoomOffset = 0;
            this.treeFilter = 'all';
            this.filterCollapsed = false;
        },

        zoomIn() {
            if (this.canZoomIn) {
                this.displayZoomOffset = Math.min(OVER_ZOOM_MAX, this.displayZoomOffset + 1);
            }
        },

        zoomOut() {
            if (this.canZoomOut) {
                this.displayZoomOffset = Math.max(-UNDER_ZOOM_MAX, this.displayZoomOffset - 1);
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
            const coordinates = [];
            this.tileGridRowsCache.forEach(row => {
                row.forEach(tile => {
                    coordinates.push(tile);
                });
            });

            if (!coordinates.length) {
                return;
            }

            const tasks = coordinates.map(tile => this.loadTileImage(tile.col, tile.row, requestToken));
            await Promise.all(tasks);
        },

        async loadTileImage(tileCol, tileRow, requestToken) {
            const key = this.getTileKey(tileCol, tileRow);
            // 软重置模式下强制重新加载，覆盖同地块旧瓦片；普通模式跳过已加载的
            if (this.tileImages[key] && !this._forceReloadTiles) {
                return;
            }
            await this.loadTileFromCDN(tileCol, tileRow, requestToken, key);
        },

        async loadTileFromCDN(tileCol, tileRow, requestToken, key) {
            try {
                // 生成CDN URL（analysis 瓦片需传 tile_path_prefix）
                const tileUrl = getCDNTileUrl(
                    this.layerName,          // tile_dir / layer_name
                    'default',               // style
                    'GoogleMapsCompatible',  // tileMatrixSet
                    this.zoomLevel,          // tileMatrix（max_zoom_level）
                    tileRow,                 // row
                    tileCol,                 // col
                    this.tileFormat,         // tile_format from API
                    this.tilePathPrefix      // analysis_tile.tile_path_prefix（测试环境为 "test"）
                );

                // 预加载图片
                await preloadTileImage(tileUrl, this.requestAbortController?.signal);

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                // 直接使用URL（浏览器会缓存）
                this.$set(this.tileImages, key, tileUrl);
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
                }
            }
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

        handleResize() {
            clearTimeout(this._resizeDebouncTimer);
            this._resizeDebouncTimer = setTimeout(() => {
                this.recalculateTileSize();
            }, 80);
        },

        // 瓦片图片管理相关方法
        getTileImageCount(x, y) {
            // 直接从 markers 数据中统计该瓦片位置的标点数量
            const count = this.markers.filter(marker =>
                marker.zoom_level === this.zoomLevel
                && marker.tile_x === x
                && marker.tile_y === y).length;
            return count;
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

    background: #000;
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

    background: #0a0a0a;
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
