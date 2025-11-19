/**
 * 地块瓦片数据处理工具
 * 用于转换后端瓦片数据为前端地图坐标格式
 */

/**
 * 将后端瓦片数据转换为坐标格式
 * @param {Object} tilesData - 后端返回的瓦片数据
 * @returns {Object} 转换后的坐标数据
 */
export function transformTilesToCoordinates(tilesData) {
    const result = {};
    const margin = 0.002; // 边界边距

    if (!tilesData || !tilesData.data || !Array.isArray(tilesData.data)) {
        console.warn('瓦片数据格式不正确');
        return result;
    }

    tilesData.data.forEach(tile => {
        const name = tile.plot_name || tile.layer_name || `Plot_${tile.plot_id}`;

        // 创建矩形边界坐标
        const leafletPolygon = [[
            [tile.min_lat - margin, tile.min_lon - margin],
            [tile.min_lat - margin, tile.max_lon + margin],
            [tile.max_lat + margin, tile.max_lon + margin],
            [tile.max_lat + margin, tile.min_lon - margin],
            [tile.min_lat - margin, tile.min_lon - margin]
        ]];

        // 计算中心点
        const center = [
            (tile.min_lat + tile.max_lat) / 2,
            (tile.min_lon + tile.max_lon) / 2
        ];

        result[name] = {
            name,
            displayName: tile.plot_name || name,
            center,
            leafletPolygon,
            area: tile.plot_area ? String(tile.plot_area) : '0',
            property_category_code: tile.property_category_code,
            property_category_name: tile.property_category_name,
            property_type_name: tile.property_type_name,
            tileData: tile
        };
    });

    return result;
}

/**
 * 构建地块数据对象
 * @param {Object} fieldData - 转换后的地块字段数据
 * @returns {Object} 地块展示数据
 */
export function createPlotData(fieldData, plotName) {
    return {
        name: plotName || fieldData.displayName || fieldData.name,
        displayName: plotName || fieldData.displayName || fieldData.name,
        area: fieldData.area || '30',
        output: '1970',
        property_category_code: fieldData.property_category_code || 'forest',
        property_type_name: fieldData.property_type_name || '八角基地',
        lat: fieldData.center[0],
        lng: fieldData.center[1]
    };
}

/**
 * 验证瓦片数据完整性
 * @param {Object} fieldData - 地块数据
 * @returns {Boolean} 数据是否有效
 */
export function isValidFieldData(fieldData) {
    return fieldData && fieldData.center && (fieldData.leaflet_polygon || fieldData.leafletPolygon);
}
