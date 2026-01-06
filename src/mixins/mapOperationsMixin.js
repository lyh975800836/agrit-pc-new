/**
 * Map Operations Mixin
 * 统一管理地图相关操作,替代直接操作全局函数
 *
 * 使用 EventBus 实现组件间通信,避免全局函数污染
 *
 * 使用方式:
 * import mapOperationsMixin from '@/mixins/mapOperationsMixin'
 *
 * export default {
 *   mixins: [mapOperationsMixin],
 *   mounted() {
 *     // 监听地图事件
 *     this.onMapZoomToField((data) => {
 *       // 处理缩放到地块事件
 *     });
 *   }
 * }
 */

import eventBus, { EVENTS } from '@/services/eventBus';

export default {
    data() {
        return {
            // 存储事件监听器(用于自动清理)
            _mapEventHandlers: []
        };
    },

    beforeDestroy() {
        // 自动清理所有事件监听
        this.cleanupMapEventListeners();
    },

    methods: {
        // ========== 地图缩放操作 ==========

        /**
         * 缩放到指定地块
         * @param {Object} fieldData - 地块数据
         * @param {number} fieldData.lat - 纬度
         * @param {number} fieldData.lng - 经度
         * @param {number} fieldData.zoom - 缩放级别(可选)
         * @param {Object} fieldData.bounds - 边界(可选)
         */
        zoomToField(fieldData) {
            eventBus.emit(EVENTS.MAP_ZOOM_TO_FIELD, fieldData);
        },

        /**
         * 监听缩放到地块事件
         * @param {Function} handler - 事件处理函数
         */
        onMapZoomToField(handler) {
            this._registerMapEventHandler(EVENTS.MAP_ZOOM_TO_FIELD, handler);
        },

        // ========== 地块详情操作 ==========

        /**
         * 显示地块详情
         * @param {Object} fieldData - 地块数据
         * @param {string} fieldData.id - 地块ID
         * @param {string} fieldData.name - 地块名称
         * @param {Object} fieldData.details - 详细信息
         */
        showFieldDetails(fieldData) {
            eventBus.emit(EVENTS.MAP_SHOW_FIELD_DETAILS, fieldData);
        },

        /**
         * 监听显示地块详情事件
         * @param {Function} handler - 事件处理函数
         */
        onShowFieldDetails(handler) {
            this._registerMapEventHandler(EVENTS.MAP_SHOW_FIELD_DETAILS, handler);
        },

        // ========== 区域选择操作 ==========

        /**
         * 选择区域
         * @param {Object} regionData - 区域数据
         * @param {string} regionData.name - 区域名称
         * @param {Array} regionData.coordinates - 区域坐标
         */
        selectRegion(regionData) {
            eventBus.emit(EVENTS.MAP_REGION_SELECTED, regionData);
        },

        /**
         * 监听区域选择事件
         * @param {Function} handler - 事件处理函数
         */
        onRegionSelected(handler) {
            this._registerMapEventHandler(EVENTS.MAP_REGION_SELECTED, handler);
        },

        // ========== 标记点击操作 ==========

        /**
         * 触发标记点击事件
         * @param {Object} markerData - 标记数据
         */
        notifyMarkerClicked(markerData) {
            eventBus.emit(EVENTS.MAP_MARKER_CLICKED, markerData);
        },

        /**
         * 监听标记点击事件
         * @param {Function} handler - 事件处理函数
         */
        onMarkerClicked(handler) {
            this._registerMapEventHandler(EVENTS.MAP_MARKER_CLICKED, handler);
        },

        // ========== 地图就绪事件 ==========

        /**
         * 通知地图已就绪
         * @param {Object} mapInstance - 地图实例
         */
        notifyMapReady(mapInstance) {
            eventBus.emit(EVENTS.MAP_READY, { map: mapInstance, component: this });
        },

        /**
         * 监听地图就绪事件
         * @param {Function} handler - 事件处理函数
         */
        onMapReady(handler) {
            this._registerMapEventHandler(EVENTS.MAP_READY, handler);
        },

        // ========== 场景过渡操作 ==========

        /**
         * 触发场景过渡
         * @param {string} target - 目标场景
         * @param {Object} options - 过渡选项
         */
        triggerIntroTransition(target, options = {}) {
            eventBus.emit(EVENTS.INTRO_TRANSITION, { target, ...options });
        },

        /**
         * 监听场景过渡事件
         * @param {Function} handler - 事件处理函数
         */
        onIntroTransition(handler) {
            this._registerMapEventHandler(EVENTS.INTRO_TRANSITION, handler);
        },

        /**
         * 设置场景目标
         * @param {string} target - 目标场景
         */
        setIntroTarget(target) {
            eventBus.emit(EVENTS.INTRO_TARGET_CHANGE, target);
        },

        /**
         * 监听场景目标变化
         * @param {Function} handler - 事件处理函数
         */
        onIntroTargetChange(handler) {
            this._registerMapEventHandler(EVENTS.INTRO_TARGET_CHANGE, handler);
        },

        // ========== 内部辅助方法 ==========

        /**
         * 注册地图事件处理器(内部使用)
         * @private
         * @param {string} event - 事件名称
         * @param {Function} handler - 事件处理函数
         */
        _registerMapEventHandler(event, handler) {
            // 绑定到当前组件上下文
            const boundHandler = handler.bind(this);

            // 注册事件监听
            eventBus.on(event, boundHandler, this);

            // 记录处理器(用于清理)
            this._mapEventHandlers.push({
                event,
                handler: boundHandler
            });
        },

        /**
         * 清理所有地图事件监听器
         * @private
         */
        cleanupMapEventListeners() {
            this._mapEventHandlers.forEach(({ event, handler }) => {
                eventBus.off(event, handler);
            });

            // 清空记录
            this._mapEventHandlers = [];
        },

        /**
         * 手动移除特定事件监听
         * @param {string} event - 事件名称
         */
        removeMapEventListener(event) {
            const handlersToRemove = this._mapEventHandlers.filter(h => h.event === event);

            handlersToRemove.forEach(({ handler }) => {
                eventBus.off(event, handler);
            });

            // 从记录中移除
            this._mapEventHandlers = this._mapEventHandlers.filter(h => h.event !== event);
        }
    }
};
