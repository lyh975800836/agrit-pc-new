import PlotStrategy from './PlotStrategy'

/**
 * 茶油地块策略
 * @class TeaOilStrategy
 */
class TeaOilStrategy extends PlotStrategy {
    getType() {
        return 'tea-oil'
    }

    getLeftPanelComponent() {
        return 'TeaOilLeftPanel'
    }

    getRightPanelComponent() {
        return 'FarmingDynamicsPanel'
    }

    getStatistics() {
        return [
            {
                label: '总面积(亩)：',
                value: this._getConfigValue('total_area', '0'),
                type: 'area'
            },
            {
                label: '产油量(斤)：',
                value: this._getConfigValue('oil_yield', '0'),
                type: 'yield'
            },
            {
                label: '出油率：',
                value: this._getConfigValue('oil_rate', '0') + '%',
                type: 'rate'
            }
        ]
    }

    getOwnerInfo() {
        return {
            name: this._getConfigValue('owner_name', '未知'),
            age: this._getConfigValue('owner_age', 0),
            avatar: this._getConfigValue('owner_avatar', '/images/farmer-avatar.jpg'),
            rating: this._getConfigValue('owner_star_rank', 4)
        }
    }

    getStatusTags() {
        const status = this.plotData.status || 'normal'
        const statusMap = {
            normal: { label: '一般户', cssClass: 'status-general' },
            not_alleviated: { label: '未脱贫', cssClass: 'status-unpoverty' },
            alleviated: { label: '已脱贫', cssClass: 'status-poverty' }
        }
        return statusMap[status] ? [statusMap[status]] : []
    }

    getPriceInfo(priceData) {
        if (!priceData) {
            return []
        }
        return [
            {
                label: '今日价格：',
                value: priceData.price || '0',
                unit: '元/斤',
                showArrow: true
            }
        ]
    }

    showHealthIndicators() {
        return true
    }

    showFarmingDynamics() {
        return true
    }

    getHealthIndicators() {
        return [
            { label: '树龄健康度', percentage: 85 },
            { label: '土壤质量', percentage: 75 },
            { label: '生长健康度', percentage: 90 }
        ]
    }

    getExtraData() {
        return {
            currentStage: this._getConfigValue('current_stage', null),
            nextStage: this._getConfigValue('next_stage', null),
            standardFarming: this._getConfigValue('standard_farming', []),
            warningFarming: this._getConfigValue('warning_farming', []),
            services: this._getConfigValue('services', [])
        }
    }
}

export default TeaOilStrategy
