<template>
  <div class="tile-map-container">
    <!-- 地图瓦片网格 -->
    <div class="tile-grid" ref="tileGrid">
      <div class="tile-grid-inner">
        <div class="markers-overlay">
          <div
            v-for="marker in visibleMarkers"
            :key="marker.id"
            class="marker"
            :style="getMarkerStyle(marker)"
            @click="showMarkerImage(marker)"
            :title="`${marker.title} (${marker.zoom_level}/${marker.tile_x}/${marker.tile_y})`"
          ></div>
        </div>

        <div
          v-for="y in visibleRows"
          :key="`row-${y-1}`"
          class="tile-row"
        >
          <div
            v-for="x in visibleCols"
            :key="`tile-${x-1}-${y-1}`"
            v-show="shouldShowTile(x-1, y-1)"
            class="tile"
            :data-x="x-1"
            :data-y="y-1"
          >
            <div
              class="tile-content"
              :style="{ backgroundImage: `url(${tileImages[`${x-1}-${y-1}`]})` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片查看器 -->
    <div v-if="selectedMarker" class="image-viewer-overlay" @click="closeImageViewer">
      <div class="image-viewer" @click.stop>
        <div class="image-viewer-header">
          <div class="image-viewer-title">{{ selectedMarker.title || '标点图片' }}</div>
          <button class="close-btn" @click="closeImageViewer">&times;</button>
        </div>
        <div class="image-viewer-body">
          <img :src="selectedMarker.image_url" :alt="selectedMarker.description" class="marker-image" />
          <div class="marker-details">
            <p><strong>坐标:</strong> {{ selectedMarker.latitude?.toFixed(6) }}, {{ selectedMarker.longitude?.toFixed(6) }}</p>
            <p><strong>描述:</strong> {{ selectedMarker.description || '暂无描述' }}</p>
            <p><strong>创建时间:</strong> {{ selectedMarker.created_at || '未知' }}</p>
            <p><strong>瓦片位置:</strong> {{ selectedMarker.tile_id || '未知' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
            selectedMarker: null,
            tileImages: {}
        };
    },
    computed: {
        plotId: () => 1000,
        gridSize() {
            return 2 ** this.zoomLevel;
        },
        layerName() {
            return `plot_${ this.plotId }_雷哥`;
        },
        visibleMarkers() {
            return this.markers.filter(marker => marker.zoom_level === this.zoomLevel);
        },
        // 根据容器宽度计算显示的列数
        visibleCols() {
            if (!this.$refs.tileGrid) {
                return 12;
            }
            const containerWidth = this.$refs.tileGrid.clientWidth;
            const tileSize = 120;
            return Math.ceil(containerWidth / tileSize) + 2;
        },
        // 根据容器高度计算显示的行数
        visibleRows() {
            if (!this.$refs.tileGrid) {
                return 8;
            }
            const containerHeight = this.$refs.tileGrid.clientHeight;
            const tileSize = 120;
            return Math.ceil(containerHeight / tileSize) + 2;
        }
    },
    mounted() {
        this.loadMapData();
        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize);
        // 使用$nextTick确保DOM已经渲染完成
        this.$nextTick(() => {
            this.handleResize();
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },
    watch: {
        plotData: {
            handler() {
                this.loadMapData();
            },
            deep: true
        }
    },
    methods: {
        async loadMapData() {
            if (!this.plotId) {
                return;
            }

            this.tileImages = {};

            await this.loadMarkers();
            await this.loadAllTiles();
        },

        async loadMarkers() {
            try {
                const isProduction = process.env.NODE_ENV === 'production';
                const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
                const response = await fetch(`${ baseUrl }/api/v1/markers/plot/${ this.plotId }`);
                const result = await response.json();

                if (response.ok && result.code === 0) {
                    this.markers = result.data || [];
                }
                else {
                    this.markers = [];
                }
            }
            catch (error) {
                console.error('加载标点失败:', error);
                this.markers = [];
            }
        },

        async loadAllTiles() {
            const promises = [];
            // 加载可见区域的瓦片
            for (let y = 0; y < this.visibleRows; y++) {
                for (let x = 0; x < this.visibleCols; x++) {
                    promises.push(this.loadTileImage(x, y));
                }
            }
            await Promise.all(promises);
        },


        async loadTileImage(x, y) {
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
                tilerow: y,
                tilecol: x,
                format: 'image/png'
            });
            const tileUrl = `${ baseUrl }/api/v1/wmts/request?${ params }`;

            try {
                const response = await fetch(tileUrl);
                const result = await response.json();

                if (result && result.data) {
                    const imageKey = `${ x }-${ y }`;
                    const imageSrc = `data:${ result.content_type };base64,${ result.data }`;
                    this.$set(this.tileImages, imageKey, imageSrc);
                }
                else {
                    // 没有数据时标记为error
                    const imageKey = `${ x }-${ y }`;
                    this.$set(this.tileImages, imageKey, 'error');
                }
            }
            catch (error) {
                console.error(`获取瓦片失败 (${ this.zoomLevel }/${ y }/${ x }):`, error);
                // 请求失败时也标记为error
                const imageKey = `${ x }-${ y }`;
                this.$set(this.tileImages, imageKey, 'error');
            }
        },


        getMarkerStyle(marker) {
            const { tile_x, tile_y, pixel_x = 256, pixel_y = 256 } = marker;
            const tileSize = 120;
            const scale = tileSize / 256 / 2;

            return {
                left: `${ tile_x * tileSize + pixel_x * scale }px`,
                top: `${ tile_y * tileSize + pixel_y * scale }px`
            };
        },

        shouldShowTile(x, y) {
            const tileData = this.tileImages[`${ x }-${ y }`];
            return tileData && tileData !== '' && tileData !== 'error' && tileData !== null;
        },

        showMarkerImage(marker) {
            this.selectedMarker = marker;
        },

        closeImageViewer() {
            this.selectedMarker = null;
        },

        handleResize() {
            // 强制重新计算显示区域
            this.$forceUpdate();
        },

        retryLoadTile(x, y) {
            // 清除失败状态
            this.$delete(this.tileImages, `${ x }-${ y }`);
            // 重新加载
            this.loadTileImage(x, y);
        }
    }
};
</script>

<style scoped>
.tile-map-container {
    width: 100%;
    height: 100%;
    font-family: "Helvetica Neue", Arial, sans-serif;
    background: #f5f5f5;
}

.tile-grid {
    position: relative;
    overflow: auto;
    height: 100%;
    background: #fafafa;
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
    height: calc(100% - 60px);

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

    background: #f0f0f0;
}

.tile-info {
    position: absolute;
    z-index: 10;
    top: 5px;
    left: 5px;
    padding: 2px 6px;
    font-size: 10px;

    color: #fff;
    border-radius: 3px;
    background: #000000b3;
}

.tile-empty-area {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;

    opacity: .7;
    background: #f0f4f8;
}

.empty-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    opacity: .3;
    background-image:
        linear-gradient(45deg, #e8e8e8 25%, transparent 25%),
        linear-gradient(-45deg, #e8e8e8 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #e8e8e8 75%),
        linear-gradient(-45deg, transparent 75%, #e8e8e8 75%);
    background-position: 0 0, 0 6px, 6px -6px, -6px 0;
    background-size: 12px 12px;
}

.empty-info {
    position: relative;
    z-index: 1;
    text-align: center;
}

.empty-text {
    font-size: 9px;
    font-weight: 500;
    color: #666;
}

.tile-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    border: 1px dashed #f5c6c6;

    background: #fef7f7;

    gap: 4px;
}

.error-icon {
    font-size: 16px;
    color: #e74c3c;
}

.error-text {
    margin: 0;
    font-size: 9px;
    color: #e74c3c;
}

.retry-btn {
    padding: 2px 6px;
    border: none;
    font-size: 8px;

    color: #fff;
    border-radius: 2px;
    background: #4cfdeb;
    transition: background .2s;
    cursor: pointer;
}

.retry-btn:hover {
    background: #00c9ff;
}

.tile-content {
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
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
</style>
