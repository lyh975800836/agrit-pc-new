/**
 * BoundaryManager - 边界管理服务
 * 负责区域边界的加载、渲染和遮罩效果
 *
 * 从 RegionDetailMap.vue 提取的边界管理逻辑
 */

import { REGION_DETAIL_MAP_CONFIG } from '@/config/mapConfig';

// 使用全局 Leaflet 实例
const L = window.L;

export class BoundaryManager {
    constructor(options = {}) {
        this.options = {
            config: REGION_DETAIL_MAP_CONFIG,
            ...options
        };

        this.map = null;
        this.layers = [];
        this.regionFeature = null;
        this.regionLayer = null;
        this.maskLayer = null;
    }

    /**
     * 设置地图实例
     * @param {L.Map} map - Leaflet 地图实例
     */
    setMap(map) {
        this.map = map;
    }

    /**
     * 添加区域边界
     * @param {Object} regionFeature - GeoJSON 要素对象
     * @param {Object} options - 边界样式选项
     * @returns {L.GeoJSON} 边界图层
     */
    addRegionBoundary(regionFeature, options = {}) {
        try {
            if (!this.map) {
                console.warn('[BoundaryManager] 地图未初始化');
                return null;
            }

            // 保存要素数据
            this.regionFeature = regionFeature;

            // 合并默认样式
            const defaultStyle = {
                color: '#c69c6d',
                weight: 3,
                opacity: 1,
                fillColor: 'rgba(76, 253, 235, 0.1)',
                fillOpacity: 0.1,
                interactive: false // 边界图层不需要交互
            };

            const style = { ...defaultStyle, ...options.style };

            // 创建区域轮廓图层
            this.regionLayer = L.geoJSON(regionFeature, {
                style,
                pane: 'overlayPane' // 明确指定使用 overlayPane
            });

            // 添加到地图
            this.regionLayer.addTo(this.map);

            // 确保边界图层不阻止点击
            this.regionLayer.eachLayer((layer) => {
                if (layer.getElement) {
                    const element = layer.getElement();
                    if (element) {
                        element.style.pointerEvents = 'none';
                    }
                }
            });

            this.layers.push(this.regionLayer);

            return this.regionLayer;
        } catch (error) {
            console.error('[BoundaryManager] 添加区域边界失败:', error);
            return null;
        }
    }

    /**
     * 添加区域外遮罩层
     * @param {Object} regionFeature - GeoJSON 要素对象(可选,默认使用当前的 regionFeature)
     * @param {Object} options - 遮罩样式选项
     * @returns {L.Polygon} 遮罩图层
     */
    addRegionMask(regionFeature = null, options = {}) {
        try {
            if (!this.map) {
                console.warn('[BoundaryManager] 地图未初始化');
                return null;
            }

            // 使用传入的要素或默认的要素
            const feature = regionFeature || this.regionFeature;
            if (!feature) {
                console.warn('[BoundaryManager] 缺少区域要素数据');
                return null;
            }

            // 计算区域边界
            const regionBounds = L.geoJSON(feature).getBounds();

            // 扩大边界以确保完全覆盖
            const config = this.options.config;
            const mult = config.regionMaskMarginMultiplier || 0.2;
            const margin = Math.max(
                Math.abs(regionBounds.getNorth() - regionBounds.getSouth()) * mult,
                Math.abs(regionBounds.getEast() - regionBounds.getWest()) * mult
            );

            // 创建一个覆盖整个可视区域的大矩形(外环)
            const outerRing = [
                [regionBounds.getSouth() - margin, regionBounds.getWest() - margin],
                [regionBounds.getSouth() - margin, regionBounds.getEast() + margin],
                [regionBounds.getNorth() + margin, regionBounds.getEast() + margin],
                [regionBounds.getNorth() + margin, regionBounds.getWest() - margin],
                [regionBounds.getSouth() - margin, regionBounds.getWest() - margin]
            ];

            // 获取区域的坐标(需要反转,作为内部洞)
            const innerRings = this.extractInnerRings(feature);

            // 创建带洞的多边形
            const defaultMaskStyle = {
                color: 'transparent',
                fillColor: 'rgba(0, 0, 0, 0.6)',
                fillOpacity: 0.6,
                weight: 0,
                interactive: false,
                pane: 'overlayPane' // 明确指定使用 overlayPane,确保在标记下方
            };

            const maskStyle = { ...defaultMaskStyle, ...options.style };
            this.maskLayer = L.polygon([outerRing, ...innerRings], maskStyle);

            // 添加遮罩到地图,并确保其在底层
            this.maskLayer.addTo(this.map);

            // 强制设置遮罩的 pointer-events 为 none,确保不阻止点击
            if (this.maskLayer.getElement) {
                const element = this.maskLayer.getElement();
                if (element) {
                    element.style.pointerEvents = 'none';
                }
            }
            this.layers.push(this.maskLayer);

            return this.maskLayer;
        } catch (error) {
            console.error('[BoundaryManager] 添加区域遮罩失败:', error);
            return null;
        }
    }

    /**
     * 提取内环坐标(用于创建遮罩洞)
     * @private
     * @param {Object} feature - GeoJSON 要素
     * @returns {Array} 内环坐标数组
     */
    extractInnerRings(feature) {
        const innerRings = [];

        if (feature.geometry.type === 'Polygon') {
            // 对于 Polygon,使用第一个坐标环,并反转坐标顺序
            const coords = feature.geometry.coordinates[0];
            innerRings.push(coords.map(coord => [coord[1], coord[0]]).reverse());
        } else if (feature.geometry.type === 'MultiPolygon') {
            // 对于 MultiPolygon,处理所有多边形
            feature.geometry.coordinates.forEach(polygon => {
                const coords = polygon[0];
                innerRings.push(coords.map(coord => [coord[1], coord[0]]).reverse());
            });
        }

        return innerRings;
    }

    /**
     * 适配地图视图到边界
     * @param {Object} options - 适配选项
     */
    fitBounds(options = {}) {
        if (!this.map || !this.regionLayer) {
            console.warn('[BoundaryManager] 地图或边界图层未初始化');
            return;
        }

        try {
            const bounds = this.regionLayer.getBounds();
            const config = this.options.config;

            const defaultOptions = {
                padding: config.centerPadding || [50, 50],
                maxZoom: config.fitZoom || 14,
                animate: true,
                duration: 0.5
            };

            this.map.fitBounds(bounds, { ...defaultOptions, ...options });
        } catch (error) {
            console.error('[BoundaryManager] 适配边界失败:', error);
        }
    }

    /**
     * 获取边界图层
     * @returns {L.GeoJSON} 边界图层
     */
    getRegionLayer() {
        return this.regionLayer;
    }

    /**
     * 获取遮罩图层
     * @returns {L.Polygon} 遮罩图层
     */
    getMaskLayer() {
        return this.maskLayer;
    }

    /**
     * 获取当前区域要素
     * @returns {Object} GeoJSON 要素
     */
    getRegionFeature() {
        return this.regionFeature;
    }

    /**
     * 获取区域边界
     * @returns {L.LatLngBounds} 边界
     */
    getBounds() {
        return this.regionLayer?.getBounds();
    }

    /**
     * 获取所有边界相关图层
     * @returns {Array} 图层数组
     */
    getLayers() {
        return this.layers;
    }

    /**
     * 更新边界样式
     * @param {Object} style - 新的样式
     */
    updateBoundaryStyle(style) {
        if (!this.regionLayer) {
            console.warn('[BoundaryManager] 边界图层未初始化');
            return;
        }

        try {
            this.regionLayer.setStyle(style);
        } catch (error) {
            console.error('[BoundaryManager] 更新边界样式失败:', error);
        }
    }

    /**
     * 更新遮罩样式
     * @param {Object} style - 新的样式
     */
    updateMaskStyle(style) {
        if (!this.maskLayer) {
            console.warn('[BoundaryManager] 遮罩图层未初始化');
            return;
        }

        try {
            this.maskLayer.setStyle(style);
        } catch (error) {
            console.error('[BoundaryManager] 更新遮罩样式失败:', error);
        }
    }

    /**
     * 显示/隐藏边界
     * @param {boolean} visible - 是否可见
     */
    setBoundaryVisible(visible) {
        if (!this.map || !this.regionLayer) {
            return;
        }

        if (visible) {
            if (!this.map.hasLayer(this.regionLayer)) {
                this.regionLayer.addTo(this.map);
            }
        } else {
            if (this.map.hasLayer(this.regionLayer)) {
                this.map.removeLayer(this.regionLayer);
            }
        }
    }

    /**
     * 显示/隐藏遮罩
     * @param {boolean} visible - 是否可见
     */
    setMaskVisible(visible) {
        if (!this.map || !this.maskLayer) {
            return;
        }

        if (visible) {
            if (!this.map.hasLayer(this.maskLayer)) {
                this.maskLayer.addTo(this.map);
            }
        } else {
            if (this.map.hasLayer(this.maskLayer)) {
                this.map.removeLayer(this.maskLayer);
            }
        }
    }

    /**
     * 移除边界图层
     */
    removeBoundary() {
        if (!this.map || !this.regionLayer) {
            return;
        }

        try {
            this.map.removeLayer(this.regionLayer);
            const index = this.layers.indexOf(this.regionLayer);
            if (index > -1) {
                this.layers.splice(index, 1);
            }
            this.regionLayer = null;
        } catch (error) {
            console.error('[BoundaryManager] 移除边界图层失败:', error);
        }
    }

    /**
     * 移除遮罩图层
     */
    removeMask() {
        if (!this.map || !this.maskLayer) {
            return;
        }

        try {
            this.map.removeLayer(this.maskLayer);
            const index = this.layers.indexOf(this.maskLayer);
            if (index > -1) {
                this.layers.splice(index, 1);
            }
            this.maskLayer = null;
        } catch (error) {
            console.error('[BoundaryManager] 移除遮罩图层失败:', error);
        }
    }

    /**
     * 清除所有边界相关图层
     */
    clear() {
        if (!this.map) {
            return;
        }

        try {
            // 移除所有图层
            this.layers.forEach(layer => {
                if (this.map.hasLayer(layer)) {
                    this.map.removeLayer(layer);
                }
            });

            // 清空数组和引用
            this.layers = [];
            this.regionLayer = null;
            this.maskLayer = null;
            this.regionFeature = null;
        } catch (error) {
            console.error('[BoundaryManager] 清除图层失败:', error);
        }
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.clear();
        this.map = null;
    }
}

export default BoundaryManager;
