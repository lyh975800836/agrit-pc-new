/**
 * 地块策略基类
 *
 * 定义所有地块类型的通用接口
 * 子类必须实现抽象方法,可选覆盖通用方法
 *
 * @abstract
 * @class PlotStrategy
 */
class PlotStrategy {
    constructor(plotData, configData) {
        this.plotData = plotData
        this.configData = configData || {}
    }

    /**
     * 获取地块类型
     * @abstract
     * @returns {string} 地块类型 (star-anise, factory, warehouse, tea-oil)
     */
    getType() {
        throw new Error('子类必须实现 getType 方法')
    }

    /**
     * 获取左侧面板组件名称
     * @abstract
     * @returns {string} 组件名称
     */
    getLeftPanelComponent() {
        throw new Error('子类必须实现 getLeftPanelComponent 方法')
    }

    /**
     * 获取右侧面板组件名称
     * @abstract
     * @returns {string} 组件名称
     */
    getRightPanelComponent() {
        throw new Error('子类必须实现 getRightPanelComponent 方法')
    }

    /**
     * 获取配置值 (通用方法)
     * @param {string} key - 配置键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 配置值
     * @protected
     */
    _getConfigValue(key, defaultValue = '') {
        return this.configData[key] || defaultValue
    }

    /**
     * 获取统计数据
     * @returns {Array} 统计数据列表
     */
    getStatistics() {
        return []
    }

    /**
     * 获取所有人信息
     * @returns {Object} 所有人信息
     */
    getOwnerInfo() {
        return {}
    }

    /**
     * 获取状态标签
     * @returns {Array} 标签列表
     */
    getStatusTags() {
        return []
    }

    /**
     * 获取价格信息
     * @param {Object} priceData - 价格数据
     * @returns {Array} 价格信息列表
     */
    getPriceInfo(priceData) { // eslint-disable-line no-unused-vars
        return []
    }

    /**
     * 是否显示健康指标
     * @returns {boolean}
     */
    showHealthIndicators() {
        return false
    }

    /**
     * 是否显示农情动态
     * @returns {boolean}
     */
    showFarmingDynamics() {
        return false
    }

    /**
     * 获取健康指标数据
     * @returns {Array} 健康指标列表
     */
    getHealthIndicators() {
        return []
    }

    /**
     * 获取额外数据 (用于右侧面板)
     * @returns {Object} 额外数据对象
     */
    getExtraData() {
        return {}
    }
}

export default PlotStrategy
