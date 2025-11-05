/**
 * 坐标转换工具集
 * 用于处理 WGS84、GCJ-02 等坐标系之间的转换
 */

// WGS84 转 GCJ-02 (高德坐标)
export function wgs84ToGcj02(lng, lat) {
    if (outOfChina(lng, lat)) {
        return [lng, lat];
    }

    let dLat = transformlat(lng - 105.0, lat - 35.0);
    let dLng = transformlng(lng - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - 0.0066292621 * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((6370996.81 * (1 - 0.0066292621)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (6370996.81 / sqrtMagic * Math.cos(radLat) * Math.PI);
    let mgLat = lat + dLat;
    let mgLng = lng + dLng;
    return [mgLng, mgLat];
}

// 判断点是否在中国范围外
export function outOfChina(lng, lat) {
    if (lng < 72.004 || lng > 137.8347) {
        return true;
    }
    if (lat < 0.8293 || lat > 55.8271) {
        return true;
    }
    return false;
}

// 转换纬度
export function transformlat(lng, lat) {
    let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * Math.PI)) + (20.0 * Math.sin(2.0 * lng * Math.PI))) * 2.0 / 3.0;
    ret += ((20.0 * Math.sin(lat * Math.PI)) + (40.0 * Math.sin(lat / 3.0 * Math.PI))) * 2.0 / 3.0;
    ret += ((160.0 * Math.sin(lat / 12.0 * Math.PI)) + (320 * Math.sin(lat * Math.PI / 30.0))) * 2.0 / 3.0;
    return ret;
}

// 转换经度
export function transformlng(lng, lat) {
    let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += ((20.0 * Math.sin(6.0 * lng * Math.PI)) + (20.0 * Math.sin(2.0 * lng * Math.PI))) * 2.0 / 3.0;
    ret += ((20.0 * Math.sin(lng * Math.PI)) + (40.0 * Math.sin(lng / 3.0 * Math.PI))) * 2.0 / 3.0;
    ret += ((150.0 * Math.sin(lng / 12.0 * Math.PI)) + (300.0 * Math.sin(lng / 30.0 * Math.PI))) * 2.0 / 3.0;
    return ret;
}

// 点是否在多边形内
export function pointInPolygon(point, polygonCoordinates) {
    const [x, y] = point;
    let inside = false;

    for (let i = 0, j = polygonCoordinates.length - 1; i < polygonCoordinates.length; j = i++) {
        const [xi, yi] = polygonCoordinates[i];
        const [xj, yj] = polygonCoordinates[j];

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}

// 计算多边形的中心点（质心）
export function calculatePolygonCenter(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return null;
    }

    let area = 0;
    let x = 0;
    let y = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
        const [xi, yi] = coordinates[i];
        const [xi1, yi1] = coordinates[i + 1];
        const cross = xi * yi1 - xi1 * yi;
        area += cross;
        x += (xi + xi1) * cross;
        y += (yi + yi1) * cross;
    }

    if (area === 0) {
        // 如果面积为0，返回第一个点
        return coordinates[0];
    }

    return [x / (3 * area), y / (3 * area)];
}

// 计算简单的平均中心
export function calculateSimpleCenter(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return null;
    }

    let lngSum = 0;
    let latSum = 0;

    coordinates.forEach(coord => {
        lngSum += coord[0];
        latSum += coord[1];
    });

    return [lngSum / coordinates.length, latSum / coordinates.length];
}
