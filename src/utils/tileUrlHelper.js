/**
 * 瓦片URL生成工具
 * 用于直接从CDN加载WMTS瓦片，避免后端代理
 */

/**
 * CDN基础URL
 * 可以通过环境变量配置
 */
const CDN_BASE_URL = process.env.VUE_APP_TILE_CDN_URL || 'https://image.baiyanai.cn/tiles';

/**
 * 生成CDN瓦片URL
 *
 * @param {string} layer - 图层名称（如：plot_1000_雷哥）
 * @param {string} style - 样式（通常为 'default'）
 * @param {string} tileMatrixSet - 瓦片矩阵集（如：'GoogleMapsCompatible'）
 * @param {number} tileMatrix - 瓦片矩阵（缩放级别）
 * @param {number} row - 瓦片行号
 * @param {number} col - 瓦片列号
 * @param {string} format - 图片格式（如：'png', 'jpg'）
 * @returns {string} 完整的CDN瓦片URL
 *
 * @example
 * // 返回: https://image.baiyanai.cn/tiles/plot_1000_雷哥/default/GoogleMapsCompatible/4/5/3.png
 * getCDNTileUrl('plot_1000_雷哥', 'default', 'GoogleMapsCompatible', 4, 5, 3, 'png')
 */
export function getCDNTileUrl(layer, style, tileMatrixSet, tileMatrix, row, col, format = 'png') {
    // 参数验证
    if (!layer) {
        throw new Error('layer parameter is required');
    }

    // URL编码layer参数（处理中文字符）
    const encodedLayer = encodeURIComponent(layer);

    // 构建URL路径
    // 格式: {baseUrl}/{layer}/{style}/{tileMatrixSet}/{tileMatrix}/{row}/{col}.{format}
    const url = `${ CDN_BASE_URL }/${ encodedLayer }/${ style }/${ tileMatrixSet }/${ tileMatrix }/${ row }/${ col }.${ format }`;

    return url;
}

/**
 * 生成瓦片加载选项（用于配置请求）
 *
 * @param {Object} options - 配置选项
 * @param {AbortSignal} options.signal - 请求取消信号
 * @param {number} options.timeout - 超时时间（毫秒）
 * @param {Object} options.headers - 自定义请求头
 * @returns {Object} fetch请求配置
 */
export function getTileRequestOptions(options = {}) {
    const {
        signal,
        timeout = 10000,
        headers = {}
    } = options;

    return {
        method: 'GET',
        signal,
        headers: {
            Accept: 'image/png,image/*,*/*',
            ...headers
        },
        // 设置超时（通过AbortController）
        ...(timeout && {
            timeout
        })
    };
}

/**
 * 预加载瓦片图片
 * 返回Promise，在图片加载完成或失败后resolve
 *
 * @param {string} url - 瓦片URL
 * @param {AbortSignal} signal - 可选的取消信号
 * @returns {Promise<HTMLImageElement>} 加载的图片元素
 */
export function preloadTileImage(url, signal) {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // 处理取消信号
        if (signal) {
            signal.addEventListener('abort', () => {
                img.src = ''; // 停止加载
                reject(new Error('Request aborted'));
            });
        }

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load tile: ${ url }`));

        img.src = url;
    });
}

/**
 * 批量预加载瓦片
 *
 * @param {Array<{col: number, row: number}>} tiles - 瓦片坐标数组
 * @param {Object} config - 瓦片配置
 * @param {string} config.layer - 图层名称
 * @param {string} config.style - 样式
 * @param {string} config.tileMatrixSet - 瓦片矩阵集
 * @param {number} config.tileMatrix - 缩放级别
 * @param {string} config.format - 图片格式
 * @param {AbortSignal} signal - 可选的取消信号
 * @returns {Promise<Map<string, HTMLImageElement>>} 瓦片键到图片元素的映射
 */
export async function batchLoadTiles(tiles, config, signal) {
    const { layer, style = 'default', tileMatrixSet = 'GoogleMapsCompatible', tileMatrix, format = 'png' } = config;

    const results = new Map();

    const promises = tiles.map(async tile => {
        const { col, row } = tile;
        const url = getCDNTileUrl(layer, style, tileMatrixSet, tileMatrix, row, col, format);
        const key = `${ col }-${ row }`;

        try {
            const img = await preloadTileImage(url, signal);
            results.set(key, img);
            return { key, success: true, img };
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.warn(`Failed to load tile ${ key }:`, error);
            results.set(key, 'error');
            return { key, success: false, error };
        }
    });

    await Promise.allSettled(promises);
    return results;
}

/**
 * 检查CDN是否可用
 * 通过加载一个已知存在的瓦片来测试CDN连接
 *
 * @param {string} layer - 测试用的图层名称
 * @returns {Promise<boolean>} CDN是否可用
 */
export async function checkCDNAvailability(layer) {
    try {
        const testUrl = getCDNTileUrl(layer, 'default', 'GoogleMapsCompatible', 0, 0, 0, 'png');
        const response = await fetch(testUrl, {
            method: 'HEAD',
            cache: 'no-cache'
        });
        return response.ok;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.warn('CDN availability check failed:', error);
        return false;
    }
}

export default {
    getCDNTileUrl,
    getTileRequestOptions,
    preloadTileImage,
    batchLoadTiles,
    checkCDNAvailability
};
