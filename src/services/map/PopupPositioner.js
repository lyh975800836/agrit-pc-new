/**
 * PopupPositioner - 弹窗定位服务
 * 负责计算地图弹窗的最佳显示位置,确保弹窗始终在可视区域内
 *
 * 从 RegionDetailMap.vue 提取的弹窗定位逻辑
 */

import { REGION_DETAIL_MAP_CONFIG } from '@/config/mapConfig';

export class PopupPositioner {
    constructor(options = {}) {
        this.options = {
            config: REGION_DETAIL_MAP_CONFIG,
            ...options
        };

        this.map = null;
        this.mapContainer = null;
    }

    /**
     * 设置地图实例和容器
     * @param {L.Map} map - Leaflet 地图实例
     * @param {string|HTMLElement} containerId - 地图容器ID或元素
     */
    setMap(map, containerId = 'leaflet-map') {
        this.map = map;

        if (typeof containerId === 'string') {
            this.mapContainer = document.getElementById(containerId);
        } else {
            this.mapContainer = containerId;
        }
    }

    /**
     * 计算弹窗位置
     * @param {Array} latLng - 地理坐标 [lat, lng]
     * @param {Object} options - 弹窗选项
     * @returns {Object} 弹窗位置 { top, left }
     */
    calculatePosition(latLng, options = {}) {
        try {
            if (!this.map || !this.mapContainer) {
                console.warn('[PopupPositioner] 地图或容器未初始化');
                return { top: 0, left: 0 };
            }

            const config = this.options.config;

            // 合并选项
            const {
                popupWidth = config.popupWidth || 300,
                popupHeight = config.popupHeight || 200,
                offsetAbove = config.popupOffsetAbove || 20,
                margin = config.popupMargin || 10
            } = options;

            // 将地理坐标转换为容器坐标
            const point = this.map.latLngToContainerPoint(latLng);
            const mapRect = this.mapContainer.getBoundingClientRect();

            // 计算屏幕坐标
            const screenX = mapRect.left + point.x;
            const screenY = mapRect.top + point.y;

            // 计算垂直位置
            let top = this.calculateTopPosition(screenY, popupHeight, offsetAbove, margin);

            // 计算水平位置
            let left = this.calculateLeftPosition(screenX, popupWidth, margin);

            return { top, left };
        } catch (error) {
            console.error('[PopupPositioner] 计算弹窗位置失败:', error);
            return { top: 0, left: 0 };
        }
    }

    /**
     * 计算垂直位置
     * @private
     * @param {number} screenY - 标记的屏幕Y坐标
     * @param {number} popupHeight - 弹窗高度
     * @param {number} offsetAbove - 标记上方偏移量
     * @param {number} margin - 边距
     * @returns {number} top 位置
     */
    calculateTopPosition(screenY, popupHeight, offsetAbove, margin) {
        // 优先在标记上方显示
        let top = screenY - popupHeight - offsetAbove;

        // 如果上方空间不足,显示在下方
        if (top < margin) {
            top = screenY + offsetAbove;
        }

        // 如果下方也超出屏幕,调整到屏幕底部
        if (top + popupHeight > window.innerHeight - margin) {
            top = window.innerHeight - popupHeight - margin;
        }

        // 确保不会超出顶部
        top = Math.max(margin, top);

        return top;
    }

    /**
     * 计算水平位置
     * @private
     * @param {number} screenX - 标记的屏幕X坐标
     * @param {number} popupWidth - 弹窗宽度
     * @param {number} margin - 边距
     * @returns {number} left 位置
     */
    calculateLeftPosition(screenX, popupWidth, margin) {
        // 居中显示
        let left = screenX - popupWidth / 2;

        // 确保不超出屏幕左侧
        left = Math.max(margin, left);

        // 确保不超出屏幕右侧
        left = Math.min(left, window.innerWidth - popupWidth - margin);

        return left;
    }

    /**
     * 计算弹窗位置(相对于地图容器)
     * @param {Array} latLng - 地理坐标 [lat, lng]
     * @param {Object} options - 弹窗选项
     * @returns {Object} 弹窗位置 { top, left }
     */
    calculateRelativePosition(latLng, options = {}) {
        try {
            if (!this.map || !this.mapContainer) {
                console.warn('[PopupPositioner] 地图或容器未初始化');
                return { top: 0, left: 0 };
            }

            const config = this.options.config;

            const {
                popupWidth = config.popupWidth || 300,
                popupHeight = config.popupHeight || 200,
                offsetAbove = config.popupOffsetAbove || 20,
                margin = config.popupMargin || 10
            } = options;

            // 将地理坐标转换为容器坐标
            const point = this.map.latLngToContainerPoint(latLng);
            const mapRect = this.mapContainer.getBoundingClientRect();

            // 计算相对于地图容器的位置
            let top = point.y - popupHeight - offsetAbove;
            let left = point.x - popupWidth / 2;

            // 边界检查(相对于容器)
            if (top < margin) {
                top = point.y + offsetAbove;
            }

            if (top + popupHeight > mapRect.height - margin) {
                top = mapRect.height - popupHeight - margin;
            }

            top = Math.max(margin, top);

            if (left < margin) {
                left = margin;
            }

            if (left + popupWidth > mapRect.width - margin) {
                left = mapRect.width - popupWidth - margin;
            }

            return { top, left };
        } catch (error) {
            console.error('[PopupPositioner] 计算相对位置失败:', error);
            return { top: 0, left: 0 };
        }
    }

    /**
     * 计算智能弹窗位置(自动选择最佳位置)
     * @param {Array} latLng - 地理坐标 [lat, lng]
     * @param {Object} options - 弹窗选项
     * @returns {Object} { position: { top, left }, placement: 'top'|'bottom'|'left'|'right' }
     */
    calculateSmartPosition(latLng, options = {}) {
        try {
            if (!this.map || !this.mapContainer) {
                console.warn('[PopupPositioner] 地图或容器未初始化');
                return { position: { top: 0, left: 0 }, placement: 'top' };
            }

            const config = this.options.config;

            const {
                popupWidth = config.popupWidth || 300,
                popupHeight = config.popupHeight || 200,
                offset = config.popupOffsetAbove || 20,
                margin = config.popupMargin || 10
            } = options;

            // 将地理坐标转换为容器坐标
            const point = this.map.latLngToContainerPoint(latLng);
            const mapRect = this.mapContainer.getBoundingClientRect();

            const screenX = mapRect.left + point.x;
            const screenY = mapRect.top + point.y;

            // 计算四个方向的可用空间
            const spaces = {
                top: screenY - margin,
                bottom: window.innerHeight - screenY - margin,
                left: screenX - margin,
                right: window.innerWidth - screenX - margin
            };

            // 确定最佳放置位置
            let placement = 'top';
            let position = { top: 0, left: 0 };

            if (spaces.top >= popupHeight + offset) {
                // 上方有足够空间
                placement = 'top';
                position.top = screenY - popupHeight - offset;
                position.left = screenX - popupWidth / 2;
            } else if (spaces.bottom >= popupHeight + offset) {
                // 下方有足够空间
                placement = 'bottom';
                position.top = screenY + offset;
                position.left = screenX - popupWidth / 2;
            } else if (spaces.left >= popupWidth + offset) {
                // 左侧有足够空间
                placement = 'left';
                position.left = screenX - popupWidth - offset;
                position.top = screenY - popupHeight / 2;
            } else if (spaces.right >= popupWidth + offset) {
                // 右侧有足够空间
                placement = 'right';
                position.left = screenX + offset;
                position.top = screenY - popupHeight / 2;
            } else {
                // 没有理想空间,使用默认计算
                position = this.calculatePosition(latLng, options);
                placement = 'top';
            }

            // 边界修正
            position.left = Math.max(margin, Math.min(position.left, window.innerWidth - popupWidth - margin));
            position.top = Math.max(margin, Math.min(position.top, window.innerHeight - popupHeight - margin));

            return { position, placement };
        } catch (error) {
            console.error('[PopupPositioner] 计算智能位置失败:', error);
            return { position: { top: 0, left: 0 }, placement: 'top' };
        }
    }

    /**
     * 检查坐标是否在视口内
     * @param {Array} latLng - 地理坐标 [lat, lng]
     * @returns {boolean} 是否在视口内
     */
    isInViewport(latLng) {
        if (!this.map) {
            return false;
        }

        try {
            const bounds = this.map.getBounds();
            return bounds.contains(latLng);
        } catch (error) {
            console.error('[PopupPositioner] 检查视口失败:', error);
            return false;
        }
    }

    /**
     * 将坐标平移到视口中心附近
     * @param {Array} latLng - 地理坐标 [lat, lng]
     * @param {Object} options - 平移选项
     */
    panToView(latLng, options = {}) {
        if (!this.map) {
            return;
        }

        try {
            const defaultOptions = {
                animate: true,
                duration: 0.5,
                ...options
            };

            this.map.panTo(latLng, defaultOptions);
        } catch (error) {
            console.error('[PopupPositioner] 平移地图失败:', error);
        }
    }

    /**
     * 获取地图容器尺寸
     * @returns {Object} { width, height }
     */
    getContainerSize() {
        if (!this.mapContainer) {
            return { width: 0, height: 0 };
        }

        const rect = this.mapContainer.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * 获取视口尺寸
     * @returns {Object} { width, height }
     */
    getViewportSize() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    /**
     * 销毁实例
     */
    destroy() {
        this.map = null;
        this.mapContainer = null;
    }
}

export default PopupPositioner;
