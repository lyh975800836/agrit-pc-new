const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');

const root = path.resolve(__dirname, '..');
// Load the existing ES modules with alias support, without adding test dependencies.
function loader(mocks = {}) {
    const cache = new Map();
    function load(name, parent = root) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        let filename = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(parent, name);
        if (!path.extname(filename)) filename += '.js';
        if (cache.has(filename)) return cache.get(filename).exports;
        const module = { exports: {} };
        cache.set(filename, module);
        const source = fs.readFileSync(filename, 'utf8');
        const script = filename.endsWith('.vue') ? require('vue-template-compiler').parseComponent(source).script.content : source;
        const code = babel.transformSync(script, {
            filename, babelrc: false, configFile: false,
            plugins: ['@babel/plugin-transform-modules-commonjs']
        }).code;
        vm.runInNewContext(code, { module, exports: module.exports,
            require: dependency => load(dependency, path.dirname(filename)),
            AbortController, setTimeout, clearTimeout, console, URL,
            window: { alert() {} }
        }, { filename });
        return module.exports;
    }
    return load;
}

const validTile = { status: 'completed', layer_name: 'analysis_random_a', max_zoom_level: 4, max_tile_x: 0, max_tile_y: 0 };
function setup({ status = 'completed', treeCode = 0, summaryCode = 0 } = {}) {
    const calls = [];
    let session = 'a';
    let layer = 0;
    const api = {
        async getAnalysisSummary(plotId, analysisId) {
            calls.push(['summary', plotId, analysisId]);
            return { code: summaryCode, message: 'denied', data: { analysis_tile: status === null ? null : { ...validTile, status, layer_name: `layer_${++layer}` } } };
        },
        async getAnalysisTileTrees(body) { calls.push(['trees', body]); return { code: treeCode, data: { tiles: [{ trees: [] }], source_tile_size: 512 } }; },
        async getPlotDetail(id) { calls.push(['detail', id]); return { code: 0, data: { id, node_type: 'parcel' } }; },
        async request(url, options) { calls.push([url, JSON.parse(options.body)]); return { code: 0, data: [] }; }
    };
    const load = loader({ '@/services/apiClient': api, '@/services/authSession': { getToken: () => session },
        '@/utils/adminRegionAggregator': { filterPlotsByFeature() {}, getPlotListPageInfo() {} } });
    return { calls, load, setSession(value) { session = value; } };
}

test('business errors propagate, including HTTP-200 forbidden responses', () => {
    const { load } = setup();
    const { unwrapResponse, isForbidden } = load('@/modules/plot/services/drilldownService');
    assert.throws(() => unwrapResponse({ code: 403, message: '无权查看该地块' }), error => isForbidden(error));
    assert.throws(() => unwrapResponse({ code: 500013, message: '单树记录不存在' }), /单树记录不存在/);
});

test('uint64 parcel IDs are used directly without a list or ancestor lookup', async () => {
    const { calls, load } = setup();
    const id = '18446744073709551610';
    const record = await load('@/modules/plot/services/plotDetailDataService').resolvePlotRecord({ plotId: id });
    assert.equal(record.id, id);
    assert.deepEqual(calls, [['detail', id]]);
});

for (const status of [null, 'pending', 'processing', 'failed', 'unknown']) {
    test(`unready tile (${status}) never requests trees and is not cached`, async () => {
        const { calls, load } = setup({ status });
        const cache = load('@/modules/plot/services/analysisBatchCache');
        const bundle = await cache.loadAnalysisBatchBundle({ plotId: '1060', analysisId: '13' });
        assert.equal(bundle.analysisTile, null);
        assert.equal(calls.filter(call => call[0] === 'trees').length, 0);
        assert.equal(cache.getCachedBatch('1060', '13'), null);
    });
}

test('fresh scoped batches reread random layer names; summary and trees share the selected ID', async () => {
    const { calls, load } = setup();
    const cache = load('@/modules/plot/services/analysisBatchCache');
    const options = { plotId: '1060', analysisId: '13', fresh: true };
    const first = await cache.loadAnalysisBatchBundle(options);
    const second = await cache.loadAnalysisBatchBundle(options);
    assert.notEqual(first.analysisTile.layer_name, second.analysisTile.layer_name);
    assert.equal(cache.getCachedBatch('1060', '13'), null);
    for (const [, body] of calls.filter(call => call[0] === 'trees')) {
        assert.equal(body.plot_id, '1060'); assert.equal(body.analysis_id, '13');
        assert.equal(body.plot_tile_id, '0'); assert.equal(body.zoom, 4);
        assert.equal(body.tile_range.max_tile_x, 0);
    }
});

test('ordinary batch cache retains reuse and isolates nodes and login sessions', async () => {
    const { calls, load, setSession } = setup();
    const cache = load('@/modules/plot/services/analysisBatchCache');
    const options = { plotId: '100', analysisId: '13' };
    const a = await cache.loadAnalysisBatchBundle(options);
    assert.equal(await cache.loadAnalysisBatchBundle(options), a);
    assert.equal(calls.filter(call => call[0] === 'summary').length, 1);
    assert.equal(cache.getCachedBatch('101', '13'), null);
    setSession('b');
    assert.equal(cache.getCachedBatch('100', '13'), null);
});

test('forbidden tree requests do not leave a partially usable batch', async () => {
    const { load } = setup({ treeCode: 403 });
    await assert.rejects(load('@/modules/plot/services/analysisBatchCache').loadAnalysisBatchBundle({ plotId: '1060', analysisId: '13', fresh: true }), error => error.code === 403);
});

test('hierarchy orders regions and groups duplicate farmer names by IDs', () => {
    const { load } = setup();
    const { buildDrilldownTree, isScopedPlot } = load('@/modules/plot/services/drilldownService');
    const tree = buildDrilldownTree({ id: '1' }, [
        { id: '12', parent_plot_id: '3', node_type: 'parcel', name: '农户甲' },
        { id: '3', parent_plot_id: '1', node_type: 'region', sort_no: 2 },
        { id: '2', parent_plot_id: '1', node_type: 'region', sort_no: 1 },
        { id: '11', parent_plot_id: '2', node_type: 'parcel', name: '农户甲' }
    ]);
    assert.equal(tree[0].id, '2'); assert.equal(tree[0].children[0].id, '11');
    assert.equal(tree[1].children[0].id, '12');
    assert.equal(isScopedPlot({ ext_attrs: '{"drilldown":true}' }), true);
    assert.equal(isScopedPlot({ node_type: 'parcel' }), true);
    assert.equal(isScopedPlot({ ext_attrs: 'invalid' }), false);
});

test('boundary projection supports the documented object ring and changes with layer and zoom', () => {
    const { load } = setup();
    const { projectPlotBoundary } = load('@/modules/plot/services/plotBoundaryProjection');
    const geometry = JSON.stringify({ type: 'Polygon', coordinates: [{ longitude: 11, latitude: 19 }, { longitude: 12, latitude: 19 }, { longitude: 11, latitude: 18 }] });
    const tile = { min_lon: 10, max_lat: 20, pixel_per_lon_degree: 512, pixel_per_lat_degree: 256, tile_size: 512 };
    assert.deepEqual(Array.from(projectPlotBoundary(geometry, tile, 256)[0]), [256, 128]);
    assert.deepEqual(Array.from(projectPlotBoundary(geometry, { ...tile, min_lon: 11 }, 512)[0]), [0, 256]);
    assert.equal(projectPlotBoundary('bad json', tile, 512), null);
    assert.equal(projectPlotBoundary(geometry, { ...tile, pixel_per_lon_degree: null }, 512), null);
});

test('farmer entry skips hierarchy and management statistics entirely', async () => {
    const { calls, load } = setup();
    const mixin = load('@/modules/plot/drilldownMixin').default;
    const state = { ...mixin.data(), ...mixin.methods };
    await state.discoverDrilldown({ id: '1060', node_type: 'parcel', root_plot_id: '1053' });
    await state.refreshDrilldownStats('13');
    assert.equal(state.drilldownEnabled, true);
    assert.equal(state.drilldownRoot, null);
    assert.equal(calls.length, 0);
});

test('tree data arriving after the scoped base map updates the mounted render layer', () => {
    const load = loader({ '@/services/apiClient': {}, '@/utils/tileUrlHelper': {},
        '@/components/Map/TileImageManager.vue': {}, '@/components/Map/MockMarkers.vue': {} });
    const component = load('@/components/Map/WMTSTileMap.vue').default;
    const oldLayer = { sourceKey: 'random|4|png|test', treeTiles: [] };
    const trees = [{ tile_x: 0, tile_y: 0, trees: [{ tree_id: 'R01-000001' }] }];
    const map = { scoped: true, analysisTile: validTile, treeTiles: trees,
        layerName: 'random', zoomLevel: 4, tileFormat: 'png', tilePathPrefix: 'test', sourceTileSize: 512,
        mountedLayers: [oldLayer], activeSourceKey: oldLayer.sourceKey, _hasCenteredOnTrees: true,
        $nextTick: callback => callback(), $set: (array, index, value) => { array[index] = value; },
        touchLayer() {}, evictLayersBeyondLimit() {}, setActiveLayer() {}, updateTreeWindow() {}, loadPriorityTreeTiles() {}
    };
    map.ensureCurrentLayer = component.methods.ensureCurrentLayer.bind(map);
    component.watch.treeTiles.handler.call(map, trees);
    assert.equal(map.mountedLayers[0].treeTiles, trees);
    assert.equal(map.mountedLayers[0].sourceKey, oldLayer.sourceKey);
    assert.equal(map.mountedLayers.length, 1);
});

test('map entry preserves the selected ID even when names are identical', () => {
    const source = require('vue-template-compiler').parseComponent(fs.readFileSync(path.join(root, 'src/components/Map/RegionDetailMap.vue'), 'utf8')).script.content;
    let method;
    require('@babel/traverse').default(require('@babel/parser').parse(source, { sourceType: 'module' }), {
        ObjectMethod(p) { if (p.node.key.name === 'goToPlotDetail') method = source.slice(p.node.start, p.node.end); }
    });
    const component = Function(`return ({${method}})`)();
    let destination;
    for (const id of ['902', '18446744073709551610']) {
        component.goToPlotDetail.call({ popupData: { id, name: '农户甲' },
            closePlotDetailPopup() { this.popupData = null; },
            $router: { push(route) { destination = route; } } });
        assert.equal(destination.path, `/plot/${id}`);
        assert.equal(destination.query.plotName, '农户甲');
    }
});

test('plot markers keep every same-name parcel instead of overwriting it', () => {
    const { load } = setup();
    const location = { type: 'Polygon', coordinates: [{ longitude: 106, latitude: 24 }, { longitude: 107, latitude: 24 }, { longitude: 106, latitude: 23 }] };
    const records = ['902', '903'].map(id => ({ id, name: '农户甲', location_info: location }));
    const result = load('@/utils/tileDataProcessor').transformTilesToCoordinates({ data: { list: records } });
    assert.deepEqual(Object.values(result).map(item => item.id), ['902', '903']);
    assert.ok(Object.values(result).every(item => item.name === '农户甲'));
});

test('labels stay inside a concave region rather than its empty bounding-box centre', () => {
    const { load } = setup();
    const { getBoundaryLabelPoint } = load('@/modules/plot/services/plotBoundaryProjection');
    const [x, y] = getBoundaryLabelPoint([[0, 0], [10, 0], [10, 2], [2, 2], [2, 10], [0, 10], [0, 0]]);
    assert.ok(x > 0 && x < 10 && y > 0 && y < 10 && (x < 2 || y < 2));
});

function mapInteraction() {
    const load = loader({ '@/services/apiClient': {}, '@/utils/tileUrlHelper': {},
        '@/components/Map/TileImageManager.vue': {}, '@/components/Map/MockMarkers.vue': {} });
    const component = load('@/components/Map/WMTSTileMap.vue').default;
    const emissions = [];
    const grid = { scrollLeft: 100, scrollTop: 100, style: {}, setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {} };
    const boundary = { node: { id: '901' }, interactive: true };
    const map = { ...component.methods, projectedBoundaries: [boundary], $refs: { tileGrid: grid }, $emit: (...args) => emissions.push(args) };
    const target = { closest: selector => selector === '[data-boundary-id]' ? { getAttribute: () => '901' } : null };
    const event = { type: 'pointerdown', button: 0, pointerId: 1, clientX: 50, clientY: 50, target };
    return { map, emissions, grid, event };
}

test('a captured short press opens its original region even when pointerup targets the grid', () => {
    const { map, emissions, grid, event } = mapInteraction();
    map.onPanStart(event);
    map.onPanEnd({ ...event, target: grid, type: 'pointerup' });
    assert.equal(emissions.length, 1);
    assert.equal(emissions[0][0], 'boundary-select');
    assert.equal(emissions[0][1].id, '901');
});

test('dragging a region and pointer cancellation never select it', () => {
    for (const cancel of [false, true]) {
        const { map, emissions, grid, event } = mapInteraction();
        map.onPanStart(event);
        if (!cancel) {
            map.onPanMove({ ...event, clientX: 80 });
            assert.equal(grid.scrollLeft, 70);
            map.onPanMove(event); // Drag back to the starting point is still a drag.
        }
        map.onPanEnd({ ...event, type: cancel ? 'pointercancel' : 'pointerup' });
        assert.equal(emissions.length, 0);
    }
});

test('tree targets bypass region selection and keep their detail interaction', () => {
    const { map, emissions, event } = mapInteraction();
    map.onPanStart({ ...event, target: { closest: selector => selector.includes('.tile-tree-svg') ? {} : null } });
    map.onPanEnd({ ...event, type: 'pointerup' });
    assert.equal(emissions.length, 0);
    assert.ok(!map.panActive);
});

test('overview keeps imagery clear while parcel view enables trees by default', () => {
    const load = loader({ '@/services/apiClient': {}, '@/utils/tileUrlHelper': {},
        '@/components/Map/TileImageManager.vue': {}, '@/components/Map/MockMarkers.vue': {} });
    const component = load('@/components/Map/WMTSTileMap.vue').default;
    assert.equal(component.data.call({ plotData: { node_type: '' }, hasPest: false }).showScopedTrees, false);
    assert.equal(component.data.call({ plotData: { node_type: 'parcel' }, hasPest: false }).showScopedTrees, true);
    assert.equal(component.methods.shouldRenderTreeLayer.call({ scoped: true, showScopedTrees: false }), false);
});

test('scoped maps fit height as well as width without shrinking ordinary maps', () => {
    const load = loader({ '@/services/apiClient': {}, '@/utils/tileUrlHelper': {},
        '@/components/Map/TileImageManager.vue': {}, '@/components/Map/MockMarkers.vue': {} });
    const component = load('@/components/Map/WMTSTileMap.vue').default;
    const map = { scoped: true, tileSizePx: 120, tileRowCount: 24, tileColumnCount: 17,
        $refs: { tileGrid: { clientWidth: 640, clientHeight: 600 } }, $nextTick: fn => fn() };
    component.methods.recalculateTileSize.call(map);
    assert.ok(map.tileSizePx * 24 <= 400);
    map.scoped = false;
    component.methods.recalculateTileSize.call(map);
    assert.equal(map.tileSizePx, 80);
});

test('clustered region labels remain separated and within the map', () => {
    const { load } = setup();
    const { placeBoundaryLabels } = load('@/modules/plot/services/plotBoundaryProjection');
    const labels = placeBoundaryLabels(Array.from({ length: 5 }, (_, i) => ({ node: { id: String(i), name: `区域0${i}` }, showLabel: true, labelPoint: [5 + i * 5, 50 + i] })), 260, 200);
    labels.forEach((label, i) => {
        const [x, y] = label.labelPoint;
        assert.ok(x >= 26 && x <= 234 && y >= 11 && y <= 189);
        assert.equal(label.node.id, String(i));
        for (const other of labels.slice(0, i)) assert.ok(Math.abs(x - other.labelPoint[0]) >= 52 || Math.abs(y - other.labelPoint[1]) >= 20);
    });
});

test('region statistics join metadata by ID, exclude other regions, and compute weighted totals', () => {
    const { buildScopeStatistics } = loader()('@/modules/plot/services/scopeStatistics');
    const data = [
        ['1067', 14.79, 87, 11.6, 14.80, 1], ['1068', 48.22, 828, 10.8, 48.22, 1],
        ['1069', 17.57, 59, 11.8, 17.57, 1], ['1070', 26.34, 176, 11.8, 26.34, 1],
        ['1071', 79.49, 1277, 9.2, 79.49, 1], ['1072', 11.85, 82, 12.6, 79.90, .1483]
    ];
    const nodes = data.map(([id, area, , , source, coverage]) => ({ id, name: '同名农户', node_type: 'parcel', parent_plot_id: '1054', area,
        ext_attrs: JSON.stringify({ source_area_mu: source, coverage }) }));
    nodes.push({ id: '2000', node_type: 'parcel', parent_plot_id: '1055', area: 500 });
    const stats = { regions: [{ plot_id: '1054', area: 359.28, tree_count: 2615, outside_parcel_trees: 106, avg_crown_area: 10.2 }],
        parcels: data.slice().reverse().map(([id, area, count, crown]) => ({ plot_id: id, area, tree_count: count, avg_crown_area: crown })) };
    const model = buildScopeStatistics({ plot: { id: '1054', node_type: 'region' }, nodes, stats });
    assert.equal(model.parcels.length, 6);
    assert.equal(model.parcels[5].source_area_mu, 79.90);
    assert.equal(model.parcels[5].coverage, .1483);
    assert.equal(model.totals.tree_count, 2509);
    assert.equal(model.totals.area.toFixed(2), '198.26');
    assert.equal(model.totals.source_area_mu.toFixed(2), '266.32');
    assert.equal(model.totals.trees_per_mu.toFixed(1), '12.7');
    assert.equal(model.totals.avg_crown_area.toFixed(1), '10.2');
    assert.equal(model.metrics.outside_parcel_trees, 106);
    assert.equal((model.metrics.in_parcel_ratio * 100).toFixed(1), '95.9');
});

test('missing measurements stay unknown and zero coverage remains zero', () => {
    const { buildScopeStatistics, totalParcelStats } = loader()('@/modules/plot/services/scopeStatistics');
    const model = buildScopeStatistics({ plot: { id: '901', node_type: 'region' }, nodes: [
        { id: '902', node_type: 'parcel', parent_plot_id: '901', area: 0, ext_attrs: { coverage: 0, source_area_mu: 0 } },
        { id: '903', node_type: 'parcel', parent_plot_id: '901', area: 5, ext_attrs: 'bad json' }
    ], stats: { parcels: [{ plot_id: '902', tree_count: 0 }] } });
    assert.equal(model.parcels[0].coverage, 0);
    assert.equal(model.parcels[1].coverage, null);
    assert.equal(model.totals.tree_count, null);
    assert.equal(model.totals.source_area_mu, null);
    assert.equal(model.totals.trees_per_mu, null);
    assert.equal(totalParcelStats([{ area: 0, tree_count: 0 }]).trees_per_mu, null);
});

test('standalone farmer statistics use only own metadata and current summary', () => {
    const { buildScopeStatistics } = loader()('@/modules/plot/services/scopeStatistics');
    const plot = { id: '18446744073709551610', node_type: 'parcel', area: 10, ext_attrs: { source_area_mu: 20, coverage: .5 } };
    const first = buildScopeStatistics({ plot, summary: { total_trees: 50, avg_crown_area: 8, has_pest: false, has_yield: false } });
    const next = buildScopeStatistics({ plot, summary: { total_trees: 80, avg_crown_area: 9, has_pest: false, has_yield: false } });
    assert.equal(first.parcels.length, 1);
    assert.equal(first.parcels[0].plot_id, plot.id);
    assert.equal(first.parcels[0].source_area_mu, 20);
    assert.equal(first.parcels[0].coverage, .5);
    assert.equal(first.totals.tree_count, 50);
    assert.equal(next.totals.tree_count, 80);
    assert.equal(next.totals.trees_per_mu, 8);
    assert.equal(next.parcels[0].pest_count, null);
});
