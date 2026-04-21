<template>
  <div class="plot-detail-container">
    <DashboardLayout
      :weather="weather"
      :user="user"
      :project-data="projectData"
      :statistics-data="statisticsData"
      :ranking-data="rankingData"
      :quality-data="qualityData"
      :region-name="regionName"
      :show-back-button="true"
      :page-title="plotData.name || '地块详情'"
      :full-screen-map="true"
      :show-bottom-nav="true"
      @back="handleBackClick"
    >
      <template #center-map>
        <!-- WMTS瓦片地图 -->
        <WMTSTileMap
          ref="wmtsTileMap"
          :region-name="regionName"
          :plot-data="plotData"
          @tile-metrics="handleTileMetrics"
        />
      </template>

      <template #left-panel>
        <!-- 八角地块左侧面板 - 新架构 -->
        <StarAniseLeftPanel
          v-if="plotData.type !== 'factory' && plotData.type !== 'warehouse'"
          :strategy="plotStrategy"
          :plot-name="plotData.name"
          :region-name="regionName"
          :price-data="spicePriceDisplay"
          @show-health-modal="showHealthModal"
        />

        <!-- 工厂左侧面板 - 新架构 -->
        <FactoryLeftPanel
          v-else-if="plotData.type === 'factory'"
          :strategy="plotStrategy"
          :plot-name="plotData.name"
          :region-name="regionName"
          :price-info="factoryPriceInfo"
          :calendar-data="constructionCalendarData"
        />

        <!-- 仓库左侧面板 - 新架构 -->
        <WarehouseLeftPanel
          v-else-if="plotData.type === 'warehouse'"
          :strategy="plotStrategy"
          :region-name="regionName"
          :price-info="warehousePriceInfo"
          :inventory-ratio="inventoryRatioData"
          @show-health-modal="showHealthModal"
        />

        <!-- 加载中状态 -->
        <div v-else-if="isLoading" class="placeholder-panel">
          加载中...
        </div>

        <!-- 其他未知类型 -->
        <div v-else class="placeholder-panel">
          未知地块类型
        </div>
      </template>

      <template #right-panel>
        <!-- 农情动态右侧面板 - 新架构 -->
        <FarmingDynamicsPanel
          v-if="!isLoading && plotData.type !== 'factory' && plotData.type !== 'warehouse'"
          :standard-farming-items="standardFarmingItems"
          :warning-farming-info="warningFarmingInfo"
          :services-data="servicesData"
          @view-farming-detail="openFarmingDetail"
          @farming-item-selected="handleFarmingItemSelected"
        />

        <!-- 工厂右侧面板 - 新架构 -->
        <FactoryRightPanel
          v-else-if="!isLoading && plotData.type === 'factory'"
          :production-data="factoryProductionData"
        />

        <!-- 仓库右侧面板 - 新架构 -->
        <WarehouseRightPanel
          v-else-if="!isLoading && plotData.type === 'warehouse'"
        />

        <!-- 加载中状态 -->
        <div v-else-if="isLoading" class="placeholder-panel">
          加载中...
        </div>

        <!-- 其他未知类型 -->
        <div v-else class="placeholder-panel">
          未知地块类型右侧面板
        </div>
      </template>
    </DashboardLayout>

    <!-- 健康指标详情弹窗 -->
    <div v-if="healthModalVisible" class="health-detail-overlay" @click.self="healthModalVisible = false">
      <div class="health-detail-panel">
        <HealthIndicatorModal
          :visible="healthModalVisible"
          @close="healthModalVisible = false"
        />
      </div>
    </div>

    <!-- 农事详情弹窗 -->
    <FarmingDetailDialog
      :visible="farmingDetailDialogVisible"
      :farming-item="farmingDetailDialogContent"
      @close="closeFarmingDetailDialog"
    />
  </div>
</template>

<script>
import DashboardLayout from '@/components/Dashboard/DashboardLayout.vue';
import WMTSTileMap from '@/components/Map/WMTSTileMap.vue';
import HealthIndicatorModal from '@/components/Dialogs/HealthIndicatorModal.vue';
import FarmingDetailDialog from '@/components/Dialogs/FarmingDetailDialog.vue';
import StarAniseLeftPanel from '@/modules/plot/panels/StarAniseLeftPanel.vue';
import FarmingDynamicsPanel from '@/modules/plot/panels/FarmingDynamicsPanel.vue';
import FactoryLeftPanel from '@/modules/plot/panels/FactoryLeftPanel.vue';
import FactoryRightPanel from '@/modules/plot/panels/FactoryRightPanel.vue';
import WarehouseLeftPanel from '@/modules/plot/panels/WarehouseLeftPanel.vue';
import WarehouseRightPanel from '@/modules/plot/panels/WarehouseRightPanel.vue';
import PlotStrategyFactory from '@/modules/plot/strategies/index.js';
import { RANKING_CONFIG, DEFAULT_PLOT_DATA } from '@/config/farmerConfig';
import apiClient from '@/services/apiClient';

/**
 * 地块详情页 V2 - 新架构实现
 *
 * 使用策略模式和组件化架构
 * 数据加载和转换在父组件完成
 * 面板组件只负责展示
 *
 * @component PlotDetailV2
 */
export default {
    name: 'PlotDetailV2',
    components: {
        DashboardLayout,
        WMTSTileMap,
        HealthIndicatorModal,
        FarmingDetailDialog,
        StarAniseLeftPanel,
        FarmingDynamicsPanel,
        FactoryLeftPanel,
        FactoryRightPanel,
        WarehouseLeftPanel,
        WarehouseRightPanel
    },
    data() {
        return {
            // 常量
            DEFAULT_PLOT_DATA,
            // UI状态
            healthModalVisible: false,
            farmingDetailDialogVisible: false,
            farmingDetailDialogContent: null,
            // API 数据
            apiPlotDetail: null,
            apiStandardFarming: [],
            currentFarmingStageId: null,
            apiWarningFarming: null,
            apiServiceFarming: null,
            apiSpicePrice: null,
            // 地块数据
            regionName: '',
            plotData: {
                id: '',
                name: '',
                area: '',
                type: ''
            },
            // 地图数据
            tileMetrics: null,
            // 加载状态
            isLoading: true,
            loadError: null,
            // 图片资源
            images: {
                serviceIcon1: '/images/service-icon-1.jpg',
                serviceIcon2: '/images/service-icon-2.jpg',
                serviceIcon3: '/images/service-icon-3.jpg',
                farmingIcon1: '/images/farming-icon-1.png',
                farmingWarm: '/images/farming-warm.png',
                userAvatar: '/images/user-avatar.png'
            },
            // 天气数据
            weather: {
                temperature: '26.8°C',
                description: '晴多云转阵雨'
            },
            // 项目数据
            projectData: {
                title: '八角数字农业示范区',
                subtitle: '智慧农业管理平台'
            },
            // 统计数据
            statisticsData: {
                totalArea: 1200,
                totalBlocks: 45,
                totalProduction: 2400
            },
            // 排名数据
            rankingData: RANKING_CONFIG,
            // 质量数据
            qualityData: {
                good: '50.9',
                average: '22.4',
                poor: '26.7'
            }
        };
    },
    computed: {
        /**
         * 策略实例
         * 即使API加载失败也创建策略实例(使用默认值)以保证UI能够渲染
         */
        plotStrategy() {
            const plotType = this.plotData.type || 'star-anise';
            const plotDetail = this.apiPlotDetail || { id: this.plotData.id, name: this.plotData.name };
            const configData = this.farmerConfigData || {};

            return PlotStrategyFactory.create(plotType, plotDetail, configData);
        },

        /**
         * 农户配置数据 - 从 API 返回的 config_data 提取
         */
        farmerConfigData() {
            if (!this.apiPlotDetail || !this.apiPlotDetail.config_data) {
                return null;
            }
            const configData = this.apiPlotDetail.config_data;

            // 如果已经是对象，直接返回
            if (typeof configData === 'object') {
                return configData;
            }

            // 如果是字符串，尝试解析
            if (typeof configData === 'string') {
                try {
                    return JSON.parse(configData);
                } catch (e) {
                    console.error('Failed to parse config_data:', e);
                    return null;
                }
            }

            return null;
        },

        /**
         * 用户信息 - 从登录响应缓存读取
         */
        user() {
            try {
                const raw = localStorage.getItem('user_info');
                if (raw) {
                    const u = JSON.parse(raw);
                    return {
                        name: u.real_name || u.username || '管理员',
                        avatar: u.avatar || this.images.userAvatar
                    };
                }
            } catch (e) { /* ignore */ }
            return { name: '管理员', avatar: this.images.userAvatar };
        },

        /**
         * 八角价格显示 - 从 API 数据提取
         */
        spicePriceDisplay() {
            if (!this.apiSpicePrice) {
                return null;
            }
            return {
                price: this.apiSpicePrice.todayPrice,
                unit: this.apiSpicePrice.skuUnit,
                change: this.apiSpicePrice.dailyPriceChangeAmount
            };
        },

        /**
         * 标准农事项目 - 从 API 数据动态生成
         */
        standardFarmingItems() {
            if (!this.apiStandardFarming || this.apiStandardFarming.length === 0) {
                return [];
            }

            // 首先确定当前农事的索引
            let currentIndex = -1;
            if (this.currentFarmingStageId) {
                currentIndex = this.apiStandardFarming.findIndex(
                    (item) => item.id === this.currentFarmingStageId
                );
            }
            if (currentIndex === -1) {
                currentIndex = 0;
            }

            // 转换为标准格式
            const items = this.apiStandardFarming.map((item, index) => ({
                id: `standard-${item.id}`,
                originalId: item.id,
                text: item.name,
                icon: this.images.farmingIcon1,
                isGold: false,
                isCurrent: false,
                isNext: false,
                details: {
                    title: item.name,
                    startDate: item.start_date,
                    endDate: item.end_date,
                    description: `处方:${item.prescription || ''}`,
                    requirement: item.specification || '施工规范详见说明',
                    status: this.getTaskStatus(index, this.apiStandardFarming.length)
                }
            }));

            const totalItems = items.length;

            // 进行环形排列，使当前农事在中间位置
            const displayCount = totalItems;
            const middlePosition = Math.floor(displayCount / 2);
            const reorderedItems = [];

            // 从当前农事往前回绕 middlePosition 个位置开始
            for (let i = 0; i < displayCount; i++) {
                const index = (currentIndex - middlePosition + i + totalItems * 100) % totalItems;
                const item = items[index];
                reorderedItems.push(item);

                // 标记当前农事和下一个农事
                if (i === middlePosition) {
                    item.isCurrent = true;
                }
                if (i === middlePosition + 1) {
                    item.isNext = true;
                }

                // 当前农事及其上面的所有农事使用 farming-warm.png（已执行）
                // 下面的农事使用 farming-icon-1.png（未执行）
                if (i <= middlePosition) {
                    item.icon = this.images.farmingWarm;
                }
            }

            return reorderedItems;
        },

        /**
         * 预警农事信息 - 从 API 数据提取
         */
        warningFarmingInfo() {
            if (!this.apiWarningFarming) {
                return null;
            }
            return {
                name: this.apiWarningFarming.name,
                triggerMonth: this.apiWarningFarming.trigger_month,
                level: this.apiWarningFarming.level,
                prescription: this.apiWarningFarming.prescription,
                processingDays: this.apiWarningFarming.processing_days
            };
        },

        /**
         * 三农服务项目 - 从 API 数据动态生成
         */
        servicesData() {
            if (!this.apiServiceFarming) {
                return [];
            }
            const iconMap = [
                this.images.serviceIcon1,
                this.images.serviceIcon2,
                this.images.serviceIcon3
            ];

            const services = [];
            if (this.apiServiceFarming.farm_tech) {
                services.push({
                    icon: iconMap[0],
                    label: '农技',
                    provider: this.apiServiceFarming.farm_tech
                });
            }
            if (this.apiServiceFarming.farm_material) {
                services.push({
                    icon: iconMap[1],
                    label: '农资',
                    provider: this.apiServiceFarming.farm_material
                });
            }
            if (this.apiServiceFarming.farm_invest) {
                services.push({
                    icon: iconMap[2],
                    label: '投融',
                    provider: this.apiServiceFarming.farm_invest
                });
            }
            return services;
        },

        /**
         * 工厂价格信息 - 从 config_data 提取
         */
        factoryPriceInfo() {
            const configData = this.farmerConfigData;
            if (!configData) {
                return {
                    freshFruitPrice: '0',
                    processingPrice: '0'
                };
            }
            return {
                freshFruitPrice: configData.fresh_fruit_price || '0',
                processingPrice: configData.processing_price || '0'
            };
        },

        /**
         * 仓库价格信息 - 从 config_data 提取
         */
        warehousePriceInfo() {
            const configData = this.farmerConfigData;
            if (!configData) {
                return {
                    label: '存储价格：',
                    value: '0',
                    unit: '元/吨/天'
                };
            }
            return {
                label: '存储价格：',
                value: configData.storage_price || '0',
                unit: '元/吨/天'
            };
        },

        /**
         * 库存占比数据 - 从 strategy 提取
         */
        inventoryRatioData() {
            return this.plotStrategy.getInventoryRatio();
        },

        /**
         * 施工计划日历数据 - 从 config_data.work_schedule 提取
         */
        constructionCalendarData() {
            if (this.plotData.type !== 'factory') return null;
            // 优先从 work_schedule 提取（year/month 索引格式）
            const configData = this.farmerConfigData;
            if (configData && configData.work_schedule) {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                let yearData = configData.work_schedule[currentYear];
                if (!yearData) {
                    const years = Object.keys(configData.work_schedule).map(Number).filter(Boolean).sort((a, b) => b - a);
                    yearData = years.length ? configData.work_schedule[years[0]] : null;
                }
                if (yearData) {
                    const monthStr = String(currentMonth).padStart(2, '0');
                    const monthData = yearData[currentMonth] || yearData[monthStr];
                    if (monthData && Array.isArray(monthData)) {
                        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                        return {
                            monthDisplay: `${currentMonth}月`,
                            daysInMonth: Array.from({ length: daysInMonth }, (_, i) => i + 1),
                            scheduledDays: monthData
                                .map((v, i) => (v === 1 ? i + 1 : null))
                                .filter((d) => d !== null && d <= daysInMonth)
                        };
                    }
                }
            }
            // 降级：用 strategy 的 getConstructionCalendar()（读 scheduled_days，无数据时返回空格子）
            if (this.plotStrategy && typeof this.plotStrategy.getConstructionCalendar === 'function') {
                return this.plotStrategy.getConstructionCalendar();
            }
            return null;
        },

        /**
         * 工厂生产数据 - 从 strategy 提取
         */
        factoryProductionData() {
            return this.plotStrategy.getExtraData();
        }
    },
    mounted() {
        this.loadPlotData();
    },
    methods: {
        /**
         * 获取任务状态 - 根据任务索引判断
         */
        /** 将新 API property_type/property_category 映射到前端类型字符串 */
        _mapPropertyType(propertyType, propertyCategory) {
            // 优先用 property_category 区分林/厂/仓
            if (propertyCategory === 'factory') return 'factory';
            if (propertyCategory === 'warehouse') return 'warehouse';
            // forest 子类型区分
            if (propertyType === 'chayou_base') return 'tea-oil';
            return 'star-anise'; // bajiao_base 及其他林地
        },

        getTaskStatus(index, totalItems) {
            if (index < totalItems / 2) {
                return 'completed';
            } else if (index === Math.floor(totalItems / 2)) {
                return 'current';
            } else {
                return 'pending';
            }
        },

        /**
         * 加载地块数据
         */
        async loadPlotData() {
            try {
                this.isLoading = true;
                this.loadError = null;

                // 从路由参数获取区域名称和地块数据
                this.regionName = this.$route.query.region || '右江区';

                // 从路由获取地块名称（入口只传名称，ID 通过 plot/list 接口获取）
                const encodedPlotId = this.$route.params.plotId;
                const plotName = this.$route.query.plotName
                    || (encodedPlotId ? decodeURIComponent(encodedPlotId) : null)
                    || '千户十亩-大楞乡基地';

                // Step 1: 用 plot/list 找到地块记录，获取真实数字 ID
                const tileRecord = await this.fetchPlotTileRecord(plotName);
                const plotId = tileRecord?.id;
                if (!plotId) {
                    throw new Error(`未找到地块：${plotName}`);
                }

                // 从 list 记录取 area / type，不再依赖路由参数
                const area = tileRecord.area != null ? String(tileRecord.area) : String(DEFAULT_PLOT_DATA.area);
                const type = this._mapPropertyType(tileRecord.property_type, tileRecord.property_category);

                // 基础地块数据（Step 2/3 在下方：loadPlotDetail → getTileInfo 由 WMTSTileMap 触发）
                this.plotData = {
                    id: plotId,
                    name: plotName,
                    district: this.regionName,
                    area,
                    type
                };

                // Step 2: 加载完整地块详情（含 config_data）
                // Step 3: WMTSTileMap 挂载后会自动触发 getTileInfo(plotId)
                if (type === 'factory' || type === 'warehouse') {
                    await this.loadPlotDetail(plotId);
                } else {
                    await Promise.all([
                        this.loadPlotDetail(plotId),
                        this.loadFarmingData()
                    ]);
                    this.loadSpicePrice();
                }

                this.isLoading = false;
            } catch (error) {
                console.error('Failed to load plot data:', error);
                this.loadError = error.message;
                this.isLoading = false;
            }
        },

        /**
         * 加载地块详情（包含农户信息）
         */
        async loadPlotDetail(plotId) {
            try {
                const result = await apiClient.getPlotDetail(plotId);
                if (result && result.code === 0 && result.data) {
                    this.apiPlotDetail = result.data;
                    // 提取当前农事阶段ID
                    if (result.data.current_farming_stage_id) {
                        this.currentFarmingStageId = result.data.current_farming_stage_id;
                    }
                }
            } catch (error) {
                console.warn('Failed to load plot detail:', error);
            }
        },

        /**
         * 加载农事数据
         */
        async loadFarmingData() {
            try {
                const [standardResult, warningResult, serviceResult] = await Promise.all([
                    apiClient.getFarmingList('standard'),
                    apiClient.getFarmingList('warning'),
                    apiClient.getFarmingList('service')
                ]);

                // 处理标准农事
                if (standardResult && standardResult.code === 0 && standardResult.data && standardResult.data.list) {
                    this.apiStandardFarming = standardResult.data.list;
                }

                // 处理预警农事
                if (warningResult && warningResult.code === 0 && warningResult.data && warningResult.data.list) {
                    this.apiWarningFarming = warningResult.data.list[0] || null;
                }

                // 处理三农服务
                if (serviceResult && serviceResult.code === 0 && serviceResult.data && serviceResult.data.list) {
                    this.apiServiceFarming = serviceResult.data.list[0] || null;
                }
            } catch (error) {
                console.warn('Failed to load farming data:', error);
            }
        },

        /**
         * 加载八角价格
         */
        async loadSpicePrice() {
            try {
                const result = await apiClient.getSpicePriceBajiao();
                if (result && result.code === 0 && result.data) {
                    this.apiSpicePrice = result.data;
                }
            } catch (error) {
                console.warn('Failed to load spice price:', error);
            }
        },

        /**
         * 从后端获取plot tile记录
         */
        async fetchPlotTileRecord(plotName) {
            try {
                const result = await apiClient.getPlotsList({ keyword: plotName });
                if (result && result.code === 0) {
                    const list = Array.isArray(result.data) ? result.data : (result.data?.list || []);
                    const record = list.find((item) => item.name === plotName);
                    return record || null;
                }
            } catch (error) {
                console.warn('Failed to fetch plot tile record:', error);
            }
            return null;
        },

        /**
         * 处理瓦片指标
         */
        handleTileMetrics(metrics) {
            this.tileMetrics = metrics || null;
        },

        /**
         * 返回上一级
         */
        handleBackClick() {
            const regionName = this.$route.query.region || '右江区';
            this.$router.push({
                path: `/detail/${encodeURIComponent(regionName)}`
            });
        },

        /**
         * 显示健康指标弹窗
         */
        showHealthModal() {
            this.healthModalVisible = true;
        },

        /**
         * 打开农事详情弹窗
         */
        openFarmingDetail(section) {
            // TODO: 根据section获取对应的农事详情
            console.log('Open farming detail:', section);
            this.farmingDetailDialogVisible = true;
        },

        /**
         * 关闭农事详情弹窗
         */
        closeFarmingDetailDialog() {
            this.farmingDetailDialogVisible = false;
            this.farmingDetailDialogContent = null;
        },

        /**
         * 处理农事项目选中
         */
        handleFarmingItemSelected(item) {
            console.log('Farming item selected:', item);
            // TODO: 更新地图显示
        }
    }
};
</script>

<style lang="less" scoped>
.plot-detail-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.health-detail-overlay {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.health-detail-panel {
    position: relative;
}

.placeholder-panel {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 375px;
    height: 734px;
    font-size: 18px;
    color: #c69c6d;
    background: #041f1d;
}
</style>
