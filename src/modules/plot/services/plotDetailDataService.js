import apiClient from '@/services/apiClient';
import { parseLocationInfo } from '@/utils/tileDataProcessor';
import {
    filterPlotsByFeature,
    getPlotListPageInfo
} from '@/utils/adminRegionAggregator';

const DEFAULT_TREE_TIMEOUT = 8000;

export function getPlotType(tileRecord, routeType) {
    if (tileRecord) {
        return mapPropertyType(tileRecord.property_type, tileRecord.property_category);
    }

    if (routeType === 'factory') return 'factory';
    if (routeType === 'warehouse') return 'warehouse';
    if (routeType === '茶油基地' || routeType === 'tea-oil') return 'tea-oil';
    return 'star-anise';
}

export function buildPlotData(tileRecord, { plotName, regionName, defaultArea, routeType }) {
    const parsedLocation = parseLocationInfo(tileRecord?.location_info);
    const area = tileRecord?.area != null ? String(tileRecord.area) : String(defaultArea);

    return {
        id: tileRecord?.id || '',
        name: tileRecord?.name || plotName,
        district: regionName,
        area,
        type: getPlotType(tileRecord, routeType),
        status: tileRecord?.status,
        property_type: tileRecord?.property_type,
        property_type_name: tileRecord?.property_type_name,
        property_category: tileRecord?.property_category,
        property_category_name: tileRecord?.property_category_name,
        ownership: tileRecord?.ownership,
        owner_username: tileRecord?.owner_username,
        owner_real_name: tileRecord?.owner_real_name,
        location_info: tileRecord?.location_info,
        center: parsedLocation?.center || null,
        leafletPolygon: parsedLocation?.leafletPolygon || null
    };
}

export function getPlotListConfigFallback(record = {}, plotData = {}) {
    const safeRecord = record || {};
    const safePlotData = plotData || {};
    const area = safeRecord.area ?? safePlotData.area;
    const ownerName = safeRecord.owner_real_name
        || safeRecord.owner_username
        || safeRecord.ownership
        || safePlotData.owner_real_name
        || safePlotData.owner_username
        || safePlotData.ownership
        || '未知';

    return {
        owner_name: ownerName,
        owner_age: safeRecord.owner_age || 0,
        owner_avatar: safeRecord.owner_avatar || '/images/default-avator.jpg',
        owner_star_rank: safeRecord.owner_star_rank || 4,
        total_area: area != null ? String(area) : '0',
        total_yield: safeRecord.total_yield || safeRecord.yield || '0',
        yield_per_mu: safeRecord.yield_per_mu || '0'
    };
}

export async function resolvePlotRecord({ plotName, regionName, cityAdcode, regionAdcode, debug }) {
    try {
        const result = await apiClient.getPlotsList({ keyword: plotName });
        if (result && result.code === 0) {
            const list = Array.isArray(result.data) ? result.data : (result.data?.list || []);
            debug?.('plot/list keyword 查询完成', {
                keyword: plotName,
                count: list.length,
                sampleNames: getDebugPlotNames(list)
            });
            const record = pickPlotRecordFromList(list, plotName);
            if (record) {
                debug?.('keyword 查询命中地块', {
                    plotId: record.id,
                    name: record.name
                });
                return record;
            }
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch plot tile record:', error);
    }

    const allPlots = await fetchAllPlotsForDetail();
    debug?.('plot/list 全量查询完成', {
        count: allPlots.length,
        sampleNames: getDebugPlotNames(allPlots)
    });

    const allMatchedRecord = pickPlotRecordFromList(allPlots, plotName);
    if (allMatchedRecord) {
        debug?.('全量名称匹配命中地块', {
            plotId: allMatchedRecord.id,
            name: allMatchedRecord.name
        });
        return allMatchedRecord;
    }

    const regionPlots = await filterPlotsByCurrentRegion(allPlots, {
        regionName,
        cityAdcode,
        regionAdcode,
        debug
    });
    debug?.('当前区县坐标过滤完成', {
        region: regionName,
        cityAdcode,
        regionAdcode,
        count: regionPlots.length,
        sampleNames: getDebugPlotNames(regionPlots)
    });

    return pickPlotRecordFromList(regionPlots, plotName, {
        allowSingle: true
    });
}

export async function fetchBaseTileInfo(plotId, debug) {
    try {
        const tileInfoResult = await apiClient.getTileInfo(plotId);
        const tileInfo = tileInfoResult?.data || null;
        debug?.('基础瓦片可用性检查完成', {
            plotId,
            usable: isUsableTileInfo(tileInfo),
            tileDir: tileInfo?.tile_dir,
            layerName: tileInfo?.layer_name,
            maxZoomLevel: tileInfo?.max_zoom_level,
            maxTileX: tileInfo?.max_tile_x,
            maxTileY: tileInfo?.max_tile_y,
            tileCount: tileInfo?.tile_count
        });
        return tileInfo;
    } catch (error) {
        debug?.('基础瓦片可用性检查失败', {
            plotId,
            error: error.message
        });
        return null;
    }
}

export function isUsableTileInfo(tileInfo) {
    if (!tileInfo || typeof tileInfo !== 'object') {
        return false;
    }

    const hasLayerName = Boolean(
        (typeof tileInfo.tile_dir === 'string' && tileInfo.tile_dir.trim())
        || (typeof tileInfo.layer_name === 'string' && tileInfo.layer_name.trim())
    );
    const maxZoom = Number(tileInfo.max_zoom_level);
    const maxTileX = Number(tileInfo.max_tile_x);
    const maxTileY = Number(tileInfo.max_tile_y);
    const tileCount = Number(tileInfo.tile_count);

    return hasLayerName
        || (Number.isFinite(maxZoom) && maxZoom > 0)
        || (Number.isFinite(maxTileX) && maxTileX > 0)
        || (Number.isFinite(maxTileY) && maxTileY > 0)
        || (Number.isFinite(tileCount) && tileCount > 0);
}

export async function fetchLatestWudaAnalysis(plotId) {
    const listResult = await apiClient.getAnalysisList({
        // eslint-disable-next-line camelcase
        plot_id: String(plotId),
        // eslint-disable-next-line camelcase
        factory_type: 'wuda',
        status: 2
    });
    const list = listResult?.data?.list;
    return Array.isArray(list) && list.length ? list[0] : null;
}

export async function fetchWudaSummaryTile(plotId, analysisId, debug) {
    const summaryResult = await apiClient.getWudaSummary(plotId, analysisId);
    const summary = summaryResult?.data || null;
    const analysisTile = summary?.analysis_tile || null;

    if (analysisTile && !isValidAnalysisTile(analysisTile)) {
        debug?.('analysis_tile 不完整，继续使用基础瓦片', {
            plotId,
            analysisId,
            tileDir: analysisTile?.tile_dir,
            layerName: analysisTile?.layer_name,
            maxZoomLevel: analysisTile?.max_zoom_level,
            maxTileX: analysisTile?.max_tile_x,
            maxTileY: analysisTile?.max_tile_y
        });
        return { summary, analysisTile: null };
    }

    return { summary, analysisTile };
}

export async function fetchWudaTreeOverlay({ plotId, analysisId, analysisTile, timeout = DEFAULT_TREE_TIMEOUT }) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const result = await apiClient.getWudaTileTrees(
            buildWudaTileTreesParams(plotId, analysisId, analysisTile),
            { signal: controller.signal }
        );

        return {
            tiles: result?.data?.tiles || [],
            sourceTileSize: result?.data?.source_tile_size || 512
        };
    } finally {
        clearTimeout(timer);
    }
}

function mapPropertyType(propertyType, propertyCategory) {
    if (propertyCategory === 'factory') return 'factory';
    if (propertyCategory === 'warehouse') return 'warehouse';
    if (propertyType === 'chayou_base') return 'tea-oil';
    return 'star-anise';
}

function pickPlotRecordFromList(list, plotName, options = {}) {
    const safeList = Array.isArray(list) ? list : [];
    const normalizedPlotName = normalizePlotName(plotName);
    const { allowSingle = false } = options;
    if (!normalizedPlotName) {
        return allowSingle && safeList.length === 1 ? safeList[0] : null;
    }

    return safeList.find((item) => normalizePlotName(item.name) === normalizedPlotName)
        || safeList.find((item) => normalizePlotName(item.name).includes(normalizedPlotName))
        || safeList.find((item) => normalizedPlotName.includes(normalizePlotName(item.name)))
        || (allowSingle && safeList.length === 1 ? safeList[0] : null);
}

async function fetchAllPlotsForDetail() {
    const pageSize = 100;
    const maxPages = 50;
    const plots = [];

    try {
        for (let page = 1; page <= maxPages; page += 1) {
            const response = await apiClient.getPlotsList({
                page,
                // eslint-disable-next-line camelcase
                page_size: pageSize
            });
            const { list, total } = getPlotListPageInfo(response);
            plots.push(...list);

            if (!list.length) break;
            if (total !== null && plots.length >= total) break;
            if (total === null && list.length < pageSize) break;
        }
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch full plot list for detail:', error);
    }

    return plots;
}

async function filterPlotsByCurrentRegion(plots, { regionName, cityAdcode, regionAdcode, debug }) {
    const regionFeature = await loadCurrentRegionFeature({
        regionName,
        cityAdcode,
        regionAdcode,
        debug
    });
    return regionFeature ? filterPlotsByFeature(plots, regionFeature) : plots;
}

async function loadCurrentRegionFeature({ regionName, cityAdcode, regionAdcode, debug }) {
    const normalizedCityAdcode = String(cityAdcode || '');
    const normalizedRegionAdcode = String(regionAdcode || '');
    if (!normalizedCityAdcode && !normalizedRegionAdcode && !regionName) {
        return null;
    }

    try {
        const cityDataImport = await import(`@/assets/mapdata/guangxi-cities/${ normalizedCityAdcode }.json`);
        const cityData = cityDataImport.default || cityDataImport;
        const features = cityData?.features || [];

        const feature = features.find(feature => {
            const featureAdcode = String(feature.properties?.adcode || '');
            return (normalizedRegionAdcode && featureAdcode === normalizedRegionAdcode)
                || feature.properties?.name === regionName;
        }) || null;

        debug?.('区县边界匹配完成', {
            cityAdcode: normalizedCityAdcode,
            regionAdcode: normalizedRegionAdcode,
            regionName,
            found: Boolean(feature),
            featureName: feature?.properties?.name || null
        });
        return feature;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load current region feature:', error);
    }

    return null;
}

function getDebugPlotNames(list) {
    return (Array.isArray(list) ? list : [])
        .slice(0, 5)
        .map(item => item?.name)
        .filter(Boolean);
}

function normalizePlotName(name) {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/[\s·•._\-—()（）【】[\]#号]/g, '');
}

function isValidAnalysisTile(tile) {
    const maxTileX = Number(tile?.max_tile_x);
    const maxTileY = Number(tile?.max_tile_y);
    const maxZoom = Number(tile?.max_zoom_level);
    const layerName = tile?.layer_name || tile?.tile_dir;

    return Boolean(layerName)
        && Number.isFinite(maxTileX)
        && Number.isFinite(maxTileY)
        && Number.isFinite(maxZoom);
}

function buildWudaTileTreesParams(plotId, analysisId, analysisTile) {
    return {
        // eslint-disable-next-line camelcase
        plot_id: String(plotId),
        // eslint-disable-next-line camelcase
        analysis_id: String(analysisId),
        // eslint-disable-next-line camelcase
        plot_tile_id: '0',
        zoom: analysisTile.max_zoom_level,
        // eslint-disable-next-line camelcase
        tile_range: {
            // eslint-disable-next-line camelcase
            min_tile_x: 0,
            // eslint-disable-next-line camelcase
            min_tile_y: 0,
            // eslint-disable-next-line camelcase
            max_tile_x: analysisTile.max_tile_x,
            // eslint-disable-next-line camelcase
            max_tile_y: analysisTile.max_tile_y
        },
        // eslint-disable-next-line camelcase
        source_layer: 'base'
    };
}
