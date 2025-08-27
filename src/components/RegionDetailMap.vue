<template>
  <div class="region-detail-map">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
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

      <!-- 弹窗内容 - 只展示图片 -->
      <div class="popup-content">
        <div class="popup-image-container">
          <img
            class="popup-image"
            :src="popupData.photo || '/images/pop-banner.png'"
            :alt="popupData.name"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
// 使用CDN引入的Leaflet (在index.html中已引入)
const { L } = window;

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
            selectedPlot: null,
            isLoading: true,
            loadingText: '正在初始化地图...',
            currentLoadedRegion: null, // 记录当前已加载的区域，防重复加载
            showDetailPopup: false, // 控制地块详情弹窗显示
            popupPosition: { top: 0, left: 0 }, // 弹窗位置
            popupData: null, // 弹窗数据
            connectorLine: null, // 连接线图层
            // 区域中心坐标
            regionCoordinates: {
                百色市: [23.9, 106.6],
                右江区: [23.9, 106.6],
                田林县: [24.3, 106.2],
                德保县: [23.3, 106.6],
                靖西市: [23.1, 106.4],
                田阳区: [23.7, 106.9],
                田东县: [23.6, 107.1],
                巴塘: [24.236, 106.205], // 添加巴塘坐标
                大楞乡: [24.236, 106.205], // 大楞乡坐标
                新村合作地块: [24.236, 106.205] // 地块坐标
            }
        };
    },
    mounted() {
    // 确保Leaflet已加载
        this.$nextTick(() => {
            if (window.L) {
                this.initMap();
                this.loadRegionData();
            }
            else {
                // 如果Leaflet还没加载，稍等片刻再试
                setTimeout(() => {
                    if (window.L) {
                        this.initMap();
                        this.loadRegionData();
                    }
                    else {
                        console.error('Leaflet未能正确加载');
                    }
                }, 1000);
            }
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
                console.log('Region changed from', oldRegionName, 'to', newRegionName);
                this.loadRegionData();
            }
        }
    },
    methods: {
    // 初始化Leaflet地图
        initMap() {
            const center = this.regionCoordinates[this.regionName] || [23.9, 106.6];

            this.map = L.map('leaflet-map', {
                center,
                zoom: 12, // 设置合理的初始缩放级别
                minZoom: 8, // 最小缩放级别，防止缩放过小
                maxZoom: 19, // 最大缩放级别，匹配卫星图精度
                zoomControl: true, // 启用缩放控件
                scrollWheelZoom: true, // 启用滚轮缩放
                doubleClickZoom: true, // 启用双击缩放
                touchZoom: true, // 启用触摸缩放（移动端）
                boxZoom: false, // 禁用框选缩放（避免误操作）
                keyboard: true, // 启用键盘缩放
                attributionControl: false, // 隐藏版权信息，保持界面简洁
                preferCanvas: true, // 使用Canvas渲染提高性能
                zoomAnimationThreshold: 4,
                fadeAnimation: true, // 启用淡入动画，提供平滑体验
                zoomAnimation: true, // 启用缩放动画，提供流畅缩放
                zoomSnap: 0.5, // 允许半级缩放，提供更精确的缩放控制
                wheelPxPerZoomLevel: 60 // 调整滚轮缩放灵敏度
            });

            // 自定义缩放控件位置，避免与其他UI元素冲突
            this.map.zoomControl.setPosition('bottomright');

            // 添加多个地图图层 - 使用高清卫星瓦片服务
            const layers = {
                谷歌卫星: L.tileLayer('https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
                    attribution: '© Google',
                    subdomains: ['0', '1', '2', '3'],
                    maxZoom: 21,
                    minZoom: 3,
                    tileSize: 256,
                    crossOrigin: true
                }),
                高德卫星: L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
                    attribution: '© 高德地图',
                    subdomains: ['1', '2', '3', '4'],
                    maxZoom: 19,
                    minZoom: 3,
                    tileSize: 256,
                    crossOrigin: true
                }),
                Bing卫星: L.tileLayer('https://mt{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
                    attribution: '© Google Hybrid',
                    subdomains: ['0', '1', '2', '3'],
                    maxZoom: 20,
                    minZoom: 1,
                    crossOrigin: true
                }),
                OpenStreetMap: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19,
                    minZoom: 1
                })
            };

            // 默认使用谷歌卫星地图 - 支持更高清晰度
            const defaultLayer = layers['谷歌卫星'];

            // 监听瓦片加载事件
            let loadedTiles = 0;
            let totalTiles = 0;

            defaultLayer.on('loading', () => {
                this.loadingText = '正在加载地图瓦片...';
                loadedTiles = 0;
                totalTiles = 0;
            });

            defaultLayer.on('tileloadstart', () => {
                totalTiles++;
            });

            defaultLayer.on('tileload', () => {
                loadedTiles++;
                if (totalTiles > 0) {
                    const progress = Math.round((loadedTiles / totalTiles) * 100);
                    this.loadingText = `加载地图瓦片 ${ progress }%`;
                }
            });

            defaultLayer.on('load', () => {
                this.loadingText = '地图加载完成';
                setTimeout(() => {
                    this.isLoading = false;
                }, 500);
            });

            // 添加瓦片加载错误处理 - 多层fallback确保高清晰度
            let fallbackUsed = false;
            defaultLayer.on('tileerror', e => {
                if (!fallbackUsed) {
                    console.warn('谷歌卫星地图瓦片加载失败，切换到高德卫星:', e);
                    fallbackUsed = true;
                    // 移除当前图层
                    this.map.removeLayer(defaultLayer);
                    // 切换到高德卫星
                    const gaodeLayer = layers['高德卫星'];
                    gaodeLayer.addTo(this.map);
                    this.loadingText = '切换到高德卫星地图';

                    // 高德也失败时切换到Bing
                    gaodeLayer.on('tileerror', () => {
                        this.map.removeLayer(gaodeLayer);
                        const bingLayer = layers['Bing卫星'];
                        bingLayer.addTo(this.map);
                        this.loadingText = '切换到Bing卫星地图';
                    });
                }
            });

            defaultLayer.addTo(this.map);

            // 不添加图层控制器和指北针

        },


        async loadRegionData() {
            try {
                // 防重复加载同一个区域
                if (this.currentLoadedRegion === this.regionName) {
                    console.log('区域已加载，跳过:', this.regionName);
                    return;
                }

                console.log('开始加载新区域:', this.regionName);
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

                console.log(`加载区域轮廓: ${ this.regionName }`);

                if (regionFeature) {
                    console.log('找到区域轮廓数据:', regionFeature.properties.name);
                    this.addRegionBoundary(regionFeature);
                }
                else {
                    console.warn('未找到区域轮廓数据，区域名称:', this.regionName);
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
                        color: '#4CFDEB',
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

                // 调整地图视野以适应区域边界
                this.map.fitBounds(regionLayer.getBounds(), {
                    padding: [30, 30],
                    maxZoom: 14 // 设置合理的最大缩放级别确保卫星瓦片可用
                });

                console.log('区域轮廓已添加到地图');

                // 只有当showPlotMarkers为true时才添加地块标注
                if (this.showPlotMarkers) {
                    // 添加地块标注，传入区域要素用于边界检查
                    this.addPlotMarkers(regionFeature);
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

                console.log('区域外遮罩层已添加');

            }
            catch (error) {
                console.error('添加区域遮罩失败:', error);
            }
        },

        // 添加地块标注
        addPlotMarkers(regionFeature) {
            // 生成模拟地块数据，传入区域要素而不是边界
            const plots = this.generatePlotData(regionFeature);

            plots.forEach(plot => {
                // 创建自定义HTML标记
                const markerHtml = this.createPlotMarkerHtml(plot);

                // 创建Leaflet自定义标记
                const customIcon = L.divIcon({
                    className: 'custom-plot-marker',
                    html: markerHtml,
                    iconSize: [105, 60],
                    iconAnchor: [52.5, 30]
                });

                // 添加标记到地图
                const marker = L.marker([plot.lat, plot.lng], { icon: customIcon });

                // 添加点击事件，跳转到三级地块详情页
                marker.on('click', () => {
                    console.log('=== 地块标记被点击 ===');
                    console.log('地块信息:', plot);
                    console.log('showPlotDetails:', this.showPlotDetails);
                    this.navigateToPlotDetail(plot);
                });

                marker.addTo(this.map);
                this.plotLayers.push(marker);
            });
        },

        // 生成地块数据
        generatePlotData(regionFeature) {
            const plots = [];
            const usedPositions = new Set(); // 用于追踪已使用的位置，避免重复

            // 生成更真实的地块名称
            const plotNames = [
                '那坡陵山地块',
                '马头山地块',
                '河东农场地块',
                '河西种植地块',
                '北山八角地块',
                '南坡种植地块',
                '东岗农业地块',
                '西岭林地块',
                '中央种植地块',
                '新村合作地块',
                '老屯集体地块',
                '高坪示范地块',
                '龙头山地块',
                '凤凰岭地块',
                '银杏坡地块'
            ];

            // 获取区域边界
            const geoJsonLayer = L.geoJSON(regionFeature);
            const bounds = geoJsonLayer.getBounds();

            const minLat = bounds.getSouth();
            const maxLat = bounds.getNorth();
            const minLng = bounds.getWest();
            const maxLng = bounds.getEast();

            // 在区域内生成合理分布的地块
            const plotCount = Math.floor(Math.random() * 5) + 10; // 10-15个地块

            // 创建网格分布，避免地块过于集中
            const gridSize = Math.ceil(Math.sqrt(plotCount));
            const latStep = (maxLat - minLat) / gridSize;
            const lngStep = (maxLng - minLng) / gridSize;

            // 打乱地块名称，避免重复名称
            const shuffledNames = [...plotNames].sort(() => Math.random() - 0.5);

            let validPlotsCount = 0;
            let maxAttempts = plotCount * 5; // 增加最大尝试次数


            for (let i = 0; i < plotCount && maxAttempts > 0; i++) {
                // 基于网格的位置，加上随机偏移
                const gridRow = Math.floor(i / gridSize);
                const gridCol = i % gridSize;

                const baseLat = minLat + gridRow * latStep + latStep * 0.5;
                const baseLng = minLng + gridCol * lngStep + lngStep * 0.5;

                let attempts = 0;
                let lat; let lng; let positionKey; let isInsideRegion = false;

                // 尝试找到区域内的不重复位置
                while (attempts < 20 && maxAttempts > 0) {
                    // 添加随机偏移，但保持在网格内
                    lat = baseLat + (Math.random() - 0.5) * latStep * 0.8;
                    lng = baseLng + (Math.random() - 0.5) * lngStep * 0.8;

                    // 确保在边界范围内
                    lat = Math.max(minLat + 0.001, Math.min(maxLat - 0.001, lat));
                    lng = Math.max(minLng + 0.001, Math.min(maxLng - 0.001, lng));

                    // 创建位置标识（精确到小数点后4位避免重复）
                    positionKey = `${ lat.toFixed(4) },${ lng.toFixed(4) }`;

                    // 检查是否在区域内部
                    isInsideRegion = this.isPointInRegion([lng, lat], regionFeature);

                    attempts++;
                    maxAttempts--;

                    // 如果位置唯一且在区域内，跳出循环
                    if (!usedPositions.has(positionKey) && isInsideRegion) {
                        break;
                    }
                }

                // 如果找到唯一且在区域内的位置，添加地块
                if (!usedPositions.has(positionKey) && isInsideRegion) {
                    usedPositions.add(positionKey);

                    // 随机分配地块类型，确保三种类型都有
                    const randomValue = Math.random();
                    let type;
                    if (randomValue < 0.4) {
                        type = 'premium'; // 40% 优质地块 (青色)
                    }
                    else if (randomValue < 0.7) {
                        type = 'normal'; // 30% 普通地块 (红色)
                    }
                    else {
                        type = 'average'; // 30% 一般地块 (黄色)
                    }

                    plots.push({
                        id: validPlotsCount + 1,
                        name: shuffledNames[validPlotsCount % shuffledNames.length] + (Math.floor(validPlotsCount / shuffledNames.length) > 0 ? `${ Math.floor(validPlotsCount / shuffledNames.length) + 1 }` : ''),
                        lat,
                        lng,
                        area: Math.floor(Math.random() * 50) + 20, // 20-70亩
                        output: Math.floor(Math.random() * 20) + 5, // 5-25吨
                        type
                    });

                    validPlotsCount++;
                }
            }

            console.log(`生成了${ validPlotsCount }个有效地块，全部在区域内部`);
            return plots;
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
            let backgroundImage;

            switch (plot.type) {
                case 'premium':
                    backgroundImage = '/images/normal-plot-bg.png'; // 蓝色背景
                    break;
                case 'normal':
                    backgroundImage = '/images/alternative-plot-bg.png'; // 红色背景
                    break;
                case 'average':
                    backgroundImage = '/images/premium-plot-bg.png'; // 黄色背景使用premium
                    break;
                default:
                    backgroundImage = '/images/premium-plot-bg.png';
            }

            return `
        <div class="plot-marker" style="background-image: url('${ backgroundImage }')">
          <div class="plot-content">
            <div class="plot-name">${ plot.name }</div>
            <div class="plot-info">
              <span class="area-label">面积：</span><span class="area-value">${ plot.area }</span><span class="area-unit">亩 | 产量：</span><span class="output-value">${ plot.output }</span><span class="output-unit">吨</span>
            </div>
          </div>
        </div>
      `;
        },

        // 清除现有地块图层
        clearPlotLayers() {
            this.plotLayers.forEach(layer => {
                this.map.removeLayer(layer);
            });
            this.plotLayers = [];
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
                    color: index % 2 === 0 ? '#4CFDEB' : '#FFD700',
                    weight: 3,
                    opacity: 0.8,
                    fillColor: index % 2 === 0 ? '#4CFDEB' : '#FFD700',
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
                    color: '#4CFDEB',
                    weight: 3,
                    fillColor: '#4CFDEB',
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

        // 导航到地块详情页
        navigateToPlotDetail(plot) {
            console.log('点击地块标记:', plot.name, '- showPlotDetails:', this.showPlotDetails);
            console.log('地块数据:', plot);
            // 如果是在地块详情页面中，则触发下钻到乡镇事件
            if (this.showPlotDetails) {
                console.log('触发乡镇下钻');
                this.loadTownshipData(plot.name);
            }
            else {
                // 否则跳转到地块详情页
                console.log('跳转到地块详情页, plotId:', plot.id);
                this.$router.push({
                    name: 'PlotDetail',
                    params: {
                        plotId: plot.id
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
            }
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

        // 添加地块详情标记（用于三级页面）
        async addPlotDetailMarker(regionFeature) {
            try {
                console.log('开始添加地块详情标记，使用真实GeoJSON数据');

                // 加载巴塘真实地块数据
                const plotDataImport = await import('@/assets/mapdata/巴塘2.json');
                const plotGeoJsonData = plotDataImport.default || plotDataImport;

                console.log('已加载巴塘地块数据:', plotGeoJsonData);

                // 取第一个地块的坐标数据（主要地块）
                const mainPlotFeature = plotGeoJsonData.features[0];
                if (!mainPlotFeature || !mainPlotFeature.geometry) {
                    console.error('未找到有效的地块数据');
                    return;
                }

                // 转换GeoJSON坐标为Leaflet格式
                const plotCoordinates = this.convertGeoJsonCoordinates(mainPlotFeature.geometry.coordinates);

                if (plotCoordinates.length === 0) {
                    console.error('地块坐标转换失败');
                    return;
                }

                console.log('转换后的地块坐标点数量:', plotCoordinates.length);

                // 添加地块轮廓多边形
                const plotPolygon = L.polygon(plotCoordinates, {
                    color: '#4CFDEB',
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
                        color: '#4CFDEB'
                    });
                });

                plotPolygon.addTo(this.map);
                this.plotLayers.push(plotPolygon);

                // 获取地块边界用于放置标记点
                const plotBounds = plotPolygon.getBounds();

                // 创建多个preview-mark标记点
                this.addMultiplePreviewMarks(plotCoordinates, plotBounds);

                // 调整地图视野聚焦到真实地块多边形，提供高清晰度视野
                this.map.fitBounds(plotBounds, {
                    padding: [20, 20],
                    maxZoom: 18 // 提供更高清晰度的卫星影像
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
                    color: '#4CFDEB',
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

                // 调整地图视野聚焦到地块多边形
                this.map.fitBounds(plotPolygon.getBounds(), {
                    padding: [20, 20],
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

        // 计算多边形中心点
        calculatePolygonCenter(coordinates) {
            let latSum = 0;
            let lngSum = 0;

            coordinates.forEach(coord => {
                latSum += coord[0];
                lngSum += coord[1];
            });

            return [
                latSum / coordinates.length,
                lngSum / coordinates.length
            ];
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
                    color: '#4CFDEB',
                    weight: 2,
                    opacity: 0.8,
                    dashArray: '5,5'
                });

                this.connectorLine.addTo(this.map);

            }
            catch (error) {
                console.error('创建连接线失败:', error);
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


/* 地块标注样式 - 使用全局样式确保在Leaflet中生效 */

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #4cfdeb;
}

.panel-header h4 {
    margin: 0;
    font-size: 16px;
    color: #4cfdeb;
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

    color: #4cfdeb;
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
    border: 1px solid #4cfdeb;

    border-radius: 8px;
    background: #001e3ce6;

    backdrop-filter: blur(10px);
}

.map-legend h5 {
    margin: 0 0 10px;
    font-size: 14px;
    color: #4cfdeb;
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
    color: #4cfdeb;
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
    background: #4cfdeb;
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
    color: #4cfdeb;
}

.spinner {
    width: 50px;
    height: 50px;
    margin: 0 auto 20px;
    border: 4px solid #4cfdeb4d;
    border-left: 4px solid #4cfdeb;

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

.custom-plot-marker {
    border: none !important;
    background: none !important;
}

.plot-marker {
    position: relative;
    width: 120px !important;
    height: 60px !important;

    background-size: 100% 100% !important;
    cursor: pointer;

    filter: drop-shadow(0 2px 8px #0000004d);
}

.plot-content {
    height: 48px !important;
    padding: 5px 8px !important;
}

.plot-name {
    overflow: hidden;
    max-width: 100px !important;
    margin-bottom: 2px !important;
    font-size: 9px !important;
    font-weight: bold !important;
    line-height: 14px !important;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #fff !important;
}

.plot-info {
    display: block !important;
    overflow: hidden !important;
    width: 100% !important;
    font-size: 8px !important;
    line-height: 11px !important;
    white-space: nowrap !important;
    text-overflow: ellipsis !important;

    color: #fff !important;
}

.area-label,
.area-unit,
.output-label,
.output-unit {
    font-size: 9px !important;
    color: #ffffffe6 !important;
}

.area-value,
.output-value {
    margin: 0 1px !important;
    font-size: 9px !important;
    font-weight: bold !important;
    color: #fff !important;
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
    border: 2px solid #4cfdeb !important;

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

    color: #4cfdeb !important;
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

/* 地块详情弹窗样式 */
.plot-detail-popup {
    position: fixed;
    z-index: 10000;
    width: 400px;
    border: 2px solid #4cfceacc;

    border-radius: 12px;
    background: linear-gradient(135deg, #0a1420f2 0%, #0f1e2df2 100%);
    box-shadow:
        0 0 30px #4cfcea66,
        inset 0 1px 0 #ffffff1a;
    animation: popup-fade-in .4s cubic-bezier(.34, 1.56, .64, 1);

    backdrop-filter: blur(10px);
}

.popup-close-button {
    position: absolute;
    z-index: 10001;
    top: -10px;
    right: -10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 2px solid #0a1420;

    border-radius: 50%;
    background: linear-gradient(135deg, #4cfdeb 0%, #00bcd4 100%);
    box-shadow: 0 0 10px #4cfcea80;
    transition: all .3s ease;
    cursor: pointer;
}

.popup-close-button:hover {
    background: linear-gradient(135deg, #ffd700 0%, #ffa000 100%);
    box-shadow: 0 0 15px #ffd70099;
    transform: scale(1.1);
}

.close-icon {
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
    color: #0a1420;
}

.popup-content {
    padding: 15px;
}

.popup-image-container {
    overflow: hidden;
    border: 1px solid #4cfcea4d;
    border-radius: 8px;
}

.popup-image {
    display: block;
    width: 100%;
    height: 220px;
    object-fit: cover;
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

    color: #4cfdeb !important;
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

/* 地块标注样式 */
</style>
