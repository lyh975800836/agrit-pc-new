<template>
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
            <select v-model="selectedPeriod" class="time-dropdown" @change="$emit('period-change', selectedPeriod)">
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
        <p class="chart-subtitle">产量（万吨）</p>
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
        <p class="chart-subtitle">面积（万亩）</p>
      </div>
      <div class="chart-display" :style="{ backgroundImage: `url(${images.barChartBg})` }">
        <PlantingAreaChart />
      </div>
    </div>
  </div>
</template>

<script>
import PriceTrendChart from '@/components/charts/PriceTrendChart.vue';
import ProductionChart from '@/components/charts/ProductionChart.vue';
import PlantingAreaChart from '@/components/charts/PlantingAreaChart.vue';

/**
 * 主图表区域组件
 *
 * 包含价格走势、产量统计、种植面积三个主要图表
 * @component ChartsMainGrid
 */
export default {
  name: 'ChartsMainGrid',
  components: {
    PriceTrendChart,
    ProductionChart,
    PlantingAreaChart
  },
  props: {
    /**
     * 图片资源配置
     */
    images: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedPeriod: '12' // 默认选择12个月
    };
  }
};
</script>

<style lang="less" scoped>
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

/* 响应式设计 */
@media (max-width: 1400px) {
  .charts-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .price-chart-main,
  .production-chart,
  .area-chart {
    height: 300px;
  }

  .chart-header h3 {
    font-size: 20px;
  }
}
</style>
