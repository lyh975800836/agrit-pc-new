<template>
  <div class="tile-map-container">
    <div class="tile-grid" ref="tileGrid">
      <div class="tile-grid-inner" :style="mapDimensions">
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
            </div>
          </div>
        </template>
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

const TILE_PLACEHOLDER_ERROR = '加载失败';

export default {
    name: 'WMTSTileMap',
    components: {
        TileImageManager
    },
    props: {
        plotData: {
            type: Object,
            default: () => ({})
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
            maxTileY: null
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
            // 直接使用 plotData 中的 layer（从路由传递过来）
            if (this.plotData?.layer) {
                return this.plotData.layer;
            }

            // 备选方案：从 tileInfo 中获取
            if (this.tileInfo?.layer_name) {
                return this.tileInfo.layer_name;
            }

            // 最后的备选方案
            const plotName = this.plotData?.name || '雷哥';
            return `plot_${ this.plotId }_${ plotName }`;
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
                this.loadMapData();
            },
            deep: true
        }
    },
    mounted() {
        this.loadMapData();
        window.addEventListener('resize', this.handleResize);
        this.$nextTick(() => {
            this.observeTileGrid();
            this.recalculateTileSize();
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
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
        async loadMapData() {
            if (!this.plotId) {
                return;
            }

            this.resetTileState();

            // 取消之前的请求
            if (this.requestAbortController) {
                this.requestAbortController.abort();
            }
            // 创建新的 AbortController
            this.requestAbortController = new AbortController();

            const requestToken = Symbol('tile-load');
            this.currentRequestToken = requestToken;

            try {
                this.tileLoading = true;
                await this.loadTileInfo(requestToken);
                if (this.currentRequestToken !== requestToken) {
                    return;
                }
                await this.loadMarkers(requestToken);
                if (this.currentRequestToken !== requestToken) {
                    return;
                }
                this.buildTileGrid();
                await this.loadAllTiles(requestToken);
                if (this.currentRequestToken !== requestToken) {
                    return;
                }
                this.updateTileMetrics();
            }
            finally {
                if (this.currentRequestToken === requestToken) {
                    this.tileLoading = false;
                }
            }
        },

        resetTileState() {
            this.tileImages = {};
            this.tileInfo = null;
            this.tileBounds = null;
            this.tileGridRowsCache = [];
            this.maxTileX = null;
            this.maxTileY = null;
        },

        async loadTileInfo(requestToken) {
            try {
                const isProduction = process.env.NODE_ENV === 'production';
                const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
                // eslint-disable-next-line no-console
                console.log(`loadTileInfo: requesting tile info for plotId=${ this.plotId }`);
                // 改为GET请求，避免CORS preflight
                const response = await fetch(`${ baseUrl }/api/v1/geoprocessing/plot-tiles/info?plot_id=${ String(this.plotId) }`, {
                    signal: this.requestAbortController?.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${ response.status }`);
                }

                const result = await response.json();
                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                // eslint-disable-next-line no-console
                console.log(`loadTileInfo response code=${ result?.code }, has data=${ !!result?.data }`);
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
                        // eslint-disable-next-line no-console
                        console.log(`loadTileInfo: tileBounds=${ JSON.stringify(this.tileBounds) }`);
                    }
                }
                else {
                    // eslint-disable-next-line no-console
                    console.warn(`loadTileInfo: No data in response for plotId=${ this.plotId }`);
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
                const isProduction = process.env.NODE_ENV === 'production';
                const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
                const response = await fetch(`${ baseUrl }/api/v1/markers/plot/${ this.plotId }`, {
                    signal: this.requestAbortController?.signal
                });
                const result = await response.json();

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (response.ok && result.code === 0) {
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
                // eslint-disable-next-line no-console
                console.log(`buildTileGrid created ${ rows.length } rows x ${ rows[0]?.length || 0 } cols from tileBounds for plotId ${ this.plotId }`);
                this.recalculateTileSize();
                return;
            }

            // eslint-disable-next-line no-console
            console.warn(`buildTileGrid: tileBounds is null for plotId ${ this.plotId }, using fallback grid`);
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
            if (this.tileImages[key]) {
                return;
            }

            const isProduction = process.env.NODE_ENV === 'production';
            const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
            const params = new URLSearchParams({
                service: 'WMTS',
                request: 'GetTile',
                version: '1.0.0',
                layer: this.layerName,
                style: 'default',
                tilematrixset: 'GoogleMapsCompatible',
                tilematrix: this.zoomLevel,
                tilerow: tileRow,
                tilecol: tileCol,
                format: 'image/png'
            });
            const tileUrl = `${ baseUrl }/api/v1/wmts/request?${ params }`;

            try {
                const response = await fetch(tileUrl, {
                    signal: this.requestAbortController?.signal
                });
                const result = await response.json();

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (result && result.data) {
                    const imageSrc = `data:${ result.content_type };base64,${ result.data }`;
                    this.$set(this.tileImages, key, imageSrc);
                }
                else {
                    this.$set(this.tileImages, key, 'error');
                }
            }
            catch (error) {
                // 如果请求被取消，不输出错误日志
                if (error.name === 'AbortError') {
                    return;
                }
                // eslint-disable-next-line no-console
                console.error(`获取瓦片失败 (${ this.zoomLevel }/${ tileRow }/${ tileCol }):`, error);
                if (this.currentRequestToken === requestToken) {
                    this.$set(this.tileImages, key, 'error');
                }
            }
        },

        getZoomLimit(zoom) {
            return (2 ** zoom) - 1;
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
            this.recalculateTileSize();
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
                this.recalculateTileSize();
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
                    } else {
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
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    font-family: "Helvetica Neue", Arial, sans-serif;
    background: transparent;
}

.tile-grid {
    position: relative;
    overflow: auto;
    flex: 1;
    width: 100%;
    height: 100%;
    background: transparent;
}

.tile-grid-inner {
    position: relative;
    display: inline-block;
    min-width: min-content;
    min-height: 100%;
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
    background: url('/public/images/mark-point.png') no-repeat center/contain;
    transition: transform .2s ease, filter .2s ease;
    cursor: pointer;

    filter: drop-shadow(0 2px 6px #ff475773);
}

.tile-image-count:hover {
    transform: scale(1.08);
    filter: drop-shadow(0 4px 10px #ff47578c);
}

/* 瓦片图片管理弹窗样式 */
.tile-image-modal {
    position: relative;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    width: 50%;
    max-width: 92vw;
    max-height: 88vh;
    padding: 26px 12px 32px;
    border: 1px solid #4cfcea40;

    color: #c7b299;
    border-radius: 12px;
    background: linear-gradient(135deg, #102838f2 0%, #081c24f2 100%);
    box-shadow: 0 18px 46px #000000b8;

    gap: 20px;
}

.tile-image-modal .modal-body {
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
    flex: 1;
    flex-direction: column;
    max-height: calc(88vh - 120px);

    gap: 20px;
    scrollbar-width: none;
}

.tile-image-modal .modal-body::-webkit-scrollbar {
    display: none;
}

/* 通用按钮样式 */
.btn {
    padding: 8px 16px;
    border: none;
    font-size: 14px;

    border-radius: 4px;
    transition: all .2s;
    cursor: pointer;
}

.btn-primary {
    color: #fff;
    background: #667eea;
}

.btn-primary:hover {
    background: #5568d3;
}

/* 模态框基础样式 */
.modal-overlay {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #00000080;
}

.modal-content {
    border-radius: 12px;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px 14px 24px;
}

.modal-header h3 {
    margin: 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 20px;
    font-weight: 500;

    color: #c7b299;
}

.close-btn {
    position: absolute;
    top: 18px;
    right: 22px;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid #c7b29973;
    font-size: 18px;
    line-height: 26px;
    text-align: center;

    color: #c7b299;
    border-radius: 50%;
    background: #081c24a6;
    transition: transform .2s ease, background .2s ease;
    cursor: pointer;
}

.close-btn:hover {
    background: #c7b2992e;
    transform: scale(1.05);
}

/* 预览视图样式 */
.preview-view {
    display: flex;
    flex-direction: column;

    border-radius: 12px;
    background: #0c26368c;

    gap: 18px;
}

.preview-navigation {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 300px;
    max-height: 52vh;
}

.preview-image-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    border-radius: 12px;
}

.preview-image-container img {
    width: 100%;
    height: 100%;

    border-radius: 8px;
    box-shadow: 0 10px 24px #00000073;
    cursor: zoom-in;
}

.preview-navigation .nav-prev {
    left: 12px;
}

.preview-navigation .nav-next {
    right: 12px;
}

.fullscreen-image-overlay {
    position: fixed;
    z-index: 1500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    background: #040c121a;

    backdrop-filter: blur(2px);
    inset: 0;
}

.fullscreen-image-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;

    gap: 28px;
}

.fullscreen-image-overlay img {
    max-width: 88vw;
    max-height: 88vh;

    border-radius: 12px;
    box-shadow: 0 18px 48px #0009;
    cursor: zoom-out;

    object-fit: contain;
}

.fullscreen-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border: 1px solid #c7b29973;
    font-size: 26px;
    line-height: 1;

    color: #c7b299;
    border-radius: 50%;
    background: #081c24b3;
    transition: transform .2s ease, background .2s ease;
    cursor: pointer;
}

.fullscreen-nav-btn:disabled {
    opacity: .35;
    cursor: not-allowed;
}

.fullscreen-nav-btn:hover:not(:disabled) {
    background: #c7b29933;
    transform: scale(1.08);
}

.fullscreen-nav-btn:active:not(:disabled) {
    transform: scale(.95);
}

.fullscreen-nav-prev,
.fullscreen-nav-next {
    flex-shrink: 0;
}

.fullscreen-close-btn {
    position: absolute;
    top: 26px;
    right: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid #c7b29973;
    font-size: 24px;
    line-height: 1;

    color: #c7b299;
    border-radius: 50%;
    background: #081c24b3;
    transition: transform .2s ease, background .2s ease;
    cursor: pointer;
}

.fullscreen-close-btn:hover {
    background: #c7b29933;
    transform: scale(1.05);
}

.fullscreen-close-btn:active {
    transform: scale(.92);
}

.nav-btn {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border: 1px solid #c7b29959;
    font-size: 20px;

    color: #c7b299;
    border-radius: 50%;
    background: #081c24a6;
    cursor: pointer;
}

.nav-btn:disabled {
    opacity: .35;
    cursor: not-allowed;
}

.preview-navigation .nav-btn {
    position: absolute;
    z-index: 10;
    top: 50%;
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border: 1px solid #c7b29959;
    font-size: 20px;

    color: #c7b299;
    border-radius: 50%;
    background: #081c24a6;
    transform: translateY(-50%);
    cursor: pointer;
}

.preview-actions {
    display: flex;
    justify-content: center;
    margin-top: 6px;
}

.btn-secondary {
    padding: 8px 24px;
    border: 1px solid #c7b29959;

    color: #c7b299;
    border-radius: 6px;
    background: #081c24a6;
    transition: background .2s ease, transform .2s ease;
}

.btn-secondary:hover {
    background: #c7b2992e;
    transform: translateY(-1px);
}

/* 农事建议样式 */
.farming-suggestion {
    position: relative;
    margin-top: 14px;
    padding: 24px 32px;

    color: #c7b299;
    border-radius: 18px;
    background-color: #081c24a6;
    background-image: url('/public/images/ai-advice.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

.suggestion-header {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;

    color: #c7b299;
}

.suggestion-title {
    position: absolute;
    top: 10px;
    left: 1.5vw;
    display: flex;
    flex-direction: column;
    font-size: 38px;
    line-height: 1.1;
    text-align: center;
}

.suggestion-title span {
    display: inline-block;
    white-space: nowrap;
}

.suggestion-title span + span {
    margin-top: 6px;
}

.suggestion-content {
    padding-left: 9vw;
    line-height: 1.8;
}

.suggestion-content p {
    margin: 6px 0;
    padding-left: 4px;
    font-size: 18px;
    color: #c7b299;
}

.suggestion-content p:first-child {
    margin-top: 0;
}

.suggestion-content p:last-child {
    margin-bottom: 0;
}

.suggestion-back {
    position: absolute;
    top: 50%;
    right: 20px;
    width: 160px;
    height: 50px;
    font-weight: 600;
    line-height: 50px;
    text-align: center;

    color: #d8af87;
    border-radius: 14px;
    background-image: url('/public/images/back-list.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
    text-shadow: 0 1px 1px #ffffff59;
    transform: translate(0, -40%);
    cursor: pointer;
}
</style>
