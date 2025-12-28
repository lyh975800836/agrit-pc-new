import httpClient from '../http/client';

/**
 * 农事API层
 *
 * 功能:
 * - 标准农事数据获取
 * - 预警农事数据获取
 * - 三农服务数据获取
 * - 农事阶段管理
 *
 * @class FarmingApi
 */
class FarmingApi {
  /**
   * 获取所有农事数据
   *
   * @returns {Promise<Object>} { standard, warning, service }
   */
  async getAllFarming() {
    try {
      const [standard, warning, service] = await Promise.all([
        this.getStandardFarming(),
        this.getWarningFarming(),
        this.getServiceFarming()
      ]);

      return {
        standard,
        warning,
        service
      };
    } catch (error) {
      console.error('[FarmingApi] 获取农事数据失败:', error);
      return {
        standard: [],
        warning: [],
        service: []
      };
    }
  }

  /**
   * 获取标准农事列表
   *
   * @returns {Promise<Array>} 标准农事数据
   */
  async getStandardFarming() {
    try {
      const response = await httpClient.get('/api/v1/farming/standard');
      return response.data || [];
    } catch (error) {
      console.error('[FarmingApi] 获取标准农事失败:', error);
      return [];
    }
  }

  /**
   * 获取预警农事列表
   *
   * @returns {Promise<Array>} 预警农事数据
   */
  async getWarningFarming() {
    try {
      const response = await httpClient.get('/api/v1/farming/warning');
      return response.data || [];
    } catch (error) {
      console.error('[FarmingApi] 获取预警农事失败:', error);
      return [];
    }
  }

  /**
   * 获取三农服务列表
   *
   * @returns {Promise<Array>} 服务数据
   */
  async getServiceFarming() {
    try {
      const response = await httpClient.get('/api/v1/farming/service');
      return response.data || [];
    } catch (error) {
      console.error('[FarmingApi] 获取三农服务失败:', error);
      return [];
    }
  }

  /**
   * 获取当前农事阶段
   *
   * @param {string} plotId - 地块ID (可选)
   * @returns {Promise<Object>} 当前阶段信息
   */
  async getCurrentStage(plotId = null) {
    try {
      const response = await httpClient.get('/api/v1/farming/current-stage', {
        params: plotId ? { plotId } : {}
      });
      return response.data || null;
    } catch (error) {
      console.error('[FarmingApi] 获取当前阶段失败:', error);
      return null;
    }
  }

  /**
   * 获取下一农事阶段
   *
   * @param {string} plotId - 地块ID (可选)
   * @returns {Promise<Object>} 下一阶段信息
   */
  async getNextStage(plotId = null) {
    try {
      const response = await httpClient.get('/api/v1/farming/next-stage', {
        params: plotId ? { plotId } : {}
      });
      return response.data || null;
    } catch (error) {
      console.error('[FarmingApi] 获取下一阶段失败:', error);
      return null;
    }
  }

  /**
   * 获取农事详情
   *
   * @param {string} farmingId - 农事ID
   * @returns {Promise<Object>} 农事详情
   */
  async getFarmingDetail(farmingId) {
    try {
      const response = await httpClient.get(`/api/v1/farming/detail/${farmingId}`);
      return response.data || null;
    } catch (error) {
      console.error(`[FarmingApi] 获取农事详情失败 (ID: ${farmingId}):`, error);
      return null;
    }
  }
}

// 导出单例
export default new FarmingApi();
