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
                district: '',
                area: '',
                type: '',
                layer: ''
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
         * 用户信息
         */
        user() {
            return {
                name: '管理员',
                avatar: this.images.userAvatar
            };
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
                unit: this.apiSpicePrice.skuUnit
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
            const configData = this.farmerConfigData;
            if (!configData || !configData.work_schedule) {
                return null;
            }

            // 获取当前日期
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 月份从 1-12

            // 获取本月的工作计划
            const yearData = configData.work_schedule[currentYear];
            if (!yearData) {
                return null;
            }

            const monthStr = String(currentMonth).padStart(2, '0');
            const monthData = yearData[currentMonth] || yearData[monthStr];

            if (!monthData || !Array.isArray(monthData)) {
                return null;
            }

            // 计算本月天数
            const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

            // 提取有工作安排的日期（值为 1 表示有工作）
            const scheduledDays = monthData
                .map((value, index) => (value === 1 ? index + 1 : null))
                .filter((day) => day !== null && day <= daysInMonth);

            return {
                monthDisplay: `${currentMonth}月`,
                daysInMonth: Array.from({ length: daysInMonth }, (_, i) => i + 1),
                scheduledDays
            };
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

                // 解码plotId参数（处理中文字符）
                const encodedPlotId = this.$route.params.plotId;
                const decodedPlotId = encodedPlotId ? decodeURIComponent(encodedPlotId) : null;

                // 从query参数获取地块数据
                const plotName = this.$route.query.plotName || decodedPlotId || '千户十亩-大楞乡基地';
                const area = this.$route.query.area || String(DEFAULT_PLOT_DATA.area);
                const output = this.$route.query.output || String(DEFAULT_PLOT_DATA.output);
                const type = this.$route.query.type || 'star-anise';

                // 从后端获取plot tiles列表，根据plotName找到真实的plot_id和layer_name
                const tileRecord = await this.fetchPlotTileRecord(plotName);

                // plotId优先级：后端返回的ID > 路由参数中解码后的ID
                let plotId = tileRecord?.plot_id || decodedPlotId;
                if (!plotId) {
                    console.warn('无法获取有效的plotId，使用默认值1000');
                    plotId = '1000';
                }

                // 基础地块数据
                const outputNum = parseFloat(output) || DEFAULT_PLOT_DATA.output;
                const areaNum = parseFloat(area) || DEFAULT_PLOT_DATA.area;
                this.plotData = {
                    id: plotId,
                    name: plotName,
                    district: this.regionName,
                    area,
                    yield: Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / DEFAULT_PLOT_DATA.conversionDivisor) || DEFAULT_PLOT_DATA.yield,
                    unitYield: output ? Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / areaNum) : DEFAULT_PLOT_DATA.unitYield,
                    type,
                    layer: tileRecord?.layer_name
                };

                // 八角地块：优先加载农事数据
                if (type !== 'factory' && type !== 'warehouse') {
                    await Promise.all([
                        this.loadPlotDetail(plotId),
                        this.loadFarmingData()
                    ]);
                    // 价格数据后台加载
                    this.loadSpicePrice();
                } else {
                    // 工厂/仓库：只加载基本信息
                    await this.loadPlotDetail(plotId);
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
                const result = await apiClient.getSpicePrice(1, 1);
                if (result && result.code === 0 && result.data && result.data.list) {
                    this.apiSpicePrice = result.data.list[0] || null;
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
                const result = await apiClient.getPlotsList();
                if (result && result.code === 0 && Array.isArray(result.data)) {
                    const record = result.data.find((item) => item.plot_name === plotName);
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
