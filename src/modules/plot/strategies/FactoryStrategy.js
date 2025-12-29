import PlotStrategy from './PlotStrategy'

/**
 * 工厂策略
 * @class FactoryStrategy
 */
class FactoryStrategy extends PlotStrategy {
    getType() {
        return 'factory'
    }

    getLeftPanelComponent() {
        return 'FactoryLeftPanel'
    }

    getRightPanelComponent() {
        return 'FactoryRightPanel';
    }

    getStatistics() {
        return [
            {
                label: '总面积(亩)：',
                value: this._getConfigValue('total_area', '0'),
                type: 'area'
            },
            {
                label: '年度加工产能(吨)：',
                value: this._getConfigValue('annual_capacity', '0'),
                type: 'capacity'
            },
            {
                label: '今年累计产量(吨)：',
                value: this._getConfigValue('year_to_date_production', '0'),
                type: 'production'
            }
        ]
    }

    getOwnerInfo() {
        return {
            name: this._getConfigValue('owner_name', '未知'),
            factoryCount: this._getConfigValue('owner_factory_num', 0),
            avatar: this._getConfigValue('owner_avatar', '/images/farmer-avatar.jpg'),
            rating: this._getConfigValue('owner_star_rank', 5)
        }
    }

    getStatusTags() {
        // 工厂状态标签：机械加工、阳光晾晒、机械+阳光晾晒
        const status = this.plotData?.status || this._getConfigValue('status')
        if (!status) {
            return []
        }

        const statusMap = {
            mechanical: { label: '机械加工', cssClass: 'status-general' },
            sunlight: { label: '阳光晾晒', cssClass: 'status-unpoverty' },
            mixed: { label: '机械+阳光晾晒', cssClass: 'status-poverty' }
        }

        const tagInfo = statusMap[status]
        return tagInfo ? [tagInfo] : []
    }

    getPriceInfo(priceData) {
        return [
            {
                label: '鲜果收购价：',
                value: priceData?.freshFruit || this._getConfigValue('fresh_fruit_price', '0'),
                unit: '元/斤',
                showArrow: false
            },
            {
                label: '加工价格：',
                value: priceData?.processing || this._getConfigValue('processing_price', '0'),
                unit: '元/吨',
                showArrow: false
            }
        ]
    }

    showHealthIndicators() {
        return false
    }

    showFarmingDynamics() {
        return false
    }

    getConstructionCalendar() {
        const currentMonth = new Date().getMonth() + 1
        const daysInMonth = new Date(new Date().getFullYear(), currentMonth, 0).getDate()
        const scheduledDays = this._getConfigValue('scheduled_days', [])

        return {
            monthDisplay: `${currentMonth}月`,
            daysInMonth: Array.from({ length: daysInMonth }, (_, i) => i + 1),
            scheduledDays: scheduledDays
        }
    }

    getExtraData() {
        return {
            // 当前批次信息
            currentBatch: {
                batchNumber: this._getConfigValue('current_batch_number', 'DH-2025-001'),
                sourceLocation: this._getConfigValue('source_location', '右江区'),
                startTime: this._getConfigValue('start_time', '2025年11月2日 08:30')
            },
            // 批次进度
            batchProgress: {
                currentStage: this._getConfigValue('current_stage', '加热中'),
                percentage: this._getConfigValue('progress_percentage', 45)
            },
            // 历史产量趋势 (最近7天)
            productionTrend: this._getConfigValue('production_trend', [
                { day: '周一', percentage: 42, value: 8.4 },
                { day: '周二', percentage: 45, value: 9.0 },
                { day: '周三', percentage: 43, value: 8.6 },
                { day: '周四', percentage: 48, value: 9.6 },
                { day: '周五', percentage: 50, value: 10.0 },
                { day: '周六', percentage: 46, value: 9.2 },
                { day: '周日', percentage: 44, value: 8.8 }
            ]),
            // 预警与任务
            alerts: {
                temperature: this._getConfigValue('temperature_status', '正常'),
                current: this._getConfigValue('current_status', '正常'),
                nextSchedule: this._getConfigValue('next_schedule', '2025年11月2日 14:00')
            }
        }
    }
}

export default FactoryStrategy
