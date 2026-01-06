/**
 * MarkerManager - 标记管理服务
 * 负责地图标记的创建、管理、过滤和交互
 *
 * 从 RegionDetailMap.vue 提取的标记管理逻辑
 */

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

// 使用全局 Leaflet 实例
const L = window.L;

export class MarkerManager {
    constructor(options = {}) {
        this.options = {
            autoFit: true, // 是否自动适配地图视图
            enableInteraction: true, // 是否启用交互
            ...options
        };

        this.map = null;
        this.markers = []; // 所有标记
        this.markerRegistry = []; // 标记注册表(包含分类信息)
        this.selectedCategory = 'all'; // 当前选中的分类
        this.eventHandlers = {}; // 事件处理器
    }

    /**
     * 设置地图实例
     * @param {L.Map} map - Leaflet 地图实例
     */
    setMap(map) {
        this.map = map;
    }

    /**
     * 从瓦片数据添加地块标记
     * @param {Object} tilesData - 瓦片数据
     * @param {Object} options - 选项
     * @returns {Promise<Array>} 创建的标记数组
     */
    async addPlotMarkersFromTiles(tilesData, options = {}) {
        try {
            if (!this.map) {
                console.warn('[MarkerManager] 地图未初始化');
                return [];
            }

            // 使用工具函数转换瓦片数据
            const coordinateData = transformTilesToCoordinates(tilesData);
            const allEntries = Object.entries(coordinateData);

            const createdMarkers = [];

            allEntries.forEach(([key, fieldData]) => {
                const plotName = fieldData.displayName || fieldData.name || key;

                // 验证数据完整性
                if (!isValidFieldData(fieldData)) {
                    return;
                }

                // 创建标记
                const marker = this.createPlotMarker(fieldData, plotName, options);
                if (marker) {
                    createdMarkers.push(marker);
                }
            });

            // 自动适配视图
            if (this.options.autoFit && options.autoFit !== false) {
                this.fitBounds();
            }

            return createdMarkers;
        } catch (error) {
            console.error('[MarkerManager] 添加地块标记失败:', error);
            return [];
        }
    }

    /**
     * 创建单个地块标记
     * @param {Object} fieldData - 地块数据
     * @param {string} plotName - 地块名称
     * @param {Object} options - 选项
     * @returns {L.Marker} 创建的标记
     */
    createPlotMarker(fieldData, plotName, options = {}) {
        try {
            const plotData = createPlotData(fieldData, plotName);
            const [markerLat, markerLng] = fieldData.center;

            // 生成标记HTML
            const markerHtml = generatePlotMarkerHtml(plotData, getTypeIcon);
            const iconConfig = getMarkerIconConfig(markerHtml);
            const customIcon = L.divIcon(iconConfig);

            // 创建标记 - 明确指定使用 markerPane 确保在最上层
            const marker = L.marker([markerLat, markerLng], {
                icon: customIcon,
                pane: 'markerPane', // 确保标记在 markerPane，位于所有图层之上
                zIndexOffset: 1000 // 增加 z-index 确保在最上层
            });

            // 添加到地图
            marker.addTo(this.map);

            // 保存数据到标记
            marker.plotData = plotData;
            marker.fieldData = fieldData;

            // 注册标记
            this.registerMarker(marker, plotData.property_category_code);

            // 等待 DOM 元素创建后，直接在元素上绑定事件（divIcon 需要这样处理）
            setTimeout(() => {
                const element = marker.getElement();
                if (element && this.options.enableInteraction && options.enableInteraction !== false) {
                    // 确保元素可点击
                    element.style.pointerEvents = 'auto';
                    element.style.cursor = 'pointer';

                    // 直接在 DOM 元素上绑定点击事件
                    element.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleMarkerClick(marker, plotData, e);
                    });

                    // 悬停事件
                    element.addEventListener('mouseenter', (e) => {
                        this.handleMarkerHover(marker, plotData, e);
                    });

                    element.addEventListener('mouseleave', (e) => {
                        this.handleMarkerOut(marker, plotData, e);
                    });
                }
            }, 0);

            return marker;
        } catch (error) {
            console.error('[MarkerManager] 创建地块标记失败:', error);
            return null;
        }
    }

    /**
     * 注册标记到注册表
     * @param {L.Marker} marker - 标记实例
     * @param {string} categoryCode - 分类代码
     */
    registerMarker(marker, categoryCode = 'forest') {
        if (!marker) {
            return;
        }

        const entry = {
            marker,
            categoryCode: categoryCode || 'forest',
            visible: true
        };

        this.markerRegistry.push(entry);
        this.markers.push(marker);

        // 监听标记添加事件,确保可见性正确
        if (marker.on) {
            marker.on('add', () => {
                this.updateMarkerVisibility(entry);
            });
        }

        // 立即更新可见性
        this.updateMarkerVisibility(entry);
    }

    /**
     * 处理标记点击事件
     * @param {L.Marker} marker - 标记实例
     * @param {Object} plotData - 地块数据
     * @param {Event} event - 事件对象
     */
    handleMarkerClick(marker, plotData, event) {
        // 触发自定义回调
        if (this.eventHandlers.onClick) {
            this.eventHandlers.onClick(marker, plotData, event);
        }
    }

    /**
     * 处理标记悬停事件
     * @param {L.Marker} marker - 标记实例
     * @param {Object} plotData - 地块数据
     * @param {Event} event - 事件对象
     */
    handleMarkerHover(marker, plotData, event) {
        // 触发自定义回调
        if (this.eventHandlers.onHover) {
            this.eventHandlers.onHover(marker, plotData, event);
        }
    }

    /**
     * 处理标记移出事件
     * @param {L.Marker} marker - 标记实例
     * @param {Object} plotData - 地块数据
     * @param {Event} event - 事件对象
     */
    handleMarkerOut(marker, plotData, event) {
        // 触发自定义回调
        if (this.eventHandlers.onOut) {
            this.eventHandlers.onOut(marker, plotData, event);
        }
    }

    /**
     * 设置事件处理器
     * @param {Object} handlers - 事件处理器对象
     */
    setEventHandlers(handlers) {
        this.eventHandlers = {
            ...this.eventHandlers,
            ...handlers
        };
    }

    /**
     * 按分类过滤标记
     * @param {string} categoryType - 分类类型 ('all', 'forest', 'factory', 'warehouse')
     */
    filterByCategory(categoryType) {
        this.selectedCategory = categoryType;
        this.applyFilter();
    }

    /**
     * 应用过滤器
     */
    applyFilter() {
        if (!this.markerRegistry.length) {
            return;
        }

        this.markerRegistry.forEach(entry => {
            this.updateMarkerVisibility(entry);
        });
    }

    /**
     * 更新标记可见性
     * @param {Object} entry - 标记注册条目
     */
    updateMarkerVisibility(entry) {
        if (!entry || !entry.marker) {
            return;
        }

        const categoryCode = entry.categoryCode || 'forest';
        const shouldShow = this.selectedCategory === 'all' || categoryCode === this.selectedCategory;

        if (!this.map) {
            entry.visible = shouldShow;
            return;
        }

        this.setMarkerVisible(entry.marker, shouldShow);
        entry.visible = shouldShow;
    }

    /**
     * 设置单个标记的可见性
     * @param {L.Marker} marker - 标记实例
     * @param {boolean} visible - 是否可见
     */
    setMarkerVisible(marker, visible) {
        const element = marker.getElement?.();

        if (visible) {
            // 显示标记
            if (!this.map.hasLayer(marker)) {
                marker.addTo(this.map);
            }
            if (element) {
                element.style.display = '';
            }
            if (marker.setOpacity) {
                marker.setOpacity(1);
            }
        } else {
            // 隐藏标记
            if (this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }
            if (element) {
                element.style.display = 'none';
            }
            if (marker.setOpacity) {
                marker.setOpacity(0);
            }
        }
    }

    /**
     * 适配地图视图以显示所有标记
     * @param {Object} options - 适配选项
     */
    fitBounds(options = {}) {
        if (!this.map || !this.markers.length) {
            return;
        }

        try {
            const coordinates = [];

            this.markers.forEach(marker => {
                if (marker.getLatLng) {
                    const latlng = marker.getLatLng();
                    coordinates.push([latlng.lat, latlng.lng]);
                }
            });

            if (coordinates.length > 0) {
                const bounds = L.latLngBounds(coordinates);

                const defaultOptions = {
                    padding: [50, 50],
                    maxZoom: 14,
                    animate: true,
                    duration: 0.5
                };

                this.map.fitBounds(bounds, { ...defaultOptions, ...options });
            }
        } catch (error) {
            console.error('[MarkerManager] 适配边界失败:', error);
        }
    }

    /**
     * 获取所有标记
     * @returns {Array} 标记数组
     */
    getMarkers() {
        return this.markers;
    }

    /**
     * 获取可见的标记
     * @returns {Array} 可见标记数组
     */
    getVisibleMarkers() {
        return this.markerRegistry
            .filter(entry => entry.visible)
            .map(entry => entry.marker);
    }

    /**
     * 获取指定分类的标记
     * @param {string} categoryCode - 分类代码
     * @returns {Array} 标记数组
     */
    getMarkersByCategory(categoryCode) {
        return this.markerRegistry
            .filter(entry => entry.categoryCode === categoryCode)
            .map(entry => entry.marker);
    }

    /**
     * 根据数据查找标记
     * @param {Function} predicate - 判断函数
     * @returns {L.Marker|null} 找到的标记
     */
    findMarker(predicate) {
        return this.markers.find(predicate);
    }

    /**
     * 移除单个标记
     * @param {L.Marker} marker - 要移除的标记
     */
    removeMarker(marker) {
        if (!this.map) {
            return;
        }

        try {
            // 从地图移除
            if (this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }

            // 从数组中移除
            const markerIndex = this.markers.indexOf(marker);
            if (markerIndex > -1) {
                this.markers.splice(markerIndex, 1);
            }

            // 从注册表移除
            const registryIndex = this.markerRegistry.findIndex(e => e.marker === marker);
            if (registryIndex > -1) {
                this.markerRegistry.splice(registryIndex, 1);
            }
        } catch (error) {
            console.error('[MarkerManager] 移除标记失败:', error);
        }
    }

    /**
     * 清除所有标记
     */
    clear() {
        if (!this.map) {
            return;
        }

        try {
            // 移除所有标记
            this.markers.forEach(marker => {
                if (this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            });

            // 清空数组
            this.markers = [];
            this.markerRegistry = [];
            this.selectedCategory = 'all';
        } catch (error) {
            console.error('[MarkerManager] 清除标记失败:', error);
        }
    }

    /**
     * 高亮标记
     * @param {L.Marker} marker - 要高亮的标记
     * @param {Object} options - 高亮选项
     */
    highlightMarker(marker, options = {}) {
        const element = marker.getElement?.();
        if (!element) {
            return;
        }

        // 添加高亮样式
        const className = options.className || 'marker-highlighted';
        element.classList.add(className);

        // 可选: 放大标记
        if (options.scale) {
            element.style.transform = `scale(${options.scale})`;
        }
    }

    /**
     * 取消标记高亮
     * @param {L.Marker} marker - 标记
     * @param {Object} options - 选项
     */
    unhighlightMarker(marker, options = {}) {
        const element = marker.getElement?.();
        if (!element) {
            return;
        }

        // 移除高亮样式
        const className = options.className || 'marker-highlighted';
        element.classList.remove(className);

        // 恢复原始大小
        element.style.transform = '';
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.clear();
        this.map = null;
        this.eventHandlers = {};
    }
}

export default MarkerManager;
