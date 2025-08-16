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
            <div class="stat-number">1,258</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.upArrow" class="trend-icon" />
                <span class="trend-text">+5.8%</span>
              </div>
              <div class="stat-label">总种植面积（亩）</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard2})` }">
          <div class="stat-content">
            <div class="stat-number">3,850</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.upArrow" class="trend-icon" />
                <span class="trend-text">+12.3%</span>
              </div>
              <div class="stat-label">预计总产量（斤）</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard3})` }">
          <div class="stat-content">
            <div class="stat-number">1160</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.downArrow" class="trend-icon" />
                <span class="trend-text">-2.1%</span>
              </div>
              <div class="stat-label">活跃农户数（户）</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card" :style="{ backgroundImage: `url(${images.statCard4})` }">
          <div class="stat-content">
            <div class="stat-number">11.2</div>
            <div class="stat-right">
              <div class="stat-trend">
                <img :src="images.downArrow" class="trend-icon" />
                <span class="trend-text">-3.4%</span>
              </div>
              <div class="stat-label">病虫害影响率（%）</div>
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
      
      <!-- 底部分布图表区域 -->
      <div class="bottom-charts">
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
                <div class="legend-color" style="background: #22C55E;"></div>
                <span>右江区</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #3B82F6;"></div>
                <span>田阳区</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #FFD700;"></div>
                <span>田东县</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #A855F7;"></div>
                <span>德保县</span>
              </div>
              <div class="legend-item">
                <div class="legend-color" style="background: #FF6B4A;"></div>
                <span>靖西市</span>
              </div>
            </div>
            <div class="pie-chart-container-large">
              <RegionalDistributionChart />
            </div>
          </div>
        </div>
        
        <!-- 详细数据表格 -->
        <div class="data-table-panel" :style="{ backgroundImage: `url(${images.tableBg})` }">
          <div class="table-header">
            <h3>详细数据</h3>
            <div class="search-box" :style="{ backgroundImage: `url(${images.searchBg})` }">
              搜索地块...
            </div>
          </div>
          <div class="data-table">
            <div class="table-row table-head">
              <span>区域名称</span>
              <span>种植面积</span>
              <span>预计产量</span>
              <span>负责人</span>
              <span>联系方式</span>
            </div>
            <div class="table-row">
              <span>地块A001</span>
              <span>45亩</span>
              <span>138斤</span>
              <span>张建国</span>
              <span>138****5068</span>
            </div>
            <div class="table-row">
              <span>地块A002</span>
              <span>38亩</span>
              <span>116斤</span>
              <span>李明华</span>
              <span>138****9570</span>
            </div>
            <div class="table-row">
              <span>地块A003</span>
              <span>52亩</span>
              <span>159斤</span>
              <span>王德胜</span>
              <span>138****9163</span>
            </div>
            <div class="table-row">
              <span>地块A004</span>
              <span>29亩</span>
              <span>89斤</span>
              <span>刘春花</span>
              <span>138****0727</span>
            </div>
            <div class="table-row">
              <span>地块A005</span>
              <span>41亩</span>
              <span>125斤</span>
              <span>陈国强</span>
              <span>138****1373</span>
            </div>
          </div>
        </div>
        
        <!-- 病虫害影响分布 -->
        <div class="disease-panel" :style="{ backgroundImage: `url(${images.diseaseBg})` }">
          <div class="panel-header">
            <h3>病虫害影响面积分布</h3>
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
                <div class="legend-color-small" style="background: #4CFCEA;"></div>
                <span>健康地块</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #90EE90;"></div>
                <span>轻度病虫害</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #FFD700;"></div>
                <span>中度病虫害</span>
              </div>
              <div class="legend-item">
                <div class="legend-color-small" style="background: #FF6B4A;"></div>
                <span>重度病虫害</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardHeader from '@/components/DashboardHeader.vue'
import PriceTrendChart from '@/components/charts/PriceTrendChart.vue'
import ProductionChart from '@/components/charts/ProductionChart.vue'
import PlantingAreaChart from '@/components/charts/PlantingAreaChart.vue'
import RegionalDistributionChart from '@/components/charts/RegionalDistributionChart.vue'
import DiseaseDistributionChart from '@/components/charts/DiseaseDistributionChart.vue'

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
}

export default {
  name: 'DataDashboard',
  components: {
    DashboardHeader,
    PriceTrendChart,
    ProductionChart,
    PlantingAreaChart,
    RegionalDistributionChart,
    DiseaseDistributionChart
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
        totalArea: 1258,
        totalProduction: 3850,
        activeUsers: 1160,
        diseaseRate: 11.2
      },
      rankingData: {},
      qualityData: {}
    }
  }
}
</script>

<style lang="less" scoped>
.data-dashboard {
  width: 100%;
  height: 100vh;
  background: #0a1a2a;
  display: flex;
  flex-direction: column;
}

.dashboard-main {
  flex: 1;
  width: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  overflow-y: auto;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0 27px 0 25px;
  border-radius: 8px;
  position: relative;
  height: 141px;
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(76, 252, 234, 1);
  width: 100%;
}

.stat-number {
  font-size: 58px;
  font-family: BebasNeueRegular;
  font-weight: bold;
}

.stat-right {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-trend {
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-icon {
  margin-right: 8px;
  width: 11px;
  height: 20px;
}

.trend-text {
  font-size: 31px;
  font-family: BebasNeueRegular;
  color: #4CFCEA;
  
  &.trend-down {
    color: #FF6B4A;
  }
}

.stat-label {
  font-size: 17px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
}

/* 图表主网格 - 匹配demo布局 */
.charts-main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.chart-panel {
  box-sizing: border-box;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  border-radius: 8px;
  color: rgba(76, 252, 234, 1);
}

.price-chart-main {
  height: 395px;
}

.chart-header-trend {
  display: flex;
  justify-content: space-between;
}

.chart-header h3 {
  font-size: 24px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  margin: 0 0 8px 0;
}

.chart-subtitle {
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  margin: 0 0 8px 0;
}

.chart-desc {
  font-size: 14px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 0.8);
  margin: 0;
}

.production-chart, .area-chart {
  height: 395px;
}

.area-chart .chart-header {
  margin-bottom: 60px;
}

/* 价格图表特定样式 */
.price-insights {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.insight-card {
  flex: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 15px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.insight-icon {
  width: 32px;
  height: 32px;
}

.insight-text h4 {
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  margin: 0 0 5px 0;
}

.insight-text p {
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 0.9);
  margin: 0;
  line-height: 1.4;
}

.time-selector-dropdown {
  position: relative;
  width: 120px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 4px;
}

.time-dropdown {
  width: 100%;
  padding: 8px 25px 8px 12px;
  background: transparent;
  border: 1px solid rgba(76, 252, 234, 0.3);
  color: rgba(76, 252, 234, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  border-radius: 4px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.dropdown-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 6px;
  pointer-events: none;
}

.price-chart-display {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 220px;
  position: relative;
  border-radius: 6px;
}

.price-values {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.current-price {
  font-size: 24px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  display: block;
  margin-bottom: 10px;
}

.price-point {
  font-size: 16px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 0.8);
  margin: 0 10px;
}

/* 图表标签页 */
.chart-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tab-btn {
  background: rgba(76, 252, 234, 0.1);
  border: 1px solid rgba(76, 252, 234, 0.3);
  color: rgba(76, 252, 234, 0.8);
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: SourceHanSansCN-Light;
  min-width: 60px;
  text-align: center;
  
  &.active {
    background: rgba(76, 252, 234, 0.25);
    border-color: rgba(76, 252, 234, 0.6);
    color: rgba(76, 252, 234, 1);
  }
  
  &:hover {
    background: rgba(76, 252, 234, 0.15);
    color: rgba(76, 252, 234, 0.9);
  }
}

/* 图表显示区域 */
.chart-display {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 250px;
  border-radius: 6px;
  position: relative;
  padding: 15px 10px 10px 10px;
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
  font-size: 14px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 0.8);
}

.chart-bars {
  flex: 1;
  display: flex;
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
  font-size: 18px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  margin-top: 10px;
}

/* 底部图表区域 */
.bottom-charts {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
}

.distribution-panel,
.data-table-panel {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  border-radius: 8px;
  color: rgba(76, 252, 234, 1);
  height: 395px;
}

.disease-panel {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
  border-radius: 8px;
  color: rgba(76, 252, 234, 1);
  height: 395px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header-simple {
  margin-bottom: 10px;
}

.panel-header h3, .panel-header-simple h3 {
  font-size: 20px;
  font-family: SourceHanSansCN-Medium;
  color: rgba(76, 252, 234, 1);
  margin: 0;
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
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  color: rgba(15, 55, 52, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
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
  align-items: center;
  gap: 20px;
  height: 300px;
  flex: 1;
}

.legend-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.legend-section-vertical {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 100px;
  justify-content: center;
  flex-shrink: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 1);
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
  flex-direction: column;
  height: calc(100% - 70px);
  gap: 8px;
}

.disease-chart-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
}

.disease-legend-compact {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 10px;
  flex-shrink: 0;
}

.pie-chart-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 280px;
  padding: 10px;
}

.pie-chart-container-large {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}


/* 数据表格 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-box {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0 16px;
  border-radius: 20px;
  width: 130px;
  height: 17px;
  line-height: 17px;
  font-size: 12px;
  max-width: 180px;
}

.search-input {
  background: transparent;
  border: none;
  color: rgba(76, 252, 234, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  outline: none;
  width: 100%;
  
  &::placeholder {
    color: rgba(76, 252, 234, 0.5);
  }
}

.data-table {
  border-radius: 6px;
  flex: 1;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding: 12px 0;
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  color: rgba(76, 252, 234, 1);
  text-align: center;
  
  &.table-head {
    font-family: SourceHanSansCN-Medium;
    color: rgba(76, 252, 234, 1);
    font-weight: bold;
  }
  
  &:not(.table-head) {
    &:hover {
      background: rgba(76, 252, 234, 0.05);
    }
  }
}

/* 病虫害面板 */

.year-selector-dropdown {
  position: relative;
}

.year-select-dropdown {
  background: rgba(76, 252, 234, 0.15);
  border: 1px solid rgba(76, 252, 234, 0.4);
  color: rgba(76, 252, 234, 1);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  outline: none;
  cursor: pointer;
  appearance: none;
  min-width: 80px;
  
  &:hover {
    background: rgba(76, 252, 234, 0.2);
  }
  
  option {
    background: rgba(15, 55, 52, 1);
    color: rgba(76, 252, 234, 1);
  }
}


/* 响应式设计 */
@media (max-width: 1400px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-main-grid {
    grid-template-columns: 1fr;
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
  .bottom-charts {
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
</style>