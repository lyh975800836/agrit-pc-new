// Local image grid, not Web Mercator. Use metadata from the current summary.
export function projectPlotBoundary(locationInfo, tile, displayTileSize) {
    if (!locationInfo || !tile) return null;
    const keys = ['min_lon', 'max_lat', 'pixel_per_lon_degree', 'pixel_per_lat_degree'];
    if (keys.some(key => tile[key] == null || !Number.isFinite(Number(tile[key])))) return null;
    if (Number(tile.pixel_per_lon_degree) <= 0 || Number(tile.pixel_per_lat_degree) <= 0) return null;
    let geometry;
    try { geometry = typeof locationInfo === 'string' ? JSON.parse(locationInfo) : locationInfo; }
    catch (_) { return null; }
    const coordinates = geometry?.coordinates;
    if (geometry?.type !== 'Polygon' || !Array.isArray(coordinates) || !coordinates.length) return null;
    const first = coordinates[0];
    const ring = !Array.isArray(first) ? coordinates : (Array.isArray(first[0]) ? first : coordinates);
    if (ring.length < 3) return null;
    const size = Number(tile.tile_size || 512);
    if (!Number.isFinite(size) || size <= 0 || !Number.isFinite(displayTileSize) || displayTileSize <= 0) return null;
    const scale = displayTileSize / size;
    const points = ring.map(point => {
        const lon = Array.isArray(point) ? point[0] : point?.longitude;
        const lat = Array.isArray(point) ? point[1] : point?.latitude;
        if (lon == null || lat == null || !Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat))) return null;
        return [(Number(lon) - Number(tile.min_lon)) * Number(tile.pixel_per_lon_degree) * scale,
            (Number(tile.max_lat) - Number(lat)) * Number(tile.pixel_per_lat_degree) * scale];
    });
    if (points.some(point => !point || point.some(value => !Number.isFinite(value)))) return null;
    return points;
}

// Find an interior label point, including for concave regions whose bounding-box
// centre can lie outside the image. Scan between vertices to avoid tangent edges.
export function getBoundaryLabelPoint(points) {
    if (!points?.length) return null;
    const ys = [...new Set(points.map(point => point[1]))].sort((a, b) => a - b);
    let widest = 0;
    let result = points[0];
    const stride = Math.max(1, Math.ceil((ys.length - 1) / 24));
    for (let row = 1; row < ys.length; row += stride) {
        const y = (ys[row - 1] + ys[row]) / 2;
        const xs = [];
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const a = points[j], b = points[i];
            if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
        }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) {
            if (xs[i + 1] - xs[i] > widest) {
                widest = xs[i + 1] - xs[i];
                result = [(xs[i] + xs[i + 1]) / 2, y];
            }
        }
    }
    return result;
}

// Keep names readable at the overview scale. Displaced labels retain a leader
// line to their region; hit targets still carry the original node ID.
export function placeBoundaryLabels(boundaries, width, height) {
    const occupied = [];
    return boundaries.map(boundary => {
        if (!boundary.showLabel) return boundary;
        const anchor = boundary.labelPoint;
        const halfWidth = [...String(boundary.node.name || '')].reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 14 : 8), 0) / 2 + 4;
        let chosen = null;
        for (let radius = 0; radius <= 8 && !chosen; radius += 1) {
            const offsets = radius ? [[0, -radius * 21], [0, radius * 21], [-radius * 26, 0], [radius * 26, 0], [-radius * 26, -radius * 21], [radius * 26, radius * 21]] : [[0, 0]];
            for (const [dx, dy] of offsets) {
                const x = Math.max(halfWidth, Math.min(width - halfWidth, anchor[0] + dx));
                const y = Math.max(11, Math.min(height - 11, anchor[1] + dy));
                const box = { left: x - halfWidth, right: x + halfWidth, top: y - 10, bottom: y + 10 };
                if (occupied.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) continue;
                chosen = [x, y];
                occupied.push(box);
                break;
            }
        }
        return { ...boundary, labelAnchor: anchor, labelPoint: chosen || anchor };
    });
}
