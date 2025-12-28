import PlotStrategy from './PlotStrategy'

/**
 * 仓库策略
 * @class WarehouseStrategy
 */
class WarehouseStrategy extends PlotStrategy {
    getType() {
        return 'warehouse'
    }

    getLeftPanelComponent() {
        return 'WarehouseLeftPanel'
    }

    getRightPanelComponent() {
        return 'WarehouseInventoryPanel'
    }

    getStatistics() {
        return [
            {
                label: '总面积(平方米)：',
                value: this._getConfigValue('warehouse_area', '0'),
                type: 'area'
            },
            {
                label: '总存储量(吨)：',
                value: this._getConfigValue('total_storage', '0'),
                type: 'storage'
            }
        ]
    }

    getOwnerInfo() {
        return {
            name: this._getConfigValue('owner_name', '未知'),
            warehouseCount: this._getConfigValue('manager_warehouse_num', 0),
            avatar: this._getConfigValue('owner_avatar', '/images/warehouse-manager-avatar.jpg'),
            rating: this._getConfigValue('owner_star_rank', 4)
        }
    }

    getStatusTags() {
        // 仓库通常不显示状态标签
        return []
    }

    getPriceInfo(priceData) { // eslint-disable-line no-unused-vars
        return {
            label: '存储价格：',
            value: this._getConfigValue('storage_price', '0'),
            unit: '元/吨/天'
        }
    }

    showHealthIndicators() {
        return false
    }

    showFarmingDynamics() {
        return false
    }

    getInventoryRatio() {
        // 存储量占比 = 当前库存 / 总存储量
        const totalStorage = parseFloat(this._getConfigValue('total_storage', 0))
        const currentInventory = parseFloat(this._getConfigValue('current_inventory', 0))
        const storagePercentage = totalStorage > 0 ? Math.round((currentInventory / totalStorage) * 100) : 78

        // 容积占比 = 使用体积 / 总体积
        const totalVolume = parseFloat(this._getConfigValue('total_volume', 0))
        const usedVolume = parseFloat(this._getConfigValue('used_volume', 0))
        const volumePercentage = totalVolume > 0 ? Math.round((usedVolume / totalVolume) * 100) : 65

        return [
            { label: '存储量', percentage: storagePercentage },
            { label: '容积占比', percentage: volumePercentage }
        ]
    }

    getExtraData() {
        return {
            inventoryCategories: this._getConfigValue('inventory_categories', []),
            storageConditions: this._getConfigValue('storage_conditions', []),
            outboundOrders: this._getConfigValue('outbound_orders', []),
            inventoryTrend: this._getConfigValue('inventory_trend', [])
        }
    }
}

export default WarehouseStrategy
