import httpClient from '../http/client';

/**
 * 价格API层
 *
 * 功能:
 * - 当日价格获取
 * - 历史价格查询
 * - 价格趋势分析
 *
 * @class PriceApi
 */
class PriceApi {
  /**
   * 获取今日八角价格
   *
   * @returns {Promise<Object>} 今日价格信息
   */
  async getTodaySpicePrice() {
    try {
      const response = await httpClient.get('/api/v1/price/today');

      return {
        date: response.data.date || new Date().toISOString().split('T')[0],
        price: parseFloat(response.data.price || 0),
        unit: response.data.unit || '元/斤',
        change: parseFloat(response.data.change || 0),
        changePercent: parseFloat(response.data.change_percent || 0),
        trend: response.data.trend || 'stable' // up, down, stable
      };
    } catch (error) {
      console.error('[PriceApi] 获取今日价格失败:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        price: 0,
        unit: '元/斤',
        change: 0,
        changePercent: 0,
        trend: 'stable'
      };
    }
  }

  /**
   * 获取历史价格数据
   *
   * @param {number} days - 查询天数 (默认30天)
   * @returns {Promise<Array>} 历史价格列表
   */
  async getPriceHistory(days = 30) {
    try {
      const response = await httpClient.get('/api/v1/price/history', {
        params: { days }
      });

      return (response.data || []).map(item => ({
        date: item.date,
        price: parseFloat(item.price || 0),
        unit: item.unit || '元/斤'
      }));
    } catch (error) {
      console.error('[PriceApi] 获取历史价格失败:', error);
      return [];
    }
  }

  /**
   * 获取价格趋势数据
   *
   * @param {number} days - 查询天数
   * @returns {Promise<Object>} 趋势数据
   */
  async getPriceTrend(days = 30) {
    try {
      const history = await this.getPriceHistory(days);

      if (history.length === 0) {
        return {
          average: 0,
          max: 0,
          min: 0,
          trend: 'stable'
        };
      }

      const prices = history.map(h => h.price);
      const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const max = Math.max(...prices);
      const min = Math.min(...prices);

      // 简单趋势判断: 比较前半段和后半段平均值
      const mid = Math.floor(history.length / 2);
      const firstHalf = prices.slice(0, mid);
      const secondHalf = prices.slice(mid);
      const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;

      let trend = 'stable';
      if (secondAvg > firstAvg * 1.05) {
        trend = 'up';
      } else if (secondAvg < firstAvg * 0.95) {
        trend = 'down';
      }

      return {
        average: parseFloat(average.toFixed(2)),
        max,
        min,
        trend,
        data: history
      };
    } catch (error) {
      console.error('[PriceApi] 获取价格趋势失败:', error);
      return {
        average: 0,
        max: 0,
        min: 0,
        trend: 'stable',
        data: []
      };
    }
  }

  /**
   * 获取工厂收购价格
   *
   * @returns {Promise<Object>} 收购价格信息
   */
  async getFactoryPurchasePrice() {
    try {
      const response = await httpClient.get('/api/v1/price/factory-purchase');

      return {
        freshFruit: parseFloat(response.data.fresh_fruit || 0), // 鲜果收购价
        processing: parseFloat(response.data.processing || 0),  // 加工价格
        unit: response.data.unit || '元/斤'
      };
    } catch (error) {
      console.error('[PriceApi] 获取工厂收购价失败:', error);
      return {
        freshFruit: 0,
        processing: 0,
        unit: '元/斤'
      };
    }
  }
}

// 导出单例
export default new PriceApi();
