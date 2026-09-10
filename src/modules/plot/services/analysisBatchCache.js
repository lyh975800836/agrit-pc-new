import { fetchAnalysisSummaryTile, fetchAnalysisTreeOverlay } from './plotDetailDataService';

/**
 * 巡飞批次数据缓存
 *
 * 时间线每切一次批次要串行打两个接口（summary → tiles/trees），再等浏览器下底图 PNG，
 * 来回对比两个批次基本等不起。这里按 plotId:analysisId 把一个批次要用的数据整包缓存，
 * 第二次点同一批次直接同步命中，切换从"重新加载"变成"翻页"。
 *
 * 说明：
 * - 只缓存 JSON。底图 PNG 交给浏览器 HTTP 缓存，预热见 WMTSTileMap.warmLayerTiles
 * - LRU 上限 CACHE_LIMIT，防止长时间停在一个多批次地块上无限增长
 * - 点击和预取可能同时要同一个批次，用 pending 表共用一个请求，不重复打接口
 * - 缓存活到页面刷新为止。回到同一地块时批次数据仍然直出，代价是期间新导入的
 *   批次统计不会自动更新——时间线节点列表每次进页面都会重拉，不影响新批次出现
 */

const CACHE_LIMIT = 12;

/** key -> bundle，Map 的插入顺序即 LRU 顺序 */
const batchCache = new Map();
/** key -> Promise<bundle>，进行中的请求 */
const pendingRequests = new Map();

function buildCacheKey(plotId, analysisId) {
    return `${ String(plotId) }:${ String(analysisId) }`;
}

/**
 * 同步读缓存，命中即可直接渲染
 *
 * @param {string|number} plotId - 地块 ID
 * @param {string|number} analysisId - 批次 ID
 * @returns {{analysisId: string, summary: Object|null, analysisTile: Object|null, treeTiles: Object[], sourceTileSize: number}|null}
 */
export function getCachedBatch(plotId, analysisId) {
    const key = buildCacheKey(plotId, analysisId);
    if (!batchCache.has(key)) return null;

    // 命中后挪到队尾，淘汰时优先丢最久没看的批次
    const bundle = batchCache.get(key);
    batchCache.delete(key);
    batchCache.set(key, bundle);
    return bundle;
}

/**
 * 取批次整包数据：命中缓存直接返回，否则发请求并写入缓存
 *
 * @param {Object} options
 * @param {string|number} options.plotId - 地块 ID
 * @param {string|number} options.analysisId - 批次 ID
 * @param {Function} [options.debug] - 调试日志钩子
 * @returns {Promise<{analysisId: string, summary: Object|null, analysisTile: Object|null, treeTiles: Object[], sourceTileSize: number}>}
 */
export function loadAnalysisBatchBundle({ plotId, analysisId, debug }) {
    const cached = getCachedBatch(plotId, analysisId);
    if (cached) return Promise.resolve(cached);

    const key = buildCacheKey(plotId, analysisId);
    if (pendingRequests.has(key)) return pendingRequests.get(key);

    const task = requestBatchBundle({ plotId, analysisId, debug })
        .then(({ bundle, cacheable }) => {
            // 树冠接口超时/失败的半包不进缓存，否则一次抖动会让这个批次永远缺标点
            if (cacheable) putCache(key, bundle);
            return bundle;
        })
        .finally(() => {
            if (pendingRequests.get(key) === task) {
                pendingRequests.delete(key);
            }
        });

    pendingRequests.set(key, task);
    return task;
}

function putCache(key, bundle) {
    batchCache.delete(key);
    batchCache.set(key, bundle);
    while (batchCache.size > CACHE_LIMIT) {
        batchCache.delete(batchCache.keys().next().value);
    }
}

async function requestBatchBundle({ plotId, analysisId, debug }) {
    const { summary, analysisTile } = await fetchAnalysisSummaryTile(plotId, analysisId, debug);
    const bundle = {
        analysisId: String(analysisId),
        summary,
        analysisTile,
        treeTiles: [],
        sourceTileSize: 512
    };

    // 无专属底图的批次沿用地块底图，也就没有对应的树冠瓦片可拉
    if (!analysisTile) {
        return { bundle, cacheable: true };
    }

    try {
        const overlay = await fetchAnalysisTreeOverlay({ plotId, analysisId, analysisTile });
        bundle.treeTiles = overlay.tiles;
        bundle.sourceTileSize = overlay.sourceTileSize;
        return { bundle, cacheable: true };
    } catch (error) {
        debug?.('树冠瓦片加载失败，本次不缓存', {
            plotId,
            analysisId,
            error: error.message
        });
        return { bundle, cacheable: false };
    }
}
