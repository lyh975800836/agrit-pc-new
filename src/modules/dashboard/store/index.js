/**
 * Dashboard Store Module
 *
 * 管理数据驾驶舱的状态和数据
 */

const state = {
  // 加载状态
  loading: false,
  error: null,

  // 统计数据
  statistics: [
    {
      id: 'monitoring-area',
      value: '10,273',
      unit: '亩',
      label: '百燕AI监测面积',
      trendValue: '+1.5%',
      trendDirection: 'up',
      trendIcon: '/images/trend-up-arrow.png',
      backgroundImage: '/images/stat-card-1.png'
    },
    {
      id: 'productive-forest',
      value: '1,136',
      unit: '亩',
      label: '百燕AI监测丰产林面积',
      trendValue: '+7.7%',
      trendDirection: 'up',
      trendIcon: '/images/trend-up-arrow.png',
      backgroundImage: '/images/stat-card-2.png'
    },
    {
      id: 'farmer-income',
      value: '3000',
      unit: '万元',
      label: '农户收入增加总量',
      trendValue: '+4.8%',
      trendDirection: 'up',
      trendIcon: '/images/trend-up-arrow.png',
      backgroundImage: '/images/stat-card-3.png'
    },
    {
      id: 'fertilizer-reduction',
      value: '1000',
      unit: '吨',
      label: '化肥和农药减少总量',
      trendValue: '-28%',
      trendDirection: 'down',
      trendIcon: '/images/trend-down-arrow.png',
      backgroundImage: '/images/stat-card-4.png'
    }
  ],

  // 图表控制
  selectedPeriod: '12', // 价格走势默认12个月
  showProductiveForestChart: false, // 是否显示丰产林对比图

  // 表格数据
  financeData: [
    { bank: '农业银行百色分行', amount: '--' },
    { bank: '百色市商业银行', amount: '--' },
    { bank: '邮储银行百色支行', amount: '--' },
    { bank: '农村信用合作社', amount: '--' }
  ],

  purchaseData: [
    { buyer: '王守义十三香', quantity: '3000吨' },
    { buyer: '仲景食品', quantity: '600吨' },
    { buyer: '海底捞', quantity: '500吨' },
    { buyer: '杨安镇调味品集团', quantity: '500吨' }
  ],

  serviceTeamData: [
    { name: '顺达农林', leader: '李子顺', area: '田林', members: '50人' },
    { name: '梁油农林', leader: '李丽', area: '右江区', members: '30人' },
    { name: '龙少坤劳务', leader: '龙少坤', area: '田林', members: '30人' },
    { name: '韦仕德劳务', leader: '韦仕德', area: '德保', members: '30人' },
    { name: '杨瑞红劳务', leader: '杨瑞红', area: '右江区', members: '30人' }
  ],

  plotData: [
    { name: '北山地块', location: '右江区', area: '500亩' },
    { name: '南畔地块', location: '田阳区', area: '380亩' },
    { name: '西侧地块', location: '田东县', area: '420亩' },
    { name: '东部地块', location: '德保县', area: '350亩' }
  ],

  // 图片资源配置
  images: {
    // 主要背景
    mainBg: '/images/dashboard-content-bg.png',
    // 统计卡片背景
    statCard1: '/images/stat-card-1.png',
    statCard2: '/images/stat-card-2.png',
    statCard3: '/images/stat-card-3.png',
    statCard4: '/images/stat-card-4.png',
    // 趋势箭头
    upArrow: '/images/trend-up-arrow.png',
    downArrow: '/images/trend-down-arrow.png',
    // 价格分析面板
    priceChartBg: '/images/price-panel-bg.png',
    insightCard: '/images/price-insight-bg.png',
    chartDisplay: '/images/price-chart-bg.png',
    // 产量统计面板
    productionChartBg: '/images/production-panel-bg.png',
    barChartBg: '/images/production-chart-bg.png',
    chartBars: '/images/production-chart-bg.png',
    // 种植面积面板
    areaChartBg: '/images/area-panel-bg.png',
    areaBars: '/images/area-chart-bg.png',
    // 分布面板
    distributionBg: '/images/map-panel-bg.png',
    backBtn: '/images/map-button-1.png',
    resetBtn: '/images/map-button-2.png',
    pieChart: '/images/map-chart-bg.png',
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
};

const getters = {
  /**
   * 获取统计数据
   */
  statistics: (state) => state.statistics,

  /**
   * 获取选中的时间周期
   */
  selectedPeriod: (state) => state.selectedPeriod,

  /**
   * 是否显示丰产林对比图
   */
  showProductiveForestChart: (state) => state.showProductiveForestChart,

  /**
   * 获取金融数据
   */
  financeData: (state) => state.financeData,

  /**
   * 获取采购数据
   */
  purchaseData: (state) => state.purchaseData,

  /**
   * 获取服务队数据
   */
  serviceTeamData: (state) => state.serviceTeamData,

  /**
   * 获取地块数据
   */
  plotData: (state) => state.plotData,

  /**
   * 获取图片资源配置
   */
  images: (state) => state.images,

  /**
   * 是否正在加载
   */
  isLoading: (state) => state.loading,

  /**
   * 获取错误信息
   */
  error: (state) => state.error
};

const mutations = {
  /**
   * 设置加载状态
   */
  SET_LOADING(state, loading) {
    state.loading = loading;
  },

  /**
   * 设置错误信息
   */
  SET_ERROR(state, error) {
    state.error = error;
  },

  /**
   * 设置统计数据
   */
  SET_STATISTICS(state, statistics) {
    state.statistics = statistics;
  },

  /**
   * 设置选中的时间周期
   */
  SET_SELECTED_PERIOD(state, period) {
    state.selectedPeriod = period;
  },

  /**
   * 切换丰产林对比图显示状态
   */
  TOGGLE_PRODUCTIVE_FOREST_CHART(state) {
    state.showProductiveForestChart = !state.showProductiveForestChart;
  },

  /**
   * 重置丰产林对比图显示状态
   */
  RESET_PRODUCTIVE_FOREST_CHART(state) {
    state.showProductiveForestChart = false;
  },

  /**
   * 设置金融数据
   */
  SET_FINANCE_DATA(state, data) {
    state.financeData = data;
  },

  /**
   * 设置采购数据
   */
  SET_PURCHASE_DATA(state, data) {
    state.purchaseData = data;
  },

  /**
   * 设置服务队数据
   */
  SET_SERVICE_TEAM_DATA(state, data) {
    state.serviceTeamData = data;
  },

  /**
   * 设置地块数据
   */
  SET_PLOT_DATA(state, data) {
    state.plotData = data;
  }
};

const actions = {
  /**
   * 加载仪表板数据
   */
  async loadDashboardData({ commit }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);

    try {
      // TODO: 从API获取实际数据
      // const data = await dashboardApi.getDashboardData();
      // commit('SET_STATISTICS', data.statistics);
      // commit('SET_FINANCE_DATA', data.finance);
      // commit('SET_PURCHASE_DATA', data.purchases);
      // commit('SET_SERVICE_TEAM_DATA', data.serviceTeams);
      // commit('SET_PLOT_DATA', data.plots);

      // 暂时使用默认数据
      commit('SET_LOADING', false);
    } catch (error) {
      commit('SET_ERROR', error.message || '加载数据失败');
      commit('SET_LOADING', false);
      throw error;
    }
  },

  /**
   * 更新选中的时间周期
   */
  updateSelectedPeriod({ commit }, period) {
    commit('SET_SELECTED_PERIOD', period);
  },

  /**
   * 切换丰产林对比图
   */
  toggleProductiveForestChart({ commit }) {
    commit('TOGGLE_PRODUCTIVE_FOREST_CHART');
  },

  /**
   * 重置分布图表
   */
  resetDistributionChart({ commit }) {
    commit('RESET_PRODUCTIVE_FOREST_CHART');
  },

  /**
   * 刷新统计数据
   */
  async refreshStatistics({ commit }) {
    try {
      // TODO: 从API获取统计数据
      // const data = await dashboardApi.getStatistics();
      // commit('SET_STATISTICS', data);
    } catch (error) {
      commit('SET_ERROR', error.message || '刷新统计数据失败');
      throw error;
    }
  },

  /**
   * 刷新金融数据
   */
  async refreshFinanceData({ commit }) {
    try {
      // TODO: 从API获取金融数据
      // const data = await dashboardApi.getFinanceData();
      // commit('SET_FINANCE_DATA', data);
    } catch (error) {
      commit('SET_ERROR', error.message || '刷新金融数据失败');
      throw error;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
