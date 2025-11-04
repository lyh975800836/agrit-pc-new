<template>
  <div class="data-dashboard">
    <!-- 复用现有的头部组件 -->
    <DashboardHeader
      :weather="weather"
      :user="user"
      :region-name="regionName"
      :show-back-button="false"
      :page-title="'数据驾驶舱'"
    />

    <!-- 主要数据面板 -->
    <div class="dashboard-main" :style="{ backgroundImage: `url(${images.mainBg})` }">
      <!-- 顶部统计卡片区域 -->
      <div class="stats-grid">
        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard1})` }">
          <div class="stat-content">
            <div class="stat-number">135</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.downArrow" class="trend-icon" />
                <span class="trend-text">-1.5%</span>
              </div>
              <div class="stat-label">种植面积（万亩）</div>
            </div>
          </div>
        </div>

        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard2})` }">
          <div class="stat-content">
            <div class="stat-number">28</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.upArrow" class="trend-icon" />
                <span class="trend-text">+7.7%</span>
              </div>
              <div class="stat-label">丰产林面积（万亩）</div>
            </div>
          </div>
        </div>

        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard3})` }">
          <div class="stat-content">
            <div class="stat-number">62</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.upArrow" class="trend-icon" />
                <span class="trend-text">+4.8%</span>
              </div>
              <div class="stat-label">烘场数量</div>
            </div>
          </div>
        </div>

        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard4})` }">
          <div class="stat-content">
            <div class="stat-number">22</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.upArrow" class="trend-icon" />
                <span class="trend-text">+10.0%</span>
              </div>
              <div class="stat-label">烘干线数量</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间图表区域 - 按demo布局调整 -->
      <div class="charts-main-grid">
        <!-- 价格走势图 - 左侧大图表 -->
        <div class="chart-panel price-chart-main" :style="{ backgroundImage: `url(${images.priceChartBg})` }">
          <div class="chart-header chart-header-trend">
            <div>
              <h3>2024年价格走势</h3>
              <p class="chart-subtitle">价格（元/斤）</p>
              <p class="chart-desc">查看八角价格的历史走势与预测</p>
            </div>
              <div class="price-insights">
              <div class="insight-card" :style="{ backgroundImage: `url(${images.insightCard})` }">
                <img :src="images.priceIcon" class="insight-icon" />
                <div class="insight-text">
                  <h4>价格洞察</h4>
                  <p>当前价格较上月上涨8.2%<br />处于历史较高水平</p>
                </div>
              </div>
              <div class="insight-card" :style="{ backgroundImage: `url(${images.insightCard})` }">
                <img :src="images.forecastIcon" class="insight-icon" />
                <div class="insight-text">
                  <h4>预测建议</h4>
                  <p>预计下月价格将稳中有升<br />建议适时出售</p>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-content">
            <div class="price-chart-controls">
              <div class="time-selector-dropdown" :style="{ backgroundImage: `url(${images.timeSelectorBg})` }">
                <select v-model="selectedPeriod" class="time-dropdown">
                  <option value="6">近6个月</option>
                  <option value="12">近12个月</option>
                  <option value="24">近24个月</option>
                </select>
              </div>
            </div>
            <div class="price-chart-display">
              <PriceTrendChart :period="selectedPeriod" />
            </div>
          </div>
        </div>

        <!-- 产量统计图 -->
        <div class="chart-panel production-chart" :style="{ backgroundImage: `url(${images.productionChartBg})` }">
          <div class="chart-header">
            <h3>历年八角产量统计</h3>
            <p class="chart-subtitle">产量（斤）</p>
          </div>
          <div class="chart-tabs">
            <button class="tab-btn active">总产量</button>
            <button class="tab-btn">平均产量</button>
          </div>
          <div class="chart-display" :style="{ backgroundImage: `url(${images.barChartBg})` }">
            <ProductionChart />
          </div>
        </div>

        <!-- 种植面积统计图 -->
        <div class="chart-panel area-chart" :style="{ backgroundImage: `url(${images.areaChartBg})` }">
          <div class="chart-header">
            <h3>历年种植面积统计</h3>
            <p class="chart-subtitle">面积（亩）</p>
          </div>
          <div class="chart-display" :style="{ backgroundImage: `url(${images.barChartBg})` }">
            <PlantingAreaChart />
          </div>
        </div>
      </div>

      <!-- 底部分布图表区域 - 单行四个模块 -->
      <div class="bottom-charts-row">
        <!-- 种植面积分布 -->
        <div class="distribution-panel" :style="{ backgroundImage: `url(${images.distributionBg})` }">
          <div class="panel-header-simple">
            <h3>各县区种植面积分布</h3>
          </div>
          <div class="panel-controls-bottom">
            <button class="control-btn" :style="{ backgroundImage: `url(${images.backBtn})` }">
              返回上一级
            </button>
            <button class="control-btn" :style="{ backgroundImage: `url(${images.resetBtn})` }">
              重置视图
            </button>
          </div>
          <div class="distribution-content-new">
            <div class="legend-section-vertical">
              <div class="legend-item">
                <div class="legend-color" style="background: #22c55e;"></div>
                <span>右江区</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #3b82f6;"></div>
                <span>田阳区</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #ffd700;"></div>
                <span>田东县</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #a855f7;"></div>
                <span>德保县</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #ff6b4a;"></div>
                <span>靖西市</span>
              </div>
            </div>
            <div class="pie-chart-container-large">
              <RegionalDistributionChart />
            </div>
          </div>
        </div>

        <!-- 八角加工生产线数量 -->
        <div class="chart-panel processing-lines-panel" :style="{ backgroundImage: `url(${images.productionChartBg})` }">
          <div class="chart-header">
            <h3>八角加工生产线数量</h3>
            <p class="chart-subtitle">生产线数量</p>
          </div>
          <div class="chart-display" :style="{ backgroundImage: `url(${images.barChartBg})` }">
            <ProcessingLinesChart />
          </div>
        </div>

        <!-- 无硫八角与有硫八角占比年度对比 -->
        <div class="chart-panel sulfur-comparison-panel" :style="{ backgroundImage: `url(${images.productionChartBg})` }">
          <div class="chart-header">
            <h3>无硫与有硫八角占比</h3>
            <p class="chart-subtitle">种植面积（亩）</p>
          </div>
          <div class="chart-display" :style="{ backgroundImage: `url(${images.barChartBg})` }">
            <SulfurComparisonChart />
          </div>
        </div>

        <!-- 病虫害影响分布 -->
        <div class="disease-panel" :style="{ backgroundImage: `url(${images.diseaseBg})` }">
          <div class="panel-header">
            <h3>病虫害影响林地占比</h3>
            <div class="year-selector-dropdown">
              <select class="year-select-dropdown">
                <option value="2024">2024年</option>
                <option value="2023">2023年</option>
                <option value="2022">2022年</option>
                <option value="2021">2021年</option>
                <option value="2020">2020年</option>
              </select>
            </div>
          </div>
          <div class="disease-content-optimized">
            <div class="disease-chart-wrapper">
              <DiseaseDistributionChart />
            </div>
            <div class="disease-legend-compact">
              <div class="legend-item">
                <div class="legend-color-small" style="background: #c69c6d;"></div>
                <span>健康地块</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #90ee90;"></div>
                <span>轻度病虫害</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #ffd700;"></div>
                <span>中度病虫害</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #ff6b4a;"></div>
                <span>重度病虫害</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部新增表格区域 - 两行两列 -->
      <div class="bottom-tables-row">
        <!-- 金融服务实体经济表格 -->
        <div class="data-table-panel finance-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
          <div class="table-header">
            <h3>金融服务实体经济</h3>
          </div>
          <div class="data-table">
            <div class="table-row table-head table-head-finance">
              <span>银行名称</span>
              <span>支持金额（万元）</span>
            </div>
            <div class="table-row table-row-finance">
              <span>农业银行百色分行</span>
              <span>5000</span>
            </div>
            <div class="table-row table-row-finance">
              <span>百色市商业银行</span>
              <span>3800</span>
            </div>
            <div class="table-row table-row-finance">
              <span>邮储银行百色支行</span>
              <span>2500</span>
            </div>
            <div class="table-row table-row-finance">
              <span>农村信用合作社</span>
              <span>1800</span>
            </div>
          </div>
        </div>

        <!-- 大宗商品采购商表格 -->
        <div class="data-table-panel purchase-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
          <div class="table-header">
            <h3>大宗商品采购商</h3>
          </div>
          <div class="data-table">
            <div class="table-row table-head table-head-purchase">
              <span>大宗商品采购商</span>
              <span>采购量</span>
            </div>
            <div class="table-row table-row-purchase">
              <span>王守义十三香</span>
              <span>3000吨</span>
            </div>
            <div class="table-row table-row-purchase">
              <span>仲景食品</span>
              <span>600吨</span>
            </div>
            <div class="table-row table-row-purchase">
              <span>海底捞</span>
              <span>500吨</span>
            </div>
            <div class="table-row table-row-purchase">
              <span>杨安镇调味品集团</span>
              <span>500吨</span>
            </div>
          </div>
        </div>

        <!-- 服务队详细数据表格 -->
        <div class="data-table-panel service-team-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
          <div class="table-header">
            <h3>服务队详细</h3>
          </div>
          <div class="data-table">
            <div class="table-row table-head">
              <span>服务队名称</span>
              <span>负责人</span>
              <span>服务范围</span>
              <span>人数</span>
              <span>评分</span>
            </div>
            <div class="table-row">
              <span>西林服务队</span>
              <span>王林</span>
              <span>西林县</span>
              <span>12</span>
              <span class="star-rating">★★★★☆</span>
            </div>
            <div class="table-row">
              <span>隆林服务队</span>
              <span>李明</span>
              <span>隆林县</span>
              <span>15</span>
              <span class="star-rating">★★★★★</span>
            </div>
            <div class="table-row">
              <span>德保服务队</span>
              <span>张华</span>
              <span>德保县</span>
              <span>10</span>
              <span class="star-rating">★★★☆☆</span>
            </div>
            <div class="table-row">
              <span>靖西服务队</span>
              <span>陈刚</span>
              <span>靖西市</span>
              <span>18</span>
              <span class="star-rating">★★★★☆</span>
            </div>
          </div>
        </div>

        <!-- 地块详细数据表格 -->
        <div class="data-table-panel plot-data-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
          <div class="table-header">
            <h3>地块详细</h3>
          </div>
          <div class="data-table">
            <div class="table-row table-head">
              <span>地块名称</span>
              <span>位置</span>
              <span>面积</span>
            </div>
            <div class="table-row">
              <span>北山地块</span>
              <span>右江区</span>
              <span>500亩</span>
            </div>
            <div class="table-row">
              <span>南畔地块</span>
              <span>田阳区</span>
              <span>380亩</span>
            </div>
            <div class="table-row">
              <span>西侧地块</span>
              <span>田东县</span>
              <span>420亩</span>
            </div>
            <div class="table-row">
              <span>东部地块</span>
              <span>德保县</span>
              <span>350亩</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from '@/components/DashboardHeader.vue';
import PriceTrendChart from '@/components/charts/PriceTrendChart.vue';
import ProductionChart from '@/components/charts/ProductionChart.vue';
import PlantingAreaChart from '@/components/charts/PlantingAreaChart.vue';
import RegionalDistributionChart from '@/components/charts/RegionalDistributionChart.vue';
import DiseaseDistributionChart from '@/components/charts/DiseaseDistributionChart.vue';
import ProcessingLinesChart from '@/components/charts/ProcessingLinesChart.vue';
import SulfurComparisonChart from '@/components/charts/SulfurComparisonChart.vue';

// 图片资源定义 - 使用从demo下载的正确背景图片
const images = {
    // 主要背景
    mainBg: '/images/dashboard-content-bg.png',
    // 统计卡片背景 - 对应demo中的四个统计卡片
    statCard1: '/images/stat-card-1.png', // 种植面积
    statCard2: '/images/stat-card-2.png', // 总产量
    statCard3: '/images/stat-card-3.png', // 活跃农户
    statCard4: '/images/stat-card-4.png', // 病虫害影响率
    // 趋势箭头
    upArrow: '/images/trend-up-arrow.png',
    downArrow: '/images/trend-down-arrow.png',
    // 价格分析面板
    priceChartBg: '/images/price-panel-bg.png',
    insightCard: '/images/price-insight-bg.png', // 价格洞察背景
    chartDisplay: '/images/price-chart-bg.png', // 价格图表背景
    // 产量统计面板
    productionChartBg: '/images/production-panel-bg.png',
    barChartBg: '/images/production-chart-bg.png',
    chartBars: '/images/production-chart-bg.png',
    // 种植面积面板
    areaChartBg: '/images/area-panel-bg.png',
    areaBars: '/images/area-chart-bg.png',
    // 分布面板
    distributionBg: '/images/map-panel-bg.png',
    backBtn: '/images/map-button-1.png', // 返回上一级按钮
    resetBtn: '/images/map-button-2.png', // 重置视图按钮
    pieChart: '/images/map-chart-bg.png', // 分布饼图背景
    // 数据表格面板
    tableBg: '/images/data-table-panel-bg.png',
    tableContentBg: '/images/data-table-bg.png',
    searchBg: '/images/search-button-bg.png',
    // 病虫害面板
    diseaseBg: '/images/disease-panel-bg.png',
    yearSelectorBg: '/images/disease-control-bg.png',
    diseasePieChartBg: '/images/disease-chart-bg.png',
    diseasePieChart: '/images/disease-indicator-bg.png',
    activeYearBg: '/images/disease-filter-bg.png',
    // 图标
    priceIcon: '/images/price-insight-icon.png',
    forecastIcon: '/images/forecast-icon.png',
    healthyIcon: '/images/disease-legend-healthy.png',
    mildIcon: '/images/disease-legend-healthy.png',
    moderateIcon: '/images/disease-legend-healthy.png',
    severeIcon: '/images/disease-legend-severe.png',
    // 下拉选择器
    timeSelectorBg: '/images/price-insight-bg.png',
    dropdownArrow: '/images/trend-down-arrow.png'
};

export default {
    name: 'DataDashboard',
    components: {
        DashboardHeader,
        PriceTrendChart,
        ProductionChart,
        PlantingAreaChart,
        RegionalDistributionChart,
        DiseaseDistributionChart,
        ProcessingLinesChart,
        SulfurComparisonChart
    },
    data() {
        return {
            images,
            selectedPeriod: '12', // 默认选择12个月
            regionName: '百色农林大数据中心',
            weather: {
                temperature: '26.8°C',
                condition: '晴多云转阵雨',
                time: '16:50',
                date: '2025年07月22日',
                weekday: '星期四'
            },
            user: {
                name: '管理员',
                role: 'admin'
            },
            projectData: {
                title: '数据驾驶舱',
                breadcrumb: ['百色', '数据中心', '驾驶舱']
            },
            statisticsData: {
                totalArea: 135,
                totalProduction: 28,
                farmersIncome: 62,
                herbicideReduction: 22
            },
            rankingData: {},
            qualityData: {}
        };
    }
};
</script>

<style lang="less" scoped>
/* 响应式设计 */
@media (max-width: 1400px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .charts-main-grid {
        grid-template-columns: 1fr;
    }

    .bottom-charts-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .bottom-charts {
        grid-template-columns: 1fr;
    }
}
@media (max-width: 768px) {
    .dashboard-main {
        padding: 15px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .charts-main-grid,
    .bottom-charts,
    .bottom-charts-row {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .stat-number {
        font-size: 36px;
    }

    .chart-header h3 {
        font-size: 20px;
    }

    .price-chart-main,
    .production-chart,
    .area-chart {
        height: 300px;
    }
}

.data-dashboard {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100vh;

    background: #0a1a2a;
}

.dashboard-main {
    overflow-y: auto;
    flex: 1;
    width: 100%;
    padding: 20px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

/* 统计卡片网格 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 30px;
    gap: 20px;
}

.stat-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 141px;
    padding: 0;

    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    color: #c69c6d;

    gap: 20px;
}

.stat-number {
    max-width: 45%;
    font-family: BebasNeueRegular;
    font-size: 58px;
    font-weight: bold;
    word-break: break-word;
}

.stat-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 8px;
}

.stat-trend {
    display: flex;
    align-items: center;
    justify-content: center;
}

.trend-icon {
    width: 11px;
    height: 20px;
    margin-right: 8px;
}

.trend-text {
    font-family: BebasNeueRegular;
    font-size: 31px;
    color: #c69c6d;

    &.trend-down {
        color: #ff6b4a;
    }
}

.stat-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    color: #c69c6d;
}

/* 图表主网格 - 匹配demo布局 */
.charts-main-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    margin-bottom: 25px;
    gap: 20px;
}

.chart-panel {
    box-sizing: border-box;
    padding: 20px;

    color: #c69c6d;
    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.price-chart-main {
    display: flex;
    flex-direction: column;
    height: 450px;
}

.chart-header-trend {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    margin-bottom: 12px;

    gap: 12px;
}

.chart-header h3 {
    margin: 0 0 6px;
    font-family: SourceHanSansCN-Medium;
    font-size: 22px;
    line-height: 1.2;

    color: #c69c6d;
}

.chart-subtitle {
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    line-height: 1.2;

    color: #c69c6d;
}

.chart-desc {
    margin: 0;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    line-height: 1.2;

    color: #4cfceacc;
}

.production-chart,
.area-chart {
    display: flex;
    flex-direction: column;
    height: 450px;
}

.area-chart .chart-header {
    flex-shrink: 0;
    margin-bottom: 12px;
}

.production-chart .chart-header {
    flex-shrink: 0;
    margin-bottom: 12px;
}

.chart-tabs {
    flex-shrink: 0;
    margin-bottom: 12px;
}

/* 价格图表特定样式 */
.price-insights {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-bottom: 8px;

    gap: 10px;
}

.insight-card {
    display: flex;
    flex: 0 1 calc(50% - 6px);
    align-items: center;
    min-width: 150px;
    padding: 12px;

    border-radius: 6px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    gap: 8px;
}

.insight-icon {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
}

.insight-text h4 {
    margin: 0 0 4px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    line-height: 1.1;

    color: #c69c6d;
}

.insight-text p {
    margin: 0;
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    line-height: 1.3;

    color: #4cfceae6;
}

.time-selector-dropdown {
    position: relative;
    width: 120px;

    border-radius: 4px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.time-dropdown {
    width: 100%;
    padding: 8px 25px 8px 12px;
    border: 1px solid #4cfcea4d;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;

    color: #c69c6d;
    border-radius: 4px;
    outline: none;
    background: transparent;
    cursor: pointer;

    appearance: none;
}

.dropdown-arrow {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 8px;
    height: 6px;

    transform: translateY(-50%);
    pointer-events: none;
}

.price-chart-display {
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: center;

    border-radius: 6px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    > div {
        width: 100%;
        height: 100%;
    }
}

.price-values {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;

    transform: translate(-50%, -50%);
}

.current-price {
    display: block;
    margin-bottom: 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 24px;

    color: #c69c6d;
}

.price-point {
    margin: 0 10px;
    font-family: SourceHanSansCN-Light;
    font-size: 16px;
    color: #4cfceacc;
}

/* 图表标签页 */
.chart-tabs {
    display: flex;
    margin-bottom: 12px;
    gap: 8px;
}

.tab-btn {
    min-width: 60px;
    padding: 5px 12px;
    border: 1px solid #4cfcea4d;
    font-family: SourceHanSansCN-Light;
    font-size: 11px;
    line-height: 1.2;
    text-align: center;

    color: #4cfceacc;
    border-radius: 4px;
    background: #4cfcea1a;
    cursor: pointer;

    &.active {
        border-color: #4cfcea99;
        color: #c69c6d;
        background: #4cfcea40;
    }

    &:hover {
        color: #4cfceae6;
        background: #4cfcea26;
    }
}

/* 图表内容容器 */
.chart-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
}

.price-chart-controls {
    display: flex;
    flex-shrink: 0;
    margin-bottom: 8px;
    gap: 10px;
}

/* 图表显示区域 */
.chart-display {
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: center;
    min-height: 200px;

    border-radius: 6px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;

    > div {
        width: 100%;
        height: 100%;
    }
}

.chart-placeholder {
    display: flex;
    align-items: flex-end;
    height: 100%;
    padding: 20px;
}

.y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    margin-right: 15px;
    font-family: SourceHanSansCN-Light;
    font-size: 14px;

    color: #4cfceacc;
}

.chart-bars {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
}

.chart-image {
    max-width: 100%;
    max-height: 180px;
    object-fit: contain;
}

.chart-value {
    margin-top: 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    color: #c69c6d;
}

/* 底部图表区域 - 单行四个模块 */
.bottom-charts-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

/* 旧样式兼容性保留 */
.bottom-charts {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 20px;
}

.distribution-panel {
    display: flex;
    flex-direction: column;
    min-height: 395px;
    padding: 20px;

    color: #c69c6d;
    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.chart-panel.processing-lines-panel,
.chart-panel.sulfur-comparison-panel {
    display: flex;
    flex-direction: column;
    min-height: 395px;
    padding: 20px;

    color: #c69c6d;
    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

/* 表格面板共同样式 - 优化单行显示 */
.service-team-table,
.plot-data-table {
    display: flex;
    overflow: hidden;
    flex-direction: column;
}

.service-team-table .data-table,
.plot-data-table .data-table {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.disease-panel {
    display: flex;
    flex-direction: column;
    min-height: 395px;
    padding: 20px;

    color: #c69c6d;
    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.panel-header-simple {
    margin-bottom: 10px;
}

.panel-header h3,
.panel-header-simple h3 {
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #c69c6d;
}

.panel-controls {
    display: flex;
    gap: 10px;
}

.panel-controls-bottom {
    display: flex;
    gap: 10px;
}

.control-btn {
    padding: 8px 16px;
    border: none;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;

    color: #0f3734;
    border-radius: 4px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    cursor: pointer;
}

/* 分布图表 */
.distribution-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.distribution-content-new {
    display: flex;
    flex: 1;
    align-items: center;
    min-height: 300px;

    gap: 20px;
}

.legend-section {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.legend-section-vertical {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: center;
    min-width: 100px;

    gap: 15px;
}

.legend-item {
    display: flex;
    align-items: center;
    font-family: SourceHanSansCN-Light;
    font-size: 14px;

    color: #c69c6d;

    gap: 12px;
}

.legend-color {
    width: 78px;
    height: 18px;
    border-radius: 2px;
}

.legend-color-small {
    width: 35px;
    height: 18px;
    border-radius: 2px;
}

.disease-content-optimized {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    gap: 8px;
}

.disease-chart-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
}

.disease-legend-compact {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: space-between;
    padding: 0 10px;
}

.pie-chart-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 280px;
    padding: 10px;
}

.pie-chart-container-large {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 280px;
}

/* 数据表格 */
.table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.table-header h3 {
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    color: #c69c6d;
}

.search-box {
    width: 130px;
    max-width: 180px;
    height: 17px;
    padding: 0 16px;
    font-size: 12px;
    line-height: 17px;

    border-radius: 20px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.search-input {
    width: 100%;
    border: none;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;

    color: #c69c6d;
    outline: none;
    background: transparent;

    &::placeholder {
        color: #4cfcea80;
    }
}

.data-table {
    flex: 1;
    border-radius: 6px;
}

.table-row {
    padding: 12px 0;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    text-align: center;

    color: #c69c6d;

    &.table-head {
        font-family: SourceHanSansCN-Medium;
        font-weight: bold;
        color: #c69c6d;
    }

    &:not(.table-head) {
        &:hover {
            background: #4cfcea0d;
        }
    }
}


/* 病虫害面板 */

.year-selector-dropdown {
    position: relative;
}

.year-select-dropdown {
    min-width: 80px;
    padding: 8px 12px;
    border: 1px solid #4cfcea66;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;

    color: #c69c6d;
    border-radius: 4px;
    outline: none;
    background: #4cfcea26;
    cursor: pointer;

    appearance: none;

    &:hover {
        background: #4cfcea33;
    }

    option {
        color: #c69c6d;
        background: #0f3734;
    }
}

/* 星级评分样式 */
.star-rating {
    font-size: 14px;
    letter-spacing: 2px;
    color: #ffd700;
}

/* 底部表格区域 - 四列 */
.bottom-tables-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-top: 25px;
    gap: 20px;
}

.data-table-panel.finance-table,
.data-table-panel.purchase-table,
.data-table-panel.service-team-table,
.data-table-panel.plot-data-table {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    height: 350px;
    padding: 20px;

    color: #c69c6d;
    border-radius: 8px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}

.finance-table .data-table,
.purchase-table .data-table,
.service-team-table .data-table,
.plot-data-table .data-table {
    overflow-y: auto;
    flex: 1;
    min-height: 0;
}

.finance-table .table-row,
.purchase-table .table-row {
    position: relative;
    display: grid;
    align-items: center;
    grid-template-columns: repeat(2, 1fr);
    padding: 12px 4px;
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: bold;
    text-align: center;

    color: #c69c6d;

    > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    &.table-head {
        font-family: SourceHanSansCN-Medium;
        font-weight: bold;
        color: #c69c6d;
    }

    &:not(.table-head) {
        &:hover {
            background: #4cfcea0d;

            > span {
                position: relative;
                z-index: 10;
                overflow: visible;
                white-space: normal;
                word-break: break-word;
            }
        }
    }
}

.service-team-table .table-row {
    position: relative;
    display: grid;
    align-items: center;
    grid-template-columns: repeat(5, 1fr);
    padding: 10px 4px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: bold;
    text-align: center;

    color: #c69c6d;

    > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    > span.star-rating {
        overflow: visible;
        white-space: normal;
    }

    &.table-head {
        padding: 12px 4px;
        font-family: SourceHanSansCN-Medium;
        font-size: 13px;
        font-weight: bold;

        color: #c69c6d;
    }

    &:not(.table-head) {
        &:hover {
            background: #4cfcea0d;

            > span {
                position: relative;
                z-index: 10;
                overflow: visible;
                white-space: normal;
                word-break: break-word;
            }
        }
    }
}

.plot-data-table .table-row {
    position: relative;
    display: grid;
    align-items: center;
    grid-template-columns: repeat(3, 1fr);
    padding: 10px 4px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: bold;
    text-align: center;

    color: #c69c6d;

    > span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    &.table-head {
        padding: 12px 4px;
        font-family: SourceHanSansCN-Medium;
        font-size: 13px;
        font-weight: bold;

        color: #c69c6d;
    }

    &:not(.table-head) {
        &:hover {
            background: #4cfcea0d;

            > span {
                position: relative;
                z-index: 10;
                overflow: visible;
                white-space: normal;
                word-break: break-word;
            }
        }
    }
}

</style>
