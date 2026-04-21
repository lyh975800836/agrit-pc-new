/**
 * API 客户端统一处理模块
 * 用于统一管理所有向服务端的请求
 * 支持环境切换、请求取消、错误处理
 */

function getBaseUrl() {
    // 使用环境变量配置
    // 生产环境：返回完整域名 https://ms.baiyanai.cn
    // 开发环境：返回空字符串，使用 vue.config.js 代理
    return process.env.VUE_APP_API_BASE_URL || '';
}

/**
 * 统一的 fetch 请求方法
 * @param {string} endpoint - API 端点（如 '/api/v2/tiles/info'）
 * @param {Object} options - 请求配置
 * @param {Object} options.query - 查询参数
 * @param {string} options.method - HTTP 方法 (GET, POST, etc.)
 * @param {string} options.body - 请求体
 * @param {AbortSignal} options.signal - 请求中止信号
 * @returns {Promise<Object>} 响应数据（JSON格式）
 */
async function request(endpoint, options = {}) {
    const { query = {}, signal, method = 'GET', body } = options;

    try {
        // 构建完整 URL
        const baseUrl = getBaseUrl();
        let url = `${ baseUrl }${ endpoint }`;

        // 添加查询参数
        const queryKeys = Object.keys(query);
        if (queryKeys.length > 0) {
            const params = new URLSearchParams();
            queryKeys.forEach(key => {
                params.append(key, query[key]);
            });
            url += `?${ params.toString() }`;
        }

        // 构建请求头
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 构建 fetch 选项
        const fetchOptions = {
            signal,
            method,
            headers
        };

        // 添加请求体（如果有）
        if (body) {
            fetchOptions.body = body;
        }

        // 发起请求
        const response = await fetch(url, fetchOptions);

        // 检查 HTTP 状态
        if (!response.ok) {
            throw new Error(`HTTP ${ response.status }: ${ endpoint }`);
        }

        // 解析JSON响应
        const data = await response.json();

        // 业务层 401：token 失效，清除状态并跳转登录页
        if (data && data.code === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('user_info');
            if (window.location.hash !== '#/login' && !window.location.pathname.endsWith('/login')) {
                window.location.href = '/#/login';
            }
        }

        return data;
    }
    catch (error) {
        // 区分错误类型
        if (error.name === 'AbortError') {
            console.warn(`请求已取消: ${ endpoint }`);
        }
        else {
            console.error(`API 请求失败: ${ endpoint }`, error.message);
        }
        throw error;
    }
}

/**
 * 获取单个资源 (GET)
 * @param {string} endpoint - API 端点
 * @param {Object} options - 请求配置
 */
async function get(endpoint, options = {}) {
    return request(endpoint, options);
}

/**
 * 获取 WMTS 瓦片信息
 * @param {string} plotId - 地块 ID
 * @param {Object} options - 请求配置
 */
async function getTileInfo(plotId, options = {}) {
    return request('/api/v2/geoprocessing/plot-tiles/info', {
        ...options,
        method: 'POST',
        body: JSON.stringify({ plot_id: String(plotId) })
    });
}

/**
 * 获取地块标记点
 * @param {string} plotId - 地块 ID
 * @param {Object} options - 请求配置
 */
async function getPlotMarkers(plotId, options = {}) {
    return get(`/api/v2/markers/plot/${ plotId }`, options);
}


/**
 * 获取地块列表
 * @param {Object} params - 筛选参数
 * @param {Object} options - 请求配置
 */
async function getPlotsList(params = {}, options = {}) {
    return request('/api/v2/plot/list', {
        ...options,
        method: 'POST',
        body: JSON.stringify({ page: 1, page_size: 100, ...params })
    });
}

/**
 * 获取地块详情
 * @param {string} plotId - 地块 ID
 * @param {Object} options - 请求配置
 */
async function getPlotDetail(plotId, options = {}) {
    return request('/api/v2/plot/detail', {
        ...options,
        method: 'POST',
        body: JSON.stringify({ id: String(plotId) })
    });
}

/**
 * 获取农情列表
 * @param {string} type - 农情类型（standard/warning/service）
 * @param {Object} options - 请求配置
 */
async function getFarmingList(type, options = {}) {
    return get('/api/v2/farming-activity/list', {
        ...options,
        query: { type, page: 1, page_size: 100, ...options.query }
    });
}

/**
 * 获取香料价格列表
 * @param {number} pageNum - 页码
 * @param {number} pageSize - 每页数量
 * @param {Object} options - 请求配置
 */
async function getSpicePrice(pageNum = 1, pageSize = 10, options = {}) {
    return request('/api/v2/spice-price/list', {
        ...options,
        method: 'POST',
        body: JSON.stringify({ page: pageNum, page_size: pageSize })
    });
}

/**
 * 获取最新八角价格
 * @param {Object} options - 请求配置
 */
async function getSpicePriceBajiao(options = {}) {
    return request('/api/v2/spice-price/bajiao', {
        ...options,
        method: 'POST',
        body: JSON.stringify({})
    });
}

export default {
    request,
    get,
    getTileInfo,
    getPlotMarkers,
    getPlotsList,
    getPlotDetail,
    getFarmingList,
    getSpicePrice,
    getSpicePriceBajiao
};
