import StarAniseStrategy from './StarAniseStrategy'
import FactoryStrategy from './FactoryStrategy'
import WarehouseStrategy from './WarehouseStrategy'
import TeaOilStrategy from './TeaOilStrategy'

/**
 * 地块策略工厂
 *
 * 负责创建和管理地块策略实例
 * 支持动态注册新策略
 * 提供降级处理机制
 *
 * @class PlotStrategyFactory
 */
class PlotStrategyFactory {
    static strategies = {
        'star-anise': StarAniseStrategy,
        'factory': FactoryStrategy,
        'warehouse': WarehouseStrategy,
        'tea-oil': TeaOilStrategy
    }

    /**
     * 创建策略实例
     *
     * @param {string} type - 地块类型
     * @param {Object} plotData - 地块数据
     * @param {Object} configData - 配置数据
     * @returns {PlotStrategy} 策略实例
     */
    static create(type, plotData, configData) {
        const StrategyClass = this.strategies[type]

        if (!StrategyClass) {
            console.warn(`[StrategyFactory] 未知地块类型: ${type}, 使用默认策略 (StarAniseStrategy)`)
            return new StarAniseStrategy(plotData, configData)
        }

        try {
            return new StrategyClass(plotData, configData)
        } catch (error) {
            console.error(`[StrategyFactory] 创建 ${type} 策略失败:`, error)
            // 降级到默认策略
            return new StarAniseStrategy(plotData, configData)
        }
    }

    /**
     * 注册新策略
     *
     * @param {string} type - 策略类型
     * @param {Function} StrategyClass - 策略类
     */
    static register(type, StrategyClass) {
        if (!type || !StrategyClass) {
            throw new Error('[StrategyFactory] 无效的策略类型或类')
        }
        this.strategies[type] = StrategyClass
        console.log(`[StrategyFactory] 已注册策略: ${type}`)
    }

    /**
     * 检查策略是否存在
     *
     * @param {string} type - 策略类型
     * @returns {boolean}
     */
    static has(type) {
        return !!this.strategies[type]
    }

    /**
     * 获取所有已注册的策略类型
     *
     * @returns {Array<string>} 策略类型列表
     */
    static getTypes() {
        return Object.keys(this.strategies)
    }
}

export default PlotStrategyFactory
