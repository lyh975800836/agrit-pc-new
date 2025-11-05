<template>
  <div class="region-detail-map">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- 二级地图分类右侧栏 -->
    <div v-if="!isPlotDetailPage" class="category-sidebar">
      <div class="category-sidebar-title">分类</div>
      <div class="category-sidebar-list">
        <button
          v-for="(category, index) in categories"
          :key="index"
          class="category-sidebar-btn"
          :class="{ 'all-option': category.isAllOption, 'active': selectedCategoryType === category.type }"
          :title="category.name"
          @click="filterMapByCategory(category)"
        >
          <img v-if="category.icon" :src="category.icon" :alt="category.name" />
          <span class="category-name">{{ category.name }}</span>
        </button>
      </div>
    </div>

    <!-- 分类弹窗 -->
    <div v-if="selectedCategory" class="category-popup" @click.self="closeCategoryPopup">
      <div class="popup-content">
        <div class="popup-header">
          <h3>{{ selectedCategory.name }}</h3>
          <button class="popup-close-btn" @click="closeCategoryPopup">✕</button>
        </div>
        <div class="popup-body">
          <p>{{ selectedCategory.description }}</p>
          <div class="popup-stats" v-if="selectedCategory.count">
            <span>共 {{ selectedCategory.count }} 个</span>
          </div>
        </div>
        <div class="popup-footer">
          <button class="navigate-btn" @click="navigateToTertiaryMap">查看详情</button>
        </div>
      </div>
    </div>

    <!-- Leaflet地图容器 -->
    <div id="leaflet-map" class="leaflet-container" :class="{ 'map-hidden': isLoading }"></div>

    <!-- 地块详情弹窗 -->
    <div
      v-if="showDetailPopup && popupData"
      class="plot-detail-popup"
      :style="{ top: popupPosition.top + 'px', left: popupPosition.left + 'px' }"
    >
      <!-- 弹窗关闭按钮 -->
      <button class="popup-close-button" @click="closePlotDetailPopup">
        <span class="close-icon">×</span>
      </button>

      <!-- 弹窗内容 -->
      <div class="popup-content">
        <!-- 信息展示区域 -->
        <div class="popup-info-section">
          <!-- 地块/设施名称 -->
          <h3 class="popup-title">{{ popupData.name }}</h3>

          <!-- 分隔线 -->
          <div class="popup-divider"></div>

          <!-- 地块信息 -->
          <div class="popup-info-item">
            <span class="info-label">区域：</span>
            <span class="info-value">{{ popupData.district || regionName }}</span>
          </div>

          <!-- 面积信息 -->
          <div class="popup-info-item">
            <span class="info-label">面积：</span>
            <span class="info-value">{{ popupData.area || '100' }}亩</span>
          </div>

          <!-- 农户/所有人信息 -->
          <div class="popup-info-item" v-if="popupData.farmerName">
            <span class="info-label">{{ popupData.type === 'warehouse' ? '所有人' : '农户' }}：</span>
            <span class="info-value">{{ popupData.farmerName }}</span>
          </div>
        </div>

        <!-- 图片容器 -->
        <div class="popup-image-container">
          <img
            class="popup-image"
            :src="popupData.photo || '/images/pop-banner.png'"
            :alt="popupData.name"
          />
        </div>

        <!-- 按钮区域 -->
        <div class="popup-button-section">
          <button class="detail-button" @click="goToPlotDetail">查看详情</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import {
    generateMockPlotConfig
} from '@/utils/plotConfig';

// 使用CDN引入的Leaflet (在index.html中已引入)
const { L } = window;

const DEFAULT_PLOT_TYPE = 'star-anise';

export default {
    name: 'RegionDetailMap',
    props: {
        regionName: {
            type: String,
            required: true
        },
        showPlotDetails: {
            type: Boolean,
            default: false
        },
        showPlotMarkers: {
            type: Boolean,
            default: true
        },
        plotData: {
            type: Object,
            default: null
        },
        isPlotDetailPage: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            map: null,
            regionPlots: [],
            plotLayers: [],
            plotMarkerLayers: [],
            selectedPlot: null,
            isLoading: true,
            loadingText: '正在初始化地图...',
            currentLoadedRegion: null, // 记录当前已加载的区域，防重复加载
            showDetailPopup: false, // 控制地块详情弹窗显示
            popupPosition: { top: 0, left: 0 }, // 弹窗位置
            popupData: null, // 弹窗数据
            connectorLine: null, // 连接线图层
            plotFilterOptions: [
                { label: '全部', value: 'all' },
                { label: '林（八角林）', value: 'star-anise' },
                { label: '厂（加工厂）', value: 'drying-facility' },
                { label: '仓（交收仓）', value: 'tea-oil' }
            ],
            selectedPlotFilter: 'all',
            showPlotFilterBar: true,
            selectedCategory: null,
            selectedCategoryType: 'all',  // 当前选中的分类类型
            categories: [
                { id: 0, name: '全部', icon: '', description: '查看所有地块', count: 85, type: 'all', isAllOption: true },
                { id: 1, name: '八角基地', icon: '/images/map-filter1.png', description: '八角种植基地', count: 12, type: 'star-anise' },
                { id: 2, name: '茶油基地', icon: '/images/map-filter2.png', description: '茶油种植基地', count: 8, type: 'tea-oil' },
                { id: 3, name: '烘干工厂', icon: '/images/map-filter3.png', description: '八角烘干工厂', count: 6, type: 'drying-facility' },
                { id: 4, name: '农资商店', icon: '/images/map-filter4.png', description: '农资销售商店', count: 15, type: '农资商店' },
                { id: 5, name: '中心工厂', icon: '/images/map-filter5.png', description: '中心加工工厂', count: 4, type: '中心工厂' },
                { id: 6, name: '产地仓', icon: '/images/map-filter6.png', description: '产地仓储设施', count: 10, type: '产地仓' },
                { id: 7, name: '交收仓', icon: '/images/map-filter7.png', description: '交易收购仓', count: 7, type: '交收仓' },
                { id: 8, name: '云仓', icon: '/images/map-filter8.png', description: '智能云仓储', count: 3, type: '云仓' },
                { id: 9, name: '晒场', icon: '/images/map-filter9.png', description: '晒干晾晒场地', count: 20, type: '晒场' }
            ],
            // 区域中心坐标
            regionCoordinates: {
                百色市: [23.9, 106.6],
                右江区: [23.75, 106.28], // 修正为接近实际地块的坐标
                田林县: [24.3, 106.2],
                德保县: [23.3, 106.6],
                靖西市: [23.1, 106.4],
                田阳区: [23.7, 106.9],
                田东县: [23.6, 107.1],
                西林县: [24.49, 105.09], // 西林县坐标
                隆林各族自治县: [24.77, 105.34], // 隆林各族自治县坐标
                巴塘: [24.236, 106.205], // 添加巴塘坐标
                大楞乡: [24.236, 106.205], // 大楞乡坐标
                新村合作地块: [24.236, 106.205] // 地块坐标
            },

            // 区域名称到adcode的映射
            regionToAdcode: {
                右江区: '451002',
                田阳区: '451003',
                田东县: '451022',
                德保县: '451024',
                那坡县: '451026',
                凌云县: '451027',
                乐业县: '451028',
                田林县: '451029',
                西林县: '451030',
                隆林各族自治县: '451031'
            }
        };
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
                    this.isLoading = false;
                    return;
                }

                // 确保DOM元素存在
                const mapElement = document.getElementById('leaflet-map');
                if (!mapElement) {
                    setTimeout(() => this.initializeMapComponent(), 200);
                    return;
                }

                // 如果地图已存在，先销毁
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }

                // 重置状态
                this.resetComponentState();

                // 初始化地图
                await this.initMap();

                // 检查是否为雷哥三级视图，如果是则跳过区域数据加载
                const isLeiGeThirdLevel = this.isPlotDetailPage
                                        && this.plotData
                                        && this.plotData.name === '雷哥';

                if (!isLeiGeThirdLevel) {
                    // 加载区域数据（雷哥三级视图时跳过，避免覆盖PNG图片）
                    await this.loadRegionData();
                }


            }
            catch (error) {
                this.isLoading = false;
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
            this.regionPlots = [];
            this.plotLayers = [];
            this.plotMarkerLayers = [];
            this.selectedPlot = null;
            this.currentLoadedRegion = null;
            this.showDetailPopup = false;
            this.popupData = null;
            this.selectedPlotFilter = 'all';
            this.showPlotFilterBar = true;

            if (this.connectorLine && this.map) {
                this.map.removeLayer(this.connectorLine);
                this.connectorLine = null;
            }
        },

        // 初始化Leaflet地图
        initMap() {
            return new Promise((resolve, reject) => {
                try {

                    const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];

                    this.map = L.map('leaflet-map', {
                        center,
                        zoom: 12,
                        minZoom: 8,
                        maxZoom: 16,
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

                    // 检查是否为雷哥地块的三级视图，如果是则使用本地PNG图片

                    const isLeiGeThirdLevel = this.isPlotDetailPage
                                            && this.plotData
                                            && this.plotData.name === '雷哥';


                    if (isLeiGeThirdLevel) {
                        // 雷哥地块：使用本地PNG图片，不加载卫星底图

                        // 设置地图背景色
                        const mapContainer = document.getElementById('leaflet-map');
                        if (mapContainer) {
                            mapContainer.style.backgroundColor = '#2C5F5A';
                        }

                        // 尝试添加PNG图片覆盖层
                        this.addLeiGePngOverlay().then(() => {
                            this.loadingText = '雷哥地块图片加载完成';
                            setTimeout(() => {
                                this.isLoading = false;
                                resolve();
                            }, 300);
                        })
                            .catch(error => {
                                console.error('PNG图片加载失败，回退到卫星底图:', error);
                                // 如果PNG加载失败，回退到正常的卫星底图
                                this.addSatelliteLayer().then(resolve)
                                    .catch(reject);
                            });
                    }
                    else {
                        // 正常情况：使用卫星底图
                        this.addSatelliteLayer().then(resolve)
                            .catch(reject);
                    }


                }
                catch (error) {
                    console.error('地图初始化失败:', error);
                    reject(error);
                }
            });
        },

        extendCoordinateEntries(coordinateData) {
            const baseEntries = Object.entries(coordinateData);
            const mockEntries = this.createMockPlotEntries(coordinateData);
            return [...baseEntries, ...mockEntries];
        },

        createMockPlotEntries(coordinateData) {
            const entries = [];
            const mockConfigs = generateMockPlotConfig();

            mockConfigs.forEach(config => {
                const basePlot = coordinateData[config.baseKey];
                if (!basePlot || !Array.isArray(basePlot.center)) {
                    return;
                }

                const mockPlot = this.buildMockPlot(basePlot, config);
                if (mockPlot) {
                    entries.push([config.key, mockPlot]);
                }
            });

            return entries;
        },

        buildMockPlot(basePlot, config) {
            const [baseLat, baseLng] = basePlot.center;
            if (typeof baseLat !== 'number' || typeof baseLng !== 'number') {
                return null;
            }

            const offsetLat = config.offset?.lat || 0;
            const offsetLng = config.offset?.lng || 0;

            const mockCenter = [baseLat + offsetLat, baseLng + offsetLng];
            const mockPolygon = Array.isArray(basePlot.leaflet_polygon)
                ? basePlot.leaflet_polygon.map(ring =>
                    ring.map(([lat, lng]) => [lat + offsetLat, lng + offsetLng]))
                : basePlot.leaflet_polygon;

            const baseClone = JSON.parse(JSON.stringify(basePlot));

            return {
                ...baseClone,
                name: config.displayName,
                displayName: config.displayName,
                routeName: config.routeName || basePlot.name,
                type: config.type,
                center: mockCenter,
                leaflet_polygon: mockPolygon
            };
        },

        resolvePlotType(fieldData) {
            if (fieldData && fieldData.type) {
                return this.normalizePlotType(fieldData.type);
            }
            return DEFAULT_PLOT_TYPE;
        },

        normalizePlotType(plotType) {
            switch (plotType) {
                case 'star-anise':
                case 'premium':
                    return 'star-anise';
                case 'tea-oil':
                case 'normal':
                    return 'tea-oil';
                case 'drying-facility':
                case 'average':
                    return 'drying-facility';
                default:
                    return DEFAULT_PLOT_TYPE;
            }
        },

        getPlotMarkerVisualConfig(plotType) {
            const normalizedType = this.normalizePlotType(plotType);
            const baseConfig = {
                backgroundImage: '/images/star-anise.png',
                typeClass: 'plot-type-star-anise',
                width: 200,
                height: 82,
                anchorYOffset: 8,
                positionOffset: { lat: 0, lng: 0 }
            };

            switch (normalizedType) {
                case 'tea-oil':
                case 'normal':
                    return {
                        ...baseConfig,
                        backgroundImage: '/images/tea-oil.png',
                        typeClass: 'plot-type-tea-oil',
                        positionOffset: { lat: 0.05, lng: 0.08 }
                    };
                case 'drying-facility':
                case 'average':
                    return {
                        backgroundImage: '/images/drying-facility.png',
                        typeClass: 'plot-type-drying',
                        width: 174,
                        height: 82,
                        anchorYOffset: 8,
                        positionOffset: { lat: -0.05, lng: -0.08 }
                    };
                case 'star-anise':
                case 'premium':
                default:
                    return { ...baseConfig };
            }
        },

        // 获取分类图标
        getCategoryIcon(plotType) {
            const normalizedType = this.normalizePlotType(plotType);
            const categoryMap = {
                'star-anise': '/images/map-filter1.png',     // 八角基地
                'tea-oil': '/images/map-filter2.png',        // 茶油基地
                'drying-facility': '/images/map-filter3.png', // 烘干工厂
                'average': '/images/map-filter3.png'         // 烘干工厂（备选）
            };
            return categoryMap[normalizedType] || '/images/map-filter1.png';
        },

        changePlotFilter(filterValue) {
            if (this.selectedPlotFilter === filterValue) {
                return;
            }
            this.selectedPlotFilter = filterValue;
            this.applyPlotFilter();
        },

        closePlotFilterBar() {
            this.showPlotFilterBar = false;
        },

        openPlotFilterBar() {
            this.showPlotFilterBar = true;
            this.$nextTick(() => this.applyPlotFilter());
        },

        registerPlotMarker(layer, plotType) {
            if (!layer) {
                return;
            }

            const entry = {
                layer,
                type: this.normalizePlotType(plotType),
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
            if (!entry || !entry.layer) {
                return;
            }

            const targetType = entry.type || DEFAULT_PLOT_TYPE;
            const shouldShow = (this.selectedPlotFilter === 'all' || targetType === this.selectedPlotFilter) &&
                               (this.selectedCategoryType === 'all' || targetType === this.selectedCategoryType);

            if (!this.map) {
                entry.visible = shouldShow;
                return;
            }

            const { layer } = entry;
            const element = layer.getElement ? layer.getElement() : null;

            if (shouldShow) {
                if (!this.map.hasLayer(layer)) {
                    layer.addTo(this.map);
                }

                if (element) {
                    element.style.display = '';
                    element.style.pointerEvents = '';
                    element.style.opacity = '1';
                }

                if (layer.setOpacity) {
                    layer.setOpacity(1);
                }

                entry.visible = true;
            }
            else {
                if (element) {
                    element.style.display = 'none';
                    element.style.pointerEvents = 'none';
                }

                if (layer.setOpacity) {
                    layer.setOpacity(0);
                }

                if (this.map.hasLayer(layer)) {
                    this.map.removeLayer(layer);
                }

                entry.visible = false;
            }
        },

        // 添加雷哥地块的PNG图片覆盖层
        async addLeiGePngOverlay() {
            try {
                // 直接定义雷哥地块的显示边界
                // 使用扩大的地理范围来展示PNG图片，覆盖整个视图区域
                const bounds = [
                    [22.5, 105.5], // 西南角 [纬度, 经度]
                    [24.0, 107.5] // 东北角 [纬度, 经度]
                ];


                // 创建图片覆盖层
                const imageUrl = '/demo/坐标/雷哥/巴平雷哥.png';
                const imageOverlay = L.imageOverlay(imageUrl, bounds, {
                    opacity: 1.0,
                    alt: '雷哥地块PNG图',
                    interactive: false
                });

                // 使用Promise等待图片加载完成
                await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => {
                        // 图片加载成功，添加到地图
                        imageOverlay.addTo(this.map);
                        this.plotLayers.push(imageOverlay);

                        // 缩放到图片显示位置
                        this.map.fitBounds(bounds, {
                            padding: [20, 20],
                            maxZoom: 16
                        });

                        resolve();
                    };

                    img.onerror = () => {
                        reject(new Error('PNG图片加载失败'));
                    };

                    img.src = imageUrl;
                });

            }
            catch (error) {
                console.error('添加雷哥PNG覆盖层失败:', error);
                throw error;
            }
        },

        // 添加标准的卫星底图层
        async addSatelliteLayer() {
            return new Promise((resolve, reject) => {
                try {
                    // 使用高德卫星图
                    const tileLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
                        attribution: '© 高德地图',
                        subdomains: ['1', '2', '3', '4'],
                        maxZoom: 18,
                        minZoom: 3,
                        tileSize: 256,
                        crossOrigin: true
                    });

                    let tilesLoading = 0;
                    let tilesLoaded = 0;
                    let initialLoadComplete = false;

                    const checkLoadComplete = () => {
                        if (!initialLoadComplete && tilesLoading > 0 && tilesLoaded >= tilesLoading) {
                            initialLoadComplete = true;
                            this.loadingText = '地图加载完成';
                            setTimeout(() => {
                                this.isLoading = false;
                                resolve();
                            }, 300);
                        }
                    };

                    tileLayer.on('loading', () => {
                        this.loadingText = '正在加载卫星地图...';
                        tilesLoading = 0;
                        tilesLoaded = 0;
                        initialLoadComplete = false;
                    });

                    tileLayer.on('tileloadstart', () => {
                        tilesLoading++;
                    });

                    tileLayer.on('tileload', () => {
                        tilesLoaded++;
                        if (tilesLoading > 0) {
                            const progress = Math.round((tilesLoaded / tilesLoading) * 100);
                            this.loadingText = `加载卫星地图 ${ progress }%`;
                        }
                        checkLoadComplete();
                    });

                    tileLayer.on('tileerror', () => {
                        tilesLoaded++;
                        checkLoadComplete();
                    });

                    // 添加到地图
                    tileLayer.addTo(this.map);

                    // 设置超时，确保不会永远等待
                    setTimeout(() => {
                        if (!initialLoadComplete) {
                            this.isLoading = false;
                            resolve();
                        }
                    }, 5000);

                }
                catch (error) {
                    console.error('卫星图层加载失败:', error);
                    reject(error);
                }
            });
        },

        // 加载坐标数据
        async loadCoordinateData() {
            if (this.coordinateData) {
                return this.coordinateData;
            }

            try {
                const response = await fetch('/demo/coordinates.json');
                this.coordinateData = await response.json();
                return this.coordinateData;
            }
            catch (error) {
                console.warn('坐标数据加载失败:', error);
                throw error;
            }
        },

        async loadRegionData() {
            try {
                // 防重复加载同一个区域
                if (this.currentLoadedRegion === this.regionName) {
                    return;
                }

                this.loadingText = '正在加载区域轮廓...';

                // 清除现有图层
                this.clearPlotLayers();

                // 记录当前加载的区域
                this.currentLoadedRegion = this.regionName;

                // 从区县级地图文件中加载当前区县的轮廓数据
                const baiseDataImport = await import('@/assets/mapdata/baise-districts-final.json');
                const baiseData = baiseDataImport.default || baiseDataImport;

                // 找到当前区县的轮廓数据
                const regionFeature = baiseData.features.find(feature =>
                    feature.properties.name === this.regionName);


                if (regionFeature) {
                    this.addRegionBoundary(regionFeature);
                }
                else {
                    console.warn('未找到区域轮廓数据，区域名称:', this.regionName);
                }

                // 添加地块标记（仅在二级地图页面显示）
                if (!this.showPlotDetails) {
                    await this.addPlotMarkers();
                }

                this.isLoading = false;

            }
            catch (error) {
                console.error('加载区域轮廓失败:', error);
                this.isLoading = false;
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

                // 只在非地块详情页面调整地图视野，避免覆盖地块详情的高缩放级别
                if (!this.isPlotDetailPage) {
                    this.map.fitBounds(regionLayer.getBounds(), {
                        padding: [30, 30],
                        maxZoom: 14 // 设置合理的最大缩放级别确保卫星瓦片可用
                    });
                }


                // 只有当showPlotMarkers为true时才添加地块标注
                if (this.showPlotMarkers) {
                    // 添加真实坐标地块标注
                    this.addRealPlotMarkers();
                }

                // 如果是地块详情页面，显示具体地块信息
                if (this.isPlotDetailPage && this.plotData) {
                    this.addPlotDetailMarker(regionFeature);
                }

            }
            catch (error) {
                console.error('添加区域边界失败:', error);
            }
        },

        // 添加区域外遮罩层
        addRegionMask(regionFeature) {
            try {
                // 立即执行，不延迟
                // 获取区域边界而不是当前地图边界
                const geoJsonLayer = L.geoJSON(regionFeature);
                const regionBounds = geoJsonLayer.getBounds();

                // 扩大边界以确保完全覆盖
                const margin = Math.max(
                    Math.abs(regionBounds.getNorth() - regionBounds.getSouth()) * 3,
                    Math.abs(regionBounds.getEast() - regionBounds.getWest()) * 3
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

        // 添加地块标注
        async addPlotMarkers() {

            // 生成基于真实demo坐标的地块数据
            const plots = await this.generatePlotData();

            if (plots.length === 0) {
                console.warn('没有地块数据可添加！');
                return;
            }

            plots.forEach(plot => {
                const visualConfig = this.getPlotMarkerVisualConfig(plot.type);
                const { positionOffset } = visualConfig;
                const markerHtml = this.createPlotMarkerHtml(plot);

                // icon尺寸：48x48
                const iconSize = 48;
                const offsetLat = positionOffset?.lat || 0;
                const offsetLng = positionOffset?.lng || 0;
                const markerLat = plot.lat + offsetLat;
                const markerLng = plot.lng + offsetLng;

                const customIcon = L.divIcon({
                    className: 'leaflet-marker-icon custom-plot-marker preview-mark-container',
                    html: markerHtml,
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize / 2, iconSize / 2]
                });

                // 添加标记到地图
                const marker = L.marker([markerLat, markerLng], { icon: customIcon });

                // 添加点击事件，显示地块详情弹窗
                marker.on('click', () => {
                    // 构建完整的plotData对象
                    const plotData = {
                        ...plot,
                        type: plot.type || 'star-anise',
                        displayName: plot.displayName || plot.name,
                        district: this.regionName
                    };
                    // 先显示弹窗，不直接跳转
                    this.showPlotDetailPopup([markerLat, markerLng], plotData);
                });

                marker.addTo(this.map);
                this.plotLayers.push(marker);

                if (!this.isPlotDetailPage) {
                    this.registerPlotMarker(marker, plot.type);
                }
            });


            // 调整地图视野以显示所有地块标记
            console.log('正在调整地图视野以显示地块标记...');
            this.fitMapToPlotMarkers();
        },


        // 基于真实坐标数据添加地块标记
        async addRealPlotMarkers() {

            try {
                const response = await fetch('/demo/coordinates.json');
                const coordinateData = await response.json();

                // 如果是三级地图，只显示当前地块的标记
                if (this.isPlotDetailPage && this.plotData && this.plotData.name) {
                    const currentPlotData = coordinateData[this.plotData.name];
                    if (currentPlotData && currentPlotData.center) {
                        this.addSinglePlotMarker(this.plotData.name, currentPlotData);
                    }
                    else {
                        console.warn('未找到当前地块的坐标数据:', this.plotData.name);
                    }
                    return;
                }

                const allEntries = this.extendCoordinateEntries(coordinateData);

                allEntries.forEach(([key, fieldData]) => {
                    const plotName = fieldData.displayName || fieldData.name || key;
                    console.log(`处理地块: ${ plotName }`, fieldData);

                    if (fieldData.center && fieldData.leaflet_polygon) {
                        const assignedType = this.resolvePlotType(fieldData);
                        const displayName = plotName;

                        const plotData = {
                            name: displayName,
                            displayName,
                            area: fieldData.area || '30',
                            output: '1970', // 产量
                            type: assignedType,
                            lat: fieldData.center[0],
                            lng: fieldData.center[1]
                        };

                        // 根据页面类型选择不同的标记样式
                        let customIcon;
                        let markerLat = fieldData.center[0];
                        let markerLng = fieldData.center[1];
                        if (this.isPlotDetailPage) {
                            // 三级地图：使用简单的图片标记
                            customIcon = L.divIcon({
                                className: 'preview-mark-container',
                                html: `<img src="/images/preview-mark.png" class="preview-mark-icon" alt="${ displayName }" />`,
                                iconSize: [40, 50],
                                iconAnchor: [20, 50]
                            });
                        }
                        else {
                            // 二级地图：使用icon标记
                            const markerHtml = this.createPlotMarkerHtml(plotData);
                            const iconSize = 48;

                            customIcon = L.divIcon({
                                className: 'leaflet-marker-icon custom-plot-marker preview-mark-container',
                                html: markerHtml,
                                iconSize: [iconSize, iconSize],
                                iconAnchor: [iconSize / 2, iconSize / 2]
                            });
                        }

                        const plotMarker = L.marker([
                            markerLat,
                            markerLng
                        ], {
                            icon: customIcon
                        }).addTo(this.map);

                        // 添加点击事件：显示弹窗，然后通过弹窗内的按钮跳转
                        plotMarker.on('click', () => {
                            // 无论二级还是三级页面，都先显示弹窗
                            this.showPlotDetailPopup(fieldData.center, plotData);
                        });

                        // 将标记添加到图层数组，用于地图视野调整
                        this.plotLayers.push(plotMarker);

                        if (!this.isPlotDetailPage) {
                            this.registerPlotMarker(plotMarker, assignedType);
                        }

                    }
                });


                // 调整地图视野以显示所有地块标记
                console.log('正在调整地图视野以显示地块标记...');
                this.fitMapToPlotMarkers();
            }
            catch (error) {
                console.error('加载坐标数据失败:', error);
                // 如果失败，添加默认标记
                this.addFallbackMarkers();
            }
        },

        // 添加备用标记
        addFallbackMarkers() {
            const plotLocations = [
                { name: '示例地块1', lat: 23.75, lng: 106.28, color: '#c69c6d' },
                { name: '示例地块2', lat: 23.76, lng: 106.29, color: '#FFD700' },
                { name: '示例地块3', lat: 23.74, lng: 106.27, color: '#FF6B35' }
            ];

            plotLocations.forEach(plot => {
                const plotMarker = L.circleMarker([plot.lat, plot.lng], {
                    color: plot.color,
                    fillColor: plot.color,
                    fillOpacity: 0.8,
                    radius: 15,
                    weight: 3
                }).addTo(this.map);

                plotMarker.bindPopup(`
                    <div style="text-align: center;">
                        <h4>${ plot.name }</h4>
                        <p>面积: 30亩</p>
                        <p>产量: 1970斤</p>
                    </div>
                `);

                this.plotLayers.push(plotMarker);

                if (!this.isPlotDetailPage) {
                    this.registerPlotMarker(plotMarker, DEFAULT_PLOT_TYPE);
                }

            });
        },

        // 添加单个地块标记（用于三级地图）
        addSinglePlotMarker(plotName, fieldData) {

            if (fieldData.center) {
                // 转换center坐标：WGS84 -> GCJ-02
                const [lat, lng] = fieldData.center;
                const [gcjLng, gcjLat] = this.wgs84ToGcj02(lng, lat);
                const resolvedName = fieldData.displayName || fieldData.name || plotName;
                const routeTarget = fieldData.routeName || plotName;

                // 创建地块数据对象
                const plotData = {
                    name: resolvedName,
                    displayName: resolvedName,
                    routeTarget,
                    area: fieldData.area || '30',
                    output: '1970',
                    type: this.resolvePlotType(fieldData),
                    lat: gcjLat,
                    lng: gcjLng
                };

                // 三级地图：使用简单的图片标记
                const customIcon = L.divIcon({
                    className: 'preview-mark-container',
                    html: `<img src="/images/preview-mark.png" class="preview-mark-icon" alt="${ resolvedName }" />`,
                    iconSize: [40, 50],
                    iconAnchor: [20, 50]
                });

                const plotMarker = L.marker([gcjLat, gcjLng], {
                    icon: customIcon
                }).addTo(this.map);

                // 添加点击事件显示预览弹窗
                plotMarker.on('click', () => {
                    console.log(`点击了${ resolvedName }地块`);
                    this.showPlotDetailPopup([gcjLat, gcjLng], plotData);
                });

                // 将标记添加到图层数组
                this.plotLayers.push(plotMarker);

            }
        },

        // 调整地图视野以显示地块标记
        fitMapToPlotMarkers() {
            try {
                if (this.plotLayers.length === 0) {
                    return;
                }

                // 计算所有地块标记的边界
                const plotCoordinates = [];
                this.plotLayers.forEach(layer => {
                    if (layer.getLatLng) {
                        const latlng = layer.getLatLng();
                        plotCoordinates.push([latlng.lat, latlng.lng]);
                    }
                });

                if (plotCoordinates.length > 0) {
                    // 创建边界并适配
                    const bounds = L.latLngBounds(plotCoordinates);

                    this.map.fitBounds(bounds, {
                        padding: [50, 50],
                        maxZoom: 14
                    });

                }
                else {
                    const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
                    this.map.setView(center, 13);
                }
            }
            catch (error) {
                console.error('调整地图视野失败:', error);
                const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
                this.map.setView(center, 13);
            }
        },

        // 生成地块数据（保持原有的三个地块）
        async generatePlotData() {
            // 直接使用原来的coordinates.json方式，保持原有的三个地块
            return await this.generatePlotDataFromCoordinates();
        },

        // 回退方法：从coordinates.json加载地块数据
        async generatePlotDataFromCoordinates() {
            try {
                const response = await fetch('/demo/coordinates.json');
                const coordinateData = await response.json();
                const plots = [];

                const allEntries = this.extendCoordinateEntries(coordinateData);

                allEntries.forEach(([key, fieldData]) => {
                    console.log(`处理地块: ${ key }`, fieldData);

                    if (fieldData.coordinates && fieldData.coordinates.length > 0) {
                        let center;
                        if (fieldData.center) {
                            center = fieldData.center;
                        }
                        else {
                            center = this.calculatePolygonCenter(fieldData.coordinates);
                        }

                        const plotName = fieldData.displayName || fieldData.name || key;
                        const plotId = plotName && plotName.includes('巴塘') ? '1002' : plotName;

                        const plot = {
                            id: plotId,
                            name: plotName,
                            lat: center[1],
                            lng: center[0],
                            area: fieldData.area || '未知',
                            output: Math.floor(Math.random() * 20) + 5,
                            type: this.resolvePlotType(fieldData),
                            coordinates: fieldData.coordinates
                        };

                        plots.push(plot);
                    }
                });

                return plots;
            }
            catch (error) {
                console.error('加载demo坐标数据失败:', error);
                return [];
            }
        },


        // 检查点是否在区域内部
        isPointInRegion(point, regionFeature) {
            try {
                // 使用turf.js的点在多边形内检测（如果可用）
                if (window.turf && window.turf.booleanPointInPolygon) {
                    const turfPoint = window.turf.point(point);
                    return window.turf.booleanPointInPolygon(turfPoint, regionFeature);
                }

                // 备选方案：使用射线法检测点在多边形内
                return this.pointInPolygon(point, regionFeature.geometry.coordinates);

            }
            catch (error) {
                console.warn('点在区域检测失败，默认返回true:', error);
                return true;
            }
        },

        // 射线法检测点在多边形内（备选方案）
        pointInPolygon(point, coords) {
            try {
                const [x, y] = point;
                let inside = false;

                // 处理多边形坐标（取第一个环）
                const polygon = coords[0] || coords;

                for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                    const [xi, yi] = polygon[i];
                    const [xj, yj] = polygon[j];

                    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                        inside = !inside;
                    }
                }

                return inside;
            }
            catch (error) {
                console.warn('射线法检测失败:', error);
                return true;
            }
        },

        // 创建地块标记HTML
        createPlotMarkerHtml(plot) {
            // 只显示分类图标，点击时弹出详细信息
            const categoryIcon = this.getCategoryIcon(plot.type);
            console.log('Plot:', plot.name, 'Type:', plot.type, 'Icon:', categoryIcon);
            return `<div class="plot-marker-icon" style="background-image: url('${ categoryIcon }'); width: 48px; height: 48px;"></div>`;
        },

        // 清除现有地块图层
        clearPlotLayers() {
            this.plotLayers.forEach(layer => {
                this.map.removeLayer(layer);
            });
            this.plotLayers = [];
            this.plotMarkerLayers = [];
        },

        // 分批添加地块到地图
        async addPlotsProgressively(features) {
            const batchSize = 20; // 每批处理20个地块
            const totalBatches = Math.ceil(features.length / batchSize);

            for (let i = 0; i < totalBatches; i++) {
                const startIndex = i * batchSize;
                const endIndex = Math.min(startIndex + batchSize, features.length);
                const batch = features.slice(startIndex, endIndex);

                this.loadingText = `正在加载地块 ${ endIndex }/${ features.length }`;

                // 添加当前批次的地块
                this.addPlotsToMap(batch);

                // 让浏览器有时间渲染，避免阻塞UI
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // 所有地块加载完成后调整视野
            setTimeout(() => {
                this.fitMapToPlots(features);
            }, 100);
        },

        // 添加地块到地图
        addPlotsToMap(features) {

            features.forEach((feature, index) => {

                const plotName = feature.properties?.name || `${ this.regionName }地块${ index + 1 }`;
                const area = (feature.area || this.calculatePolygonArea(feature.geometry.coordinates)).toFixed(1);
                const output = (Math.random() * 1000 + 500).toFixed(1);

                // 转换坐标格式（GeoJSON格式为[lng, lat]，Leaflet需要[lat, lng]）
                const coordinates = this.convertGeoJsonCoordinates(feature.geometry.coordinates);

                if (coordinates.length === 0) {
                    console.warn(`地块 ${ plotName } 坐标转换失败，跳过`);
                    return;
                }

                const plotData = {
                    name: plotName,
                    area,
                    output,
                    feature
                };

                // 创建多边形样式
                const plotStyle = {
                    color: index % 2 === 0 ? '#c69c6d' : '#FFD700',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: index % 2 === 0 ? '#c69c6d' : '#FFD700',
                    fillOpacity: 0.2,
                    dashArray: '8,4'
                };

                try {
                    // 创建多边形
                    const polygon = L.polygon(coordinates, plotStyle);

                    // 添加点击事件
                    polygon.on('click', () => {
                        this.selectPlot(plotData);
                    });

                    // 添加悬停事件
                    polygon.on('mouseover', e => {
                        e.target.setStyle({
                            weight: 4,
                            fillOpacity: 0.4
                        });
                    });

                    polygon.on('mouseout', e => {
                        e.target.setStyle(plotStyle);
                    });

                    // 添加Popup
                    polygon.bindPopup(`
            <div class="plot-popup">
              <h4>${ plotData.name }</h4>
              <p><strong>面积:</strong> ${ plotData.area }亩</p>
              <p><strong>产量:</strong> ${ plotData.output }吨</p>
              <button onclick="this.parentElement.parentElement.dispatchEvent(new CustomEvent('selectPlot'))">查看详情</button>
            </div>
          `);

                    // 添加到地图和图层数组
                    polygon.addTo(this.map);
                    this.plotLayers.push(polygon);

                    // 保存地块数据
                    this.regionPlots.push(plotData);

                }
                catch (error) {
                    console.error(`添加地块 ${ plotName } 失败:`, error);
                }
            });
        },

        // 转换GeoJSON坐标为Leaflet格式
        convertGeoJsonCoordinates(coords) {

            // GeoJSON Polygon: [[[lng,lat], [lng,lat], ...]]
            // Leaflet需要: [[lat,lng], [lat,lng], ...]
            let leafletCoords = [];

            try {
                if (!coords || !Array.isArray(coords)) {
                    console.warn('坐标数据无效或非数组');
                    return [];
                }

                // 深度检查坐标结构 - 验证嵌套数组结构

                // 处理标准Polygon格式: [[[lng,lat], [lng,lat], ...]]
                if (coords[0] && Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && !Array.isArray(coords[0][0][0])) {
                    leafletCoords = coords[0]
                        .filter(coord => Array.isArray(coord) && coord.length >= 2)
                        .map(coord => {
                            const converted = [parseFloat(coord[1]), parseFloat(coord[0])]; // 交换lng,lat为lat,lng
                            return converted;
                        })
                        .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1])); // 过滤NaN值
                }
                // 处理MultiPolygon或更深层嵌套: [[[[lng,lat], ...]]]
                else if (coords[0] && Array.isArray(coords[0]) && Array.isArray(coords[0][0]) && Array.isArray(coords[0][0][0])) {
                    leafletCoords = coords[0][0]
                        .filter(coord => Array.isArray(coord) && coord.length >= 2)
                        .map(coord => {
                            const converted = [parseFloat(coord[1]), parseFloat(coord[0])];
                            return converted;
                        })
                        .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                }
                // 处理直接的坐标数组格式: [[lng,lat], [lng,lat], ...]
                else if (coords[0] && Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
                    leafletCoords = coords
                        .filter(coord => Array.isArray(coord) && coord.length >= 2)
                        .map(coord => {
                            const converted = [parseFloat(coord[1]), parseFloat(coord[0])];
                            return converted;
                        })
                        .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                }


                // 验证坐标范围是否合理（中国境内）
                const validCoords = leafletCoords.filter(coord => {
                    const lat = coord[0];
                    const lng = coord[1];
                    return lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135;
                });

                if (validCoords.length !== leafletCoords.length) {
                    console.warn(`过滤了${ leafletCoords.length - validCoords.length }个超出中国范围的坐标点`);
                }

                return validCoords;

            }
            catch (error) {
                console.error('坐标转换失败:', error);
                return [];
            }
        },

        // 调整地图视野
        fitMapToPlots(features) {
            if (features.length === 0) {
                return;
            }

            // 如果是三级地块详情页面，不执行视野调整，保持高缩放级别
            if (this.isPlotDetailPage && this.plotData) {
                return;
            }

            try {

                if (this.plotLayers.length === 0) {
                    const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
                    this.map.setView(center, 12);
                    return;
                }

                // 创建图层组并获取边界
                const group = new L.featureGroup(this.plotLayers);
                const bounds = group.getBounds();


                // 检查边界是否有效
                if (bounds.isValid()) {
                    this.map.fitBounds(bounds, {
                        padding: [30, 30], // 减小边距
                        maxZoom: 16 // 稍微提高最大缩放级别
                    });
                }
                else {

                    // 手动计算所有地块的边界
                    let minLat = Infinity; let maxLat = -Infinity;
                    let minLng = Infinity; let maxLng = -Infinity;

                    this.plotLayers.forEach(layer => {
                        try {
                            const layerBounds = layer.getBounds();
                            if (layerBounds.isValid()) {
                                const sw = layerBounds.getSouthWest();
                                const ne = layerBounds.getNorthEast();

                                minLat = Math.min(minLat, sw.lat);
                                maxLat = Math.max(maxLat, ne.lat);
                                minLng = Math.min(minLng, sw.lng);
                                maxLng = Math.max(maxLng, ne.lng);

                            }
                        }
                        catch (e) {
                            console.warn('获取图层边界失败:', e);
                        }
                    });

                    if (minLat !== Infinity && maxLat !== -Infinity) {
                        const manualBounds = L.latLngBounds([minLat, minLng], [maxLat, maxLng]);
                        this.map.fitBounds(manualBounds, { padding: [30, 30], maxZoom: 16 });
                    }
                    else {
                        const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
                        this.map.setView(center, 12);
                    }
                }
            }
            catch (error) {
                console.error('调整地图视野失败:', error);
                // 使用备用方案
                const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
                this.map.setView(center, 12);
            }
        },

        // 创建默认地块（当没有找到真实数据时）
        createDefaultPlots() {
            const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];
            const defaultPlots = [
                {
                    name: `${ this.regionName }示例地块1`,
                    coordinates: [
                        [center[0] + 0.01, center[1] - 0.01],
                        [center[0] + 0.01, center[1] + 0.01],
                        [center[0] - 0.01, center[1] + 0.01],
                        [center[0] - 0.01, center[1] - 0.01]
                    ],
                    area: '150.0',
                    output: '450.5'
                }
            ];

            defaultPlots.forEach(plot => {
                const polygon = L.polygon(plot.coordinates, {
                    color: '#c69c6d',
                    weight: 3,
                    fillColor: '#c69c6d',
                    fillOpacity: 0.2
                });

                polygon.bindPopup(`
          <div class="plot-popup">
            <h4>${ plot.name }</h4>
            <p><strong>面积:</strong> ${ plot.area }亩</p>
            <p><strong>产量:</strong> ${ plot.output }吨</p>
          </div>
        `);

                polygon.addTo(this.map);
                this.plotLayers.push(polygon);
            });
        },

        // 计算多边形面积（简化计算）
        calculatePolygonArea(coordinates) {
            // 简化面积计算，基于坐标点数量
            if (coordinates && coordinates[0] && coordinates[0].length) {
                return coordinates[0].length * 10; // 简单的面积估算
            }
            return 100;
        },

        // 选择地块
        selectPlot(plotData) {
            this.selectedPlot = plotData;
        },

        // 关闭信息面板
        closeInfoPanel() {
            this.selectedPlot = null;
        },

        // 导航到地块详情页或下钻到地块轮廓
        navigateToPlotDetail(plot) {

            // 如果是在地块详情页面中，则触发下钻到乡镇事件
            if (this.showPlotDetails) {
                this.loadTownshipData(plot.name);
            }
            else {
                // 特殊处理：雷哥地块使用本地PNG图片
                if (plot.name === '雷哥') {
                    this.showLeiGePngImage();
                }
                else {
                    // 在二级地图中，跳转到三级地图页面（PlotDetail）
                    const encodedPlotId = encodeURIComponent(plot.name);
                    this.$router.push(`/plot/${ encodedPlotId }`);
                }
            }
        },

        // 显示带有本地图片的地块
        async showPlotWithLocalImage(plot) {
            try {

                // 获取雷哥地块的边界信息
                const plotData = this.coordinateData && this.coordinateData['雷哥'];
                if (!plotData || !plotData.leaflet_polygon) {
                    console.error('未找到雷哥地块的坐标数据');
                    return;
                }

                // 计算地块的边界
                const polygon = plotData.leaflet_polygon[0]; // 第一个多边形
                const bounds = L.polygon(polygon).getBounds();


                // 隐藏卫星底图层 - 遍历所有图层并移除tile层
                this.map.eachLayer(layer => {
                    if (layer instanceof L.TileLayer) {
                        this.map.removeLayer(layer);
                    }
                });

                // 设置地图背景为纯色，避免看到空白
                const mapContainer = document.getElementById('leaflet-map');
                if (mapContainer) {
                    mapContainer.style.backgroundColor = '#2C5F5A';
                }

                // 创建图片覆盖层 - 使用完全不透明显示
                const imageUrl = '/demo/坐标/雷哥/巴平雷哥.png';
                const imageOverlay = L.imageOverlay(imageUrl, bounds, {
                    opacity: 1.0, // 完全不透明，作为主要背景
                    alt: '雷哥地块卫星图',
                    interactive: true
                });

                // 添加到地图
                imageOverlay.addTo(this.map);
                this.plotLayers.push(imageOverlay);

                // 缩放到地块位置
                this.map.fitBounds(bounds, {
                    padding: [20, 20],
                    maxZoom: 16
                });


            }
            catch (error) {
                console.error('显示雷哥地块图片失败:', error);
                // 如果失败，回退到原有逻辑
                const encodedPlotId = encodeURIComponent(plot.name);
                this.$router.push(`/plot/${ encodedPlotId }`);
            }
        },

        // 直接显示雷哥PNG图片
        showLeiGePngImage() {

            // 清除现有图层
            this.map.eachLayer(layer => {
                if (layer instanceof L.TileLayer || this.plotLayers.includes(layer)) {
                    this.map.removeLayer(layer);
                }
            });
            this.plotLayers = [];

            // 使用扩大的边界显示PNG图片，覆盖整个视图区域
            const bounds = [
                [22.5, 105.5], // 西南角 [纬度, 经度]
                [24.0, 107.5] // 东北角 [纬度, 经度]
            ];

            // 创建图片覆盖层
            const imageUrl = '/demo/坐标/雷哥/巴平雷哥.png';
            const imageOverlay = L.imageOverlay(imageUrl, bounds, {
                opacity: 1.0,
                alt: '雷哥地块PNG图',
                interactive: false
            });

            // 添加图片到地图
            imageOverlay.addTo(this.map);
            this.plotLayers.push(imageOverlay);

            // 缩放到图片区域
            this.map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 16
            });

        },

        // 下钻到地块轮廓显示
        async drillDownToPlotOutline(plot) {
            try {

                // 清除当前的地块标记
                this.clearPlotLayers();

                // 如果地块有坐标数据，显示地块轮廓
                if (plot.coordinates && plot.coordinates.length > 0) {
                    console.log('使用地块坐标数据绘制轮廓');
                    this.drawPlotOutline(plot);
                }
                else {
                    console.log('地块无坐标数据，尝试从demo数据加载');
                    await this.loadPlotOutlineFromDemo(plot);
                }

                // 缩放到地块区域
                this.zoomToPlot(plot);

            }
            catch (error) {
                console.error('下钻到地块轮廓失败:', error);
                // 如果下钻失败，回退到跳转页面的方式
                this.fallbackToPlotDetailPage(plot);
            }
        },

        // 绘制地块轮廓
        drawPlotOutline(plot) {
            console.log('绘制地块轮廓:', plot.name, '坐标点数:', plot.coordinates.length);

            // 转换坐标格式 [lng, lat] -> [lat, lng]
            const leafletCoords = plot.coordinates.map(coord => [coord[1], coord[0]]);

            // 创建地块轮廓多边形
            const polygon = L.polygon(leafletCoords, {
                color: '#ff6b35', // 边框颜色：橙红色
                weight: 3, // 边框宽度
                fillColor: '#ff6b35', // 填充颜色
                fillOpacity: 0.3, // 填充透明度
                dashArray: '5, 5' // 虚线样式
            });

            // 添加到地图
            polygon.addTo(this.map);
            this.plotLayers.push(polygon);

            // 绑定点击事件 - 点击轮廓跳转到详情页
            polygon.on('click', () => {
                console.log('点击地块轮廓，跳转到详情页');
                this.jumpToPlotDetailPage(plot);
            });

            // 添加地块标签
            this.addPlotLabel(plot, leafletCoords);

            console.log('地块轮廓绘制完成');
        },

        // 从demo数据加载地块轮廓
        async loadPlotOutlineFromDemo(plot) {
            try {
                console.log('从demo数据加载地块轮廓:', plot.name);

                const response = await fetch('/demo/coordinates.json');
                const coordinateData = await response.json();

                // 参考mapshaper.org的理念，对坐标数据进行优化简化
                this.optimizeCoordinateData(coordinateData);

                // 查找匹配的地块数据
                const plotData = coordinateData[plot.name] || coordinateData[plot.id];

                if (plotData && plotData.leaflet_polygon) {
                    console.log('找到demo地块数据，绘制轮廓');

                    // 创建地块轮廓
                    const polygon = L.polygon(plotData.leaflet_polygon, {
                        color: '#ff6b35',
                        weight: 3,
                        fillColor: '#ff6b35',
                        fillOpacity: 0.3,
                        dashArray: '5, 5'
                    });

                    polygon.addTo(this.map);
                    this.plotLayers.push(polygon);

                    // 绑定点击事件
                    polygon.on('click', () => {
                        this.jumpToPlotDetailPage(plot);
                    });

                    // 添加标签
                    this.addPlotLabel(plot, plotData.leaflet_polygon[0]);

                }
                else {
                    console.log('未找到地块轮廓数据，使用fallback方式');
                    throw new Error('未找到地块轮廓数据');
                }

            }
            catch (error) {
                console.error('从demo数据加载地块轮廓失败:', error);
                throw error;
            }
        },

        // 添加地块标签
        addPlotLabel(plot, coordinates) {
            // 计算地块中心点
            const center = this.calculatePolygonCenter(coordinates);

            // 创建标签标记
            const label = L.marker(center, {
                icon: L.divIcon({
                    className: 'plot-outline-label',
                    html: `<div class="plot-label-content">
                        <div class="plot-name">${ plot.name }</div>
                        <div class="plot-area">${ plot.area }亩</div>
                    </div>`,
                    iconSize: [120, 40],
                    iconAnchor: [60, 20]
                })
            });

            label.addTo(this.map);
            this.plotLayers.push(label);
        },

        // 计算多边形中心点
        calculatePolygonCenter(coordinates) {
            if (!coordinates || coordinates.length === 0) {
                return [0, 0];
            }

            let latSum = 0; let lngSum = 0;
            coordinates.forEach(coord => {
                // coord格式是[longitude, latitude]
                lngSum += coord[0]; // 经度
                latSum += coord[1]; // 纬度
            });

            // 返回[latitude, longitude]格式
            return [latSum / coordinates.length, lngSum / coordinates.length];
        },

        // 缩放到地块区域
        zoomToPlot(plot) {
            if (plot.lat && plot.lng) {
                // 缩放到地块位置，使用较高的缩放级别看到轮廓细节
                this.map.setView([plot.lat, plot.lng], 16);
                console.log('缩放到地块位置:', plot.lat, plot.lng);
            }
        },

        // 跳转到地块详情页
        jumpToPlotDetailPage(plot) {
            console.log('跳转到地块详情页:', plot.name);

            const encodedPlotId = encodeURIComponent(plot.id);
            this.$router.push({
                name: 'PlotDetail',
                params: {
                    plotId: encodedPlotId
                },
                query: {
                    region: this.regionName,
                    plotName: plot.name,
                    area: plot.area,
                    output: plot.output
                }
            }).then(() => {
                console.log('路由跳转成功');
            })
                .catch(err => {
                    console.error('路由跳转失败:', err);
                });
        },

        // 回退到详情页面方式
        fallbackToPlotDetailPage(plot) {
            console.log('使用fallback方式跳转到详情页');
            this.jumpToPlotDetailPage(plot);
        },


        // 加载乡镇数据
        async loadTownshipData(townshipName) {
            try {
                this.loadingText = `正在加载${ townshipName }乡镇轮廓...`;
                this.isLoading = true;

                // 清除现有图层
                this.clearPlotLayers();

                // 从乡镇级地图文件中加载轮廓数据
                const townshipDataImport = await import('@/assets/mapdata/GeoJSON-Polygon-ok_geo4_ETD221128-250623-141758.json');
                const townshipData = townshipDataImport.default || townshipDataImport;

                // 根据乡镇名称过滤数据（这里需要根据实际数据结构调整）
                const townshipFeatures = townshipData.features.filter(feature =>
                    feature.properties.name && (
                        feature.properties.name.includes(townshipName.replace('地块', ''))
            || feature.properties.name.includes('乡')
            || feature.properties.name.includes('镇')
                    )).slice(0, 5); // 限制显示数量

                console.log(`找到${ townshipFeatures.length }个相关的乡镇轮廓`);

                if (townshipFeatures.length > 0) {
                    this.addTownshipBoundaries(townshipFeatures);
                }
                else {
                    console.warn(`未找到${ townshipName }的乡镇轮廓数据，显示默认乡镇`);
                    // 显示前5个乡镇作为示例
                    const defaultFeatures = townshipData.features.slice(0, 5);
                    this.addTownshipBoundaries(defaultFeatures);
                }

                this.isLoading = false;

            }
            catch (error) {
                console.error('加载乡镇轮廓失败:', error);
                this.isLoading = false;
            }
        },

        // 添加乡镇边界轮廓
        addTownshipBoundaries(townshipFeatures) {
            try {
                const townshipLayer = L.geoJSON(townshipFeatures, {
                    style: {
                        color: '#FFD700',
                        weight: 2,
                        opacity: 1,
                        fillColor: 'rgba(255, 215, 0, 0.1)',
                        fillOpacity: 0.1
                    }
                });

                // 添加到地图
                townshipLayer.addTo(this.map);
                this.plotLayers.push(townshipLayer);

                // 调整地图视野以适应乡镇边界
                this.map.fitBounds(townshipLayer.getBounds(), {
                    padding: [30, 30],
                    maxZoom: 14
                });

                console.log('乡镇轮廓已添加到地图');

                // 为每个乡镇添加标签
                townshipFeatures.forEach(feature => {
                    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                        const center = this.getFeatureCenter(feature);
                        if (center) {
                            const marker = L.marker(center, {
                                icon: L.divIcon({
                                    className: 'township-label',
                                    html: `<div class="township-name">${ feature.properties.name || '乡镇' }</div>`,
                                    iconSize: [100, 25],
                                    iconAnchor: [50, 12]
                                })
                            });
                            marker.addTo(this.map);
                            this.plotLayers.push(marker);
                        }
                    }
                });

            }
            catch (error) {
                console.error('添加乡镇边界失败:', error);
            }
        },

        // 获取要素中心点
        getFeatureCenter(feature) {
            try {
                const geoJsonLayer = L.geoJSON(feature);
                const bounds = geoJsonLayer.getBounds();
                const center = bounds.getCenter();
                return [center.lat, center.lng];
            }
            catch (error) {
                console.error('计算要素中心失败:', error);
                return null;
            }
        },

        // 添加地块详情轮廓（用于三级页面）
        async addPlotDetailMarker(regionFeature) {
            try {
                console.log('=== 开始添加地块详情轮廓 ===');
                console.log('isPlotDetailPage:', this.isPlotDetailPage);
                console.log('plotData:', this.plotData);
                console.log('plotData.coordinates存在:', !!(this.plotData && this.plotData.coordinates));

                // 如果plotData中已有坐标数据，直接使用
                if (this.plotData && this.plotData.coordinates) {
                    console.log('=== 使用plotData中的坐标数据绘制轮廓 ===');
                    this.drawPlotDetailOutline(this.plotData);
                    return;
                }
                console.log('plotData中没有坐标数据，尝试从文件加载');


                // 从coordinates.json加载对应的地块数据
                const response = await fetch('/demo/coordinates.json');
                const coordinateData = await response.json();

                // 根据plotData.name查找对应的地块坐标数据
                let selectedPlotData = null;

                // 提取地块名称关键字（去掉"地块"后缀）
                const plotName = this.plotData?.name || '';
                const plotKey = plotName.replace('地块', '');

                // 在coordinates.json中查找匹配的地块
                for (const [key, value] of Object.entries(coordinateData)) {
                    if (key.includes(plotKey) || plotKey.includes(key)) {
                        selectedPlotData = value;
                        console.log(`找到匹配的地块数据: ${ key }`, value);
                        break;
                    }
                }

                // 如果没找到对应地块，使用第一个作为默认
                if (!selectedPlotData) {
                    const keys = Object.keys(coordinateData);
                    if (keys.length > 0) {
                        selectedPlotData = coordinateData[keys[0]];
                        console.log('未找到匹配地块，使用默认地块:', keys[0]);
                    }
                }

                if (!selectedPlotData) {
                    console.error('未找到任何地块数据');
                    return;
                }

                console.log('已加载地块坐标数据:', selectedPlotData);

                // 使用selectedPlotData中的leaflet_polygon坐标数据
                if (!selectedPlotData.leaflet_polygon || selectedPlotData.leaflet_polygon.length === 0) {
                    console.error('地块坐标数据不完整');
                    return;
                }

                // 直接使用leaflet_polygon格式的坐标（已经是Leaflet需要的[lat, lng]格式）
                const plotCoordinates = selectedPlotData.leaflet_polygon;

                console.log('地块坐标点数量:', plotCoordinates.length);

                // 添加地块轮廓多边形
                const plotPolygon = L.polygon(plotCoordinates, {
                    color: '#c69c6d',
                    weight: 4,
                    opacity: 1,
                    fillColor: 'rgba(76, 252, 234, 0.3)',
                    fillOpacity: 0.3,
                    dashArray: '8,4'
                });

                // 添加悬停效果
                plotPolygon.on('mouseover', () => {
                    plotPolygon.setStyle({
                        weight: 5,
                        fillOpacity: 0.5,
                        color: '#FFD700'
                    });
                });

                plotPolygon.on('mouseout', () => {
                    plotPolygon.setStyle({
                        weight: 4,
                        fillOpacity: 0.3,
                        color: '#c69c6d'
                    });
                });

                plotPolygon.addTo(this.map);
                this.plotLayers.push(plotPolygon);

                // 获取地块边界用于放置标记点
                const plotBounds = plotPolygon.getBounds();

                // 创建多个preview-mark标记点
                this.addMultiplePreviewMarks(plotCoordinates, plotBounds);

                // 使用地块的真实中心点或bounds来调整地图视野
                let mapBounds;
                if (selectedPlotData.center) {
                    // 如果有中心点，基于中心点创建bounds
                    const { center } = selectedPlotData;
                    const offset = 0.002; // 适当的偏移量
                    mapBounds = L.latLngBounds(
                        [center[0] - offset, center[1] - offset],
                        [center[0] + offset, center[1] + offset]
                    );
                }
                else {
                    // 否则使用多边形的bounds
                    mapBounds = plotBounds;
                }

                // 统一放大到地块位置，使用高德地图支持的最高缩放级别
                this.map.fitBounds(mapBounds, {
                    padding: [5, 5],
                    maxZoom: 18
                });

                console.log('真实地块详情标记已添加，坐标点数量:', plotCoordinates.length);

            }
            catch (error) {
                console.error('添加地块详情标记失败:', error);
                // 如果加载失败，回退到mock数据
                this.addPlotDetailMarkerFallback(regionFeature);
            }
        },

        // 回退方法：使用mock数据
        addPlotDetailMarkerFallback(regionFeature) {
            try {
                console.log('使用fallback方法添加地块标记');

                // 获取区域中心点作为基准
                const geoJsonLayer = L.geoJSON(regionFeature);
                const bounds = geoJsonLayer.getBounds();
                const center = bounds.getCenter();

                // 生成具体地块的mock坐标数据
                const plotCoordinates = this.generatePlotCoordinates(center, this.plotData);

                // 添加地块轮廓多边形
                const plotPolygon = L.polygon(plotCoordinates, {
                    color: '#c69c6d',
                    weight: 4,
                    opacity: 1,
                    fillColor: 'rgba(76, 252, 234, 0.3)',
                    fillOpacity: 0.3,
                    dashArray: '8,4'
                });

                plotPolygon.addTo(this.map);
                this.plotLayers.push(plotPolygon);

                // 创建多个preview-mark标记点
                this.addMultiplePreviewMarks(plotCoordinates, bounds);

                // 统一放大到地块位置，使用高德地图支持的最高缩放级别
                this.map.fitBounds(plotPolygon.getBounds(), {
                    padding: [5, 5],
                    maxZoom: 18
                });

                console.log('Fallback地块详情标记已添加');

            }
            catch (error) {
                console.error('Fallback添加地块详情标记失败:', error);
            }
        },

        // 添加多个preview-mark标记点
        addMultiplePreviewMarks(plotCoordinates, bounds) {
            try {
                // 计算地块内部的有效位置
                const validPositions = this.generatePositionsInsidePolygon(plotCoordinates, 5);

                const markersData = [
                    {
                        position: validPositions[0] || [bounds.getCenter().lat, bounds.getCenter().lng],
                        name: '监测点A',
                        type: 'sensor'
                    },
                    {
                        position: validPositions[1] || [bounds.getCenter().lat, bounds.getCenter().lng],
                        name: '监测点B',
                        type: 'sensor'
                    },
                    {
                        position: validPositions[2] || [bounds.getCenter().lat, bounds.getCenter().lng],
                        name: '监测点C',
                        type: 'sensor'
                    },
                    {
                        position: validPositions[3] || [bounds.getCenter().lat, bounds.getCenter().lng],
                        name: '监测点D',
                        type: 'sensor'
                    },
                    {
                        position: validPositions[4] || [bounds.getCenter().lat, bounds.getCenter().lng],
                        name: '中心监测点',
                        type: 'main'
                    }
                ];

                markersData.forEach(markerData => {
                    // 使用preview-mark.png图片作为标记图标，增大尺寸提升体验
                    const previewIcon = L.divIcon({
                        className: 'preview-mark-container',
                        html: `<img src="/images/preview-mark.png" class="preview-mark-icon" alt="${ markerData.name }" />`,
                        iconSize: [40, 50],
                        iconAnchor: [20, 50]
                    });

                    const previewMarker = L.marker(markerData.position, { icon: previewIcon });

                    // 添加点击事件
                    previewMarker.on('click', () => {
                        this.showPlotDetailPopup(markerData.position, {
                            ...this.plotData,
                            name: markerData.name
                        });
                    });

                    // 添加悬停效果
                    previewMarker.on('mouseover', e => {
                        const img = e.target.getElement().querySelector('.preview-mark-icon');
                        if (img) {
                            img.style.transform = 'scale(1.2)';
                            img.style.filter = 'drop-shadow(0 0 10px rgba(76, 252, 234, 0.8))';
                        }
                    });

                    previewMarker.on('mouseout', e => {
                        const img = e.target.getElement().querySelector('.preview-mark-icon');
                        if (img) {
                            img.style.transform = 'scale(1)';
                            img.style.filter = 'none';
                        }
                    });

                    previewMarker.addTo(this.map);
                    this.plotLayers.push(previewMarker);
                });

                console.log(`添加了 ${ markersData.length } 个 preview-mark 标记点`);

            }
            catch (error) {
                console.error('添加preview-mark标记失败:', error);
            }
        },

        // 在多边形内部生成有效位置点
        generatePositionsInsidePolygon(polygonCoordinates, numPoints) {
            try {
                const positions = [];

                // 计算多边形的边界框
                let minLat = Infinity; let maxLat = -Infinity;
                let minLng = Infinity; let maxLng = -Infinity;

                polygonCoordinates.forEach(coord => {
                    const lat = coord[0];
                    const lng = coord[1];
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);
                });

                // 计算多边形重心作为第一个点
                const centroid = this.calculatePolygonCentroid(polygonCoordinates);
                if (this.isPointInPolygonCoords([centroid[1], centroid[0]], polygonCoordinates)) {
                    positions.push(centroid);
                }

                // 生成其他点位
                let attempts = 0;
                const maxAttempts = numPoints * 20;

                while (positions.length < numPoints && attempts < maxAttempts) {
                    // 在边界框内随机生成点
                    const lat = minLat + Math.random() * (maxLat - minLat);
                    const lng = minLng + Math.random() * (maxLng - minLng);

                    // 检查点是否在多边形内部
                    if (this.isPointInPolygonCoords([lng, lat], polygonCoordinates)) {
                        // 确保与已有点保持一定距离
                        let tooClose = false;
                        for (const existingPos of positions) {
                            const distance = Math.sqrt(
                                Math.pow(lat - existingPos[0], 2)
                + Math.pow(lng - existingPos[1], 2)
                            );
                            if (distance < 0.0008) { // 最小距离阈值
                                tooClose = true;
                                break;
                            }
                        }

                        if (!tooClose) {
                            positions.push([lat, lng]);
                        }
                    }

                    attempts++;
                }

                console.log(`在多边形内生成了 ${ positions.length } 个有效位置点`);
                return positions;

            }
            catch (error) {
                console.error('生成多边形内部位置失败:', error);
                return [];
            }
        },

        // 计算多边形重心
        calculatePolygonCentroid(coordinates) {
            let centroidLat = 0;
            let centroidLng = 0;
            let signedArea = 0;

            for (let i = 0; i < coordinates.length - 1; i++) {
                const lat0 = coordinates[i][0];
                const lng0 = coordinates[i][1];
                const lat1 = coordinates[i + 1][0];
                const lng1 = coordinates[i + 1][1];

                const a = lat0 * lng1 - lat1 * lng0;
                signedArea += a;
                centroidLat += (lat0 + lat1) * a;
                centroidLng += (lng0 + lng1) * a;
            }

            signedArea *= 0.5;
            centroidLat /= (6 * signedArea);
            centroidLng /= (6 * signedArea);

            return [centroidLat, centroidLng];
        },

        // 检查点是否在多边形坐标内部
        isPointInPolygonCoords(point, polygonCoordinates) {
            try {
                const [x, y] = point;
                let inside = false;

                for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
                    const [xi, yi] = [polygonCoordinates[i][1], polygonCoordinates[i][0]]; // 注意坐标顺序
                    const [xj, yj] = [polygonCoordinates[j][1], polygonCoordinates[j][0]];

                    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                        inside = !inside;
                    }
                }

                return inside;
            }
            catch (error) {
                console.warn('点在多边形检测失败:', error);
                return false;
            }
        },

        // 生成地块坐标数据
        generatePlotCoordinates(centerPoint, plotData) {
            // 根据地块名称和面积生成不同形状的多边形坐标
            const plotName = plotData?.name || '';
            const area = parseFloat(plotData?.area || '40');

            // 基础偏移量，根据面积调整
            const baseOffset = Math.sqrt(area) * 0.0008; // 面积越大，地块越大

            // 根据地块名称生成不同形状
            let coordinates = [];

            if (plotName.includes('新村') || plotName.includes('合作')) {
                // 新村合作地块 - 不规则农田形状
                coordinates = [
                    [centerPoint.lat + baseOffset * 0.8, centerPoint.lng - baseOffset * 1.2],
                    [centerPoint.lat + baseOffset * 1.1, centerPoint.lng - baseOffset * 0.3],
                    [centerPoint.lat + baseOffset * 0.9, centerPoint.lng + baseOffset * 0.8],
                    [centerPoint.lat + baseOffset * 0.2, centerPoint.lng + baseOffset * 1.3],
                    [centerPoint.lat - baseOffset * 0.5, centerPoint.lng + baseOffset * 1.1],
                    [centerPoint.lat - baseOffset * 1.0, centerPoint.lng + baseOffset * 0.4],
                    [centerPoint.lat - baseOffset * 1.2, centerPoint.lng - baseOffset * 0.2],
                    [centerPoint.lat - baseOffset * 0.8, centerPoint.lng - baseOffset * 0.9],
                    [centerPoint.lat - baseOffset * 0.3, centerPoint.lng - baseOffset * 1.4],
                    [centerPoint.lat + baseOffset * 0.2, centerPoint.lng - baseOffset * 1.3]
                ];
            }
            else if (plotName.includes('大楞') || plotName.includes('乡')) {
                // 大楞乡地块 - 梯田形状
                coordinates = [
                    [centerPoint.lat + baseOffset * 0.9, centerPoint.lng - baseOffset * 1.1],
                    [centerPoint.lat + baseOffset * 1.0, centerPoint.lng - baseOffset * 0.1],
                    [centerPoint.lat + baseOffset * 0.7, centerPoint.lng + baseOffset * 0.6],
                    [centerPoint.lat + baseOffset * 0.3, centerPoint.lng + baseOffset * 1.2],
                    [centerPoint.lat - baseOffset * 0.1, centerPoint.lng + baseOffset * 1.0],
                    [centerPoint.lat - baseOffset * 0.6, centerPoint.lng + baseOffset * 0.8],
                    [centerPoint.lat - baseOffset * 0.9, centerPoint.lng + baseOffset * 0.2],
                    [centerPoint.lat - baseOffset * 1.1, centerPoint.lng - baseOffset * 0.3],
                    [centerPoint.lat - baseOffset * 0.8, centerPoint.lng - baseOffset * 0.8],
                    [centerPoint.lat - baseOffset * 0.4, centerPoint.lng - baseOffset * 1.2],
                    [centerPoint.lat + baseOffset * 0.1, centerPoint.lng - baseOffset * 1.3]
                ];
            }
            else if (plotName.includes('山') || plotName.includes('坡')) {
                // 山坡地块 - 山地轮廓形状
                coordinates = [
                    [centerPoint.lat + baseOffset * 1.2, centerPoint.lng - baseOffset * 0.8],
                    [centerPoint.lat + baseOffset * 0.8, centerPoint.lng - baseOffset * 0.2],
                    [centerPoint.lat + baseOffset * 1.0, centerPoint.lng + baseOffset * 0.5],
                    [centerPoint.lat + baseOffset * 0.4, centerPoint.lng + baseOffset * 1.1],
                    [centerPoint.lat - baseOffset * 0.2, centerPoint.lng + baseOffset * 1.3],
                    [centerPoint.lat - baseOffset * 0.7, centerPoint.lng + baseOffset * 0.9],
                    [centerPoint.lat - baseOffset * 1.1, centerPoint.lng + baseOffset * 0.1],
                    [centerPoint.lat - baseOffset * 0.9, centerPoint.lng - baseOffset * 0.6],
                    [centerPoint.lat - baseOffset * 1.3, centerPoint.lng - baseOffset * 0.9],
                    [centerPoint.lat - baseOffset * 0.5, centerPoint.lng - baseOffset * 1.1],
                    [centerPoint.lat + baseOffset * 0.3, centerPoint.lng - baseOffset * 1.4],
                    [centerPoint.lat + baseOffset * 0.8, centerPoint.lng - baseOffset * 1.0]
                ];
            }
            else {
                // 默认地块形状 - 标准农田
                coordinates = [
                    [centerPoint.lat + baseOffset * 1.0, centerPoint.lng - baseOffset * 1.0],
                    [centerPoint.lat + baseOffset * 1.0, centerPoint.lng + baseOffset * 1.0],
                    [centerPoint.lat + baseOffset * 0.2, centerPoint.lng + baseOffset * 1.2],
                    [centerPoint.lat - baseOffset * 0.8, centerPoint.lng + baseOffset * 1.0],
                    [centerPoint.lat - baseOffset * 1.0, centerPoint.lng + baseOffset * 0.3],
                    [centerPoint.lat - baseOffset * 1.0, centerPoint.lng - baseOffset * 0.5],
                    [centerPoint.lat - baseOffset * 0.6, centerPoint.lng - baseOffset * 1.2],
                    [centerPoint.lat + baseOffset * 0.4, centerPoint.lng - baseOffset * 1.1]
                ];
            }

            return coordinates;
        },


        // 显示地块详情弹窗
        showPlotDetailPopup(plotCenter, plotData) {
            try {
                const mapContainer = document.getElementById('leaflet-map');
                const mapRect = mapContainer.getBoundingClientRect();

                // 计算弹窗位置（在地图右上角区域）
                this.popupPosition = {
                    top: mapRect.top + 20, // 距离地图顶部20px
                    left: mapRect.right - 420 // 距离地图右边420px（弹窗宽度400px + 20px边距）
                };

                // 设置弹窗数据
                this.popupData = {
                    ...plotData,
                    photo: '/images/pop-banner.png' // 地块实景照片 - 八角植物
                };

                // 显示弹窗
                this.showDetailPopup = true;

                // 创建连接线
                this.createConnectorLine(plotCenter, {
                    x: this.popupPosition.left + 20, // 弹窗左边缘 + 20px
                    y: this.popupPosition.top + 200 // 弹窗中部
                });

                console.log('地块详情弹窗已显示', {
                    plotCenter,
                    popupPosition: this.popupPosition,
                    plotData
                });

            }
            catch (error) {
                console.error('显示地块详情弹窗失败:', error);
            }
        },

        // 关闭地块详情弹窗
        closePlotDetailPopup() {
            this.showDetailPopup = false;
            this.popupData = null;

            // 移除连接线
            if (this.connectorLine) {
                this.map.removeLayer(this.connectorLine);
                this.connectorLine = null;
            }
        },

        // 跳转到地块详情页面
        goToPlotDetail() {
            if (this.popupData && this.popupData.name) {
                // 保存popupData的值，因为closePlotDetailPopup会将其设置为null
                const popupDataSnapshot = {
                    name: this.popupData.name,
                    routeTarget: this.popupData.routeTarget,
                    type: this.popupData.type,
                    displayName: this.popupData.displayName
                };

                this.closePlotDetailPopup();

                const targetName = popupDataSnapshot.routeTarget || popupDataSnapshot.name;
                const query = {
                    region: this.regionName,
                    plotName: popupDataSnapshot.name
                };

                // 根据弹窗类型添加对应的 type 参数
                if (popupDataSnapshot.type === 'drying-facility' || popupDataSnapshot.displayName === '烘干示范工厂') {
                    query.type = 'factory';
                }
                else if (popupDataSnapshot.type === 'warehouse' || popupDataSnapshot.displayName === '仓库') {
                    query.type = 'warehouse';
                }
                else if (popupDataSnapshot.type === 'tea-oil') {
                    query.type = 'tea-oil';
                }
                else if (popupDataSnapshot.type === 'star-anise') {
                    query.type = 'star-anise';
                }

                this.$router.push({
                    path: `/plot/${ encodeURIComponent(targetName) }`,
                    query
                });
            }
        },

        // 参考mapshaper.org理念优化坐标数据

        // 创建连接线
        createConnectorLine(plotCenter, popupPoint) {
            try {
                // 移除现有连接线
                if (this.connectorLine) {
                    this.map.removeLayer(this.connectorLine);
                }

                // 将屏幕坐标转换为地理坐标
                const mapContainer = document.getElementById('leaflet-map');
                const mapRect = mapContainer.getBoundingClientRect();
                const popupLatLng = this.map.containerPointToLatLng([
                    popupPoint.x - mapRect.left,
                    popupPoint.y - mapRect.top
                ]);

                // 创建连接线
                this.connectorLine = L.polyline([plotCenter, popupLatLng], {
                    color: '#c69c6d',
                    weight: 2,
                    opacity: 0.8,
                    dashArray: '5,5'
                });

                this.connectorLine.addTo(this.map);

            }
            catch (error) {
                console.error('创建连接线失败:', error);
            }
        },

        // 绘制地块详情轮廓（用于三级地图）
        drawPlotDetailOutline(plotData) {
            try {
                console.log('=== 开始绘制地块详情轮廓 ===');
                console.log('地块数据:', plotData);
                console.log('coordinates存在:', !!plotData.coordinates);
                console.log('coordinates长度:', plotData.coordinates ? plotData.coordinates.length : 0);

                if (!plotData.coordinates || plotData.coordinates.length === 0) {
                    console.error('地块坐标数据不完整，无法绘制轮廓');
                    console.error('plotData:', plotData);
                    return;
                }

                // 转换坐标系统：WGS84 -> GCJ-02，然后转为Leaflet格式
                const convertedCoords = plotData.coordinates.map(coord => {
                    const [lng, lat] = coord;
                    const [gcjLng, gcjLat] = this.wgs84ToGcj02(lng, lat);
                    return [gcjLat, gcjLng]; // Leaflet格式：[lat, lng]
                });

                console.log('坐标转换完成，原始:', plotData.coordinates[0], '转换后:', convertedCoords[0]);

                // 使用bright green色彩区别于二级地图的orange色
                const plotPolygon = L.polygon(convertedCoords, {
                    color: '#00FF7F', // 边框颜色：亮绿色
                    weight: 4, // 边框宽度
                    fillColor: '#00FF7F', // 填充颜色
                    fillOpacity: 0.3, // 填充透明度
                    dashArray: '8, 4' // 虚线样式
                });

                // 添加悬停效果
                plotPolygon.on('mouseover', () => {
                    plotPolygon.setStyle({
                        weight: 5,
                        fillOpacity: 0.5,
                        color: '#FFD700'
                    });
                });

                plotPolygon.on('mouseout', () => {
                    plotPolygon.setStyle({
                        weight: 4,
                        fillOpacity: 0.3,
                        color: '#00FF7F'
                    });
                });

                // 添加到地图
                plotPolygon.addTo(this.map);
                this.plotLayers.push(plotPolygon);

                // 三级地图不需要地块标签，轮廓本身就足够了

                // 统一放大策略：所有地块都使用高德地图支持的最高缩放级别
                this.map.fitBounds(plotPolygon.getBounds(), {
                    padding: [5, 5],
                    maxZoom: 18
                });

                console.log('地块详情轮廓绘制完成');

            }
            catch (error) {
                console.error('绘制地块详情轮廓失败:', error);
            }
        },

        // WGS84坐标转GCJ-02坐标（火星坐标系）
        wgs84ToGcj02(lng, lat) {
            const a = 6378245.0;
            const ee = 0.00669342162296594323;

            if (this.outOfChina(lng, lat)) {
                return [lng, lat];
            }

            let dlat = this.transformlat(lng - 105.0, lat - 35.0);
            let dlng = this.transformlng(lng - 105.0, lat - 35.0);
            const radlat = lat / 180.0 * Math.PI;
            let magic = Math.sin(radlat);
            magic = 1 - ee * magic * magic;
            const sqrtmagic = Math.sqrt(magic);
            dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
            dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);
            const mglat = lat + dlat;
            const mglng = lng + dlng;
            return [mglng, mglat];
        },

        // 判断是否在中国范围外
        outOfChina(lng, lat) {
            return (lng < 72.004 || lng > 137.8347) || (lat < 0.8293 || lat > 55.8271);
        },

        // 坐标转换辅助函数
        transformlat(lng, lat) {
            let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        },

        // 坐标转换辅助函数
        transformlng(lng, lat) {
            let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
            ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
            return ret;
        },

        // 分类过滤相关方法
        // 筛选地图上的icon显示
        filterMapByCategory(category) {
            this.selectedCategoryType = category.type;
            console.log('筛选分类:', category.name, '类型:', category.type);
            // 应用分类筛选
            this.applyPlotFilter();
        },

        showCategoryPopup(category) {
            this.selectedCategory = category;
        },

        closeCategoryPopup() {
            this.selectedCategory = null;
        },

        navigateToTertiaryMap() {
            if (this.selectedCategory) {
                // 全部选项只是关闭弹窗，显示所有地块
                if (this.selectedCategory.isAllOption) {
                    this.closeCategoryPopup();
                    return;
                }

                this.$emit('category-navigate', {
                    categoryType: this.selectedCategory.type,
                    categoryName: this.selectedCategory.name
                });
                this.$router.push({
                    path: '/plot/烘干示范工厂',
                    query: {
                        type: 'factory',
                        region: '右江区',
                        category: this.selectedCategory.type
                    }
                });
                this.closeCategoryPopup();
            }
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

/* 响应式调整 */
@media (max-width: 768px) {
    .plot-detail-popup {
        top: 10px !important;
        left: 10px !important;
        width: 300px;
    }

    .popup-image {
        height: 160px;
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

.custom-plot-marker {
    z-index: 1000 !important;
    border: none !important;
    background: none !important;
}

// 二级地图marker icon - 只显示分类图标
// Leaflet marker容器样式调整
.leaflet-marker-icon.custom-plot-marker.preview-mark-container {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    width: 48px !important;
    height: 48px !important;
}

.plot-marker-icon {
    width: 48px !important;
    height: 48px !important;
    display: block !important;
    background-repeat: no-repeat !important;
    background-size: contain !important;
    background-position: center !important;
    cursor: pointer;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    border: none !important;
    outline: none !important;
}

.plot-marker-icon:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 4px 8px rgba(76, 252, 234, 0.6));
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

/* 地块详情弹窗样式 */
.plot-detail-popup {
    position: fixed;
    z-index: 10000;
    width: 360px;
    border-radius: 12px;
    animation: popup-fade-in .4s cubic-bezier(.34, 1.56, .64, 1);
}

.popup-close-button {
    position: absolute;
    z-index: 10001;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: 1.5px solid #4cfcea;
    border-radius: 50%;
    background: transparent;
    transition: all .3s ease;
    cursor: pointer;
}

.popup-close-button:hover {
    background: #4cfcea1a;
    box-shadow: 0 0 8px #4cfcea66;
    transform: rotate(90deg);
}

.close-icon {
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
    color: #4cfcea;
}

.popup-content {
    padding: 16px 18px 14px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.popup-info-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.popup-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #c69c6d;
    font-family: SourceHanSansCN-Medium, sans-serif;
    line-height: 1.4;
}

.popup-divider {
    height: 1px;
    background: linear-gradient(90deg, #4cfcea 0%, transparent 100%);
    margin: 2px 0 4px 0;
}

.popup-info-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    align-items: center;
    min-height: 20px;
}

.info-label {
    color: #999;
    font-family: SourceHanSansCN-Regular, sans-serif;
    font-weight: 400;
}

.info-value {
    color: #4cfcea;
    font-family: SourceHanSansCN-Light, sans-serif;
    text-align: right;
    flex: 1;
    margin-left: 8px;
}

.popup-image-container {
    overflow: hidden;
    border-radius: 6px;
    transition: all .3s ease;
    aspect-ratio: 16 / 10;
    margin: 2px 0;
}

.popup-image-container:hover {
    border-color: #c69c6d;
    box-shadow: 0 0 8px #4cfcea4d;
}

.popup-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.popup-button-section {
    display: flex;
    gap: 0;
    justify-content: stretch;
    margin-top: 2px;
}

.detail-button {
    flex: 1;
    padding: 9px 16px;
    font-size: 13px;
    font-weight: 500;
    color: #0a1420;
    border: none;
    border-radius: 4px;
    background: linear-gradient(135deg, #4cfcea 0%, #39b44a 100%);
    cursor: pointer;
    transition: all .3s ease;
    font-family: SourceHanSansCN-Medium, sans-serif;
}

.detail-button:hover {
    background: linear-gradient(135deg, #6effff 0%, #5ec968 100%);
    box-shadow: 0 0 12px #4cfcea66;
    transform: translateY(-1px);
}

.detail-button:active {
    transform: translateY(0);
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

/* 分类右侧栏 */
.category-sidebar {
    position: absolute;
    top: 0;
    right: 375px;
    z-index: 1000;
    background: rgba(15, 35, 52, 0.9);
    border: 1px solid rgba(76, 252, 234, 0.4);
    border-radius: 12px;
    padding: 15px 12px;
    max-width: 180px;
    max-height: 80vh;
    overflow-y: auto;
    backdrop-filter: blur(10px);
}

.category-sidebar-title {
    color: #C69C6D;
    font-size: 14px;
    font-weight: 600;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(76, 252, 234, 0.2);
    margin-bottom: 12px;
    text-align: center;
}

.category-sidebar-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.category-sidebar-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(76, 252, 234, 0.08);
    border: 1px solid rgba(76, 252, 234, 0.2);
    border-radius: 6px;
    padding: 8px 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: rgba(76, 252, 234, 0.9);
    font-size: 12px;
}

.category-sidebar-btn:hover {
    background: rgba(76, 252, 234, 0.15);
    border-color: rgba(76, 252, 234, 0.5);
}

.category-sidebar-btn img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    flex-shrink: 0;
}

.category-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* 全部选项按钮特殊样式 */
.category-sidebar-btn.all-option {
    background: rgba(198, 156, 109, 0.15);
    border-color: rgba(198, 156, 109, 0.4);
    color: rgba(198, 156, 109, 0.95);
    font-weight: 600;
}

.category-sidebar-btn.all-option:hover {
    background: rgba(198, 156, 109, 0.25);
    border-color: rgba(198, 156, 109, 0.6);
}

/* 选中状态样式 */
.category-sidebar-btn.active {
    background: rgba(76, 252, 234, 0.25);
    border-color: rgba(76, 252, 234, 0.8);
    box-shadow: 0 0 12px rgba(76, 252, 234, 0.4);
}

.category-sidebar-btn.all-option.active {
    background: rgba(198, 156, 109, 0.35);
    border-color: rgba(198, 156, 109, 0.8);
    box-shadow: 0 0 12px rgba(198, 156, 109, 0.4);
}

/* 分类弹窗 */
.category-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.3s ease;
}

.popup-content {
    background: rgba(15, 35, 52, 0.95);
    border: 1px solid rgba(76, 252, 234, 0.4);
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s ease;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(76, 252, 234, 0.2);
}

.popup-header h3 {
    margin: 0;
    color: #C69C6D;
    font-size: 18px;
    font-weight: 600;
}

.popup-close-btn {
    background: none;
    border: none;
    color: rgba(76, 252, 234, 0.8);
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s ease;
    font-weight: 600;
}

.popup-close-btn:hover {
    color: rgba(76, 252, 234, 1);
}

.popup-body {
    padding: 20px;
    color: rgba(76, 252, 234, 0.9);
    font-size: 14px;
    line-height: 1.6;
}

.popup-stats {
    margin-top: 15px;
    padding: 10px;
    background: rgba(76, 252, 234, 0.05);
    border-left: 3px solid rgba(76, 252, 234, 0.4);
    border-radius: 4px;
}

.popup-stats span {
    color: #C69C6D;
    font-weight: 600;
}

.popup-footer {
    padding: 15px 20px;
    border-top: 1px solid rgba(76, 252, 234, 0.2);
    display: flex;
    justify-content: flex-end;
}

.navigate-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    padding: 10px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.navigate-btn:hover {
    background: linear-gradient(135deg, #16a34a, #15803d);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
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
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* 响应式调整 - 分类右侧栏 */
@media (max-width: 768px) {
    .category-sidebar {
        top: 10px;
        right: 10px;
        max-width: 160px;
        padding: 12px 10px;
    }

    .category-sidebar-btn {
        padding: 6px 8px;
        font-size: 11px;
    }

    .category-sidebar-btn img {
        width: 24px;
        height: 24px;
    }

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

</style>
