<template>
  <div class="region-detail-map">
    <!-- 加载指示器 -->
    <MapLoadingOverlay
      :isLoading="isLoading"
      :loading-text="loadingText"
    />

    <!-- 二级地图分类右侧栏 -->
    <CategorySidebar
      :categories="categories"
      :selected-category-type="selectedCategoryType"
      :is-plot-detail-page="isPlotDetailPage"
      @category-filter="filterMapByCategory"
    />

    <!-- 分类弹窗 -->
    <CategoryPopup
      :selected-category="selectedCategory"
      @close="closeCategoryPopup"
      @navigate="navigateToTertiaryMap"
    />

    <!-- Leaflet地图容器 -->
    <div id="leaflet-map" class="leaflet-container" :class="{ 'map-hidden': isLoading }"></div>

    <!-- 地块详情弹窗 -->
    <PlotDetailPopup
      v-if="showDetailPopup"
      :popup-data="popupData"
      :popup-position="popupPosition"
      :region-name="regionName"
      @close="closePlotDetailPopup"
      @navigate="goToPlotDetail"
    />

  </div>
</template>

<script>
import { getTypeIcon } from '@/utils/plotMarkerManager';
import {
    transformTilesToCoordinates,
    createPlotData,
    isValidFieldData
} from '@/utils/tileDataProcessor';
import {
    generatePlotMarkerHtml,
    getMarkerIconConfig
} from '@/config/markerConfig';
import regionCoordinates from '@/config/regionCoordinates.json';
import MapLoadingOverlay from '@/components/Map/MapLoadingOverlay.vue';
import CategorySidebar from '@/components/Dialogs/CategorySidebar.vue';
import CategoryPopup from '@/components/Dialogs/CategoryPopup.vue';
import PlotDetailPopup from '@/components/Dialogs/PlotDetailPopup.vue';

// 使用CDN引入的Leaflet (在index.html中已引入)
const { L } = window;

export default {
    name: 'RegionDetailMap',
    props: {
        regionName: {
            type: String,
            required: true
        }
    },
    components: {
        MapLoadingOverlay,
        CategorySidebar,
        CategoryPopup,
        PlotDetailPopup
    },
    data() {
        return {
            // 地图配置常量
            mapConfig: {
                defaultZoom: 12,
                minZoom: 8,
                maxZoom: 16,
                fitZoom: 14,
                fallbackZoom: 13,
                centerPadding: [30, 30],
                fitPadding: [50, 50],
                tileLoadTimeout: 3000,
                regionMaskMarginMultiplier: 3,
                popupWidth: 380,
                popupHeight: 350,
                popupOffsetAbove: 20,
                popupMargin: 10
            },
            // 地图实例及状态
            map: null,
            plotLayers: [],
            plotMarkerLayers: [],
            isLoading: true,
            loadingText: '正在初始化地图...',
            currentLoadedRegion: null,
            showDetailPopup: false,
            popupPosition: { top: 0, left: 0 },
            popupData: null,
            selectedCategory: null,
            selectedCategoryType: 'all'
        };
    },
    computed: {
        // 地块分类配置（不变，使用 computed 避免重复创建对象）
        categories() {
            return [
                { id: 0, name: '全部', icon: '', type: 'all', isAllOption: true },
                { id: 1, name: '林', icon: '/images/map-filter1.png', type: 'forest' },
                { id: 2, name: '厂', icon: '/images/map-filter3.png', type: 'factory' },
                { id: 3, name: '仓', icon: '/images/map-filter6.png', type: 'warehouse' }
            ];
        }
    },
    mounted() {
        // 确保Leaflet已加载并且DOM已完全渲染
        this.$nextTick(() => {
            setTimeout(() => {
                this.initializeMapComponent();
            }, 100); // 给DOM一点时间完成渲染
        });
    },
    beforeDestroy() {
        if (this.map) {
            this.map.remove();
        }
    },
    watch: {
        regionName(newRegionName, oldRegionName) {
            if (newRegionName !== oldRegionName && newRegionName) {
                this.reinitializeForNewRegion();
            }
        }
    },
    methods: {
        // 统一的组件初始化方法
        async initializeMapComponent() {
            try {
                if (!window.L) {
                    console.warn('Leaflet库未加载');
                    this.isLoading = false;
                    return;
                }

                // 确保DOM元素存在
                const mapElement = document.getElementById('leaflet-map');
                if (!mapElement) {
                    console.warn('地图容器不存在，重试中...');
                    setTimeout(() => this.initializeMapComponent(), 200);
                    return;
                }

                // 销毁已有地图实例
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }

                // 重置状态并初始化地图
                this.resetComponentState();
                await this.initMap();
                await this.loadRegionData();
                this.isLoading = false;
            }
            catch (error) {
                this.handleError('RegionDetailMap初始化失败，请刷新页面', error);
            }
        },

        // 为新区域重新初始化
        async reinitializeForNewRegion() {
            this.isLoading = true;
            this.loadingText = '切换区域中...';

            // 重置当前加载的区域
            this.currentLoadedRegion = null;

            await this.initializeMapComponent();
        },

        // 重置组件状态
        resetComponentState() {
            this.plotLayers = [];
            this.plotMarkerLayers = [];
            this.currentLoadedRegion = null;
            this.showDetailPopup = false;
            this.popupData = null;
        },

        // 初始化Leaflet地图
        initMap() {
            return new Promise((resolve, reject) => {
                try {
                    const cfg = this.mapConfig;
                    const center = regionCoordinates[this.regionName] || [23.9, 106.6];

                    this.map = L.map('leaflet-map', {
                        center,
                        zoom: cfg.defaultZoom,
                        minZoom: cfg.minZoom,
                        maxZoom: cfg.maxZoom,
                        zoomControl: true,
                        scrollWheelZoom: true,
                        doubleClickZoom: true,
                        touchZoom: true,
                        boxZoom: false,
                        keyboard: true,
                        attributionControl: false,
                        preferCanvas: true,
                        zoomAnimationThreshold: 4,
                        fadeAnimation: true,
                        zoomAnimation: true,
                        zoomSnap: 0.5,
                        wheelPxPerZoomLevel: 60
                    });

                    this.map.zoomControl.setPosition('bottomright');

                    // 添加卫星底图
                    this.addSatelliteLayer().then(() => {
                        this.isLoading = false;
                        resolve();
                    })
                        .catch(error => {
                            this.handleError('卫星底图加载失败', error);
                            reject(error);
                        });
                }
                catch (error) {
                    this.handleError('地图初始化失败', error);
                    reject(error);
                }
            });
        },

        registerPlotMarker(layer, categoryCode) {
            if (!layer) {
                return;
            }

            const entry = {
                layer,
                categoryCode: categoryCode || 'forest',
                visible: true
            };

            this.plotMarkerLayers.push(entry);

            if (layer.on) {
                layer.on('add', () => {
                    this.updateMarkerVisibility(entry);
                });
            }

            this.updateMarkerVisibility(entry);
        },

        applyPlotFilter() {
            if (!this.plotMarkerLayers.length) {
                return;
            }

            this.plotMarkerLayers.forEach(entry => {
                this.updateMarkerVisibility(entry);
            });
        },

        updateMarkerVisibility(entry) {
            if (!entry || !entry.layer) return;

            const categoryCode = entry.categoryCode || 'forest';
            const shouldShow = this.selectedCategoryType === 'all' || categoryCode === this.selectedCategoryType;

            if (!this.map) {
                entry.visible = shouldShow;
                return;
            }

            const { layer } = entry;
            this.setMarkerVisibility(layer, shouldShow);
            entry.visible = shouldShow;
        },

        // 设置单个标记的可见性
        setMarkerVisibility(layer, visible) {
            const element = layer.getElement?.();
            if (visible) {
                if (!this.map.hasLayer(layer)) layer.addTo(this.map);
                if (element) element.style.display = '';
                if (layer.setOpacity) layer.setOpacity(1);
            } else {
                if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
                if (element) element.style.display = 'none';
                if (layer.setOpacity) layer.setOpacity(0);
            }
        },

        // 添加卫星底图层 - 简化版本，使用固定超时
        async addSatelliteLayer() {
            return new Promise((resolve, reject) => {
                try {
                    const tileLayer = L.tileLayer(
                        'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
                        {
                            attribution: '© 高德地图',
                            subdomains: ['1', '2', '3', '4'],
                            maxZoom: 18,
                            minZoom: 3,
                            tileSize: 256,
                            crossOrigin: true
                        }
                    );

                    tileLayer.addTo(this.map);
                    this.loadingText = '正在加载卫星地图...';

                    // 简单超时方案 - 避免复杂事件跟踪
                    setTimeout(() => {
                        this.isLoading = false;
                        resolve();
                    }, this.mapConfig.tileLoadTimeout);
                }
                catch (error) {
                    this.handleError('卫星图层加载失败', error);
                    reject(error);
                }
            });
        },

        async loadRegionData() {
            try {
                // 防重复加载同一个区域
                if (this.currentLoadedRegion === this.regionName) {
                    this.isLoading = false;
                    return;
                }

                this.loadingText = '正在加载区域轮廓...';
                this.clearPlotLayers();
                this.currentLoadedRegion = this.regionName;

                // 动态导入地图数据
                const baiseDataImport = await import('@/assets/mapdata/baise-districts-final.json');
                const baiseData = baiseDataImport.default || baiseDataImport;

                // 查找当前区县的轮廓数据
                const regionFeature = baiseData.features.find(feature =>
                    feature.properties.name === this.regionName);

                if (regionFeature) {
                    this.addRegionBoundary(regionFeature);
                } else {
                    console.warn('未找到区域轮廓数据:', this.regionName);
                }

                this.isLoading = false;
                this.loadingText = '';
            }
            catch (error) {
                this.handleError('加载区域轮廓失败，请刷新重试', error);
            }
        },

        // 添加区域边界轮廓
        addRegionBoundary(regionFeature) {
            try {
                // 创建区域轮廓图层
                const regionLayer = L.geoJSON(regionFeature, {
                    style: {
                        color: '#c69c6d',
                        weight: 3,
                        opacity: 1,
                        fillColor: 'rgba(76, 253, 235, 0.1)',
                        fillOpacity: 0.1
                    }
                });

                // 添加到地图
                regionLayer.addTo(this.map);
                this.plotLayers.push(regionLayer);

                // 添加区域外遮罩层效果
                this.addRegionMask(regionFeature);

                // 调整地图视野至区域边界
                this.fitMapToContent(regionLayer.getBounds(), this.mapConfig.centerPadding);

                // 添加地块标记
                this.addRealPlotMarkers();

            }
            catch (error) {
                console.error('添加区域边界失败:', error);
            }
        },

        // 添加区域外遮罩层
        addRegionMask(regionFeature) {
            try {
                const regionBounds = L.geoJSON(regionFeature).getBounds();

                // 扩大边界以确保完全覆盖
                const mult = this.mapConfig.regionMaskMarginMultiplier;
                const margin = Math.max(
                    Math.abs(regionBounds.getNorth() - regionBounds.getSouth()) * mult,
                    Math.abs(regionBounds.getEast() - regionBounds.getWest()) * mult
                );

                // 创建一个覆盖整个可视区域的大矩形
                const outerRing = [
                    [regionBounds.getSouth() - margin, regionBounds.getWest() - margin],
                    [regionBounds.getSouth() - margin, regionBounds.getEast() + margin],
                    [regionBounds.getNorth() + margin, regionBounds.getEast() + margin],
                    [regionBounds.getNorth() + margin, regionBounds.getWest() - margin],
                    [regionBounds.getSouth() - margin, regionBounds.getWest() - margin]
                ];

                // 获取区域的坐标（需要反转，作为内部洞）
                let innerRings = [];
                if (regionFeature.geometry.type === 'Polygon') {
                    // 对于Polygon，使用第一个坐标环，并反转坐标顺序
                    const coords = regionFeature.geometry.coordinates[0];
                    innerRings = [coords.map(coord => [coord[1], coord[0]]).reverse()];
                }
                else if (regionFeature.geometry.type === 'MultiPolygon') {
                    // 对于MultiPolygon，处理所有多边形
                    regionFeature.geometry.coordinates.forEach(polygon => {
                        const coords = polygon[0];
                        innerRings.push(coords.map(coord => [coord[1], coord[0]]).reverse());
                    });
                }

                // 创建带洞的多边形
                const maskPolygon = L.polygon([outerRing, ...innerRings], {
                    color: 'transparent',
                    fillColor: 'rgba(0, 0, 0, 0.6)',
                    fillOpacity: 0.6,
                    weight: 0,
                    interactive: false
                });

                // 添加遮罩到地图
                maskPolygon.addTo(this.map);
                this.plotLayers.push(maskPolygon);


            }
            catch (error) {
                console.error('添加区域遮罩失败:', error);
            }
        },

        // 基于真实坐标数据添加地块标记
        async addRealPlotMarkers() {
            try {
                const response = await fetch('http://43.136.169.150:8000/api/v1/geoprocessing/plot-tiles/list');
                const tilesData = await response.json();

                // 使用工具函数转换瓦片数据
                const coordinateData = transformTilesToCoordinates(tilesData);
                const allEntries = Object.entries(coordinateData);

                allEntries.forEach(([key, fieldData]) => {
                    const plotName = fieldData.displayName || fieldData.name || key;

                    // 验证数据完整性
                    if (!isValidFieldData(fieldData)) return;

                    const plotData = createPlotData(fieldData, plotName);
                    const [markerLat, markerLng] = fieldData.center;
                    const markerHtml = generatePlotMarkerHtml(plotData, getTypeIcon);
                    const iconConfig = getMarkerIconConfig(markerHtml);
                    const customIcon = L.divIcon(iconConfig);

                    const plotMarker = L.marker([markerLat, markerLng], { icon: customIcon }).addTo(this.map);

                    // 点击事件：显示地块详情弹窗
                    plotMarker.on('click', () => {
                        this.setPlotDetailPopup(true, fieldData.center, plotData);
                    });

                    this.plotLayers.push(plotMarker);
                    this.registerPlotMarker(plotMarker, plotData.property_category_code);
                });

                // 调整地图视野
                this.fitMapToPlotMarkers();
            }
            catch (error) {
                this.handleError('加载坐标数据失败', error);
            }
        },

        // 调整地图视野以显示地块标记
        fitMapToPlotMarkers() {
            const plotCoordinates = [];
            this.plotLayers.forEach(layer => {
                if (layer.getLatLng) {
                    const latlng = layer.getLatLng();
                    plotCoordinates.push([latlng.lat, latlng.lng]);
                }
            });

            if (plotCoordinates.length > 0) {
                const bounds = L.latLngBounds(plotCoordinates);
                this.fitMapToContent(bounds, this.mapConfig.fitPadding);
            } else {
                this.setDefaultView();
            }
        },

        // 统一的地图视野调整方法
        fitMapToContent(bounds, padding = this.mapConfig.centerPadding) {
            try {
                this.map.fitBounds(bounds, {
                    padding,
                    maxZoom: this.mapConfig.fitZoom
                });
            } catch (error) {
                this.handleError('调整地图视野失败', error);
                this.setDefaultView();
            }
        },

        // 设置地图到默认视野
        setDefaultView() {
            const center = regionCoordinates[this.regionName] || [23.9, 106.6];
            this.map.setView(center, this.mapConfig.fallbackZoom);
        },

        // 清除现有地块图层
        clearPlotLayers() {
            this.plotLayers.forEach(layer => {
                this.map.removeLayer(layer);
            });
            this.plotLayers = [];
            this.plotMarkerLayers = [];
        },

        // 显示/关闭地块详情弹窗
        setPlotDetailPopup(show, plotCenter = null, plotData = null) {
            if (!show) {
                this.showDetailPopup = false;
                this.popupData = null;
                return;
            }

            try {
                const cfg = this.mapConfig;
                const mapContainer = document.getElementById('leaflet-map');
                const mapRect = mapContainer.getBoundingClientRect();
                const point = this.map.latLngToContainerPoint(plotCenter);
                const screenX = mapRect.left + point.x;
                const screenY = mapRect.top + point.y;

                // 计算弹窗位置
                let top = screenY - cfg.popupHeight - cfg.popupOffsetAbove;
                if (top < cfg.popupMargin) {
                    top = screenY + cfg.popupOffsetAbove;
                }
                if (top + cfg.popupHeight > window.innerHeight - cfg.popupMargin) {
                    top = window.innerHeight - cfg.popupHeight - cfg.popupMargin;
                }
                top = Math.max(cfg.popupMargin, top);

                let left = screenX - cfg.popupWidth / 2;
                left = Math.max(cfg.popupMargin, Math.min(left, window.innerWidth - cfg.popupWidth - cfg.popupMargin));

                this.popupPosition = { top, left };
                this.popupData = { ...plotData, photo: '/images/pop-banner.png' };
                this.showDetailPopup = true;
            } catch (error) {
                this.handleError('显示地块详情弹窗失败', error);
            }
        },

        closePlotDetailPopup() {
            this.setPlotDetailPopup(false);
        },

        // 跳转到地块详情页面
        goToPlotDetail() {
            if (this.popupData && this.popupData.name) {
                // 保存popupData的值，因为closePlotDetailPopup会将其设置为null
                const popupDataSnapshot = {
                    name: this.popupData.name,
                    routeTarget: this.popupData.routeTarget,
                    type: this.popupData.type,
                    displayName: this.popupData.displayName,
                    property_category_code: this.popupData.property_category_code,
                    property_type_name: this.popupData.property_type_name
                };

                this.closePlotDetailPopup();

                const targetName = popupDataSnapshot.routeTarget || popupDataSnapshot.name;
                const query = {
                    region: this.regionName,
                    plotName: popupDataSnapshot.name
                };

                // 根据后端 property_category_code 决定 type 参数
                const categoryCode = popupDataSnapshot.property_category_code;
                if (categoryCode === 'factory') {
                    query.type = 'factory';
                }
                else if (categoryCode === 'warehouse') {
                    query.type = 'warehouse';
                }
                else if (categoryCode === 'forest') {
                    // 对于林业，使用 property_type_name 来进一步区分
                    query.type = popupDataSnapshot.property_type_name || 'star-anise';
                }

                this.$router.push({
                    path: `/plot/${ encodeURIComponent(targetName) }`,
                    query
                });
            }
        },

        // 统一错误处理
        handleError(message, error) {
            console.error(message, error);
            this.isLoading = false;
            this.$notify({
                title: '提示',
                message: message,
                type: 'warning',
                duration: 3000
            });
        },

        // 分类过滤相关方法
        filterMapByCategory(category) {
            this.selectedCategoryType = category.type;
            this.applyPlotFilter();
        },

        setCategoryPopup(show) {
            if (!show) {
                this.selectedCategory = null;
                return;
            }
            // show 时不做处理，由外部控制
        },

        closeCategoryPopup() {
            this.setCategoryPopup(false);
        },

        navigateToTertiaryMap() {
            if (!this.selectedCategory) return;

            // 全部选项只是关闭弹窗
            if (this.selectedCategory.isAllOption) {
                this.closeCategoryPopup();
                return;
            }

            this.$emit('category-navigate', {
                categoryType: this.selectedCategory.type,
                categoryName: this.selectedCategory.name
            });

            this.$router.push({
                path: '/plot/八角智能烘干工厂',
                query: {
                    type: 'factory',
                    region: '右江区',
                    category: this.selectedCategory.type
                }
            });

            this.closeCategoryPopup();
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

/* 响应式调整 */
@media (max-width: 768px) {
    .region-info-panel {
        top: 10px;
        right: 10px;
        width: 200px;
    }

    .map-legend {
        bottom: 10px;
        left: 10px;
    }

    .loading-text {
        font-size: 14px;
    }

    .spinner {
        width: 40px;
        height: 40px;
    }
}

.region-detail-map {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;

    border-radius: 10px;
    background: #0a1420;
}

.leaflet-container {
    z-index: 1;
    width: 100%;
    height: 100%;
}

.plot-filter-container {
    position: absolute;
    z-index: 1200;
    top: 0;
    right: 375px;
}

.plot-filter-bar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 12px 48px 39px;

    opacity: .9;
    border-radius: 4px;
    background: #00282a;

    gap: 38px;
}

.plot-filter-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: .6px;
    color: #b7fef7;
}

.plot-filter-close {
    position: absolute;
    right: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 23px;
    height: 23px;
    border: 1px solid #4cfdeb59;
    font-size: 18px;
    line-height: 1;

    color: #b7fef7;
    border-radius: 50%;
    background: transparent;
    transition: all .2s ease;
    cursor: pointer;
}

.plot-filter-close:hover,
.plot-filter-close:focus {
    border-color: #c69c6d;

    color: #051921;
    outline: none;
    background: #4cfdeb4d;
    box-shadow: 0 0 10px #4cfdeb73;
}

.plot-filter-list {
    display: flex;
    flex-direction: column;
    gap: 38px;
}

.plot-filter-button {
    width: 129px;
    min-width: 0;
    height: 37px;
    border: 1px solid #4cfdeb59;
    font-size: 16px;
    font-weight: 500;
    line-height: 37px;
    letter-spacing: .5px;

    color: #b7fef7;
    border-radius: 4px;
    background: #0c283ca6;
    transition: all .2s ease;
    cursor: pointer;
}

.plot-filter-button:hover,
.plot-filter-button:focus {
    border-color: #c69c6d;

    color: #fff;
    outline: none;
    background: #4cfdeb4d;
    box-shadow: 0 0 10px #4cfdeb80;
}

.plot-filter-button.is-active {
    border-color: #c69c6d;
    color: #051921;
    background: linear-gradient(135deg, #c69c6d 0%, #1c9fff 100%);
    box-shadow: 0 10px 24px #4cfdeb66;
}

.plot-filter-button.is-active:hover,
.plot-filter-button.is-active:focus {
    color: #051921;
}

.plot-filter-toggle {
    padding: 8px 18px;
    border: 1px solid #4cfdeb73;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: .5px;

    color: #b7fef7;
    border-radius: 999px;
    background: #050f1ad1;
    box-shadow: 0 10px 24px #0000004d;
    transition: all .2s ease;
    cursor: pointer;

    backdrop-filter: blur(12px);
}

.plot-filter-toggle:hover,
.plot-filter-toggle:focus {
    border-color: #c69c6d;

    color: #051921;
    outline: none;
    background: linear-gradient(135deg, #c69c6d 0%, #1c9fff 100%);
    box-shadow: 0 10px 24px #4cfdeb66;
}


/* 地块标注样式 - 使用全局样式确保在Leaflet中生效 */

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #c69c6d;
}

.panel-header h4 {
    margin: 0;
    font-size: 16px;
    color: #c69c6d;
}

.close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    font-size: 24px;

    color: #c69c6d;
    background: none;
    cursor: pointer;
}

.close-btn:hover {
    color: #ffd700;
}

.panel-content {
    padding: 20px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.info-item .label {
    font-weight: bold;
    color: #fff;
}

.info-item .value {
    color: #ffd700;
}

/* 图例 */
.map-legend {
    position: absolute;
    z-index: 1000;
    bottom: 20px;
    left: 20px;
    padding: 15px;
    border: 1px solid #c69c6d;

    border-radius: 8px;
    background: #001e3ce6;

    backdrop-filter: blur(10px);
}

.map-legend h5 {
    margin: 0 0 10px;
    font-size: 14px;
    color: #c69c6d;
}

.legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.legend-color {
    width: 20px;
    height: 15px;
    margin-right: 10px;
    border-radius: 3px;
}

.legend-item span {
    font-size: 12px;
    color: #fff;
}

/* Leaflet弹窗样式 */
.leaflet-popup-content {
    margin: 0;
}

.plot-popup h4 {
    margin: 0 0 10px;
    color: #c69c6d;
}

.plot-popup p {
    margin: 5px 0;
    color: #333;
}

.plot-popup button {
    margin-top: 10px;
    padding: 5px 10px;
    border: none;

    color: #000;
    border-radius: 3px;
    background: #c69c6d;
    cursor: pointer;
}

.plot-popup button:hover {
    background: #ffd700;
}

/* Leaflet指北针样式 */
.leaflet-compass {
    border: none;
    background: transparent;
    box-shadow: none;
}

/* 加载指示器样式 */
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

    background: #0a1420e6;

    backdrop-filter: blur(5px);
}

.loading-spinner {
    text-align: center;
    color: #c69c6d;
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 20px;
    border: 4px solid #4cfdeb4d;
    border-left: 4px solid #c69c6d;

    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loading-text {
    margin-top: 10px;
    font-size: 16px;
    font-weight: bold;
}

.map-hidden {
    opacity: .3;
}
</style>

<!-- 全局样式，用于Leaflet动态生成的标记 -->
<style>
@keyframes plot-detail-glow {
    from {
        box-shadow: 0 0 20px #4cfcea80 !important;
    }

    to {
        box-shadow: 0 0 30px #4cfceacc !important;
    }
}
@keyframes popup-fade-in {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(.9);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 移动端缩放控件调整 */
@media (max-width: 768px) {
    .leaflet-control-zoom {
        right: 15px !important;
        bottom: 80px !important;
    }

    .leaflet-control-zoom a {
        width: 28px !important;
        height: 28px !important;
        font-size: 16px !important;
        line-height: 26px !important;
    }
}

/* 脉冲动画 */
@keyframes pulse-gold {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: .7;
        transform: scale(1.3);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}
@keyframes pulse-blue {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: .7;
        transform: scale(1.3);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* 响应式调整 */
@media (max-width: 768px) {
    .marker-label {
        padding: 2px 6px !important;
        font-size: 9px !important;
    }

    .plot-filter-container {
        top: 12px;
    }

    .plot-filter-bar {
        padding: 12px 14px;
        gap: 12px;
    }

    .plot-filter-list {
        gap: 8px;
    }

    .plot-filter-button {
        padding: 6px 10px;
        font-size: 12px !important;
    }

    .plot-marker {
        width: 150px !important;
        height: 68px !important;
    }

    .plot-marker.plot-type-star-anise,
    .plot-marker.plot-type-tea-oil {
        width: 160px !important;
    }

    .plot-marker.plot-type-drying {
        width: 140px !important;
    }

    .plot-marker.plot-type-star-anise .plot-content,
    .plot-marker.plot-type-tea-oil .plot-content {
        padding-right: 12px !important;
        padding-left: 68px !important;
    }

    .plot-marker.plot-type-drying .plot-content {
        padding-right: 68px !important;
        padding-left: 12px !important;
    }

    .plot-name {
        font-size: 11px !important;
        line-height: 16px !important;
    }

    .plot-info .info-value {
        font-size: 11px !important;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式调整 - 分类弹窗 */
@media (max-width: 768px) {
    .popup-content {
        width: 95%;
        max-width: 350px;
    }

    .popup-header h3 {
        font-size: 16px;
    }

    .popup-body {
        font-size: 13px;
    }

    .navigate-btn {
        padding: 8px 16px;
        font-size: 13px;
    }
}

.custom-plot-marker {
    z-index: 1000 !important;
    border: none !important;
    background: none !important;
}

/* 二级地图marker icon - 只显示分类图标 */
/* Leaflet marker容器样式调整 */
.leaflet-marker-icon.custom-plot-marker.preview-mark-container {
    width: 48px !important;
    height: 48px !important;
    border: none !important;

    background: transparent !important;
    box-shadow: none !important;
}

.plot-marker-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;

    gap: 2px;
}

.plot-marker-icon {
    display: block !important;
    flex-shrink: 0;
    box-sizing: border-box !important;
    width: 48px !important;
    height: 48px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;

    outline: none !important;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
    transition: all .3s ease;
    cursor: pointer;

    filter: drop-shadow(0 2px 4px #0000004d);
}

.plot-marker-icon:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 4px 8px #4cfcea99);
}

.plot-marker-label {
    overflow: hidden;
    flex-shrink: 0;
    max-width: 160px;
    padding: 1px 4px;
    border: 1px solid #c69c6d66;
    font-size: 11px;
    font-weight: 500;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-word;

    color: #c69c6d;
    border-radius: 3px;
    background: #0f2334f2;
}

.plot-marker {
    position: relative;
    display: flex !important;
    align-items: center !important;

    box-sizing: border-box !important;
    width: 184px !important;
    height: 82px !important;

    border-radius: 12px !important;
    background-repeat: no-repeat !important;
    background-size: 100% 100% !important;
    cursor: pointer;

    filter: drop-shadow(0 2px 8px #0000004d);
}

.plot-marker.plot-type-star-anise,
.plot-marker.plot-type-tea-oil {
    width: 200px !important;
}

.plot-marker.plot-type-drying {
    width: 174px !important;
}

.plot-content {
    display: flex !important;
    flex-direction: column !important;

    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    padding: 4px 16px !important;

    gap: 4px !important;
}

.plot-marker.plot-type-star-anise .plot-content,
.plot-marker.plot-type-tea-oil .plot-content {
    padding-right: 18px !important;
    padding-left: 62px !important;
}

.plot-marker.plot-type-drying .plot-content {
    padding-top: 8px !important;
    padding-left: 12px !important;
}

.plot-name {
    overflow: hidden;
    max-width: 100% !important;
    font-size: 12px !important;
    font-weight: bold !important;
    line-height: 18px !important;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #fff !important;
    text-shadow: 0 1px 4px #00000059 !important;
}

.plot-info {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: baseline !important;

    color: #fff !important;

    gap: 2px !important;
}

.plot-info .info-label {
    font-size: 10px !important;
    color: #ffffffe6 !important;
}

.plot-info .info-value {
    font-size: 12px !important;
    font-weight: bold !important;
    color: #fff !important;
}

.plot-info .info-unit {
    font-size: 10px !important;
    color: #ffffffe6 !important;
}

.plot-info .info-separator {
    padding: 0 2px !important;
    font-size: 10px !important;
    color: #ffffffe6 !important;
}

/* 悬停效果 */
.plot-marker:hover {
    z-index: 1000;
    transition: transform .2s ease;
    transform: scale(1.05);
}

/* 乡镇标签样式 */
.township-label {
    border: none !important;
    background: none !important;
}

.township-name {
    padding: 4px 8px !important;
    border: 1px solid #ffd700 !important;
    font-size: 12px !important;
    font-weight: bold !important;
    text-align: center !important;
    white-space: nowrap !important;

    color: #000 !important;
    border-radius: 4px !important;
    background: #ffd700e6 !important;
    box-shadow: 0 2px 4px #0000004d !important;
}

/* 地块详情标记样式 */
.plot-detail-marker-container {
    border: none !important;
    background: none !important;
}

.plot-detail-marker {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 160px !important;
    height: 80px !important;

    border-radius: 12px !important;
    background: linear-gradient(135deg, #4cfceae6 0%, #0a1420e6 100%) !important;
    box-shadow: 0 0 20px #4cfcea80 !important;
    animation: plot-detail-glow 2s infinite alternate !important;
    cursor: pointer !important;
}

.marker-content {
    padding: 8px !important;
    text-align: center !important;
}

.marker-title {
    overflow: hidden !important;
    max-width: 140px !important;
    margin-bottom: 4px !important;
    font-size: 14px !important;
    font-weight: bold !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;

    color: #c69c6d !important;
}

.marker-info {
    display: flex !important;
    flex-direction: column !important;
    gap: 2px !important;
}

.marker-info span {
    font-size: 11px !important;
    white-space: nowrap !important;
    color: #fff !important;
}

/* Preview Mark 标记样式 */
.preview-mark-container {
    border: none !important;
    background: none !important;
}

.preview-mark-icon {
    width: 40px !important;
    height: 50px !important;

    transition: all .3s ease !important;
    cursor: pointer !important;

    filter: drop-shadow(0 2px 8px #0000004d) !important;
}

.preview-mark-icon:hover {
    transform: scale(1.2) !important;
    filter: drop-shadow(0 0 10px #4cfceacc) !important;
}

/* 地块轮廓标签样式 */
.plot-outline-label {
    border: none !important;
    background: none !important;
}

.plot-label-content {
    padding: 8px 12px;
    border: 2px solid #ff6b35;
    font-size: 12px;
    text-align: center;
    white-space: nowrap;

    color: #fff;
    border-radius: 8px;
    background: #ff6b35e6;
    box-shadow: 0 2px 8px #0000004d;
}

.plot-name {
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: bold;
}

.plot-area {
    font-size: 11px;
    opacity: .9;
}

/* 自定义Leaflet缩放控件样式 */
.leaflet-control-zoom {
    position: absolute !important;
    right: 20px !important;
    bottom: 70px !important; /* 避免与底部导航条冲突 */
    overflow: hidden !important;

    border-radius: 8px !important;
    box-shadow: 0 0 15px #4cfcea4d !important;
}

.leaflet-control-zoom a {
    width: 32px !important;
    height: 32px !important;
    border: 1px solid #4cfcea66 !important;
    font-size: 18px !important;
    font-weight: bold !important;
    line-height: 30px !important;
    text-decoration: none !important;

    color: #c69c6d !important;
    border-radius: 0 !important;
    background: linear-gradient(135deg, #102838e6 0%, #081c24f2 100%) !important;
    transition: all .3s ease !important;

    backdrop-filter: blur(10px) !important;
}

.leaflet-control-zoom a:hover {
    border-color: #4cfceacc !important;
    color: #fff !important;
    background: linear-gradient(135deg, #4cfcea33 0%, #102838f2 100%) !important;
    transform: scale(1.05) !important;
}

.leaflet-control-zoom a:first-child {
    border-bottom: none !important;
    border-radius: 8px 8px 0 0 !important;
}

.leaflet-control-zoom a:last-child {
    border-radius: 0 0 8px 8px !important;
}

.leaflet-disabled {
    opacity: .4 !important;
    cursor: not-allowed !important;
}

/* 地块详情轮廓标签样式 */
.plot-detail-outline-label {
    border: none !important;
    background: none !important;
}

.plot-detail-label-content {
    padding: 8px 12px;
    border: 2px solid #00ff7f;
    font-size: 12px;
    text-align: center;
    white-space: nowrap;

    color: #fff;
    border-radius: 8px;
    background: #00ff7fe6;
    box-shadow: 0 2px 8px #0000004d;
}

.plot-detail-label-content .plot-name {
    margin-bottom: 2px;
    font-size: 13px;
    font-weight: 600;
}

.plot-detail-label-content .plot-area {
    font-size: 11px;
    opacity: .9;
}

/* 地块标注样式 */

/* 原始二级地图标记样式 */
.custom-plot-marker {
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
    background: radial-gradient(circle, #c69c6d, #00bcd4);
    animation: pulse-blue 2s infinite;
}

.marker-label {
    position: relative;
    padding: 3px 8px;
    border: 1px solid #4cfcea66;
    font-size: 10px;
    font-weight: bold;
    white-space: nowrap;

    color: #c69c6d;
    border-radius: 4px;
    background: linear-gradient(135deg, #102838f2, #081c24fa);
    box-shadow: 0 2px 8px #0000004d;
}

/* 添加向下的三角形箭头 */
.marker-label::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    width: 0;
    height: 0;
    border-top: 8px solid #081c24fa;
    border-right: 6px solid transparent;
    border-left: 6px solid transparent;

    transform: translateX(-50%);
}

/* 分类弹窗 */
.category-popup {
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    background: #0009;
    animation: fadeIn .3s ease;
}

.popup-content {
    width: 90%;
    max-width: 400px;
    border: 1px solid #4cfcea66;

    border-radius: 12px;
    background: #0f2334f2;
    box-shadow: 0 8px 32px #00000080;
    animation: slideUp .3s ease;
}

.popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #4cfcea33;
}

.popup-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #c69c6d;
}

.popup-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: none;
    font-size: 24px;
    font-weight: 600;

    color: #4cfceacc;
    background: none;
    transition: color .3s ease;
    cursor: pointer;
}

.popup-close-btn:hover {
    color: #4cfcea;
}

.popup-body {
    padding: 20px;
    font-size: 14px;
    line-height: 1.6;
    color: #4cfceae6;
}

.popup-stats {
    margin-top: 15px;
    padding: 10px;
    border-left: 3px solid #4cfcea66;

    border-radius: 4px;
    background: #4cfcea0d;
}

.popup-stats span {
    font-weight: 600;
    color: #c69c6d;
}

.popup-footer {
    display: flex;
    justify-content: flex-end;
    padding: 15px 20px;
    border-top: 1px solid #4cfcea33;
}

.navigate-btn {
    padding: 10px 24px;
    border: none;
    font-size: 14px;
    font-weight: 600;

    color: #fff;
    border-radius: 6px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    transition: all .3s ease;
    cursor: pointer;
}

.navigate-btn:hover {
    background: linear-gradient(135deg, #16a34a, #15803d);
    box-shadow: 0 4px 12px #22c55e66;
    transform: translateY(-2px);
}

</style>
