import axios from 'axios';

/**
 * HTTP客户端封装
 *
 * 功能:
 * - 统一的请求/响应拦截器
 * - 指数退避重试机制
 * - 错误处理
 * - 请求日志记录
 *
 * @class HttpClient
 */
class HttpClient {
  constructor(config = {}) {
    this.client = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL || '',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config
    });

    this.setupInterceptors();
  }

  /**
   * 配置请求/响应拦截器
   * @private
   */
  setupInterceptors() {
    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`);

        // 可以在这里添加认证token
        // const token = localStorage.getItem('auth_token');
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }

        return config;
      },
      error => {
        console.error('[HTTP] 请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      response => {
        // 记录响应时间
        const duration = Date.now() - (response.config._startTime || Date.now());
        console.log(`[HTTP] ${response.config.url} - ${response.status} (${duration}ms)`);

        return response;
      },
      this.handleError.bind(this)
    );
  }

  /**
   * 错误处理和重试机制
   *
   * 策略: 指数退避 (1s, 2s, 4s...)
   * 最大重试次数: 3次
   *
   * @param {Error} error - Axios错误对象
   * @returns {Promise}
   * @private
   */
  async handleError(error) {
    const { config, response } = error;

    // 初始化重试计数
    if (!config._retryCount) {
      config._retryCount = 0;
      config._startTime = Date.now();
    }

    const maxRetries = config.maxRetries !== undefined ? config.maxRetries : 3;

    // 判断是否应该重试
    const shouldRetry = this._shouldRetry(error, config._retryCount, maxRetries);

    if (shouldRetry) {
      config._retryCount++;

      // 指数退避延迟: 1s, 2s, 4s
      const delay = Math.pow(2, config._retryCount) * 1000;

      console.log(
        `[HTTP] 重试 ${config.url} (${config._retryCount}/${maxRetries}) - ` +
        `等待 ${delay}ms`
      );

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.client(config);
    }

    // 超过重试次数或不应重试,记录错误并拒绝
    console.error(
      `[HTTP] 请求失败 ${config.url}:`,
      response?.status || error.code,
      response?.data?.message || error.message
    );

    return Promise.reject(error);
  }

  /**
   * 判断是否应该重试请求
   *
   * @param {Error} error - 错误对象
   * @param {number} retryCount - 当前重试次数
   * @param {number} maxRetries - 最大重试次数
   * @returns {boolean}
   * @private
   */
  _shouldRetry(error, retryCount, maxRetries) {
    // 已达到最大重试次数
    if (retryCount >= maxRetries) {
      return false;
    }

    // 没有响应(网络错误) - 应该重试
    if (!error.response) {
      return true;
    }

    // 服务器错误 (5xx) - 应该重试
    if (error.response.status >= 500) {
      return true;
    }

    // 请求超时 - 应该重试
    if (error.code === 'ECONNABORTED') {
      return true;
    }

    // 429 (Too Many Requests) - 应该重试
    if (error.response.status === 429) {
      return true;
    }

    // 其他情况不重试
    return false;
  }

  /**
   * GET 请求
   *
   * @param {string} url - 请求URL
   * @param {Object} config - Axios配置
   * @returns {Promise}
   */
  get(url, config = {}) {
    return this.client.get(url, config);
  }

  /**
   * POST 请求
   *
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} config - Axios配置
   * @returns {Promise}
   */
  post(url, data, config = {}) {
    return this.client.post(url, data, config);
  }

  /**
   * PUT 请求
   *
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} config - Axios配置
   * @returns {Promise}
   */
  put(url, data, config = {}) {
    return this.client.put(url, data, config);
  }

  /**
   * DELETE 请求
   *
   * @param {string} url - 请求URL
   * @param {Object} config - Axios配置
   * @returns {Promise}
   */
  delete(url, config = {}) {
    return this.client.delete(url, config);
  }

  /**
   * PATCH 请求
   *
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {Object} config - Axios配置
   * @returns {Promise}
   */
  patch(url, data, config = {}) {
    return this.client.patch(url, data, config);
  }

  /**
   * 添加请求拦截器
   *
   * @param {Function} onFulfilled - 成功回调
   * @param {Function} onRejected - 失败回调
   * @returns {number} 拦截器ID
   */
  addRequestInterceptor(onFulfilled, onRejected) {
    return this.client.interceptors.request.use(onFulfilled, onRejected);
  }

  /**
   * 添加响应拦截器
   *
   * @param {Function} onFulfilled - 成功回调
   * @param {Function} onRejected - 失败回调
   * @returns {number} 拦截器ID
   */
  addResponseInterceptor(onFulfilled, onRejected) {
    return this.client.interceptors.response.use(onFulfilled, onRejected);
  }

  /**
   * 移除请求拦截器
   *
   * @param {number} id - 拦截器ID
   */
  removeRequestInterceptor(id) {
    this.client.interceptors.request.eject(id);
  }

  /**
   * 移除响应拦截器
   *
   * @param {number} id - 拦截器ID
   */
  removeResponseInterceptor(id) {
    this.client.interceptors.response.eject(id);
  }
}

// 导出单例
export default new HttpClient();
