/**
 * EventBus 服务
 * 用于组件间通信,替代全局 window 函数
 *
 * 使用方式:
 * import eventBus from '@/services/eventBus'
 *
 * // 监听事件
 * eventBus.on('event-name', callback)
 *
 * // 触发事件
 * eventBus.emit('event-name', data)
 *
 * // 移除监听
 * eventBus.off('event-name', callback)
 */

import Vue from 'vue';

class EventBus {
    constructor() {
        // 使用 Vue 实例作为事件中心
        this.bus = new Vue();

        // 事件监听器映射表(用于调试和清理)
        this.listeners = new Map();
    }

    /**
     * 监听事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} context - 上下文(可选,用于自动清理)
     */
    on(event, callback, context = null) {
        this.bus.$on(event, callback);

        // 记录监听器(用于调试)
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push({ callback, context });
    }

    /**
     * 监听事件(一次性)
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
    once(event, callback) {
        this.bus.$once(event, callback);
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {*} data - 事件数据
     */
    emit(event, data) {
        this.bus.$emit(event, data);
    }

    /**
     * 移除事件监听
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数(可选)
     */
    off(event, callback) {
        if (callback) {
            this.bus.$off(event, callback);

            // 从记录中移除
            if (this.listeners.has(event)) {
                const listeners = this.listeners.get(event);
                const index = listeners.findIndex(l => l.callback === callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        } else {
            // 移除所有该事件的监听器
            this.bus.$off(event);
            this.listeners.delete(event);
        }
    }

    /**
     * 移除指定上下文的所有监听器
     * @param {Object} context - 上下文对象(通常是组件实例)
     */
    offByContext(context) {
        this.listeners.forEach((listeners, event) => {
            listeners.forEach(({ callback, context: ctx }) => {
                if (ctx === context) {
                    this.off(event, callback);
                }
            });
        });
    }

    /**
     * 移除所有监听器
     */
    offAll() {
        this.bus.$off();
        this.listeners.clear();
    }

    /**
     * 获取所有注册的事件
     * @returns {Array} 事件名称列表
     */
    getEvents() {
        return Array.from(this.listeners.keys());
    }

    /**
     * 获取指定事件的监听器数量
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }
}

// 创建单例
const eventBus = new EventBus();

// 导出单例
export default eventBus;

// 导出事件名称常量(避免拼写错误)
export const EVENTS = {
    // 地图相关事件
    MAP_ZOOM_TO_FIELD: 'map:zoom-to-field',
    MAP_SHOW_FIELD_DETAILS: 'map:show-field-details',
    MAP_REGION_SELECTED: 'map:region-selected',
    MAP_MARKER_CLICKED: 'map:marker-clicked',
    MAP_READY: 'map:ready',

    // 场景过渡事件
    INTRO_TRANSITION: 'intro:transition',
    INTRO_TARGET_CHANGE: 'intro:target-change',

    // 数据更新事件
    DATA_REFRESH: 'data:refresh',
    DATA_LOADED: 'data:loaded',
    DATA_ERROR: 'data:error',

    // UI 事件
    PANEL_OPEN: 'ui:panel-open',
    PANEL_CLOSE: 'ui:panel-close',
    MODAL_OPEN: 'ui:modal-open',
    MODAL_CLOSE: 'ui:modal-close',
};
