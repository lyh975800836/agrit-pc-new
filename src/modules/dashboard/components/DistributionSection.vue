<template>
  <div class="bottom-charts-row">
    <!-- 种植面积分布 -->
    <div class="distribution-panel" :style="{ backgroundImage: `url(${images.distributionBg})` }">
      <div class="panel-header-simple">
        <h3>{{ showProductiveForestChart ? '各区县丰产林占比' : '各县区种植面积分布' }}</h3>
      </div>
      <div class="panel-controls-bottom">
        <button
          class="control-btn"
          :style="{ backgroundImage: `url(${images.backBtn})` }"
          @click="$emit('toggle-productive-forest')"
        >
          {{ showProductiveForestChart ? '查看面积分布' : '各区县丰产林占比' }}
        </button>
        <button
          class="control-btn"
          :style="{ backgroundImage: `url(${images.resetBtn})` }"
          @click="$emit('reset-distribution')"
        >
          重置视图
        </button>
      </div>
      <div v-if="!showProductiveForestChart" class="distribution-content-optimized">
        <div class="pie-chart-container-large">
          <RegionalDistributionChart />
        </div>
        <div class="distribution-legend-horizontal">
          <div
            v-for="region in regionalLegend"
            :key="region.name"
            class="legend-item-horizontal"
          >
            <div class="legend-color-bar" :style="{ background: region.color }"></div>
            <span>{{ region.name }}</span>
          </div>
        </div>
      </div>
      <div v-if="showProductiveForestChart" class="productive-forest-chart-container">
        <ProductiveForestChart />
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

    <!-- 高质八角与低质八角占比年度对比 -->
    <div class="chart-panel sulfur-comparison-panel" :style="{ backgroundImage: `url(${images.productionChartBg})` }">
      <div class="chart-header">
        <h3>高质与低质八角占比</h3>
        <p class="chart-subtitle">产量（万吨）</p>
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
          <select v-model="selectedYear" class="year-select-dropdown">
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
        <div class="disease-legend-horizontal">
          <div
            v-for="status in diseaseLegend"
            :key="status.name"
            class="legend-item-vertical"
          >
            <div class="legend-color-bar" :style="{ background: status.color }"></div>
            <span>{{ status.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RegionalDistributionChart from '@/components/charts/RegionalDistributionChart.vue';
import DiseaseDistributionChart from '@/components/charts/DiseaseDistributionChart.vue';
import ProcessingLinesChart from '@/components/charts/ProcessingLinesChart.vue';
import SulfurComparisonChart from '@/components/charts/SulfurComparisonChart.vue';
import ProductiveForestChart from '@/components/charts/ProductiveForestChart.vue';

/**
 * 分布图表区域组件
 *
 * 包含地区分布、加工线数量、质量占比、病虫害分布四个面板
 * @component DistributionSection
 */
export default {
  name: 'DistributionSection',
  components: {
    RegionalDistributionChart,
    DiseaseDistributionChart,
    ProcessingLinesChart,
    SulfurComparisonChart,
    ProductiveForestChart
  },
  props: {
    /**
     * 图片资源配置
     */
    images: {
      type: Object,
      required: true
    },
    /**
     * 是否显示丰产林对比图
     */
    showProductiveForestChart: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedYear: '2024',
      regionalLegend: [
        { name: '德保县', color: '#22c55e' },
        { name: '那坡县', color: '#3b82f6' },
        { name: '右江区', color: '#ffd700' },
        { name: '田林县', color: '#a855f7' },
        { name: '凌云县', color: '#ff6b4a' },
        { name: '乐业县', color: '#ff9500' }
      ],
      diseaseLegend: [
        { name: '健康地块', color: '#c69c6d' },
        { name: '轻度病虫害', color: '#90ee90' },
        { name: '中度病虫害', color: '#ffd700' },
        { name: '重度病虫害', color: '#ff6b4a' }
      ]
    };
  }
};
</script>

<style lang="less" scoped>
/* 底部图表区域 - 单行四个模块 */
.bottom-charts-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
.distribution-content-optimized {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  gap: 0;
}

.pie-chart-container-large {
  position: relative;
  flex: 1;
  min-height: 0;
}

.productive-forest-chart-container {
  position: relative;
  display: flex;
  flex: 1;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  min-height: 280px;
}

.distribution-legend-horizontal {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  padding: 8px 10px 0;

  gap: 15px;
}

.legend-item-horizontal {
  display: flex;
  align-items: center;
  font-family: SourceHanSansCN-Light;
  font-size: 13px;

  color: #c69c6d;

  gap: 6px;
}

.legend-item-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: SourceHanSansCN-Light;
  font-size: 12px;

  color: #c69c6d;

  gap: 4px;
}

.legend-color-bar {
  flex-shrink: 0;
  width: 60px;
  height: 16px;
  border-radius: 2px;
}

/* 图表头部和显示区域 */
.chart-header {
  flex-shrink: 0;
  margin-bottom: 12px;
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

/* 病虫害面板 */
.disease-content-optimized {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  gap: 0;
}

.disease-chart-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.disease-legend-horizontal {
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-around;
  padding: 12px 10px 0;

  gap: 10px;
}

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

/* 响应式设计 */
@media (max-width: 1400px) {
  .bottom-charts-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .bottom-charts-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .distribution-panel,
  .chart-panel.processing-lines-panel,
  .chart-panel.sulfur-comparison-panel,
  .disease-panel {
    min-height: 300px;
  }
}
</style>
