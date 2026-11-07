import apiClient from '@/services/apiClient';

// Only the new scoped flows require strict business-error propagation. Keep the
// legacy client's response contract for existing consumers.
export function unwrapResponse(response) {
    if (response?.code !== 0) {
        const error = new Error(response?.message || '数据加载失败');
        error.code = response?.code;
        throw error;
    }
    return response.data;
}

export function isForbidden(error) {
    return Number(error?.code || error?.status) === 403;
}

export function isScopedPlot(plot) {
    let attrs = plot?.ext_attrs;
    if (typeof attrs === 'string') {
        try { attrs = JSON.parse(attrs); } catch (_) { attrs = {}; }
    }
    return ['region', 'parcel'].includes(plot?.node_type) || attrs?.drilldown === true;
}

export async function postPlotData(path, payload) {
    return unwrapResponse(await apiClient.request(`/api/v2/${path}`, {
        method: 'POST', body: JSON.stringify(payload)
    }));
}

export function fetchSubPlots(plotId) {
    return postPlotData('plot/sub-plots', {
        parent_plot_id: String(plotId), include_descendants: true
    });
}

export function fetchSubPlotStats(plotId, analysisId) {
    return postPlotData('plot-analysis/sub-plot-stats', {
        plot_id: String(plotId), analysis_id: String(analysisId)
    });
}

export function buildDrilldownTree(root, nodes) {
    const sorted = [...nodes].sort((a, b) => Number(a.sort_no || 0) - Number(b.sort_no || 0)
        || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
    return sorted.filter(node => node.node_type === 'region' && String(node.parent_plot_id) === String(root.id))
        .map(region => ({ ...region, children: sorted.filter(node => node.node_type === 'parcel'
            && String(node.parent_plot_id) === String(region.id)) }));
}

export function tileStatusLabel(status) {
    return ({ pending: '底图生成中', processing: '底图生成中', completed: '已完成', failed: '底图生成失败，请联系管理员重试' })[status] || '底图生成中';
}
