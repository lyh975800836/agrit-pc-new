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
