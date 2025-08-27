<template>
  <div class="baise-map-container">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- Leaflet地图容器 -->
    <div id="baise-leaflet-map" class="leaflet-map" :class="{ 'map-hidden': isLoading }"></div>
  </div>
</template>

<script>
// 使用CDN引入的Leaflet
const { L } = window;

export default {
    name: 'MapViewBaise',
    props: {
        mapData: {
            type: Object,
            default: () => ({ features: [] })
        },
        selectedRegion: {
            type: [String, Number],
            default: null
        },
        projectRegions: {
            type: Array,
            default: () => []
        },
        markers: {
            type: Array,
            default: () => []
        },
        labels: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            map: null,
            isLoading: true,
            loadingText: '正在初始化地图...',
            regionLayers: [],
            markerLayers: [],
            labelLayers: []
        };
    },
    computed: {
        regions() {
            if (!this.mapData || !this.mapData.features) {
                return [];
            }
            return this.mapData.features;
        }
    },
    mounted() {
        this.$nextTick(() => {
            if (window.L) {
                this.initMap();
            }
            else {
                console.error('Leaflet未加载，请确认CDN引入是否正确');
                this.loadingText = 'Leaflet地图库加载失败';
            }
        });
    },
    beforeDestroy() {
        if (this.map) {
            this.map.remove();
        }
    },
    watch: {
        mapData: {
            handler() {
                if (this.map && this.regions.length > 0) {
                    this.loadMapData();
                }
            },
            deep: true
        },
        selectedRegion() {
            this.updateSelectedRegion();
        },
        markers() {
            this.updateMarkers();
        }
    },
    methods: {
    // 初始化Leaflet地图
        initMap() {
            try {
                this.loadingText = '初始化地图视图...';

                // 百色市中心坐标
                const baiseCenter = [23.9, 106.6];

                this.map = L.map('baise-leaflet-map', {
                    center: baiseCenter,
                    zoom: 9,
                    minZoom: 8,
                    maxZoom: 12, // 限制最大缩放，避免过度放大
                    zoomControl: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    dragging: true,
                    attributionControl: false,
                    preferCanvas: true, // 提高性能
                    zoomSnap: 0.5, // 允许半级缩放
                    wheelPxPerZoomLevel: 60
                });

                // 自定义缩放控件位置
                this.map.zoomControl.setPosition('bottomright');

                // 不使用底图，直接加载业务数据
                this.loadingText = '准备加载区域数据...';
                setTimeout(() => {
                    this.loadMapData();
                }, 300);

            }
            catch (error) {
                console.error('初始化地图失败:', error);
                this.loadingText = '地图初始化失败';
                this.isLoading = false;
            }
        },

        // 加载地图数据
        async loadMapData() {
            try {
                if (!this.regions.length) {
                    console.warn('没有地图区域数据');
                    this.loadingText = '没有地图数据';
                    this.isLoading = false;
                    return;
                }

                this.loadingText = `加载${ this.regions.length }个区县数据...`;
                // 开始加载百色市地图数据

                // 清除现有图层
                this.clearLayers();

                // 按顺序添加图层
                await this.addRegionLayers();
                await this.addMarkerLayers();
                await this.addLabelLayers();

                // 调整视图到百色市边界
                this.fitMapToBaise();

                this.loadingText = '地图加载完成';
                setTimeout(() => {
                    this.isLoading = false;
                }, 500);

            }
            catch (error) {
                console.error('加载地图数据失败:', error);
                this.loadingText = '数据加载失败';
                this.isLoading = false;
            }
        },

        // 添加区域图层
        async addRegionLayers() {
            this.loadingText = '绘制区县边界...';

            for (let i = 0; i < this.regions.length; i++) {
                const region = this.regions[i];
                try {
                    const hasProjects = this.hasProjects(region);
                    const isSelected = this.selectedRegion === region.properties.adcode;

                    // 创建GeoJSON图层 - 确保边界完整显示
                    const layer = L.geoJSON(region, {
                        style: this.getRegionStyle(hasProjects, isSelected),
                        onEachFeature: (feature, layer) => {
                            // 修正西林县和隆林县的tooltip显示名称
                            let tooltipName = feature.properties.name;
                            if (feature.properties.name === '西林县') {
                                tooltipName = '隆林各族自治县';
                            } else if (feature.properties.name === '隆林各族自治县') {
                                tooltipName = '西林县';
                            }
                            
                            // 添加区域名称提示
                            layer.bindTooltip(tooltipName, {
                                permanent: false,
                                direction: 'center',
                                className: 'region-tooltip'
                            });

                            // 添加鼠标事件
                            layer.on({
                                click: e => {
                                    console.log(`点击区域: ${ feature.properties.name }`);
                                    this.handleRegionClick(feature, e);
                                },
                                mouseover: e => {
                                    // 高亮效果
                                    e.target.setStyle({
                                        weight: 4,
                                        fillOpacity: 0.8
                                    });
                                    this.handleRegionHover(feature, true, e);
                                },
                                mouseout: e => {
                                    // 恢复原样式
                                    e.target.setStyle(this.getRegionStyle(hasProjects, isSelected));
                                    this.handleRegionHover(feature, false, e);
                                }
                            });
                        }
                    });

                    layer.addTo(this.map);
                    this.regionLayers.push(layer);

                    // 更新加载进度
                    this.loadingText = `绘制区县边界... ${ i + 1 }/${ this.regions.length }`;

                }
                catch (error) {
                    console.error('添加区域图层失败:', region.properties?.name, error);
                }
            }
        },

        // 获取区域样式
        getRegionStyle(hasProjects, isSelected) {
            if (isSelected) {
                return {
                    fillColor: '#FFD700',
                    weight: 3,
                    opacity: 1,
                    color: '#FFD700',
                    fillOpacity: 0.6,
                    dashArray: null
                };
            } if (hasProjects) {
                return {
                    fillColor: '#4CFDEB',
                    weight: 2,
                    opacity: 1,
                    color: '#4CFDEB',
                    fillOpacity: 0.4,
                    dashArray: null
                };
            }
            return {
                fillColor: '#2C5F5A',
                weight: 1.5,
                opacity: 0.8,
                color: '#4CFDEB',
                fillOpacity: 0.2,
                dashArray: '5,5' // 无项目区域使用虚线边框
            };

        },

        // 添加标记点图层
        async addMarkerLayers() {
            if (!this.markers || this.markers.length === 0) {
                return;
            }

            this.loadingText = '添加项目标记...';

            this.markers.forEach(marker => {
                try {
                    const markerIcon = L.divIcon({
                        className: 'baise-custom-marker',
                        html: `<div class="marker-wrapper">
              <div class="marker-point ${ marker.highlight ? 'highlight' : 'normal' }"></div>
              <div class="marker-label">${ marker.label || marker.title }</div>
            </div>`,
                        iconSize: [80, 50],
                        iconAnchor: [40, 40]
                    });

                    const leafletMarker = L.marker([marker.lat, marker.lng], {
                        icon: markerIcon,
                        zIndexOffset: marker.highlight ? 1000 : 500 // 高亮标记在上层
                    });

                    // 添加点击事件
                    leafletMarker.on('click', () => {
                        console.log(`点击项目标记: ${ marker.title }`);
                        this.$emit('marker-click', marker);
                    });

                    // 添加详细信息弹窗
                    leafletMarker.bindPopup(`
            <div class="marker-popup">
              <h4>${ marker.title }</h4>
              <p>${ marker.description }</p>
            </div>
          `, {
                        className: 'baise-popup'
                    });

                    leafletMarker.addTo(this.map);
                    this.markerLayers.push(leafletMarker);

                }
                catch (error) {
                    console.error('添加标记失败:', marker, error);
                }
            });
        },

        // 添加区域标签
        async addLabelLayers() {
            if (!this.labels || this.labels.length === 0) {
                // 自动生成简化样式的区域标签
                this.autoGenerateLabels();
                return;
            }

            this.loadingText = '添加区域标签...';

            this.labels.forEach(label => {
                try {
                    const labelIcon = L.divIcon({
                        className: 'baise-region-label',
                        html: `<div class="label-content ${ label.hasProjects ? 'has-projects' : 'no-projects' }">
              ${ label.text }
            </div>`,
                        iconSize: [100, 30],
                        iconAnchor: [50, 15]
                    });

                    const labelMarker = L.marker([label.lat, label.lng], {
                        icon: labelIcon,
                        interactive: false, // 标签不响应点击
                        zIndexOffset: 2000 // 标签在最上层
                    });

                    labelMarker.addTo(this.map);
                    this.labelLayers.push(labelMarker);

                }
                catch (error) {
                    console.error('添加标签失败:', label, error);
                }
            });
        },

        // 自动生成区域标签
        autoGenerateLabels() {
            this.regions.forEach(region => {
                try {
                    const bounds = L.geoJSON(region).getBounds();
                    let center = bounds.getCenter();
                    const hasProjects = this.hasProjects(region);


                    // 修正西林县和隆林县的标签显示：交换它们的名称以匹配正确的地理位置
                    let displayName = region.properties.name;
                    if (region.properties.name === '西林县') {
                        displayName = '隆林各族自治县';
                    } else if (region.properties.name === '隆林各族自治县') {
                        displayName = '西林县';
                    }

                    const labelIcon = L.divIcon({
                        className: 'baise-auto-label',
                        html: `<div class="auto-label-content ${ hasProjects ? 'has-projects' : 'no-projects' }">
              ${ displayName }
            </div>`,
                        iconSize: [100, 20],
                        iconAnchor: [50, 10]
                    });

                    const labelMarker = L.marker([center.lat, center.lng], {
                        icon: labelIcon,
                        interactive: false,
                        zIndexOffset: 1800
                    });

                    labelMarker.addTo(this.map);
                    this.labelLayers.push(labelMarker);

                }
                catch (error) {
                    console.error('自动生成标签失败:', region.properties.name, error);
                }
            });
        },

        // 调整地图视图到百色市范围
        fitMapToBaise() {
            try {
                if (this.regionLayers.length > 0) {
                    const group = new L.featureGroup(this.regionLayers);
                    const bounds = group.getBounds();

                    this.map.fitBounds(bounds, {
                        padding: [30, 30], // 边距
                        maxZoom: 10 // 限制最大缩放级别，保持合适的显示比例
                    });

                    console.log('地图视图已调整到百色市边界');
                }
                else {
                    // fallback到百色市中心
                    this.map.setView([23.9, 106.6], 9);
                }
            }
            catch (error) {
                console.error('调整地图视图失败:', error);
                this.map.setView([23.9, 106.6], 9);
            }
        },

        // 清除所有图层
        clearLayers() {
            [...this.regionLayers, ...this.markerLayers, ...this.labelLayers].forEach(layer => {
                try {
                    this.map.removeLayer(layer);
                }
                catch (error) {
                    console.warn('移除图层失败:', error);
                }
            });
            this.regionLayers = [];
            this.markerLayers = [];
            this.labelLayers = [];
        },

        // 更新选中区域
        updateSelectedRegion() {
            if (this.map && this.regionLayers.length > 0) {
                // 重新设置所有区域的样式
                this.regionLayers.forEach(layer => {
                    const { feature } = layer;
                    const hasProjects = this.hasProjects(feature);
                    const isSelected = this.selectedRegion === feature.properties.adcode;
                    layer.setStyle(this.getRegionStyle(hasProjects, isSelected));
                });
            }
        },


        // 更新标记点
        updateMarkers() {
            // 清除现有标记
            this.markerLayers.forEach(layer => {
                this.map.removeLayer(layer);
            });
            this.markerLayers = [];

            // 重新添加标记
            this.addMarkerLayers();
        },

        // 处理区域点击
        handleRegionClick(region, event) {
            console.log('Leaflet地图区域点击:', region.properties.name);
            this.$emit('region-click', region, event.originalEvent);
        },

        // 处理区域悬停
        handleRegionHover(region, isHovered, event) {
            this.$emit('region-hover', region, isHovered, event.originalEvent);
        },

        // 判断区域是否有项目
        hasProjects(region) {
            const regionName = region.properties.name;
            return this.projectRegions.includes(regionName);
        }
    }
};
</script>

<style scoped>
@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.baise-map-container {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;

    border-radius: 10px;
    background: transparent;
}

.leaflet-map {
    z-index: 1;
    width: 100%;
    height: 100%;
    background: transparent !important;
}

.map-hidden {
    opacity: .3;
}

/* 加载指示器 */
.loading-overlay {
    position: absolute;
    z-index: 2000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #0a1420f2;

    backdrop-filter: blur(8px);
}

.loading-spinner {
    text-align: center;
    color: #4cfdeb;
}

.spinner {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    border: 4px solid #4cfdeb33;
    border-left: 4px solid #4cfdeb;

    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 15px;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
}
</style>

<!-- 全局样式用于Leaflet动态生成的元素 -->
<style>
@keyframes pulse-gold {
    0%,
    100% {
        box-shadow: 0 0 15px #ffd700cc;
        transform: scale(1);
    }

    50% {
        box-shadow: 0 0 25px #ffd700;
        transform: scale(1.1);
    }
}
@keyframes pulse-blue {
    0%,
    100% {
        box-shadow: 0 0 15px #4cfcea99;
        transform: scale(1);
    }

    50% {
        box-shadow: 0 0 20px #4cfceae6;
        transform: scale(1.05);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .leaflet-control-zoom {
        right: 15px !important;
        bottom: 80px !important;
    }

    .leaflet-control-zoom a {
        width: 30px !important;
        height: 30px !important;
        font-size: 16px !important;
        line-height: 28px !important;
    }

    .marker-label {
        padding: 2px 6px !important;
        font-size: 9px !important;
    }

    .label-content,
    .auto-label-content {
        padding: 3px 8px !important;
        font-size: 10px !important;
    }
}

.region-tooltip {
    padding: 6px 10px !important;
    border: 1px solid #4cfcea99 !important;
    font-size: 12px !important;
    font-weight: bold !important;

    color: #4cfdeb !important;
    border-radius: 6px !important;
    background: #102838f2 !important;
    box-shadow: 0 4px 12px #0006 !important;
}

.region-tooltip::before {
    border-top-color: #102838f2 !important;
}

/* 自定义标记样式 */
.baise-custom-marker {
    border: none !important;
    background: none !important;
}

.marker-wrapper {
    position: relative;
    text-align: center;
}

.marker-point {
    width: 16px;
    height: 16px;
    margin: 0 auto 4px;
    border: 2px solid #102838;

    border-radius: 50%;
    box-shadow: 0 0 15px #4cfceacc;
}

.marker-point.highlight {
    background: radial-gradient(circle, #ffd700, #ffa000);
    animation: pulse-gold 2s infinite;
}

.marker-point.normal {
    background: radial-gradient(circle, #4cfdeb, #00bcd4);
    animation: pulse-blue 2s infinite;
}

.marker-label {
    padding: 3px 8px;
    border: 1px solid #4cfcea66;
    font-size: 10px;
    font-weight: bold;
    white-space: nowrap;

    color: #4cfdeb;
    border-radius: 4px;
    background: linear-gradient(135deg, #102838f2, #081c24fa);
    box-shadow: 0 2px 8px #0000004d;

    backdrop-filter: blur(5px);
}

/* 标记弹窗样式 */
.baise-popup {
    background: none !important;
}

.baise-popup .leaflet-popup-content-wrapper {
    border: 1px solid #4cfcea99 !important;

    border-radius: 8px !important;
    background: linear-gradient(135deg, #102838f2, #081c24fa) !important;
    box-shadow: 0 8px 32px #0006 !important;

    backdrop-filter: blur(10px) !important;
}

.baise-popup .leaflet-popup-content {
    margin: 0 !important;
    color: #fff !important;
}

.marker-popup h4 {
    margin: 0 0 8px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    color: #4cfdeb !important;
}

.marker-popup p {
    margin: 0 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    color: #fff !important;
}

/* 区域标签样式 */
.baise-region-label,
.baise-auto-label {
    border: none !important;
    background: none !important;
}

.label-content,
.auto-label-content {
    padding: 0;
    border: none;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    color: #4cfdeb;
    background: none;
    box-shadow: none;
    transition: none;
    backdrop-filter: none;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 统一所有标签样式为纯文字 */
.label-content.has-projects,
.auto-label-content.has-projects,
.label-content.no-projects,
.auto-label-content.no-projects {
    border: none;
    color: #4cfdeb;
    background: none;
    box-shadow: none;
}

/* 自定义Leaflet缩放控件样式 */
.leaflet-control-zoom {
    overflow: hidden !important;
    border: 1px solid #4cfcea4d !important;
    border-radius: 8px !important;
    box-shadow: 0 0 20px #4cfcea66 !important;
}

.leaflet-control-zoom a {
    width: 34px !important;
    height: 34px !important;
    border: none !important;
    font-size: 18px !important;
    font-weight: bold !important;
    line-height: 32px !important;

    color: #4cfdeb !important;
    background: linear-gradient(135deg, #102838f2 0%, #081c24fa 100%) !important;
    transition: all .3s ease !important;

    backdrop-filter: blur(10px) !important;
}

.leaflet-control-zoom a:hover {
    color: #fff !important;
    background: linear-gradient(135deg, #4cfcea4d 0%, #102838f2 100%) !important;
    transform: scale(1.05) !important;
}

.leaflet-control-zoom a:first-child {
    border-radius: 8px 8px 0 0 !important;
}

.leaflet-control-zoom a:last-child {
    border-radius: 0 0 8px 8px !important;
}

.leaflet-disabled {
    opacity: .4 !important;
    cursor: not-allowed !important;
}

/* 区域提示框样式 */

/* 确保Leaflet容器背景透明 */
.leaflet-container {
    background: transparent !important;
}

/* 移除Leaflet默认的瓦片图层背景 */
.leaflet-tile-pane {
    display: none !important;
}
</style>
