export function numericStat(value) {
    if (value == null || value === '' || typeof value === 'boolean') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function attributes(node) {
    if (typeof node?.ext_attrs !== 'string') return node?.ext_attrs || {};
    try { return JSON.parse(node.ext_attrs) || {}; } catch (_) { return {}; }
}

export function enrichParcelStats(rows = [], nodes = []) {
    const byId = new Map(nodes.map(node => [String(node.id), node]));
    return rows.map(row => {
        const node = byId.get(String(row.plot_id));
        const attrs = attributes(node);
        const coverage = numericStat(attrs.coverage);
        return { ...node, ...row, node,
            source_area_mu: numericStat(attrs.source_area_mu),
            coverage: coverage != null && coverage >= 0 && coverage <= 1 ? coverage : null };
    });
}

// Missing measurements must not silently become zero in a total.
export function sumStats(rows, key) {
    const values = rows.map(row => numericStat(row[key]));
    return values.every(value => value != null) ? values.reduce((sum, value) => sum + value, 0) : null;
}

export function totalParcelStats(rows) {
    const total = {};
    for (const key of ['area', 'tree_count', 'source_area_mu', 'pest_count', 'healthy_count', 'yield_total']) {
        total[key] = sumStats(rows, key);
    }
    total.trees_per_mu = total.area > 0 && total.tree_count != null ? total.tree_count / total.area : null;
    const measured = rows.every(row => numericStat(row.tree_count) === 0 || numericStat(row.avg_crown_area) != null);
    total.avg_crown_area = total.tree_count > 0 && measured
        ? rows.reduce((sum, row) => sum + Number(row.tree_count) * (numericStat(row.avg_crown_area) || 0), 0) / total.tree_count : null;
    return total;
}

export function buildScopeStatistics({ plot, nodes = [], stats, summary }) {
    const isParcel = plot.node_type === 'parcel';
    const isRegion = plot.node_type === 'region';
    const id = String(plot.id);
    const scopeStat = isParcel ? stats?.parcels?.find(row => String(row.plot_id) === id)
        : isRegion ? stats?.regions?.find(row => String(row.plot_id) === id) : stats?.root;
    const scopeNodes = nodes.filter(node => node.node_type === 'parcel' &&
        (isParcel ? String(node.id) === id : !isRegion || String(node.parent_plot_id) === id));
    if (isParcel && !scopeNodes.length) scopeNodes.push(plot);
    const byId = new Map((stats?.parcels || []).map(row => [String(row.plot_id), row]));
    const rows = scopeNodes.map(node => {
        const row = byId.get(String(node.id));
        const ownSummary = isParcel && String(node.id) === id ? summary : null;
        return { plot_id: String(node.id), name: node.name, area: node.area,
            tree_count: ownSummary?.total_trees, avg_crown_area: ownSummary?.avg_crown_area,
            pest_count: ownSummary?.has_pest === false ? null : ownSummary?.pest_trees,
            healthy_count: ownSummary?.has_pest === false ? null : ownSummary?.healthy_trees,
            yield_total: ownSummary?.has_yield === false ? null : ownSummary?.yield_total,
            ...row };
    });
    const parcels = enrichParcelStats(rows, scopeNodes).map(row => ({ ...row,
        trees_per_mu: numericStat(row.trees_per_mu) ?? (Number(row.area) > 0 && numericStat(row.tree_count) != null
            ? Number(row.tree_count) / Number(row.area) : null) }));
    const totals = totalParcelStats(parcels);
    const treeCount = numericStat(scopeStat?.tree_count) ?? numericStat(summary?.total_trees);
    const area = numericStat(scopeStat?.area) ?? numericStat(plot.area);
    const rootSummary = !isRegion && !isParcel ? stats?.summary : null;
    const regionArea = numericStat(rootSummary?.region_area) ?? area;
    const inParcels = numericStat(rootSummary?.in_parcel_trees) ?? totals.tree_count;
    return { parcels, totals, metrics: {
        area: regionArea,
        parcel_count: numericStat(rootSummary?.parcel_count) ?? parcels.length,
        parcel_area: numericStat(rootSummary?.parcel_area) ?? totals.area,
        tree_count: treeCount ?? numericStat(rootSummary?.tree_count),
        in_parcel_trees: inParcels,
        in_parcel_ratio: treeCount > 0 && inParcels != null ? inParcels / treeCount : null,
        outside_parcel_trees: numericStat(scopeStat?.outside_parcel_trees) ?? numericStat(rootSummary?.outside_parcel_trees),
        trees_per_mu: numericStat(scopeStat?.trees_per_mu) ?? numericStat(rootSummary?.trees_per_mu)
            ?? (regionArea > 0 && treeCount != null ? treeCount / regionArea : null),
        parcel_trees_per_mu: numericStat(rootSummary?.parcel_trees_per_mu) ?? totals.trees_per_mu,
        avg_crown_area: numericStat(scopeStat?.avg_crown_area) ?? numericStat(summary?.avg_crown_area)
            ?? numericStat(rootSummary?.avg_crown_area)
    } };
}
