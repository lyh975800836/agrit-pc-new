<template>
  <div class="base-map-container">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- Leaflet地图容器 -->
    <div
      :id="mapContainerId"
      class="leaflet-map"
      :class="{ 'map-hidden': isLoading }"
    ></div>

    <!-- 插槽用于扩展功能 -->
    <slot name="overlay" :map="map" :loading="isLoading"></slot>
  </div>
</template>

<script>
import mapMixin from '@/mixins/mapMixin.js';

export default {
    name: 'BaseMap',
    mixins: [mapMixin],

    props: {
    // 地图容器ID
        containerId: {
            type: String,
            default: 'base-leaflet-map'
        },

        // 初始中心坐标
        initialCenter: {
            type: Array,
            default: () => [23.9, 106.6]
        },

        // 初始缩放级别
        initialZoom: {
            type: Number,
            default: 10
        },

        // 瓦片服务提供商
        tileProvider: {
            type: String,
            default: 'GAODE'
        },

        // 瓦片图层类型
        tileType: {
            type: String,
            default: 'SATELLITE'
        },

        // 是否启用图层控制
        enableLayerControl: {
            type: Boolean,
            default: true
        },

        // 是否自动加载数据
        autoLoad: {
            type: Boolean,
            default: true
        }
    },

    methods: {

        /**
     * 重写加载地图数据方法
     */
        async loadMapData() {
            if (!this.autoLoad) {
                return;
            }

            try {
                this.setLoadingText('正在加载地图数据...');

                // 触发数据加载事件，让父组件处理具体的数据加载
                this.$emit('load-data', this.map);

                // 延迟一下确保数据加载完成
                await new Promise(resolve => setTimeout(resolve, 500));

            }
            catch (error) {
                console.error('地图数据加载失败:', error);
                throw error;
            }
        },

        /**
     * 公开地图操作方法供父组件调用
     */

        // 添加GeoJSON数据
        addGeoJSONData(geojsonData, options = {}) {
            return this.addRegionLayer(geojsonData, options);
        },

        // 添加标记点
        addMarker(coordinates, options = {}) {
            return this.addMarkerLayer(coordinates, options);
        },

        // 缩放到区域
        zoomToRegion(regionName) {
            const coordinates = this.getRegionCoordinates(regionName);
            if (coordinates) {
                this.setMapView(coordinates, 12);
            }
        },

        // 缩放到边界
        zoomToBounds(bounds) {
            this.fitBounds(bounds);
        }
    }
};
</script>

<style lang="less" scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.base-map-container {
    position: relative;
    width: 100%;
    height: 100%;

    .loading-overlay {
        position: absolute;
        z-index: 1000;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        background: #0000004d;
    }

    .loading-spinner {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #fff;
    }

    .spinner {
        width: 40px;
        height: 40px;
        margin-bottom: 10px;
        border: 4px solid #ffffff4d;
        border-top: 4px solid #fff;

        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-text {
        font-size: 14px;
        text-align: center;
    }

    .leaflet-map {
        width: 100%;
        height: 100%;
        transition: opacity .3s ease;

        &.map-hidden {
            opacity: 0;
        }
    }
}

// 全局Leaflet样式调整
:global(.leaflet-container) {
    font-family: inherit;
}

:global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px #00000026;
}

:global(.leaflet-popup-tip) {
    box-shadow: 0 2px 8px #00000026;
}

:global(.leaflet-control-layers) {
    border-radius: 8px;
    background: #fffffff2;
    box-shadow: 0 2px 8px #00000026;
}
</style>
