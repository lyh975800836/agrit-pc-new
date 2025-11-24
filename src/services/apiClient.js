/**
 * API 客户端统一处理模块
 * 用于统一管理所有向服务端的请求
 * 支持环境切换、请求取消、错误处理
 */

// 获取基础 URL - 根据环境切换
function getBaseUrl() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
    // 生产环境：使用后端服务的完整地址
        return 'http://43.136.169.150:8000';
    }

    // 开发环境：使用相对路径，vue.config.js 会代理
    return '';
}

/**
 * 统一的 fetch 请求方法
 * @param {string} endpoint - API 端点（如 '/api/v1/tiles/info'）
 * @param {Object} options - 请求配置
 * @param {Object} options.query - 查询参数
 * @param {AbortSignal} options.signal - 请求中止信号
 * @returns {Promise<Object>} 响应数据（JSON格式）
 */
async function request(endpoint, options = {}) {
    const { query = {}, signal } = options;

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

        // 发起请求
        const response = await fetch(url, { signal });

        // 检查 HTTP 状态
        if (!response.ok) {
            throw new Error(`HTTP ${ response.status }: ${ endpoint }`);
        }

        // 解析JSON响应
        const data = await response.json();
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
    return get('/api/v1/geoprocessing/plot-tiles/info', {
        ...options,
        query: { plot_id: plotId, ...options.query }
    });
}

/**
 * 获取地块标记点
 * @param {string} plotId - 地块 ID
 * @param {Object} options - 请求配置
 */
async function getPlotMarkers(plotId, options = {}) {
    return get(`/api/v1/markers/plot/${ plotId }`, options);
}

/**
 * 获取 WMTS 瓦片图像
 * @param {Object} params - 瓦片参数
 * @param {string} params.layer - 图层名称
 * @param {number} params.tilematrix - 瓦片矩阵（缩放级别）
 * @param {number} params.tilerow - 瓦片行号
 * @param {number} params.tilecol - 瓦片列号
 * @param {Object} options - 请求配置
 */
async function getWmtsTile(params, options = {}) {
    const query = {
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        format: 'image/png',
        ...params
    };

    return get('/api/v1/wmts/request', {
        ...options,
        query
    });
}

/**
 * 获取地块列表
 * @param {Object} options - 请求配置
 */
async function getPlotsList(options = {}) {
    return get('/api/v1/geoprocessing/plot-tiles/list', options);
}

export default {
    request,
    get,
    getTileInfo,
    getPlotMarkers,
    getWmtsTile,
    getPlotsList
};
