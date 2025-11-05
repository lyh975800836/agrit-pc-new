/**
 * 地图导航和视图管理工具
 */

/**
 * 根据特征集计算边界
 * @param {array} features - GeoJSON特征数组
 * @returns {L.LatLngBounds} Leaflet边界对象
 */
export function calculateBoundsFromFeatures(features) {
    if (!features || features.length === 0) {
        return null;
    }

    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;

    features.forEach(feature => {
        if (feature.geometry && feature.geometry.coordinates) {
            const coords = feature.geometry.coordinates;
            flattenCoordinates(coords).forEach(([lng, lat]) => {
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                maxLng = Math.max(maxLng, lng);
            });
        }
    });

    return {
        south: minLat,
        north: maxLat,
        west: minLng,
        east: maxLng
    };
}

/**
 * 扁平化坐标数组
 * @param {array} coords - 嵌套的坐标数组
 * @returns {array} 扁平化的坐标数组
 */
function flattenCoordinates(coords) {
    let result = [];
    if (!coords || coords.length === 0) {
        return result;
    }

    // 检查是否是坐标对 [lng, lat]
    if (typeof coords[0] === 'number') {
        return [coords];
    }

    // 递归处理嵌套数组
    coords.forEach(coord => {
        if (typeof coord[0] === 'number') {
            result.push(coord);
        } else {
            result = result.concat(flattenCoordinates(coord));
        }
    });

    return result;
}

/**
 * 获取特征的中心点
 * @param {object} feature - GeoJSON特征
 * @returns {array} [lng, lat] 坐标对
 */
export function getFeatureCenter(feature) {
    if (!feature || !feature.geometry) {
        return [23.9, 106.6];
    }

    const coords = feature.geometry.coordinates;
    const flatCoords = flattenCoordinates(coords);

    if (flatCoords.length === 0) {
        return [23.9, 106.6];
    }

    let lngSum = 0;
    let latSum = 0;

    flatCoords.forEach(([lng, lat]) => {
        lngSum += lng;
        latSum += lat;
    });

    return [lngSum / flatCoords.length, latSum / flatCoords.length];
}

/**
 * 根据特征调整地图视图
 * @param {object} map - Leaflet地图实例
 * @param {array} features - GeoJSON特征数组
 * @param {number} padding - 内边距 (默认 0.01)
 * @returns {void}
 */
export function fitMapToFeatures(map, features, padding = 0.01) {
    if (!map || !features || features.length === 0) {
        return;
    }

    const bounds = calculateBoundsFromFeatures(features);
    if (!bounds) {
        return;
    }

    // 添加边距
    const latPadding = (bounds.north - bounds.south) * padding;
    const lngPadding = (bounds.east - bounds.west) * padding;

    const boundsWithPadding = [
        [bounds.south - latPadding, bounds.west - lngPadding],
        [bounds.north + latPadding, bounds.east + lngPadding]
    ];

    try {
        map.fitBounds(boundsWithPadding);
    } catch (e) {
        console.error('调整地图视图失败:', e);
    }
}

/**
 * 缩放到特定地块
 * @param {object} map - Leaflet地图实例
 * @param {array} center - [lng, lat] 中心坐标
 * @param {number} zoom - 缩放级别 (默认 14)
 * @returns {void}
 */
export function zoomToLocation(map, center, zoom = 14) {
    if (!map || !center || center.length < 2) {
        return;
    }

    map.setView([center[1], center[0]], zoom);
}

/**
 * 根据地块标记调整地图视图
 * @param {object} map - Leaflet地图实例
 * @param {array} plotMarkerLayers - 地块标记层数组
 * @returns {void}
 */
export function fitMapToMarkers(map, plotMarkerLayers) {
    if (!map || !plotMarkerLayers || plotMarkerLayers.length === 0) {
        return;
    }

    let minLat = 90;
    let maxLat = -90;
    let minLng = 180;
    let maxLng = -180;
    let hasValidMarker = false;

    plotMarkerLayers.forEach(entry => {
        if (entry.layer && entry.layer.getLatLng) {
            const latLng = entry.layer.getLatLng();
            minLat = Math.min(minLat, latLng.lat);
            maxLat = Math.max(maxLat, latLng.lat);
            minLng = Math.min(minLng, latLng.lng);
            maxLng = Math.max(maxLng, latLng.lng);
            hasValidMarker = true;
        }
    });

    if (!hasValidMarker) {
        return;
    }

    const bounds = [[minLat - 0.01, minLng - 0.01], [maxLat + 0.01, maxLng + 0.01]];
    map.fitBounds(bounds);
}
