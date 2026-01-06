/**
 * MapServiceManager - 地图服务统一管理器
 * 协调所有地图服务的初始化、交互和销毁
 *
 * 简化组件中对多个服务的管理
 */

import { MapInitializer } from './MapInitializer';
import { BoundaryManager } from './BoundaryManager';
import { MarkerManager } from './MarkerManager';
import { PopupPositioner } from './PopupPositioner';

export class MapServiceManager {
    constructor(options = {}) {
        this.options = {
            containerId: 'map',
            autoFit: true,
            enableMarkerInteraction: true,
            ...options
        };

        // 服务实例
        this.mapInitializer = null;
        this.boundaryManager = null;
        this.markerManager = null;
        this.popupPositioner = null;

        // 地图实例
        this.map = null;

        // 状态
        this.isInitialized = false;
    }

    /**
     * 初始化所有服务
     * @param {Object} overrideConfig - 覆盖配置
     * @returns {Promise<L.Map>} 地图实例
     */
    async initialize(overrideConfig = {}) {
        try {
            if (this.isInitialized) {
                console.warn('[MapServiceManager] 服务已初始化');
                return this.map;
            }

            // 1. 初始化地图
            this.mapInitializer = new MapInitializer({
                containerId: this.options.containerId,
                config: this.options.config,
                tileProvider: this.options.tileProvider
            });

            this.map = await this.mapInitializer.initialize(overrideConfig);

            // 2. 初始化边界管理器
            this.boundaryManager = new BoundaryManager({
                config: this.options.config
            });
            this.boundaryManager.setMap(this.map);

            // 3. 初始化标记管理器
            this.markerManager = new MarkerManager({
                autoFit: this.options.autoFit,
                enableInteraction: this.options.enableMarkerInteraction
            });
            this.markerManager.setMap(this.map);

            // 4. 初始化弹窗定位器
            this.popupPositioner = new PopupPositioner({
                config: this.options.config
            });
            this.popupPositioner.setMap(this.map, this.options.containerId);

            this.isInitialized = true;

            console.log('[MapServiceManager] 所有服务初始化完成');
            return this.map;
        } catch (error) {
            console.error('[MapServiceManager] 初始化失败:', error);
            throw error;
        }
    }

    /**
     * 加载区域数据(边界 + 标记)
     * @param {Object} regionFeature - GeoJSON 区域要素
     * @param {Object} tilesData - 瓦片数据
     * @param {Object} options - 加载选项
     * @returns {Promise<Object>} { boundaryLayer, maskLayer, markers }
     */
    async loadRegionData(regionFeature, tilesData, options = {}) {
        try {
            if (!this.isInitialized) {
                throw new Error('服务未初始化');
            }

            const results = {
                boundaryLayer: null,
                maskLayer: null,
                markers: []
            };

            console.log('[MapServiceManager] 开始加载区域数据', { regionFeature: !!regionFeature, tilesData: !!tilesData });

            // 添加边界
            if (regionFeature) {
                console.log('[MapServiceManager] 添加边界...');
                results.boundaryLayer = this.boundaryManager.addRegionBoundary(
                    regionFeature,
                    options.boundaryOptions
                );
                console.log('[MapServiceManager] 边界添加完成', { layer: !!results.boundaryLayer });

                // 添加遮罩
                if (options.addMask !== false) {
                    console.log('[MapServiceManager] 添加遮罩...');
                    results.maskLayer = this.boundaryManager.addRegionMask(
                        regionFeature,
                        options.maskOptions
                    );
                    console.log('[MapServiceManager] 遮罩添加完成', { layer: !!results.maskLayer });
                }
            }

            // 添加标记
            if (tilesData) {
                console.log('[MapServiceManager] 添加标记...', { dataKeys: Object.keys(tilesData).length });
                results.markers = await this.markerManager.addPlotMarkersFromTiles(
                    tilesData,
                    options.markerOptions
                );
                console.log('[MapServiceManager] 标记添加完成', { count: results.markers.length });
            }

            // 适配边界 - 在标记添加后进行
            if (regionFeature && options.fitBoundary !== false) {
                console.log('[MapServiceManager] 适配地图视图...');
                // 优先使用标记的边界,如果没有标记则使用边界图层
                if (results.markers.length > 0) {
                    this.markerManager.fitBounds(options.fitOptions);
                } else {
                    this.boundaryManager.fitBounds(options.fitOptions);
                }
            }

            console.log('[MapServiceManager] 区域数据加载完成', results);
            return results;
        } catch (error) {
            console.error('[MapServiceManager] 加载区域数据失败:', error);
            throw error;
        }
    }

    /**
     * 设置标记事件处理器
     * @param {Object} handlers - 事件处理器
     */
    setMarkerEventHandlers(handlers) {
        if (!this.markerManager) {
            console.warn('[MapServiceManager] 标记管理器未初始化');
            return;
        }

        this.markerManager.setEventHandlers(handlers);
    }

    /**
     * 按分类过滤标记
     * @param {string} categoryType - 分类类型
     */
    filterMarkers(categoryType) {
        if (!this.markerManager) {
            console.warn('[MapServiceManager] 标记管理器未初始化');
            return;
        }

        this.markerManager.filterByCategory(categoryType);
    }

    /**
     * 计算弹窗位置
     * @param {Array} latLng - 地理坐标
     * @param {Object} options - 弹窗选项
     * @returns {Object} { position, placement }
     */
    calculatePopupPosition(latLng, options = {}) {
        if (!this.popupPositioner) {
            console.warn('[MapServiceManager] 弹窗定位器未初始化');
            return { position: { top: 0, left: 0 }, placement: 'top' };
        }

        return this.popupPositioner.calculateSmartPosition(latLng, options);
    }

    /**
     * 设置地图视图
     * @param {Array} center - 中心坐标
     * @param {number} zoom - 缩放级别
     * @param {Object} options - 选项
     */
    setView(center, zoom, options = {}) {
        if (!this.mapInitializer) {
            console.warn('[MapServiceManager] 地图未初始化');
            return;
        }

        this.mapInitializer.setView(center, zoom, options);
    }

    /**
     * 适配地图视图到边界
     * @param {L.LatLngBounds} bounds - 边界
     * @param {Object} options - 选项
     */
    fitBounds(bounds, options = {}) {
        if (!this.mapInitializer) {
            console.warn('[MapServiceManager] 地图未初始化');
            return;
        }

        this.mapInitializer.fitBounds(bounds, options);
    }

    /**
     * 飞行到指定位置
     * @param {Array} center - 中心坐标
     * @param {number} zoom - 缩放级别
     * @param {Object} options - 选项
     */
    flyTo(center, zoom, options = {}) {
        if (!this.mapInitializer) {
            console.warn('[MapServiceManager] 地图未初始化');
            return;
        }

        this.mapInitializer.flyTo(center, zoom, options);
    }

    /**
     * 刷新地图大小
     */
    invalidateSize() {
        if (!this.mapInitializer) {
            console.warn('[MapServiceManager] 地图未初始化');
            return;
        }

        this.mapInitializer.invalidateSize();
    }

    /**
     * 获取地图实例
     * @returns {L.Map} 地图实例
     */
    getMap() {
        return this.map;
    }

    /**
     * 获取所有服务实例
     * @returns {Object} 服务实例对象
     */
    getServices() {
        return {
            mapInitializer: this.mapInitializer,
            boundaryManager: this.boundaryManager,
            markerManager: this.markerManager,
            popupPositioner: this.popupPositioner
        };
    }

    /**
     * 获取指定服务
     * @param {string} serviceName - 服务名称
     * @returns {Object|null} 服务实例
     */
    getService(serviceName) {
        const services = {
            mapInitializer: this.mapInitializer,
            boundaryManager: this.boundaryManager,
            markerManager: this.markerManager,
            popupPositioner: this.popupPositioner
        };

        return services[serviceName] || null;
    }

    /**
     * 清除地图内容(保留地图实例)
     */
    clear() {
        if (this.boundaryManager) {
            this.boundaryManager.clear();
        }

        if (this.markerManager) {
            this.markerManager.clear();
        }
    }

    /**
     * 重新加载区域数据
     * @param {Object} regionFeature - GeoJSON 区域要素
     * @param {Object} tilesData - 瓦片数据
     * @param {Object} options - 加载选项
     * @returns {Promise<Object>} 加载结果
     */
    async reload(regionFeature, tilesData, options = {}) {
        try {
            // 清除现有数据
            this.clear();

            // 重新加载
            return await this.loadRegionData(regionFeature, tilesData, options);
        } catch (error) {
            console.error('[MapServiceManager] 重新加载失败:', error);
            throw error;
        }
    }

    /**
     * 高亮标记
     * @param {L.Marker} marker - 标记实例
     * @param {Object} options - 高亮选项
     */
    highlightMarker(marker, options = {}) {
        if (!this.markerManager) {
            console.warn('[MapServiceManager] 标记管理器未初始化');
            return;
        }

        this.markerManager.highlightMarker(marker, options);
    }

    /**
     * 取消标记高亮
     * @param {L.Marker} marker - 标记实例
     * @param {Object} options - 选项
     */
    unhighlightMarker(marker, options = {}) {
        if (!this.markerManager) {
            console.warn('[MapServiceManager] 标记管理器未初始化');
            return;
        }

        this.markerManager.unhighlightMarker(marker, options);
    }

    /**
     * 查找标记
     * @param {Function} predicate - 判断函数
     * @returns {L.Marker|null} 找到的标记
     */
    findMarker(predicate) {
        if (!this.markerManager) {
            console.warn('[MapServiceManager] 标记管理器未初始化');
            return null;
        }

        return this.markerManager.findMarker(predicate);
    }

    /**
     * 获取所有标记
     * @returns {Array} 标记数组
     */
    getMarkers() {
        if (!this.markerManager) {
            return [];
        }

        return this.markerManager.getMarkers();
    }

    /**
     * 获取可见标记
     * @returns {Array} 可见标记数组
     */
    getVisibleMarkers() {
        if (!this.markerManager) {
            return [];
        }

        return this.markerManager.getVisibleMarkers();
    }

    /**
     * 获取边界图层
     * @returns {L.GeoJSON} 边界图层
     */
    getBoundaryLayer() {
        if (!this.boundaryManager) {
            return null;
        }

        return this.boundaryManager.getRegionLayer();
    }

    /**
     * 获取边界范围
     * @returns {L.LatLngBounds} 边界范围
     */
    getBounds() {
        if (!this.boundaryManager) {
            return null;
        }

        return this.boundaryManager.getBounds();
    }

    /**
     * 更新边界样式
     * @param {Object} style - 新样式
     */
    updateBoundaryStyle(style) {
        if (!this.boundaryManager) {
            console.warn('[MapServiceManager] 边界管理器未初始化');
            return;
        }

        this.boundaryManager.updateBoundaryStyle(style);
    }

    /**
     * 显示/隐藏边界
     * @param {boolean} visible - 是否可见
     */
    setBoundaryVisible(visible) {
        if (!this.boundaryManager) {
            console.warn('[MapServiceManager] 边界管理器未初始化');
            return;
        }

        this.boundaryManager.setBoundaryVisible(visible);
    }

    /**
     * 显示/隐藏遮罩
     * @param {boolean} visible - 是否可见
     */
    setMaskVisible(visible) {
        if (!this.boundaryManager) {
            console.warn('[MapServiceManager] 边界管理器未初始化');
            return;
        }

        this.boundaryManager.setMaskVisible(visible);
    }

    /**
     * 检查坐标是否在视口内
     * @param {Array} latLng - 地理坐标
     * @returns {boolean} 是否在视口内
     */
    isInViewport(latLng) {
        if (!this.popupPositioner) {
            return false;
        }

        return this.popupPositioner.isInViewport(latLng);
    }

    /**
     * 将坐标平移到视口
     * @param {Array} latLng - 地理坐标
     * @param {Object} options - 平移选项
     */
    panToView(latLng, options = {}) {
        if (!this.popupPositioner) {
            console.warn('[MapServiceManager] 弹窗定位器未初始化');
            return;
        }

        this.popupPositioner.panToView(latLng, options);
    }

    /**
     * 销毁所有服务
     */
    destroy() {
        try {
            // 销毁各个服务
            if (this.boundaryManager) {
                this.boundaryManager.destroy();
                this.boundaryManager = null;
            }

            if (this.markerManager) {
                this.markerManager.destroy();
                this.markerManager = null;
            }

            if (this.popupPositioner) {
                this.popupPositioner.destroy();
                this.popupPositioner = null;
            }

            if (this.mapInitializer) {
                this.mapInitializer.destroy();
                this.mapInitializer = null;
            }

            // 清空状态
            this.map = null;
            this.isInitialized = false;

            console.log('[MapServiceManager] 所有服务已销毁');
        } catch (error) {
            console.error('[MapServiceManager] 销毁服务失败:', error);
        }
    }

    /**
     * 检查服务是否已初始化
     * @returns {boolean} 是否已初始化
     */
    isReady() {
        return this.isInitialized && this.map !== null;
    }

    /**
     * 等待服务就绪
     * @param {number} timeout - 超时时间(毫秒)
     * @returns {Promise<boolean>} 是否就绪
     */
    waitForReady(timeout = 5000) {
        return new Promise((resolve) => {
            if (this.isReady()) {
                resolve(true);
                return;
            }

            const startTime = Date.now();
            const interval = setInterval(() => {
                if (this.isReady()) {
                    clearInterval(interval);
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    resolve(false);
                }
            }, 100);
        });
    }
}

export default MapServiceManager;
