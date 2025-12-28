import httpClient from '../http/client';

/**
 * 地块API层
 *
 * 功能:
 * - 地块数据获取
 * - 数据格式转换 (后端 → 前端)
 * - 地块类型推断
 * - 统一错误处理
 *
 * @class PlotApi
 */
class PlotApi {
  /**
   * 获取地块详情
   *
   * @param {string} plotId - 地块ID
   * @returns {Promise<Object>} 转换后的地块数据
   */
  async getPlotDetail(plotId) {
    try {
      const response = await httpClient.get('/api/v1/p/detail', {
        params: { id: plotId }
      });

      // 数据转换: 后端格式 → 前端格式
      return this._transformPlotDetail(response.data);
    } catch (error) {
      console.error(`[PlotApi] 获取地块详情失败 (ID: ${plotId}):`, error);
      throw error;
    }
  }

  /**
   * 获取地块列表
   *
   * @returns {Promise<Array>} 地块列表
   */
  async getPlotsList() {
    try {
      const response = await httpClient.get('/api/v1/geoprocessing/plot-tiles/list');

      // 转换每个地块数据
      if (Array.isArray(response.data)) {
        return response.data.map(plot => this._transformPlotDetail(plot));
      }

      return [];
    } catch (error) {
      console.error('[PlotApi] 获取地块列表失败:', error);
      throw error;
    }
  }

  /**
   * 通过名称查找地块
   *
   * @param {string} plotName - 地块名称
   * @returns {Promise<Object|null>} 地块数据或null
   */
  async findPlotByName(plotName) {
    try {
      const plotList = await this.getPlotsList();
      return plotList.find(plot => plot.name === plotName) || null;
    } catch (error) {
      console.error(`[PlotApi] 查找地块失败 (Name: ${plotName}):`, error);
      return null;
    }
  }

  /**
   * 获取地块统计信息
   *
   * @param {string} plotId - 地块ID
   * @returns {Promise<Object>} 统计信息
   */
  async getPlotStatistics(plotId) {
    try {
      const response = await httpClient.get('/api/v1/p/statistics', {
        params: { id: plotId }
      });

      return response.data;
    } catch (error) {
      console.error(`[PlotApi] 获取地块统计失败 (ID: ${plotId}):`, error);
      return {};
    }
  }

  /**
   * 数据转换: 后端格式 → 前端格式
   *
   * 后端数据格式:
   * {
   *   id: "plot-123",
   *   plot_name: "千户十亩",
   *   property_type_name: "八角基地",
   *   area: "1200",
   *   config_data: "{\"owner_name\":\"张三\",...}"
   * }
   *
   * 前端数据格式:
   * {
   *   id: "plot-123",
   *   name: "千户十亩",
   *   type: "star-anise",
   *   area: 1200,
   *   configData: { owner_name: "张三", ... },
   *   _raw: { ... } // 保留原始数据
   * }
   *
   * @param {Object} rawData - 后端原始数据
   * @returns {Object} 转换后的数据
   * @private
   */
  _transformPlotDetail(rawData) {
    if (!rawData) {
      return null;
    }

    // 解析config_data (可能是字符串或对象)
    let configData = {};
    if (rawData.config_data) {
      try {
        configData = typeof rawData.config_data === 'string'
          ? JSON.parse(rawData.config_data)
          : rawData.config_data;
      } catch (error) {
        console.warn('[PlotApi] 解析 config_data 失败:', error);
        configData = {};
      }
    }

    // 推断地块类型
    const type = this._inferPlotType(rawData, configData);

    return {
      // 基础信息
      id: rawData.id,
      name: rawData.plot_name,
      type: type,

      // 几何信息
      area: parseFloat(rawData.area || 0),
      coordinates: rawData.coordinates,
      centerPoint: rawData.center_point,

      // 分类信息
      propertyType: rawData.property_type_name,
      region: rawData.region,
      district: rawData.district,
      status: rawData.status,

      // WMTS瓦片图层
      layer: rawData.layer_name,

      // 配置数据
      configData: configData,

      // 保留原始数据供特殊需求使用
      _raw: rawData
    };
  }

  /**
   * 推断地块类型
   *
   * 优先级:
   * 1. 根据 property_type_name 推断
   * 2. 根据 config_data.facility_type 推断
   * 3. 根据其他字段推断
   * 4. 默认返回 'star-anise'
   *
   * 地块类型:
   * - 'star-anise': 八角地块
   * - 'factory': 烘干工厂
   * - 'warehouse': 仓库
   * - 'tea-oil': 茶油地块
   *
   * @param {Object} rawData - 后端原始数据
   * @param {Object} configData - 解析后的配置数据
   * @returns {string} 地块类型
   * @private
   */
  _inferPlotType(rawData, configData) {
    const propertyType = rawData.property_type_name || '';

    // 方式1: 根据 property_type_name 推断
    if (propertyType.includes('八角')) {
      return 'star-anise';
    }
    if (propertyType.includes('工厂') || propertyType.includes('烘干')) {
      return 'factory';
    }
    if (propertyType.includes('仓库')) {
      return 'warehouse';
    }
    if (propertyType.includes('茶油')) {
      return 'tea-oil';
    }

    // 方式2: 根据 config_data.facility_type 推断
    if (configData.facility_type) {
      const facilityType = configData.facility_type.toLowerCase();

      if (facilityType === 'factory') {
        return 'factory';
      }
      if (facilityType === 'warehouse') {
        return 'warehouse';
      }
    }

    // 方式3: 根据其他特征推断
    // 如果有施工计划相关字段,可能是工厂
    if (configData.construction_calendar || configData.schedule) {
      return 'factory';
    }

    // 如果有库存相关字段,可能是仓库
    if (configData.inventory || configData.storage_capacity) {
      return 'warehouse';
    }

    // 默认类型: 八角地块
    return 'star-anise';
  }

  /**
   * 更新地块数据
   *
   * @param {string} plotId - 地块ID
   * @param {Object} data - 更新数据
   * @returns {Promise<Object>} 更新后的数据
   */
  async updatePlot(plotId, data) {
    try {
      const response = await httpClient.put(`/api/v1/p/detail/${plotId}`, data);
      return this._transformPlotDetail(response.data);
    } catch (error) {
      console.error(`[PlotApi] 更新地块失败 (ID: ${plotId}):`, error);
      throw error;
    }
  }

  /**
   * 删除地块
   *
   * @param {string} plotId - 地块ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deletePlot(plotId) {
    try {
      await httpClient.delete(`/api/v1/p/detail/${plotId}`);
      return true;
    } catch (error) {
      console.error(`[PlotApi] 删除地块失败 (ID: ${plotId}):`, error);
      return false;
    }
  }
}

// 导出单例
export default new PlotApi();
