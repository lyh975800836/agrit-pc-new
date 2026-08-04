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
      :breadcrumb-items="breadcrumbItems"
      @back="handleBackClick"
      @breadcrumb-click="handleBreadcrumbClick"
    >
      <template #center-map>
        <!-- WMTS瓦片地图 -->
        <WMTSTileMap
          v-if="mapReady"
          ref="wmtsTileMap"
          :region-name="regionName"
          :plot-data="plotData"
          :base-tile-info="baseMapTileInfo"
          :analysis-tile="analysisTileInfo"
          :tree-tiles="analysisTreeTiles"
          :source-tile-size="analysisSourceTileSize"
          @tile-metrics="handleTileMetrics"
          @tree-click="handleTreeClick"
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
          :analysis-summary="apiAnalysisSummary"
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

    <!-- 单树详情浮层 -->
    <div v-if="showTreeDetail" class="tree-detail-overlay" @click.self="showTreeDetail = false">
      <div class="tree-detail-panel">
        <button class="tree-detail-close" @click="showTreeDetail = false">✕</button>
        <h4 class="tree-detail-title">树冠详情</h4>
        <div v-if="!selectedTreeDetail" class="tree-detail-loading">暂无数据</div>
        <template v-else>
        <div class="tree-detail-row"><span class="tree-detail-label">树 ID</span><span>{{ selectedTreeDetail.tree_id }}</span></div>
        <div class="tree-detail-row">
          <span class="tree-detail-label">经纬度</span>
          <span>{{ Number(selectedTreeDetail.longitude).toFixed(6) }}, {{ Number(selectedTreeDetail.latitude).toFixed(6) }}</span>
        </div>
        <div class="tree-detail-row">
          <span class="tree-detail-label">状态</span>
          <span v-if="!selectedTreeDetail.pest" class="tree-tag tree-tag--healthy">健康</span>
          <span v-else-if="!selectedTreeDetail.has_detection_geometry" class="tree-tag tree-tag--warn">病虫害（缺检测几何）</span>
          <span v-else class="tree-tag tree-tag--pest">病虫害</span>
        </div>
        <div v-if="selectedTreeDetail.yield_value" class="tree-detail-row">
          <span class="tree-detail-label">产量</span><span>{{ Number(selectedTreeDetail.yield_value).toFixed(2) }} kg</span>
        </div>
        <div v-if="selectedTreeDetail.tree_area" class="tree-detail-row">
          <span class="tree-detail-label">冠层面积</span><span>{{ Number(selectedTreeDetail.tree_area).toFixed(2) }} m²</span>
        </div>
        <div v-if="selectedTreeDetail.detected_at" class="tree-detail-row">
          <span class="tree-detail-label">检测时间</span><span>{{ formatDetectedAt(selectedTreeDetail.detected_at) }}</span>
        </div>
        <template v-if="selectedTreeDetail.detection_geometries && selectedTreeDetail.detection_geometries.length">
          <div class="tree-detail-divider"></div>
          <div v-for="(dg, i) in selectedTreeDetail.detection_geometries" :key="i" class="tree-detection-item">
            <div class="tree-detail-row"><span class="tree-detail-label">类型</span><span>{{ dg.detection_type }}</span></div>
            <div v-if="dg.confidence != null" class="tree-detail-row">
              <span class="tree-detail-label">置信度</span><span>{{ (dg.confidence * 100).toFixed(1) }}%</span>
            </div>
            <div v-if="dg.anomaly_reason" class="tree-detail-row">
              <span class="tree-detail-label">异常原因</span><span>{{ dg.anomaly_reason }}</span>
            </div>
          </div>
        </template>
        </template>
      </div>
    </div>
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
import {
    buildPlotData,
    fetchBaseTileInfo,
    fetchLatestWudaAnalysis,
    fetchWudaSummaryTile,
    fetchWudaTreeOverlay,
    getPlotListConfigFallback as buildPlotListConfigFallback,
    getPlotType,
    isUsableTileInfo,
    resolvePlotRecord
} from '@/modules/plot/services/plotDetailDataService';

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
            apiPlotListRecord: null,
            apiStandardFarming: [],
            currentFarmingStageId: null,
            apiWarningFarming: null,
            apiServiceFarming: null,
            apiSpicePrice: null,
            // 分析批次数据
            apiAnalysisSummary: null,
            analysisMapTile: null,
            analysisTreeTiles: [],
            analysisSourceTileSize: 512,
            baseMapTileInfo: null,
            mapReady: false,
            // 单树详情
            selectedTreeDetail: null,
            showTreeDetail: false,
            treeDetailLoading: false,
            currentAnalysisId: null,
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
            const plotDetail = {
                ...this.plotData,
                ...(this.apiPlotDetail || {})
            };
            const configData = this.farmerConfigData || {};

            return PlotStrategyFactory.create(plotType, plotDetail, configData);
        },

        /**
         * 农户配置数据 - 从 API 返回的 config_data 提取
         */
        farmerConfigData() {
            const fallbackConfig = buildPlotListConfigFallback(this.apiPlotListRecord, this.plotData);
            const configData = this.apiPlotDetail?.config_data;

            // 如果已经是对象，直接返回
            if (typeof configData === 'object') {
                return { ...fallbackConfig, ...configData };
            }

            // 如果是字符串，尝试解析
            if (typeof configData === 'string') {
                try {
                    return { ...fallbackConfig, ...JSON.parse(configData) };
                } catch (e) {
                    console.error('Failed to parse config_data:', e);
                }
            }

            return fallbackConfig;
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
        },

        /**
         * 批次专属底图信息 - 传给 WMTSTileMap
         */
        analysisTileInfo() {
            return this.analysisMapTile;
        },
        cityDashboardRoute() {
            const cityName = this.$route.query.cityName;
            const cityAdcode = this.$route.query.cityAdcode;

            if (!cityName || !cityAdcode) {
                return { name: 'Dashboard' };
            }

            return {
                name: 'Dashboard',
                query: {
                    level: 'city',
                    cityName,
                    cityAdcode: String(cityAdcode)
                }
            };
        },
        detailMapRoute() {
            const regionName = this.$route.query.region || this.regionName || '右江区';
            return {
                name: 'DetailMap',
                params: {
                    region: regionName
                },
                query: {
                    cityName: this.$route.query.cityName || '百色市',
                    cityAdcode: this.$route.query.cityAdcode || '451000',
                    regionAdcode: this.$route.query.regionAdcode || ''
                }
            };
        },
        breadcrumbItems() {
            const cityName = this.$route.query.cityName || '百色市';
            const plotName = this.$route.query.plotName || this.plotData.name || '地块详情';

            return [
                { name: '广西', route: { name: 'Dashboard' } },
                { name: cityName.replace(/市$/, ''), route: this.cityDashboardRoute },
                { name: this.regionName, route: this.detailMapRoute },
                { name: plotName, path: this.$route.fullPath, current: true }
            ];
        }
    },
    mounted() {
        this.loadPlotData();
    },
    watch: {
        '$route.fullPath'(newPath, oldPath) {
            if (newPath !== oldPath && this.$route.name === 'PlotDetail') {
                this.loadPlotData();
            }
        }
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
                this.apiPlotDetail = null;
                this.apiPlotListRecord = null;
                this.apiAnalysisSummary = null;
                this.analysisMapTile = null;
                this.analysisTreeTiles = [];
                this.analysisSourceTileSize = 512;
                this.baseMapTileInfo = null;
                this.mapReady = false;
                this.currentAnalysisId = null;
                this._mapTileToken = null;

                // 从路由参数获取区域名称和地块数据
                this.regionName = this.$route.query.region || '右江区';

                // 从路由获取地块名称（入口只传名称，ID 通过 plot/list 接口获取）
                const encodedPlotId = this.$route.params.plotId;
                const plotName = this.$route.query.plotName
                    || (encodedPlotId ? decodeURIComponent(encodedPlotId) : null)
                    || '千户十亩-大楞乡基地';
                this.debugPlotDetail('开始解析地块详情路由', {
                    plotName,
                    region: this.regionName,
                    cityName: this.$route.query.cityName,
                    cityAdcode: this.$route.query.cityAdcode,
                    regionAdcode: this.$route.query.regionAdcode,
                    routeType: this.$route.query.type
                });

                // Step 1: 用 plot/list 找到地块记录，获取真实数字 ID
                const tileRecord = await resolvePlotRecord({
                    plotName,
                    regionName: this.regionName,
                    cityAdcode: this.$route.query.cityAdcode,
                    regionAdcode: this.$route.query.regionAdcode,
                    debug: this.debugPlotDetail
                });
                const plotId = tileRecord?.id;
                this.apiPlotListRecord = tileRecord;
                this.debugPlotDetail('地块记录解析完成', {
                    found: Boolean(tileRecord),
                    plotId: plotId || null,
                    matchedName: tileRecord?.name || null,
                    hasLocationInfo: Boolean(tileRecord?.location_info),
                    propertyType: tileRecord?.property_type,
                    propertyCategory: tileRecord?.property_category
                });

                // 从 list 记录取 area / type，不再依赖路由参数
                const type = getPlotType(tileRecord, this.$route.query.type);

                // 基础地块数据（Step 2/3 在下方：loadPlotDetail → getTileInfo 由 WMTSTileMap 触发）
                this.plotData = buildPlotData(tileRecord, {
                    plotName,
                    regionName: this.regionName,
                    defaultArea: DEFAULT_PLOT_DATA.area,
                    routeType: this.$route.query.type
                });

                if (plotId) {
                    this.prepareMapTiles(plotId, type).catch(error => {
                        this.debugPlotDetail('地图瓦片准备失败，业务面板继续展示', {
                            plotId,
                            error: error.message
                        });
                    });
                }

                // Step 2: 加载完整地块详情（含 config_data）
                if (!plotId) {
                    this.debugPlotDetail('未匹配到真实 plot_id，进入 URL 基础信息兜底展示', {
                        plotName,
                        region: this.regionName,
                        type
                    });
                    await this.loadFallbackSideData(type);
                }
                else if (type === 'factory' || type === 'warehouse') {
                    await this.loadPlotDetail(plotId);
                } else {
                    await Promise.all([
                        this.loadPlotDetail(plotId),
                        this.loadFarmingData()
                    ]);
                    this.loadSpicePrice();
                }

                this.isLoading = false;
                this.debugPlotDetail('详情主数据加载完成', {
                    plotId: plotId || null,
                    type,
                    mapReady: this.mapReady,
                    hasPlotDetail: Boolean(this.apiPlotDetail),
                    standardFarmingCount: this.apiStandardFarming.length,
                    hasWarningFarming: Boolean(this.apiWarningFarming),
                    hasServiceFarming: Boolean(this.apiServiceFarming)
                });
            } catch (error) {
                console.error('Failed to load plot data:', error);
                this.loadError = error.message;
                this.isLoading = false;
            }
        },

        async prepareMapTiles(plotId, type) {
            const normalizedPlotId = String(plotId);
            const mapTileToken = Symbol('map-tile');
            this._mapTileToken = mapTileToken;

            const baseTileInfo = await fetchBaseTileInfo(normalizedPlotId, this.debugPlotDetail);
            if (!this.isCurrentMapTileLoad(mapTileToken, normalizedPlotId)) return;

            const baseTileUsable = isUsableTileInfo(baseTileInfo);
            const isForestPlot = type !== 'factory' && type !== 'warehouse';
            if (!isForestPlot) {
                this.baseMapTileInfo = baseTileInfo;
                this.mapReady = true;
                return;
            }

            if (baseTileUsable) {
                this.baseMapTileInfo = baseTileInfo;
                this.mapReady = true;
                this.loadAnalysisOverlayAfterBaseReady(normalizedPlotId, mapTileToken);
                return;
            }

            const analysisSource = await this.resolveAnalysisSource(normalizedPlotId);
            if (!this.isCurrentMapTileLoad(mapTileToken, normalizedPlotId)) return;

            if (analysisSource?.analysisTile) {
                this.baseMapTileInfo = null;
                this.useAnalysisBaseTile(
                    analysisSource.analysisTile,
                    normalizedPlotId,
                    analysisSource.analysisId,
                    'base-tile-empty'
                );
                this.mapReady = true;
                this.loadAnalysisTreeOverlay({
                    plotId: normalizedPlotId,
                    analysisId: analysisSource.analysisId,
                    analysisTile: analysisSource.analysisTile,
                    mapTileToken
                });
                return;
            }

            this.baseMapTileInfo = baseTileInfo;
            this.mapReady = true;
        },

        async loadAnalysisOverlayAfterBaseReady(plotId, mapTileToken) {
            const analysisSource = await this.resolveAnalysisSource(plotId);
            if (!this.isCurrentMapTileLoad(mapTileToken, plotId)) return;
            if (analysisSource?.analysisTile) {
                this.loadAnalysisTreeOverlay({
                    plotId,
                    analysisId: analysisSource.analysisId,
                    analysisTile: analysisSource.analysisTile,
                    mapTileToken,
                    switchBaseTileAfterLoaded: true
                });
            }
        },

        async resolveAnalysisSource(plotId) {
            try {
                const latestBatch = await fetchLatestWudaAnalysis(plotId);
                if (!latestBatch) return null;
                this.currentAnalysisId = latestBatch.id;

                const { summary, analysisTile } = await fetchWudaSummaryTile(
                    plotId,
                    latestBatch.id,
                    this.debugPlotDetail
                );
                this.apiAnalysisSummary = summary;
                if (!analysisTile) return null;

                return {
                    analysisId: latestBatch.id,
                    analysisTile
                };
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn('Failed to resolve analysis tile:', error);
                return null;
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
                    this.debugPlotDetail('plot/detail 加载完成', {
                        plotId,
                        hasConfigData: Boolean(result.data.config_data),
                        currentFarmingStageId: this.currentFarmingStageId
                    });
                } else {
                    this.debugPlotDetail('plot/detail 无有效数据，使用 plot/list 兜底', {
                        plotId,
                        code: result?.code
                    });
                }
            } catch (error) {
                console.warn('Failed to load plot detail:', error);
                this.debugPlotDetail('plot/detail 加载失败，使用 plot/list 兜底', {
                    plotId,
                    error: error.message
                });
            }
        },

        async loadFallbackSideData(type) {
            if (type === 'factory' || type === 'warehouse') {
                return;
            }

            await this.loadFarmingData();
            this.loadSpicePrice();
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
                this.debugPlotDetail('农事数据加载完成', {
                    standardCount: this.apiStandardFarming.length,
                    warningCount: warningResult?.data?.list?.length || 0,
                    serviceCount: serviceResult?.data?.list?.length || 0
                });
            } catch (error) {
                console.warn('Failed to load farming data:', error);
                this.debugPlotDetail('农事数据加载失败，右侧面板使用空列表兜底', {
                    error: error.message
                });
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

        debugPlotDetail(message, payload = {}) {
            if (process.env.NODE_ENV === 'production') {
                return;
            }
            // eslint-disable-next-line no-console
            console.info(`[PlotDetailV2] ${ message }`, payload);
        },

        useAnalysisBaseTile(analysisTile, plotId, analysisId, reason, options = {}) {
            const { resetTreeOverlay = true } = options;
            this.analysisMapTile = analysisTile;
            if (resetTreeOverlay) {
                this.analysisTreeTiles = [];
                this.analysisSourceTileSize = 512;
            }
            this.debugPlotDetail('analysis_tile 已接入底图', {
                plotId,
                analysisId,
                reason,
                tileDir: analysisTile.tile_dir,
                layerName: analysisTile.layer_name,
                maxZoomLevel: analysisTile.max_zoom_level,
                maxTileX: analysisTile.max_tile_x,
                maxTileY: analysisTile.max_tile_y,
                tilePathPrefix: analysisTile.tile_path_prefix || ''
            });
        },

        async loadAnalysisTreeOverlay({
            plotId,
            analysisId,
            analysisTile,
            mapTileToken,
            switchBaseTileAfterLoaded = false
        }) {
            try {
                const treeOverlay = await fetchWudaTreeOverlay({
                    plotId,
                    analysisId,
                    analysisTile
                });
                if (!this.isCurrentMapTileLoad(mapTileToken, plotId)) return false;

                if (treeOverlay.tiles.length) {
                    this.analysisTreeTiles = treeOverlay.tiles;
                    this.analysisSourceTileSize = treeOverlay.sourceTileSize;
                    this.debugPlotDetail('树冠瓦片数据加载完成', {
                        plotId,
                        analysisId,
                        tileCount: treeOverlay.tiles.length,
                        sourceTileSize: this.analysisSourceTileSize
                    });
                    if (switchBaseTileAfterLoaded) {
                        this.useAnalysisBaseTile(analysisTile, plotId, analysisId, 'tree-overlay-ready', {
                            resetTreeOverlay: false
                        });
                    }
                    return true;
                }
            } catch (error) {
                if (!this.isCurrentMapTileLoad(mapTileToken, plotId)) return false;
                // eslint-disable-next-line no-console
                console.warn('Failed to load analysis tree overlay:', error);
            }
            return false;
        },

        isCurrentMapTileLoad(token, plotId) {
            return this._mapTileToken === token && String(this.plotData?.id || '') === String(plotId);
        },

        /**
         * 处理树冠点击 - 拉取单树详情并展示
         */
        async handleTreeClick(tree) {
            if (!tree) {
                this.showTreeDetail = false;
                this.selectedTreeDetail = null;
                return;
            }
            // 立即展示面板并用瓦片内已有的 tree 数据填充，API 回来后再补充
            this.showTreeDetail = true;
            this.selectedTreeDetail = tree;
            const analysisId = this.currentAnalysisId;
            if (!analysisId) {
                // eslint-disable-next-line no-console
                console.warn('handleTreeClick: currentAnalysisId is null');
                return;
            }
            this.treeDetailLoading = true;
            try {
                const result = await apiClient.getWudaTreeDetail(this.plotData.id, analysisId, tree.tree_id);
                if (result?.data) {
                    this.selectedTreeDetail = result.data;
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to load tree detail:', error);
            } finally {
                this.treeDetailLoading = false;
            }
        },

        /**
         * 格式化检测时间
         */
        formatDetectedAt(detectedAt) {
            if (!detectedAt) return '-';
            try {
                return new Date(detectedAt).toLocaleString('zh-CN', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                });
            } catch (e) {
                return detectedAt;
            }
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
            this.$router.push(this.detailMapRoute).catch(() => {});
        },

        handleBreadcrumbClick(item) {
            const target = item.route || item.path;
            if (target) {
                this.$router.push(target).catch(() => {});
            }
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

/* 单树详情浮层 */
.tree-detail-overlay {
    position: fixed;
    z-index: 1100;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tree-detail-panel {
    position: absolute;
    top: 50%;
    right: 420px;
    transform: translateY(-50%);
    width: 260px;
    padding: 20px 18px 18px;
    border: 1px solid rgba(198, 156, 109, 0.35);
    border-radius: 8px;
    background: #0d2a28;
    color: #c69c6d;
}

.tree-detail-title {
    margin: 0 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: #e2c59a;
}

.tree-detail-loading {
    padding: 20px 0;
    font-size: 12px;
    color: rgba(198, 156, 109, 0.65);
    text-align: center;
}

.tree-detail-close {
    position: absolute;
    top: 10px;
    right: 12px;
    padding: 0;
    border: none;
    font-size: 14px;
    line-height: 1;
    color: #c69c6d;
    background: transparent;
    cursor: pointer;
    opacity: 0.7;

    &:hover { opacity: 1; }
}

.tree-detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    font-size: 12px;
    gap: 8px;
}

.tree-detail-label {
    flex-shrink: 0;
    color: rgba(198, 156, 109, 0.6);
}

.tree-tag {
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;

    &--healthy { background: rgba(0, 200, 83, 0.2); color: #00c853; }
    &--pest    { background: rgba(255, 23, 68, 0.2); color: #ff1744; }
    &--warn    { background: rgba(255, 145, 0, 0.2); color: #ff9100; }
}

.tree-detail-divider {
    height: 1px;
    margin: 10px 0;
    background: rgba(198, 156, 109, 0.2);
}

.tree-detection-item {
    padding-left: 8px;
    border-left: 2px solid rgba(198, 156, 109, 0.3);
    margin-bottom: 10px;
}
</style>
