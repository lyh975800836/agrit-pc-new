/**
 * MapInitializer - 地图初始化服务
 * 负责 Leaflet 地图的创建、配置和初始化
 *
 * 从 RegionDetailMap.vue 提取的初始化逻辑
 */

import { DEFAULT_MAP_CONFIG, REGION_DETAIL_MAP_CONFIG, TILE_PROVIDERS } from '@/config/mapConfig';
import { MAP_DELAYS } from '@/config/timingConfig';

// 使用全局 Leaflet 实例
const L = window.L;

export class MapInitializer {
    constructor(options = {}) {
        this.options = {
            containerId: 'map',
            config: { ...DEFAULT_MAP_CONFIG, ...REGION_DETAIL_MAP_CONFIG },
            tileProvider: TILE_PROVIDERS.GAODE.STANDARD,
            ...options
        };

        this.map = null;
        this.tileLayer = null;
    }

    /**
     * 初始化地图
     * @param {Object} overrideConfig - 覆盖配置
     * @returns {Promise<L.Map>} 地图实例
     */
    async initialize(overrideConfig = {}) {
        try {
            // 合并配置
            const config = { ...this.options.config, ...overrideConfig };

            // 创建地图实例
            this.map = L.map(this.options.containerId, {
                center: config.center,
                zoom: config.defaultZoom || config.zoom,
                minZoom: config.minZoom,
                maxZoom: config.maxZoom,
                zoomControl: config.zoomControl,
                scrollWheelZoom: config.scrollWheelZoom,
                doubleClickZoom: config.doubleClickZoom,
                touchZoom: config.touchZoom,
                boxZoom: config.boxZoom,
                keyboard: config.keyboard,
                attributionControl: config.attributionControl,
                preferCanvas: config.preferCanvas,
                zoomAnimationThreshold: config.zoomAnimationThreshold,
                fadeAnimation: config.fadeAnimation,
                zoomAnimation: config.zoomAnimation,
                zoomSnap: config.zoomSnap,
                wheelPxPerZoomLevel: config.wheelPxPerZoomLevel
            });

            // 添加瓦片图层
            this.addTileLayer();

            // 等待地图完全初始化
            await this.waitForMapReady();

            return this.map;
        } catch (error) {
            console.error('[MapInitializer] 地图初始化失败:', error);
            throw error;
        }
    }

    /**
     * 添加瓦片图层
     */
    addTileLayer() {
        const { url, options } = this.options.tileProvider;

        this.tileLayer = L.tileLayer(url, {
            ...options,
            errorTileUrl: '', // 错误时不显示瓦片
        });

        this.tileLayer.addTo(this.map);

        // 监听瓦片加载事件
        this.setupTileLayerEvents();
    }

    /**
     * 设置瓦片图层事件监听
     */
    setupTileLayerEvents() {
        if (!this.tileLayer) return;

        // 瓦片加载开始
        this.tileLayer.on('loading', () => {
            this.onTileLoading?.();
        });

        // 瓦片加载完成
        this.tileLayer.on('load', () => {
            this.onTileLoaded?.();
        });

        // 瓦片加载错误
        this.tileLayer.on('tileerror', (error) => {
            console.warn('[MapInitializer] 瓦片加载失败:', error);
            this.onTileError?.(error);
        });
    }

    /**
     * 等待地图就绪
     * @returns {Promise<void>}
     */
    waitForMapReady() {
        return new Promise((resolve) => {
            // 使用短延迟确保 DOM 更新完成
            setTimeout(() => {
                if (this.map) {
                    this.map.invalidateSize();
                    resolve();
                }
            }, MAP_DELAYS.INIT_DELAY);
        });
    }

    /**
     * 设置地图视图
     * @param {Array} center - [lat, lng]
     * @param {number} zoom - 缩放级别
     * @param {Object} options - 选项
     */
    setView(center, zoom, options = {}) {
        if (!this.map) {
            console.warn('[MapInitializer] 地图未初始化');
            return;
        }

        this.map.setView(center, zoom, {
            animate: true,
            duration: 0.5,
            ...options
        });
    }

    /**
     * 适配边界
     * @param {L.LatLngBounds} bounds - 边界
     * @param {Object} options - 选项
     */
    fitBounds(bounds, options = {}) {
        if (!this.map) {
            console.warn('[MapInitializer] 地图未初始化');
            return;
        }

        const config = this.options.config;
        const defaultOptions = {
            padding: config.fitPadding || [50, 50],
            maxZoom: config.fitZoom || 14,
            animate: true,
            duration: 0.5
        };

        this.map.fitBounds(bounds, { ...defaultOptions, ...options });
    }

    /**
     * 飞行到指定位置
     * @param {Array} center - [lat, lng]
     * @param {number} zoom - 缩放级别
     * @param {Object} options - 选项
     */
    flyTo(center, zoom, options = {}) {
        if (!this.map) {
            console.warn('[MapInitializer] 地图未初始化');
            return;
        }

        this.map.flyTo(center, zoom, {
            duration: 1.5,
            ...options
        });
    }

    /**
     * 更新地图瓦片提供商
     * @param {Object} tileProvider - 新的瓦片提供商配置
     */
    updateTileProvider(tileProvider) {
        if (!this.map) {
            console.warn('[MapInitializer] 地图未初始化');
            return;
        }

        // 移除旧图层
        if (this.tileLayer) {
            this.map.removeLayer(this.tileLayer);
        }

        // 更新配置
        this.options.tileProvider = tileProvider;

        // 添加新图层
        this.addTileLayer();
    }

    /**
     * 刷新地图大小
     * 在容器大小改变后调用
     */
    invalidateSize() {
        if (!this.map) {
            console.warn('[MapInitializer] 地图未初始化');
            return;
        }

        setTimeout(() => {
            this.map.invalidateSize();
        }, MAP_DELAYS.INIT_DELAY);
    }

    /**
     * 获取地图实例
     * @returns {L.Map}
     */
    getMap() {
        return this.map;
    }

    /**
     * 获取当前中心点
     * @returns {L.LatLng}
     */
    getCenter() {
        return this.map?.getCenter();
    }

    /**
     * 获取当前缩放级别
     * @returns {number}
     */
    getZoom() {
        return this.map?.getZoom();
    }

    /**
     * 获取当前边界
     * @returns {L.LatLngBounds}
     */
    getBounds() {
        return this.map?.getBounds();
    }

    /**
     * 销毁地图
     */
    destroy() {
        if (this.map) {
            // 移除所有图层
            if (this.tileLayer) {
                this.map.removeLayer(this.tileLayer);
                this.tileLayer = null;
            }

            // 销毁地图
            this.map.remove();
            this.map = null;
        }
    }

    /**
     * 设置事件回调
     * @param {Object} callbacks - 回调函数对象
     */
    setCallbacks(callbacks) {
        this.onTileLoading = callbacks.onTileLoading;
        this.onTileLoaded = callbacks.onTileLoaded;
        this.onTileError = callbacks.onTileError;
    }
}

export default MapInitializer;
