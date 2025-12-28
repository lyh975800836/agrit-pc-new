import httpClient from '../http/client';

/**
 * 地图API层
 *
 * 功能:
 * - 区域边界数据获取
 * - 地块瓦片数据获取
 * - 地图图层管理
 *
 * @class MapApi
 */
class MapApi {
  /**
   * 获取区域边界数据
   *
   * @param {string} regionName - 区域名称
   * @returns {Promise<Object>} GeoJSON边界数据
   */
  async getRegionBoundary(regionName) {
    try {
      const response = await httpClient.get('/api/v1/map/region-boundary', {
        params: { region: regionName }
      });

      return response.data || null;
    } catch (error) {
      console.error(`[MapApi] 获取区域边界失败 (Region: ${regionName}):`, error);
      return null;
    }
  }

  /**
   * 获取地块瓦片数据
   *
   * @param {string} regionName - 区域名称
   * @param {Object} options - 可选参数
   * @returns {Promise<Array>} 瓦片URL列表
   */
  async getPlotTiles(regionName, options = {}) {
    try {
      const response = await httpClient.get('/api/v1/map/plot-tiles', {
        params: {
          region: regionName,
          ...options
        }
      });

      return response.data || [];
    } catch (error) {
      console.error(`[MapApi] 获取地块瓦片失败 (Region: ${regionName}):`, error);
      return [];
    }
  }

  /**
   * 获取地块几何数据
   *
   * @param {string} plotId - 地块ID
   * @returns {Promise<Object>} GeoJSON几何数据
   */
  async getPlotGeometry(plotId) {
    try {
      const response = await httpClient.get('/api/v1/map/plot-geometry', {
        params: { id: plotId }
      });

      return response.data || null;
    } catch (error) {
      console.error(`[MapApi] 获取地块几何失败 (ID: ${plotId}):`, error);
      return null;
    }
  }

  /**
   * 获取地块中心点坐标
   *
   * @param {string} plotId - 地块ID
   * @returns {Promise<Array|null>} [lng, lat] 或 null
   */
  async getPlotCenter(plotId) {
    try {
      const response = await httpClient.get('/api/v1/map/plot-center', {
        params: { id: plotId }
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return null;
    } catch (error) {
      console.error(`[MapApi] 获取地块中心点失败 (ID: ${plotId}):`, error);
      return null;
    }
  }

  /**
   * 搜索地块
   *
   * @param {Object} searchParams - 搜索参数
   * @returns {Promise<Array>} 地块列表
   */
  async searchPlots(searchParams) {
    try {
      const response = await httpClient.get('/api/v1/map/search-plots', {
        params: searchParams
      });

      return response.data || [];
    } catch (error) {
      console.error('[MapApi] 搜索地块失败:', error);
      return [];
    }
  }
}

// 导出单例
export default new MapApi();
