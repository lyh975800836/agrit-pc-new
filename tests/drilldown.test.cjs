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
