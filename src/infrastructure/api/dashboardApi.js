/**
 * Dashboard API
 *
 * 数据驾驶舱相关的API接口
 */

import { httpClient } from '../http/client';

/**
 * 获取仪表板统计数据
 * @returns {Promise<Object>} 统计数据
 */
export const getStatistics = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/statistics');
    return response.data;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    throw error;
  }
};

/**
 * 获取价格走势数据
 * @param {Object} params - 查询参数
 * @param {string} params.period - 时间周期 (6/12/24个月)
 * @returns {Promise<Object>} 价格走势数据
 */
export const getPriceTrend = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/price-trend', { params });
    return response.data;
  } catch (error) {
    console.error('获取价格走势数据失败:', error);
    throw error;
  }
};

/**
 * 获取产量统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 产量统计数据
 */
export const getProductionData = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/production', { params });
    return response.data;
  } catch (error) {
    console.error('获取产量数据失败:', error);
    throw error;
  }
};

/**
 * 获取种植面积统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 种植面积数据
 */
export const getPlantingAreaData = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/planting-area', { params });
    return response.data;
  } catch (error) {
    console.error('获取种植面积数据失败:', error);
    throw error;
  }
};

/**
 * 获取区域分布数据
 * @returns {Promise<Object>} 区域分布数据
 */
export const getRegionalDistribution = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/regional-distribution');
    return response.data;
  } catch (error) {
    console.error('获取区域分布数据失败:', error);
    throw error;
  }
};

/**
 * 获取丰产林对比数据
 * @returns {Promise<Object>} 丰产林对比数据
 */
export const getProductiveForestData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/productive-forest');
    return response.data;
  } catch (error) {
    console.error('获取丰产林数据失败:', error);
    throw error;
  }
};

/**
 * 获取加工生产线数据
 * @returns {Promise<Object>} 生产线数据
 */
export const getProcessingLinesData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/processing-lines');
    return response.data;
  } catch (error) {
    console.error('获取生产线数据失败:', error);
    throw error;
  }
};

/**
 * 获取质量对比数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 质量对比数据
 */
export const getQualityComparisonData = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/quality-comparison', { params });
    return response.data;
  } catch (error) {
    console.error('获取质量对比数据失败:', error);
    throw error;
  }
};

/**
 * 获取病虫害分布数据
 * @param {Object} params - 查询参数
 * @param {string} params.year - 年份
 * @returns {Promise<Object>} 病虫害分布数据
 */
export const getDiseaseDistribution = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/disease-distribution', { params });
    return response.data;
  } catch (error) {
    console.error('获取病虫害分布数据失败:', error);
    throw error;
  }
};

/**
 * 获取金融服务数据
 * @returns {Promise<Array>} 金融服务数据列表
 */
export const getFinanceData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/finance');
    return response.data;
  } catch (error) {
    console.error('获取金融服务数据失败:', error);
    throw error;
  }
};

/**
 * 获取大宗商品采购数据
 * @returns {Promise<Array>} 采购数据列表
 */
export const getPurchaseData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/purchases');
    return response.data;
  } catch (error) {
    console.error('获取采购数据失败:', error);
    throw error;
  }
};

/**
 * 获取服务队数据
 * @returns {Promise<Array>} 服务队数据列表
 */
export const getServiceTeamData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/service-teams');
    return response.data;
  } catch (error) {
    console.error('获取服务队数据失败:', error);
    throw error;
  }
};

/**
 * 获取地块数据
 * @param {Object} params - 查询参数
 * @returns {Promise<Array>} 地块数据列表
 */
export const getPlotListData = async (params = {}) => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/plots', { params });
    return response.data;
  } catch (error) {
    console.error('获取地块数据失败:', error);
    throw error;
  }
};

/**
 * 获取完整的仪表板数据
 * @returns {Promise<Object>} 完整的仪表板数据
 */
export const getDashboardData = async () => {
  try {
    const response = await httpClient.get('/api/v1/dashboard/all');
    return response.data;
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    throw error;
  }
};

export default {
  getStatistics,
  getPriceTrend,
  getProductionData,
  getPlantingAreaData,
  getRegionalDistribution,
  getProductiveForestData,
  getProcessingLinesData,
  getQualityComparisonData,
  getDiseaseDistribution,
  getFinanceData,
  getPurchaseData,
  getServiceTeamData,
  getPlotListData,
  getDashboardData
};
