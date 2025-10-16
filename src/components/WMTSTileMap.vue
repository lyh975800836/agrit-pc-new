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
    <div v-if="showTileImageModal" class="modal-overlay" @click="closeTileImageManager">
      <div class="modal-content tile-image-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <span v-if="!showImagePreview">瓦片图片</span>
            <span v-else>图片预览 ({{ currentPreviewIndex + 1 }}/{{ currentTileImages.length }})</span>
            - {{ currentTilePosition.z }}/{{ currentTilePosition.x }}/{{ currentTilePosition.y }}
          </h3>
          <button class="close-btn" @click="closeTileImageManager">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 网格视图 -->
          <div v-if="!showImagePreview">
            <!-- 图片网格 -->
            <div class="tile-images-grid">
              <div
                v-for="(image, index) in currentTileImages"
                :key="image.id"
                class="tile-image-item"
                @click="openImagePreview(index)"
              >
                <img :src="image.image_url" :alt="`图片 ${image.id}`" />
              </div>
            </div>

            <div v-if="currentTileImages.length === 0" class="empty-message">
              该瓦片暂无图片
            </div>
          </div>

          <!-- 预览视图 -->
          <div v-else class="preview-view">
            <div class="preview-navigation">
              <button
                class="nav-btn nav-prev"
                @click.stop="previousImage"
                :disabled="currentPreviewIndex === 0"
                title="上一张 (←)"
              >
                ←
              </button>

              <div class="preview-image-container">
                <img
                  :src="currentPreviewImage.image_url"
                  :alt="`图片 ${currentPreviewImage.id}`"
                  class="marker-image"
                />
              </div>

              <button
                class="nav-btn nav-next"
                @click.stop="nextImage"
                :disabled="currentPreviewIndex === currentTileImages.length - 1"
                title="下一张 (→)"
              >
                →
              </button>
            </div>

            <div class="marker-details">
              <p><strong>上传时间:</strong> {{ currentPreviewImage.created_at || '未知' }}</p>
              <p><strong>描述:</strong> {{ currentPreviewImage.description || '暂无描述' }}</p>
            </div>

            <div class="preview-actions">
              <button @click="closeImagePreview" class="btn btn-secondary">
                ← 返回列表
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const TILE_PLACEHOLDER_ERROR = '加载失败';
const EARTH_RADIUS_METERS = 6378137; // WGS84
const MU_IN_SQUARE_METERS = 666.6666667;
const PRESET_TILE_DIMENSIONS = {
    1000: { cols: 10, rows: 6, offsetX: 0, offsetY: 0 },
    1001: { cols: 9, rows: 10, offsetX: -2, offsetY: 0 },
    1002: { cols: 12, rows: 6, offsetX: -2, offsetY: 0 }
};

export default {
    name: 'WMTSTileMap',
    props: {
        regionName: {
            type: String,
            default: ''
        },
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
            selectedMarker: null,
            tileImages: {},
            tileAreas: {},
            tileInfo: null,
            tileBounds: null,
            tileGridRowsCache: [],
            tileLoading: false,
            totalTileAreaSquareMeters: 0,
            tilePlaceholderError: TILE_PLACEHOLDER_ERROR,
            currentRequestToken: null,
            // 瓦片图片管理相关
            showTileImageModal: false,
            currentTilePosition: { x: 0, y: 0, z: 0 },
            currentTileImages: [],
            // 图片预览相关
            showImagePreview: false,
            currentPreviewIndex: 0
        };
    },
    computed: {
        plotId() {
            const mapping = {
                '雷哥': 1000,
                '宏哥': 1001,
                '千户十亩-大楞乡基地': 1000,
                '巴塘2': 1002,
                '巴塘': 1002,
                '千户十亩-田林县那色村巴塘八角基地': 1002
            };

            const rawId = this.plotData?.id;
            const normalizedId = typeof rawId === 'string' ? rawId.trim() : rawId;

            if (normalizedId !== undefined && normalizedId !== null) {
                if (typeof normalizedId === 'number') {
                    return normalizedId;
                }
                const numericId = Number(normalizedId);
                if (Number.isFinite(numericId)) {
                    return numericId;
                }
                if (mapping[normalizedId]) {
                    return mapping[normalizedId];
                }
                if (typeof normalizedId === 'string' && normalizedId.includes('巴塘')) {
                    return 1002;
                }
            }

            const name = typeof this.plotData?.name === 'string'
                ? this.plotData.name.trim()
                : this.plotData?.name;

            if (name && mapping[name]) {
                return mapping[name];
            }
            if (name && name.includes && name.includes('巴塘')) {
                return 1002;
            }

            return 1000;
        },
        layerName() {
            if (this.tileInfo?.layer_name) {
                return this.tileInfo.layer_name;
            }
            const plotName = this.plotData?.name || '雷哥';
            return `plot_${ this.plotId }_${ plotName }`;
        },
        visibleMarkers() {
            return this.markers.filter(marker => marker.zoom_level === this.zoomLevel);
        },
        tileSize() {
            return 120;
        },
        tileOffsetX() {
            return this.tileBounds ? this.tileBounds.minX : 0;
        },
        tileOffsetY() {
            return this.tileBounds ? this.tileBounds.minY : 0;
        },
        tileGridRows() {
            return this.tileGridRowsCache;
        },
        tileColumnCount() {
            if (this.tileBounds) {
                return this.tileBounds.maxX - this.tileBounds.minX + 1;
            }
            return this.visibleCols;
        },
        tileRowCount() {
            if (this.tileBounds) {
                return this.tileBounds.maxY - this.tileBounds.minY + 1;
            }
            return this.visibleRows;
        },
        mapDimensions() {
            if (!this.tileBounds) {
                return {};
            }
            const width = this.tileColumnCount * this.tileSize;
            const height = this.tileRowCount * this.tileSize;
            return {
                width: `${ width }px`,
                height: `${ height }px`
            };
        },
        totalTileAreaMu() {
            return this.totalTileAreaSquareMeters / MU_IN_SQUARE_METERS;
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
        },
        currentPreviewImage() {
            if (!this.currentTileImages.length || this.currentPreviewIndex < 0) {
                return {};
            }
            return this.currentTileImages[this.currentPreviewIndex] || {};
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
            this.handleResize();
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    methods: {
        async loadMapData() {
            if (!this.plotId) {
                return;
            }

            this.resetTileState();
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
                this.applyPresetDimensions();
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
            this.tileAreas = {};
            this.tileInfo = null;
            this.tileBounds = null;
            this.tileGridRowsCache = [];
            this.totalTileAreaSquareMeters = 0;
        },

        async loadTileInfo(requestToken) {
            try {
                const isProduction = process.env.NODE_ENV === 'production';
                const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
                const response = await fetch(`${ baseUrl }/api/v1/geoprocessing/plot-tiles/info`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ plot_id: String(this.plotId) })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${ response.status }`);
                }

                const result = await response.json();
                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (result && result.code === 0 && result.data) {
                    this.tileInfo = result.data;
                    const maxZoom = Number(result.data.max_zoom_level);
                    if (Number.isFinite(maxZoom)) {
                        this.zoomLevel = maxZoom;
                    }
                    this.tileBounds = this.computeTileBounds(result.data);
                }
            }
            catch (error) {
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
                const response = await fetch(`${ baseUrl }/api/v1/markers/plot/${ this.plotId }`);
                const result = await response.json();

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (response.ok && result.code === 0) {
                    this.markers = result.data || [];
                    this.extendBoundsByMarkers();
                }
                else {
                    this.markers = [];
                }
            }
            catch (error) {
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

        computeTileBounds(info) {
            if (!info) {
                return null;
            }

            const zoom = Number.isFinite(info.max_zoom_level) ? info.max_zoom_level : this.zoomLevel;
            const limit = this.getZoomLimit(zoom);

            const lonMin = Number(info.min_lon);
            const lonMax = Number(info.max_lon);
            const latMin = Number(info.min_lat);
            const latMax = Number(info.max_lat);

            if ([lonMin, lonMax, latMin, latMax].some(value => Number.isNaN(value))) {
                return null;
            }

            let minX = this.clampTileIndex(Math.min(this.lonToTileX(lonMin, zoom), this.lonToTileX(lonMax, zoom)), limit);
            let maxX = this.clampTileIndex(Math.max(this.lonToTileX(lonMin, zoom), this.lonToTileX(lonMax, zoom)), limit);
            let minY = this.clampTileIndex(Math.min(this.latToTileY(latMin, zoom), this.latToTileY(latMax, zoom)), limit);
            let maxY = this.clampTileIndex(Math.max(this.latToTileY(latMin, zoom), this.latToTileY(latMax, zoom)), limit);

            if (maxX < minX) {
                [minX, maxX] = [maxX, minX];
            }
            if (maxY < minY) {
                [minY, maxY] = [maxY, minY];
            }

            const declaredTileCount = Number(info.tile_count);
            const currentCols = maxX - minX + 1;
            const currentRows = maxY - minY + 1;

            if (Number.isFinite(declaredTileCount) && declaredTileCount > 0) {
                const aspect = currentCols / (currentRows || 1);
                let desiredCols = Math.max(currentCols, Math.round(Math.sqrt(declaredTileCount * aspect)));
                let desiredRows = Math.max(currentRows, Math.ceil(declaredTileCount / desiredCols));

                desiredCols = Math.min(desiredCols, limit + 1);
                desiredRows = Math.min(desiredRows, limit + 1);

                const colsIncrease = desiredCols - currentCols;
                if (colsIncrease > 0) {
                    const expandLeft = Math.floor(colsIncrease / 2);
                    const expandRight = colsIncrease - expandLeft;
                    minX = this.clampTileIndex(minX - expandLeft, limit);
                    maxX = this.clampTileIndex(maxX + expandRight, limit);

                    let width = maxX - minX + 1;
                    if (width < desiredCols) {
                        const deficit = desiredCols - width;
                        const moveLeft = Math.min(deficit, minX);
                        minX = this.clampTileIndex(minX - moveLeft, limit);
                        maxX = this.clampTileIndex(minX + desiredCols - 1, limit);
                        width = maxX - minX + 1;
                        if (width < desiredCols) {
                            maxX = this.clampTileIndex(maxX + (desiredCols - width), limit);
                            minX = this.clampTileIndex(maxX - desiredCols + 1, limit);
                        }
                    }
                }

                const rowsIncrease = desiredRows - currentRows;
                if (rowsIncrease > 0) {
                    const expandTop = Math.floor(rowsIncrease / 2);
                    const expandBottom = rowsIncrease - expandTop;
                    minY = this.clampTileIndex(minY - expandTop, limit);
                    maxY = this.clampTileIndex(maxY + expandBottom, limit);

                    let height = maxY - minY + 1;
                    if (height < desiredRows) {
                        const deficit = desiredRows - height;
                        const moveUp = Math.min(deficit, minY);
                        minY = this.clampTileIndex(minY - moveUp, limit);
                        maxY = this.clampTileIndex(minY + desiredRows - 1, limit);
                        height = maxY - minY + 1;
                        if (height < desiredRows) {
                            maxY = this.clampTileIndex(maxY + (desiredRows - height), limit);
                            minY = this.clampTileIndex(maxY - desiredRows + 1, limit);
                        }
                    }
                }
            }

            return {
                minX,
                maxX,
                minY,
                maxY
            };
        },

        applyPresetDimensions() {
            const preset = PRESET_TILE_DIMENSIONS[this.plotId];
            if (!preset) {
                return;
            }

            const limit = this.getZoomLimit(this.zoomLevel);
            const { cols } = preset;
            const { rows } = preset;

            const offsetX = Number(preset.offsetX) || 0;
            const offsetY = Number(preset.offsetY) || 0;

            let minX = (this.tileBounds ? this.tileBounds.minX : 0) + offsetX;
            let minY = (this.tileBounds ? this.tileBounds.minY : 0) + offsetY;

            minX = this.clampTileIndex(minX, limit);
            minY = this.clampTileIndex(minY, limit);

            let maxX = Math.min(minX + cols - 1, limit);
            if (maxX - minX + 1 < cols) {
                minX = Math.max(0, maxX - cols + 1);
                maxX = Math.min(minX + cols - 1, limit);
            }

            let maxY = Math.min(minY + rows - 1, limit);
            if (maxY - minY + 1 < rows) {
                minY = Math.max(0, maxY - rows + 1);
                maxY = Math.min(minY + rows - 1, limit);
            }

            this.tileBounds = {
                minX,
                maxX,
                minY,
                maxY
            };
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
                const response = await fetch(tileUrl);
                const result = await response.json();

                if (this.currentRequestToken !== requestToken) {
                    return;
                }

                if (result && result.data) {
                    const imageSrc = `data:${ result.content_type };base64,${ result.data }`;
                    this.$set(this.tileImages, key, imageSrc);
                    const tileArea = this.calculateTileArea(tileCol, tileRow, this.zoomLevel);
                    this.$set(this.tileAreas, key, tileArea);
                }
                else {
                    this.$set(this.tileImages, key, 'error');
                    this.$delete(this.tileAreas, key);
                }
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error(`获取瓦片失败 (${ this.zoomLevel }/${ tileRow }/${ tileCol }):`, error);
                if (this.currentRequestToken !== requestToken) {
                    return;
                }
                this.$set(this.tileImages, key, 'error');
                this.$delete(this.tileAreas, key);
            }
        },

        calculateTileArea(tileCol, tileRow, zoom) {
            const bounds = this.getTileBounds(tileCol, tileRow, zoom);
            const lat1 = this.degToRad(bounds.minLat);
            const lat2 = this.degToRad(bounds.maxLat);
            const lon1 = this.degToRad(bounds.minLon);
            const lon2 = this.degToRad(bounds.maxLon);

            const area = Math.abs(
                (Math.sin(lat2) - Math.sin(lat1)) * (lon2 - lon1) * (EARTH_RADIUS_METERS ** 2)
            );
            return area;
        },

        getTileBounds(col, row, zoom) {
            const north = this.tile2lat(row, zoom);
            const south = this.tile2lat(row + 1, zoom);
            const west = this.tile2lon(col, zoom);
            const east = this.tile2lon(col + 1, zoom);
            return {
                minLat: Math.min(north, south),
                maxLat: Math.max(north, south),
                minLon: Math.min(west, east),
                maxLon: Math.max(west, east)
            };
        },

        extendBoundsByMarkers() {
            if (!this.markers || !this.markers.length) {
                this.applyPresetDimensions();
                return;
            }

            const limit = this.getZoomLimit(this.zoomLevel);
            const numericX = this.markers
                .map(marker => Number(marker.tile_x))
                .filter(value => Number.isFinite(value));
            const numericY = this.markers
                .map(marker => Number(marker.tile_y))
                .filter(value => Number.isFinite(value));

            if (!numericX.length || !numericY.length) {
                this.applyPresetDimensions();
                return;
            }

            const minX = Math.max(0, Math.min(...numericX));
            const maxX = Math.min(limit, Math.max(...numericX));
            const minY = Math.max(0, Math.min(...numericY));
            const maxY = Math.min(limit, Math.max(...numericY));

            if (!this.tileBounds) {
                this.tileBounds = {
                    minX,
                    maxX,
                    minY,
                    maxY
                };
            }
            else {
                this.tileBounds = {
                    minX: Math.min(this.tileBounds.minX, minX),
                    maxX: Math.max(this.tileBounds.maxX, maxX),
                    minY: Math.min(this.tileBounds.minY, minY),
                    maxY: Math.max(this.tileBounds.maxY, maxY)
                };
            }

            this.applyPresetDimensions();
        },

        lonToTileX(lon, zoom) {
            return Math.floor(((lon + 180) / 360) * (2 ** zoom));
        },

        latToTileY(lat, zoom) {
            const latRad = this.degToRad(lat);
            const normalized = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
            return Math.floor(normalized * (2 ** zoom));
        },

        clampTileIndex(value, limit) {
            if (!Number.isFinite(value)) {
                return 0;
            }
            return Math.max(0, Math.min(limit, value));
        },

        tile2lon(x, z) {
            return (x / (2 ** z)) * 360 - 180;
        },

        tile2lat(y, z) {
            const n = Math.PI - (2 * Math.PI * y) / (2 ** z);
            return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
        },

        degToRad(value) {
            return (value * Math.PI) / 180;
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

        getMarkerStyle(marker) {
            if (!marker) {
                return {};
            }

            const { tileSize } = this;
            const scale = tileSize / 256 / 2;

            const tileX = Number(marker.tile_x);
            const tileY = Number(marker.tile_y);
            const pixelX = Number.isFinite(marker.pixel_x) ? marker.pixel_x : 256;
            const pixelY = Number.isFinite(marker.pixel_y) ? marker.pixel_y : 256;

            if (!Number.isFinite(tileX) || !Number.isFinite(tileY)) {
                return {};
            }

            const offsetX = (tileX - this.tileOffsetX) * tileSize;
            const offsetY = (tileY - this.tileOffsetY) * tileSize;

            return {
                left: `${ offsetX + pixelX * scale }px`,
                top: `${ offsetY + pixelY * scale }px`
            };
        },

        updateTileMetrics() {
            const values = Object.values(this.tileAreas);
            const totalSquareMeters = values.reduce((sum, area) => sum + area, 0);
            this.totalTileAreaSquareMeters = totalSquareMeters;

            this.$emit('tile-metrics', {
                plotId: this.plotId,
                zoomLevel: this.zoomLevel,
                tileCount: values.length,
                totalAreaSquareMeters: totalSquareMeters,
                totalAreaMu: totalSquareMeters / MU_IN_SQUARE_METERS,
                declaredTileCount: this.tileInfo?.tile_count || null
            });
        },

        showMarkerImage(marker) {
            this.selectedMarker = marker;
        },

        closeImageViewer() {
            this.selectedMarker = null;
        },

        handleResize() {
            this.$forceUpdate();
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
            this.showImagePreview = false;
            this.currentPreviewIndex = 0;

            // 加载该瓦片的图片列表
            await this.loadTileImages(x, y);

            // 添加键盘事件监听
            document.addEventListener('keydown', this.handleKeyboardNavigation);
        },

        async loadTileImages(x, y) {
            // 直接从 markers 数据中筛选该瓦片位置的所有标点
            this.currentTileImages = this.markers.filter(marker =>
                marker.zoom_level === this.zoomLevel
                && marker.tile_x === x
                && marker.tile_y === y);
        },

        closeTileImageManager() {
            this.showTileImageModal = false;
            this.showImagePreview = false;
            this.currentTileImages = [];
            this.currentPreviewIndex = 0;
            // 移除键盘事件监听
            document.removeEventListener('keydown', this.handleKeyboardNavigation);
        },

        // 图片预览相关方法
        openImagePreview(index) {
            this.currentPreviewIndex = index;
            this.showImagePreview = true;
        },

        closeImagePreview() {
            this.showImagePreview = false;
            this.currentPreviewIndex = 0;
        },

        previousImage() {
            if (this.currentPreviewIndex > 0) {
                this.currentPreviewIndex -= 1;
            }
        },

        nextImage() {
            if (this.currentPreviewIndex < this.currentTileImages.length - 1) {
                this.currentPreviewIndex += 1;
            }
        },

        handleKeyboardNavigation(event) {
            if (!this.showTileImageModal) {
                return;
            }

            // 如果在预览模式
            if (this.showImagePreview) {
                switch (event.key) {
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                    case 'Escape':
                        this.closeImagePreview();
                        break;
                    default:
                        break;
                }
            }
            else {
                // 如果在网格模式，Esc 关闭整个弹窗
                if (event.key === 'Escape') {
                    this.closeTileImageManager();
                }
            }
        }
    }
};
</script>

<style scoped>
.tile-map-container {
    width: 100%;
    height: 100%;
    font-family: "Helvetica Neue", Arial, sans-serif;
    background: transparent;
}

.tile-grid {
    position: relative;
    overflow: auto;
    height: 100%;
    background: transparent;
}

.tile-grid-inner {
    position: relative;
    display: inline-block;
    min-width: fit-content;
    min-height: 100%;
}

.markers-overlay {
    position: absolute;
    z-index: 5;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    pointer-events: none;
}

.marker {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid white;

    border-radius: 50%;
    background: #ff4757;
    box-shadow: 0 2px 8px #ff475766;
    transition: all .2s;
    transform: translate(-50%, -50%);
    cursor: pointer;
    pointer-events: auto;
}

.marker:hover {
    background: #ff3838;
    transform: translate(-50%, -50%) scale(1.2);
}

.tile-row {
    display: flex;
    white-space: nowrap;
}

.tile {
    position: relative;
    flex-shrink: 0;
    width: 120px;
    height: 120px;

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

.image-viewer-overlay {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #000000e6;
}

.image-viewer {
    position: relative;
    overflow: hidden;
    max-width: 90%;
    max-height: 90%;

    border-radius: 15px;
    background: #fff;
    box-shadow: 0 20px 60px #0000004d;
}

.image-viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;

    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-viewer-title {
    font-size: 1.2em;
    font-weight: bold;
}

.close-btn {
    padding: 5px 10px;
    border: none;
    font-size: 1.5em;

    color: #fff;
    border-radius: 5px;
    background: none;
    transition: background .3s;
    cursor: pointer;
}

.close-btn:hover {
    background: #ffffff1a;
}

.image-viewer-body {
    padding: 20px;
    text-align: center;
}

.marker-image {
    max-width: 100%;
    max-height: 60vh;
    border-radius: 8px;
    box-shadow: 0 8px 24px #0003;
}

.marker-details {
    margin-top: 15px;
    line-height: 1.6;
    text-align: left;
    color: #555;
}

.marker-details strong {
    color: #333;
}

/* 瓦片图片数量徽章样式 */
.tile-image-count {
    position: absolute;
    z-index: 10;
    right: 8px;
    bottom: 8px;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    font-size: 14px;
    font-weight: bold;
    line-height: 24px;
    text-align: center;

    color: #fff;
    border-radius: 12px;
    background: #ff4757;
    box-shadow: 0 2px 8px #ff475766;
    transition: all .2s;
    cursor: pointer;
}

.tile-image-count:hover {
    background: #ff3838;
    box-shadow: 0 4px 12px #ff475799;
    transform: scale(1.1);
}

/* 瓦片图片管理弹窗样式 */
.tile-image-modal {
    width: 700px;
    max-width: 90vw;
    max-height: 80vh;
}

.tile-image-modal .modal-body {
    overflow-y: auto;
    max-height: 60vh;
}

.tile-images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
}

.tile-image-item {
    position: relative;
    overflow: hidden;
    padding-bottom: 100%;

    border-radius: 8px;
    box-shadow: 0 2px 8px #0000001a;
    transition: all .2s;
    cursor: pointer;
}

.tile-image-item:hover {
    box-shadow: 0 4px 16px #0003;
    transform: translateY(-4px);
}

.tile-image-item img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.empty-message {
    padding: 40px;
    text-align: center;
    color: #999;
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

    background: #000000b3;
}

.modal-content {
    position: relative;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 20px 60px #0000004d;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
}

.close-btn {
    padding: 5px 10px;
    border: none;
    font-size: 1.5em;

    color: #666;
    border-radius: 5px;
    background: none;
    transition: background .3s ease;
    cursor: pointer;
}

.close-btn:hover {
    background: #0000001a;
}

.modal-body {
    padding: 20px;
}

/* 预览视图样式 */
.preview-view {
    padding: 10px 0;
}

.preview-navigation {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    gap: 20px;
}

.preview-image-container {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    max-height: 60vh;
}

.nav-btn {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    border: none;

    font-size: 24px;

    color: #fff;
    border-radius: 50%;
    background: #667eeacc;
    transition: all .2s;
    cursor: pointer;
}

.nav-btn:disabled {
    opacity: .3;
    cursor: not-allowed;
}

.nav-btn:hover:not(:disabled) {
    background: #667eea;
    transform: scale(1.1);
}

.nav-btn:active:not(:disabled) {
    transform: scale(.95);
}

.preview-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.btn-secondary {
    color: #fff;
    background: #6c757d;
}

.btn-secondary:hover {
    background: #5a6268;
}
</style>

