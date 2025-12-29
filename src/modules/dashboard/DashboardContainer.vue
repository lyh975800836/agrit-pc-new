<template>
  <div class="dashboard-container">
    <DashboardHeader
      :weather="weather"
      :user="user"
      :region-name="regionName"
      :show-back-button="false"
      :page-title="'数据驾驶舱'"
      @nav-button-click="handleNavButtonClick"
    />

    <div class="dashboard-main" :style="{ backgroundImage: `url(${images.mainBg})` }">
      <!-- 统计卡片区域 -->
      <StatisticsGrid :statistics="statistics" />

      <!-- 主图表区域 -->
      <ChartsMainGrid
        :images="images"
        @period-change="handlePeriodChange"
      />

      <!-- 分布图表区域 -->
      <DistributionSection
        :images="images"
        :show-productive-forest-chart="showProductiveForestChart"
        @toggle-productive-forest="handleToggleProductiveForest"
        @reset-distribution="handleResetDistribution"
      />

      <!-- 数据表格区域 -->
      <DataTablesSection
        :images="images"
        :finance-data="financeData"
        :purchase-data="purchaseData"
        :service-team-data="serviceTeamData"
        :plot-data="plotData"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import DashboardHeader from '@/components/Dashboard/DashboardHeader.vue';
import StatisticsGrid from './components/StatisticsGrid.vue';
import ChartsMainGrid from './components/ChartsMainGrid.vue';
import DistributionSection from './components/DistributionSection.vue';
import DataTablesSection from './components/DataTablesSection.vue';

/**
 * 数据驾驶舱容器组件
 *
 * 组合所有Dashboard子组件，连接Vuex Store管理状态
 * @component DashboardContainer
 */
export default {
  name: 'DashboardContainer',
  components: {
    DashboardHeader,
    StatisticsGrid,
    ChartsMainGrid,
    DistributionSection,
    DataTablesSection
  },
  data() {
    return {
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
      }
    };
  },
  computed: {
    ...mapGetters('dashboard', [
      'statistics',
      'selectedPeriod',
      'showProductiveForestChart',
      'financeData',
      'purchaseData',
      'serviceTeamData',
      'plotData',
      'images'
    ])
  },
  created() {
    // 组件创建时加载仪表板数据
    this.loadDashboardData();
  },
  methods: {
    ...mapActions('dashboard', [
      'loadDashboardData',
      'updateSelectedPeriod',
      'toggleProductiveForestChart',
      'resetDistributionChart'
    ]),

    /**
     * 处理导航按钮点击
     */
    handleNavButtonClick() {
      if (this.$router) {
        this.$router.push('/').catch(() => {});
      }
    },

    /**
     * 处理时间周期变更
     */
    handlePeriodChange(period) {
      this.updateSelectedPeriod(period);
    },

    /**
     * 处理切换丰产林对比图
     */
    handleToggleProductiveForest() {
      this.toggleProductiveForestChart();
    },

    /**
     * 处理重置分布图表
     */
    handleResetDistribution() {
      this.resetDistributionChart();
    }
  }
};
</script>

<style lang="less" scoped>
.dashboard-container {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-main {
    padding: 15px;
  }
}
</style>
