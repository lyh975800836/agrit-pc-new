/**
 * 地图服务层
 * 提供统一的地图操作API，抽象Leaflet底层实现
 */

import {
    TILE_PROVIDERS,
    DEFAULT_MAP_CONFIG,
    REGION_COORDINATES,
    MAP_STYLES,
    LAYER_CONFIG,
    POPUP_CONFIG,
    MARKER_CONFIG,
    LOADING_CONFIG
} from '@/config/mapConfig.js';

const { L } = window;

class MapService {
    constructor() {
        this.maps = new Map(); // 管理多个地图实例
        this.layers = new Map(); // 管理图层
    }

    /**
   * 创建地图实例
   * @param {string} containerId - 地图容器ID
   * @param {Object} options - 地图配置选项
   * @returns {Object} 地图实例
   */
    createMap(containerId, options = {}) {
        if (!L) {
            throw new Error('Leaflet库未加载');
        }

        const config = { ...DEFAULT_MAP_CONFIG, ...options };

        const map = L.map(containerId, {
            center: config.center,
            zoom: config.zoom,
            minZoom: config.minZoom,
            maxZoom: config.maxZoom,
            zoomControl: config.zoomControl,
            attributionControl: config.attributionControl,
            scrollWheelZoom: config.scrollWheelZoom,
            doubleClickZoom: config.doubleClickZoom,
            dragging: config.dragging
        });

        // 保存地图实例
        this.maps.set(containerId, map);

        return map;
    }

    /**
   * 添加瓦片图层
   * @param {Object} map - 地图实例
   * @param {string} provider - 提供商名称
   * @param {string} type - 图层类型
   * @returns {Object} 瓦片图层
   */
    addTileLayer(map, provider = 'GAODE', type = 'SATELLITE') {
        const tileConfig = TILE_PROVIDERS[provider][type];
        if (!tileConfig) {
            throw new Error(`不支持的瓦片服务: ${ provider }.${ type }`);
        }

        const tileLayer = L.tileLayer(tileConfig.url, tileConfig.options);
        tileLayer.addTo(map);

        return tileLayer;
    }

    /**
   * 添加图层控制器
   * @param {Object} map - 地图实例
   * @param {Object} baseLayers - 基础图层
   * @param {Object} overlayLayers - 覆盖图层
   * @returns {Object} 图层控制器
   */
    addLayerControl(map, baseLayers = {}, overlayLayers = {}) {
    // 如果没有提供基础图层，使用默认配置
        if (Object.keys(baseLayers).length === 0) {
            baseLayers = this._createDefaultBaseLayers();
        }

        const control = L.control.layers(baseLayers, overlayLayers, LAYER_CONFIG.CONTROL);
        control.addTo(map);

        return control;
    }

    /**
   * 创建默认基础图层
   * @private
   */
    _createDefaultBaseLayers() {
        const layers = {};

        Object.entries(LAYER_CONFIG.BASE_LAYERS).forEach(([name, config]) => {
            layers[name] = L.tileLayer(config.url, config.options);
        });

        return layers;
    }

    /**
   * 添加GeoJSON图层
   * @param {Object} map - 地图实例
   * @param {Object} geojsonData - GeoJSON数据
   * @param {Object} options - 图层选项
   * @returns {Object} GeoJSON图层
   */
    addGeoJSONLayer(map, geojsonData, options = {}) {
        const defaultOptions = {
            style: MAP_STYLES.REGION.default,
            onEachFeature: (feature, layer) => {
                this._bindDefaultEvents(layer, feature, options.onFeatureClick);
            }
        };

        const geoJsonLayer = L.geoJSON(geojsonData, { ...defaultOptions, ...options });
        geoJsonLayer.addTo(map);

        return geoJsonLayer;
    }

    /**
   * 添加标记点
   * @param {Object} map - 地图实例
   * @param {Array} coordinates - 坐标 [lat, lng]
   * @param {Object} options - 标记选项
   * @returns {Object} 标记对象
   */
    addMarker(map, coordinates, options = {}) {
        const markerOptions = { ...MARKER_CONFIG.default, ...options };
        const icon = L.icon(markerOptions);

        const marker = L.marker(coordinates, { icon });
        marker.addTo(map);

        return marker;
    }

    /**
   * 添加弹窗
   * @param {Object} layer - 图层对象
   * @param {string} content - 弹窗内容
   * @param {Object} options - 弹窗选项
   */
    bindPopup(layer, content, options = {}) {
        const popupOptions = { ...POPUP_CONFIG, ...options };
        layer.bindPopup(content, popupOptions);
    }

    /**
   * 缩放到指定区域
   * @param {Object} map - 地图实例
   * @param {Array} bounds - 边界范围
   * @param {Object} options - 缩放选项
   */
    fitBounds(map, bounds, options = {}) {
        map.fitBounds(bounds, options);
    }

    /**
   * 设置地图视图
   * @param {Object} map - 地图实例
   * @param {Array} center - 中心坐标
   * @param {number} zoom - 缩放级别
   */
    setView(map, center, zoom) {
        map.setView(center, zoom);
    }

    /**
   * 获取区域坐标
   * @param {string} regionName - 区域名称
   * @returns {Array} 坐标数组
   */
    getRegionCoordinates(regionName) {
        return REGION_COORDINATES[regionName] || REGION_COORDINATES['百色市'];
    }

    /**
   * 绑定默认事件
   * @private
   */
    _bindDefaultEvents(layer, feature, onFeatureClick) {
        layer.on({
            mouseover(e) {
                const layer = e.target;
                layer.setStyle(MAP_STYLES.REGION.hover);
            },
            mouseout(e) {
                const layer = e.target;
                layer.setStyle(MAP_STYLES.REGION.default);
            },
            click(e) {
                if (onFeatureClick) {
                    onFeatureClick(feature, layer, e);
                }
            }
        });
    }

    /**
   * 清除图层
   * @param {Object} map - 地图实例
   * @param {Object} layer - 要清除的图层
   */
    removeLayer(map, layer) {
        if (layer && map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }

    /**
   * 清除所有图层
   * @param {Object} map - 地图实例
   */
    clearAllLayers(map) {
        map.eachLayer(layer => {
            if (layer._url) {
                return;
            } // 保留瓦片图层
            map.removeLayer(layer);
        });
    }

    /**
   * 销毁地图实例
   * @param {string} containerId - 地图容器ID
   */
    destroyMap(containerId) {
        const map = this.maps.get(containerId);
        if (map) {
            map.remove();
            this.maps.delete(containerId);
            this.layers.delete(containerId);
        }
    }

    /**
   * 获取地图实例
   * @param {string} containerId - 地图容器ID
   * @returns {Object} 地图实例
   */
    getMap(containerId) {
        return this.maps.get(containerId);
    }

    /**
   * 创建自定义样式
   * @param {Object} baseStyle - 基础样式
   * @param {Object} customStyle - 自定义样式
   * @returns {Object} 合并后的样式
   */
    createStyle(baseStyle, customStyle = {}) {
        return { ...baseStyle, ...customStyle };
    }

    /**
   * 加载外部数据
   * @param {string} url - 数据URL
   * @returns {Promise} 数据Promise
   */
    async loadData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${ response.status }`);
            }
            return await response.json();
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('地图数据加载失败:', error);
            throw error;
        }
    }

    /**
   * 获取加载配置
   * @returns {Object} 加载配置
   */
    getLoadingConfig() {
        return LOADING_CONFIG;
    }
}

// 创建单例实例
const mapService = new MapService();

export default mapService;
