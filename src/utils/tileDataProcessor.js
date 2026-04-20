/**
 * 地块瓦片数据处理工具
 * 基于新 API：POST /api/v2/plot/list 返回格式
 */

/**
 * 解析 location_info GeoJSON 字符串，返回边界和中心点
 * @param {string|Object} locationInfo
 * @returns {{ center: [number, number], leafletPolygon: Array }|null}
 */
function parseLocationInfo(locationInfo) {
    if (!locationInfo) return null;

    let geojson;
    try {
        geojson = typeof locationInfo === 'string' ? JSON.parse(locationInfo) : locationInfo;
    } catch (e) {
        console.warn('[tileDataProcessor] 解析 location_info 失败:', e);
        return null;
    }

    if (!geojson.coordinates || !geojson.coordinates.length) return null;

    // 兼容两种 coordinates 格式：
    // A. 自定义扁平对象数组: [{longitude, latitude}, ...]  ← 本项目 API 实际返回
    // B. 标准 GeoJSON 嵌套数组: [[[lng, lat], ...]]
    let rawCoords;
    const first = geojson.coordinates[0];
    if (first && typeof first === 'object' && !Array.isArray(first) && 'longitude' in first) {
        // 格式 A：直接是坐标对象数组
        rawCoords = geojson.coordinates;
    } else if (Array.isArray(first)) {
        // 格式 B：标准 GeoJSON，取第一个 ring
        rawCoords = first;
    } else {
        return null;
    }

    if (!rawCoords.length) return null;

    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
    const leafletCoords = [];

    rawCoords.forEach(coord => {
        const lng = Array.isArray(coord) ? coord[0] : coord.longitude;
        const lat = Array.isArray(coord) ? coord[1] : coord.latitude;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        leafletCoords.push([lat, lng]);
    });

    const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];

    // Leaflet 坐标格式: [[lat, lng], ...]
    const leafletPolygon = [leafletCoords];

    return { center, leafletPolygon };
}

/**
 * 将新 API 地块列表数据转换为坐标格式
 * @param {Object} plotListResponse - POST /api/v2/plot/list 的完整响应
 * @returns {Object} 以地块 name 为 key 的坐标映射
 */
export function transformTilesToCoordinates(plotListResponse) {
    const result = {};

    const list = plotListResponse?.data?.list || plotListResponse?.data || [];
    if (!Array.isArray(list)) {
        console.warn('地块列表数据格式不正确');
        return result;
    }

    list.forEach(plot => {
        const parsed = parseLocationInfo(plot.location_info);
        if (!parsed) return;

        const name = plot.name;
        result[name] = {
            id: plot.id,
            name,
            displayName: name,
            center: parsed.center,
            leafletPolygon: parsed.leafletPolygon,
            area: String(plot.area || '0'),
            property_category: plot.property_category,
            property_category_name: plot.property_category_name,
            property_type: plot.property_type,
            property_type_name: plot.property_type_name,
            tileData: plot
        };
    });

    return result;
}

/**
 * 构建地块展示数据对象
 * @param {Object} fieldData - transformTilesToCoordinates 中单条数据
 * @returns {Object}
 */
export function createPlotData(fieldData, plotName) {
    const category = fieldData.property_category || 'forest';
    return {
        id: fieldData.id,
        name: plotName || fieldData.name,
        displayName: plotName || fieldData.displayName,
        area: fieldData.area || '0',
        property_category: category,
        property_category_code: category,           // 兼容 MarkerManager / plotMarkerManager 使用的字段名
        property_category_name: fieldData.property_category_name || '',
        property_type: fieldData.property_type || 'bajiao_base',
        property_type_name: fieldData.property_type_name || '八角',
        lat: fieldData.center[0],
        lng: fieldData.center[1],
        center: fieldData.center
    };
}

/**
 * 验证地块数据完整性
 * @param {Object} fieldData
 * @returns {boolean}
 */
export function isValidFieldData(fieldData) {
    return fieldData && fieldData.center && fieldData.leafletPolygon;
}
