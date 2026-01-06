/**
 * Dashboard Store Module
 *
 * 管理数据驾驶舱的状态和数据
 */
import {
  DEFAULT_PERIOD,
  STATISTICS_DATA,
  FINANCE_DATA,
  PURCHASE_DATA,
  SERVICE_TEAM_DATA,
  PLOT_DATA,
  DASHBOARD_IMAGES
} from '@/config/dashboardConfig';

const state = {
  // 加载状态
  loading: false,
  error: null,

  // 统计数据（从配置文件导入）
  statistics: STATISTICS_DATA,

  // 图表控制
  selectedPeriod: DEFAULT_PERIOD, // 价格走势默认时间周期
  showProductiveForestChart: false, // 是否显示丰产林对比图

  // 表格数据（从配置文件导入）
  financeData: FINANCE_DATA,
  purchaseData: PURCHASE_DATA,
  serviceTeamData: SERVICE_TEAM_DATA,
  plotData: PLOT_DATA,

  // 图片资源配置（从配置文件导入）
  images: DASHBOARD_IMAGES
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
