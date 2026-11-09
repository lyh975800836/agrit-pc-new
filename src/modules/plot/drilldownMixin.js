import apiClient from '@/services/apiClient';
import { buildPlotData, fetchAnalysisTimeline } from './services/plotDetailDataService';
import { loadAnalysisBatchBundle } from './services/analysisBatchCache';
import { fetchSubPlots, fetchSubPlotStats, isScopedPlot, isForbidden, unwrapResponse, tileStatusLabel } from './services/drilldownService';

export default {
    data() {
        return {
            drilldownRoot: null, drilldownNodes: [], drilldownEnabled: false,
            drilldownOpen: false, drilldownStats: null, drilldownStatsLoading: false,
            drilldownStatsError: '', scopeLoading: false, scopeError: '',
            reportOpen: false, scopeTreesLoading: false, scopeTreeError: ''
        };
    },
    computed: {
        isForestPlot() { return !['factory', 'warehouse'].includes(this.plotData.type); },
        scopeBreadcrumbs() {
            if (!this.drilldownRoot) return [this.plotData];
            const result = [this.drilldownRoot];
            if (String(this.plotData.id) === String(this.drilldownRoot.id)) return result;
            const parent = this.drilldownNodes.find(node => String(node.id) === String(this.plotData.parent_plot_id));
            if (parent && parent.node_type === 'region') result.push(parent);
            return [...result, this.plotData];
        },
        scopeBoundaries() {
            if (!this.drilldownEnabled) return [];
            if (!this.drilldownRoot) return [this.plotData];
            if (!this.plotData.node_type) return this.drilldownNodes.filter(node => node.node_type === 'region');
            const regionId = this.plotData.node_type === 'region' ? this.plotData.id : this.plotData.parent_plot_id;
            return this.drilldownNodes.filter(node => String(node.id) === String(regionId)
                || String(node.parent_plot_id) === String(regionId));
        },
        scopedMapMessage() {
            if (this.scopeLoading) return '正在加载当前范围…';
            if (this.scopeError) return this.scopeError;
            if (!this.currentAnalysisId) return '暂无巡飞记录';
            return tileStatusLabel(this.apiAnalysisSummary?.analysis_tile?.status);
        }
    },
    beforeDestroy() {
        this._plotLoadToken = null;
        this._mapTileToken = null;
        this._statsToken = null;
        this._timelineToken = null;
        this._treeDetailToken = null;
    },
    methods: {
        resetDrilldown() {
            this.drilldownRoot = null;
            this.drilldownNodes = [];
            this.drilldownEnabled = false;
            this.drilldownOpen = false;
            this.drilldownStats = null;
            this.drilldownStatsError = '';
            this.drilldownStatsLoading = false;
            this.scopeLoading = false;
            this.scopeError = '';
            this.scopeTreeError = '';
            this.scopeTreesLoading = false;
            this.reportOpen = false;
            this._statsToken = null;
            this._timelineToken = null;
            this._treeDetailToken = null;
            this.showTreeDetail = false;
            this.selectedTreeDetail = null;
        },
        async discoverDrilldown(record, loadToken) {
            // A parcel entry is self-contained: never probe its ancestors or management APIs.
            if (['parcel', 'region'].includes(record.node_type)) {
                this.drilldownEnabled = true;
                return;
            }
            let nodes = [];
            try {
                const data = await fetchSubPlots(record.id);
                nodes = Array.isArray(data) ? data : [];
            } catch (error) {
                if (this._plotLoadToken !== loadToken) return;
                if (isForbidden(error) || isScopedPlot(record)) throw error;
                // Older deployments may not expose sub-plots. Ordinary plots retain their map.
                this.debugPlotDetail('子地块不可用，沿用普通地块流程', { error: error.message });
            }
            if (this._plotLoadToken !== loadToken) return;
            this.drilldownEnabled = isScopedPlot(record) || nodes.some(node => node.node_type === 'region');
            if (this.drilldownEnabled) {
                this.drilldownRoot = record;
                this.drilldownNodes = nodes;
            }
        },
        async selectScope(node) {
            if (!node?.id || String(node.id) === String(this.plotData.id)) {
                this.drilldownOpen = false;
                return;
            }
            // Only server-returned members of this hierarchy can be selected.
            if (!this.drilldownRoot || ![this.drilldownRoot, ...this.drilldownNodes]
                .some(item => String(item.id) === String(node.id))) return;
            const token = Symbol('scope');
            this._mapTileToken = token;
            this._timelineToken = null;
            this._treeDetailToken = null;
            this._statsToken = null;
            this.drilldownStats = null;
            this.drilldownOpen = false;
            this.drilldownStatsLoading = false;
            this.drilldownStatsError = '';
            this.analysisSwitchingId = null;
            this.scopeLoading = true;
            this.scopeError = '';
            this.reportOpen = false;
            this.showTreeDetail = false;
            this.selectedTreeDetail = null;
            const analysisId = this.currentAnalysisId;
            this.analysisMapTile = null;
            this.analysisTreeTiles = [];
            this.apiAnalysisSummary = null;
            this.analysisTimelineNodes = [];
            this.analysisTimelineYears = [];
            this.analysisTimelineYear = 0;
            this.apiPlotDetail = null;
            this.apiPlotListRecord = node;
            this.plotData = buildPlotData(node, { plotName: node.name, regionName: this.regionName, defaultArea: 0 });
            try {
                const detail = unwrapResponse(await apiClient.getPlotDetail(node.id));
                if (!this.isCurrentMapTileLoad(token, node.id)) return;
                this.apiPlotDetail = detail;
                this.currentFarmingStageId = detail?.current_farming_stage_id || null;
                this.plotData = buildPlotData(detail, { plotName: node.name, regionName: this.regionName, defaultArea: 0 });
                await this.loadScopedMap(String(node.id), analysisId, token);
            } catch (error) {
                if (this.isCurrentMapTileLoad(token, node.id)) this.handleScopeError(error);
            } finally {
                if (this.isCurrentMapTileLoad(token, node.id)) this.scopeLoading = false;
            }
        },
        async loadScopedMap(plotId, preferredAnalysisId = null, existingToken = null) {
            const token = existingToken || Symbol('scoped-map');
            this._mapTileToken = token;
            this._statsToken = null;
            this._timelineToken = null;
            this.drilldownStats = null;
            this.scopeTreeError = '';
            this.drilldownStatsLoading = false;
            this.drilldownStatsError = '';
            this.analysisSwitchingId = null;
            this.scopeTreesLoading = false;
            this.scopeLoading = true;
            this.scopeError = '';
            this.baseMapTileInfo = null;
            this.analysisMapTile = null;
            this.analysisTreeTiles = [];
            this.apiAnalysisSummary = null;
            this.mapReady = true;
            try {
                const timeline = await fetchAnalysisTimeline(plotId);
                if (!this.isCurrentMapTileLoad(token, plotId)) return;
                this.analysisTimelineNodes = timeline?.nodes || [];
                this.analysisTimelineYears = timeline?.years || [];
                this.analysisTimelineYear = 0;
                const retained = this.analysisTimelineNodes.find(node => String(node.analysis_id) === String(preferredAnalysisId));
                const analysisId = retained ? String(retained.analysis_id) : timeline?.latestAnalysisId;
                this.currentAnalysisId = analysisId || null;
                if (analysisId) await this.loadScopedBatch(plotId, analysisId, token);
            } catch (error) {
                if (this.isCurrentMapTileLoad(token, plotId)) { this.scopeTreesLoading = false; this.handleScopeError(error); }
            } finally {
                if (this.isCurrentMapTileLoad(token, plotId)) this.scopeLoading = false;
            }
        },
        async loadScopedBatch(plotId, analysisId, token) {
            // Fresh summary first, then trees projected on that exact layer.
            this.drilldownStats = null;
            this.scopeTreeError = '';
            this.scopeTreesLoading = true;
            let statsTask;
            const bundle = await loadAnalysisBatchBundle({ plotId, analysisId, fresh: true,
                onSummary: (summary, analysisTile) => {
                    if (!this.isCurrentMapTileLoad(token, plotId)) return;
                    this.currentAnalysisId = String(analysisId);
                    this.apiAnalysisSummary = summary;
                    this.analysisMapTile = analysisTile;
                    this.scopeLoading = false;
                    statsTask = this.refreshDrilldownStats(analysisId);
                }
            });
            if (!this.isCurrentMapTileLoad(token, plotId)) return;
            this.currentAnalysisId = String(analysisId);
            this.apiAnalysisSummary = bundle.summary;
            this.analysisMapTile = bundle.analysisTile;
            this.analysisTreeTiles = bundle.treeTiles;
            this.analysisSourceTileSize = bundle.sourceTileSize;
            this.scopeTreesLoading = false;
            this.scopeTreeError = bundle.treeError || '';
            await statsTask;
        },
        async switchScopedBatch(analysisId) {
            const plotId = String(this.plotData.id);
            const token = Symbol('scoped-batch');
            this._mapTileToken = token;
            this._treeDetailToken = null;
            this._statsToken = null;
            this.showTreeDetail = false;
            this.reportOpen = false;
            this.analysisSwitchingId = analysisId;
            this.scopeLoading = true;
            this.scopeError = '';
            this.currentAnalysisId = analysisId;
            this.apiAnalysisSummary = null;
            this.analysisMapTile = null;
            this.analysisTreeTiles = [];
            this.drilldownStats = null;
            this.drilldownStatsLoading = false;
            this.drilldownStatsError = '';
            try {
                await this.loadScopedBatch(plotId, analysisId, token);
            } catch (error) {
                if (this.isCurrentMapTileLoad(token, plotId)) this.handleScopeError(error);
            } finally {
                if (this.isCurrentMapTileLoad(token, plotId)) {
                    this.analysisSwitchingId = null;
                    this.scopeLoading = false;
                    this.scopeTreesLoading = false;
                }
            }
        },
        async refreshDrilldownStats(analysisId = this.currentAnalysisId) {
            if (!this.drilldownRoot || !analysisId) return;
            const token = Symbol('stats');
            this._statsToken = token;
            this.drilldownStatsLoading = true;
            this.drilldownStatsError = '';
            try {
                const data = await fetchSubPlotStats(this.drilldownRoot.id, analysisId);
                if (this._statsToken === token) this.drilldownStats = data;
            } catch (error) {
                if (this._statsToken !== token) return;
                if (isForbidden(error)) this.handleScopeError(error);
                else this.drilldownStatsError = error.message;
            } finally {
                if (this._statsToken === token) this.drilldownStatsLoading = false;
            }
        },
        handleScopeError(error) {
            if (isForbidden(error)) {
                this._mapTileToken = null;
                this._plotLoadToken = null;
                this._statsToken = null;
                this._treeDetailToken = null;
                this.mapReady = false;
                this.analysisMapTile = null;
                this.analysisTreeTiles = [];
                this.apiAnalysisSummary = null;
                this.drilldownStats = null;
                this.drilldownOpen = false;
                this.reportOpen = false;
                this.showTreeDetail = false;
                this.scopeTreesLoading = false;
                this.scopeTreeError = '';
                window.alert('无权查看该地块');
                this.$router.replace(this.detailMapRoute).catch(() => {});
                return;
            }
            this.scopeError = error.message || '数据加载失败，请重试';
        }
    }
};
