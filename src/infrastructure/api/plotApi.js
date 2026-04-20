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
      const response = await httpClient.post('/api/v2/plot/detail', { id: String(plotId) });

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
  async getPlotsList(params = {}) {
    try {
      const response = await httpClient.post('/api/v2/plot/list', { page: 1, page_size: 100, ...params });

      // 新API返回 { list, total } 结构
      const list = response.data?.list || response.data || [];
      if (Array.isArray(list)) {
        return list.map(plot => this._transformPlotDetail(plot));
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
      const response = await httpClient.post('/api/v2/plot/detail', { id: String(plotId) });

      return response.data;
    } catch (error) {
      console.error(`[PlotApi] 获取地块统计失败 (ID: ${plotId}):`, error);
      return {};
    }
  }

  /**
   * 数据转换: 后端格式 → 前端格式
   *
   * 后端数据格式 (POST /api/v2/plot/detail):
   * {
   *   id: "100",
   *   name: "八角林A区",
   *   area: 150.5,
   *   location_info: "{GeoJSON}",
   *   property_type: "bajiao",
   *   property_category: "forest",
   *   config_data: "{...}"
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
    const type = this._inferPlotType(rawData);

    return {
      id: rawData.id,
      name: rawData.name,
      type: type,
      area: parseFloat(rawData.area || 0),
      location_info: rawData.location_info,
      property_type: rawData.property_type,
      property_type_name: rawData.property_type_name,
      property_category: rawData.property_category,
      property_category_name: rawData.property_category_name,
      ownership: rawData.ownership,
      status: rawData.status,
      owner_username: rawData.owner_username,
      owner_real_name: rawData.owner_real_name,
      current_farming_stage_id: rawData.current_farming_stage_id,
      configData: configData,
      _raw: rawData
    };
  }

  /**
   * 推断地块类型
   *
   * 使用 property_type / property_category 字段直接映射
   * 默认返回 'star-anise'
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
  _inferPlotType(rawData) {
    // 使用新 API 的 property_type 字段，property_category 辅助判断
    const propertyType = rawData.property_type || '';
    const propertyCategory = rawData.property_category || '';

    // 优先用 property_category 区分林/厂/仓
    if (propertyCategory === 'factory') return 'factory';
    if (propertyCategory === 'warehouse') return 'warehouse';
    // forest 子类型区分
    if (propertyType === 'chayou_base') return 'tea-oil';
    // bajiao_base 及其他林地
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
      const response = await httpClient.post(`/api/v2/plot/update`, { id: String(plotId), ...data });
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
      await httpClient.post(`/api/v2/plot/delete`, { id: String(plotId) });
      return true;
    } catch (error) {
      console.error(`[PlotApi] 删除地块失败 (ID: ${plotId}):`, error);
      return false;
    }
  }
}

// 导出单例
export default new PlotApi();
