import { parseLocationInfo } from './tileDataProcessor';

function getFeatureKey(feature) {
    const properties = feature?.properties || {};
    return String(properties.adcode || properties.code || properties.name || '');
}

function getFeatureName(feature) {
    return feature?.properties?.name || getFeatureKey(feature);
}

function normalizePlotListResponse(response) {
    const data = response?.data;

    if (Array.isArray(data?.list)) {
        return data.list;
    }

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(response?.list)) {
        return response.list;
    }

    return [];
}

function normalizePlotListTotal(response) {
    const total = response?.data?.total ?? response?.total;
    const numericTotal = Number(total);
    return Number.isFinite(numericTotal) ? numericTotal : null;
}

function getPlotCenterLngLat(plot) {
    const directLng = plot?.longitude ?? plot?.lng;
    const directLat = plot?.latitude ?? plot?.lat;

    if (Number.isFinite(Number(directLng)) && Number.isFinite(Number(directLat))) {
        return [Number(directLng), Number(directLat)];
    }

    const parsedLocation = parseLocationInfo(plot?.location_info);
    if (!parsedLocation?.center) {
        return null;
    }

    const [lat, lng] = parsedLocation.center;
    if (!Number.isFinite(Number(lng)) || !Number.isFinite(Number(lat))) {
        return null;
    }

    return [Number(lng), Number(lat)];
}

function isPointOnSegment(point, start, end) {
    const [px, py] = point;
    const [sx, sy] = start;
    const [ex, ey] = end;
    const cross = (px - sx) * (ey - sy) - (py - sy) * (ex - sx);

    if (Math.abs(cross) > 1e-10) {
        return false;
    }

    return px >= Math.min(sx, ex) - 1e-10
        && px <= Math.max(sx, ex) + 1e-10
        && py >= Math.min(sy, ey) - 1e-10
        && py <= Math.max(sy, ey) + 1e-10;
}

function isPointInRing(point, ring) {
    if (!Array.isArray(ring) || ring.length < 3) {
        return false;
    }

    let inside = false;
    const [x, y] = point;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
        const current = ring[i];
        const previous = ring[j];

        if (isPointOnSegment(point, previous, current)) {
            return true;
        }

        const [xi, yi] = current;
        const [xj, yj] = previous;
        const intersects = ((yi > y) !== (yj > y))
            && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

        if (intersects) {
            inside = !inside;
        }
    }

    return inside;
}

function isPointInPolygon(point, polygonCoordinates) {
    if (!Array.isArray(polygonCoordinates) || !polygonCoordinates.length) {
        return false;
    }

    const [outerRing, ...holes] = polygonCoordinates;
    if (!isPointInRing(point, outerRing)) {
        return false;
    }

    return !holes.some(ring => isPointInRing(point, ring));
}

function isPointInFeature(point, feature) {
    const geometry = feature?.geometry;

    if (!geometry) {
        return false;
    }

    if (geometry.type === 'Polygon') {
        return isPointInPolygon(point, geometry.coordinates);
    }

    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(polygon => isPointInPolygon(point, polygon));
    }

    return false;
}

export function getPlotListPageInfo(response) {
    return {
        list: normalizePlotListResponse(response),
        total: normalizePlotListTotal(response)
    };
}

export function aggregatePlotsByFeatures(plots = [], features = []) {
    const regionStats = {};
    const unmatchedPlots = [];

    features.forEach(feature => {
        const key = getFeatureKey(feature);

        if (!key) {
            return;
        }

        regionStats[key] = {
            key,
            adcode: feature?.properties?.adcode,
            name: getFeatureName(feature),
            count: 0,
            plots: [],
            feature
        };
    });

    plots.forEach(plot => {
        const point = getPlotCenterLngLat(plot);

        if (!point) {
            unmatchedPlots.push(plot);
            return;
        }

        const matchedFeature = features.find(feature => isPointInFeature(point, feature));
        const key = getFeatureKey(matchedFeature);

        if (!key || !regionStats[key]) {
            unmatchedPlots.push(plot);
            return;
        }

        regionStats[key].count += 1;
        regionStats[key].plots.push({
            ...plot,
            _mapCenter: point
        });
    });

    return {
        regionStats,
        activeRegionNames: Object.values(regionStats)
            .filter(item => item.count > 0)
            .map(item => item.name),
        unmatchedPlots
    };
}

export function filterPlotsByFeature(plots = [], feature) {
    if (!feature) {
        return [];
    }

    return plots.filter(plot => {
        const point = getPlotCenterLngLat(plot);
        return point ? isPointInFeature(point, feature) : false;
    });
}
