<template>
  <div class="scope-overlay" @click.self="$emit('close')">
    <section class="scope-panel" role="dialog" aria-modal="true" aria-label="区域与农户统计">
      <header><div><h3>{{ root.name }}</h3><small>区域与农户 · 当前巡飞批次统计</small></div><button @click="$emit('close')">关闭</button></header>
      <div class="scope-content">
        <nav class="scope-tree" aria-label="地块下钻">
          <input v-model="keyword" placeholder="搜索区域、地块或农户" aria-label="搜索区域、地块或农户" />
          <button :class="{ active: sameId(root.id, selectedId) }" @click="$emit('select', root)">全部区域 · {{ root.name }}</button>
          <details v-for="region in filteredTree" :key="region.id" open>
            <summary><button :class="{ active: sameId(region.id, selectedId) }" @click.stop="$emit('select', region)">{{ region.name }} <small>{{ region.children.length }} 块</small></button></summary>
            <button v-for="parcel in region.children" :key="parcel.id" class="parcel" :class="{ active: sameId(parcel.id, selectedId) }" @click="$emit('select', parcel)">{{ parcel.name }} <small>{{ parcel.area }} 亩</small></button>
          </details>
          <p v-if="!filteredTree.length">暂无匹配区域</p>
        </nav>
        <main class="scope-data">
          <div v-if="selectedPlot" class="scope-tabs"><button :class="{ active: currentScope }" @click="currentScope = true">当前范围 · {{ selectedPlot.name }}</button><button :class="{ active: !currentScope }" @click="currentScope = false">全部区域与农户</button></div>
          <ScopeStatistics v-if="currentScope && selectedPlot" :expanded="true" :keyword="keyword" :plot="selectedPlot" :nodes="nodes" :stats="stats" :summary="summary" :loading="loading" :error="error" :can-expand="true" @select="$emit('select', $event)" @retry="$emit('retry')" />
          <template v-else>
          <p v-if="loading" role="status">正在加载当前批次统计…</p>
          <p v-else-if="error" role="alert">{{ error }} <button @click="$emit('retry')">重新加载</button></p>
          <p v-else-if="!stats">暂无批次统计</p>
          <template v-else>
            <div class="scope-metrics"><div v-for="metric in summaryMetrics" :key="metric.key"><strong>{{ format(stats.summary && stats.summary[metric.key]) }}</strong><span>{{ metric.label }}</span></div></div>
            <div class="scope-tabs"><button v-for="item in tabs" :key="item.key" :class="{ active: tab === item.key }" @click="tab = item.key">{{ item.label }}（{{ (stats[item.key] || []).length }}）</button></div>
            <div class="scope-table-wrap">
              <table>
                <thead><tr><th>{{ tab === 'farmers' ? '农户' : '名称' }}</th><th>面积（亩）</th><th>株数</th><th>株密度（株/亩）</th><th>平均冠幅（㎡）</th><th v-if="tab === 'parcels'">原始面积（亩）</th><th v-if="tab === 'parcels'">影像覆盖</th><th v-if="stats.has_pest !== false">病树</th><th v-if="stats.has_pest !== false">健康树</th><th v-if="stats.has_yield !== false">产量</th><th v-if="tab === 'regions'">区域内未归属小地块株数</th><th v-if="tab !== 'regions'">绑定账号 / 底图</th><th>查看</th></tr></thead>
                <tbody><tr v-for="(row, index) in rows" :key="row.plot_id || row.farmer_name || index">
                  <td>{{ row.name || row.farmer_name || '—' }}</td><td>{{ format(row.area) }}</td><td>{{ format(row.tree_count) }}</td><td>{{ format(row.trees_per_mu) }}</td><td>{{ format(row.avg_crown_area) }}</td><td v-if="tab === 'parcels'">{{ format(row.source_area_mu) }}</td><td v-if="tab === 'parcels'"><span :class="{ 'low-coverage': row.coverage != null && row.coverage < .95 }">{{ row.coverage == null ? '—' : `${Math.round(row.coverage * 100)}%` }}</span></td><td v-if="stats.has_pest !== false">{{ format(row.pest_count) }}</td><td v-if="stats.has_pest !== false">{{ format(row.healthy_count) }}</td><td v-if="stats.has_yield !== false">{{ format(row.yield_total) }}</td><td v-if="tab === 'regions'">{{ format(row.outside_parcel_trees) }}</td>
                  <td v-if="tab !== 'regions'">{{ row.owner_name || '未绑定' }}<small v-if="row.tile_status" class="tile-status">{{ tileStatusLabel(row.tile_status) }}</small></td>
                  <td><button v-for="node in rowNodes(row)" :key="node.id" @click="$emit('select', node)">{{ tab === 'farmers' ? node.name : '进入' }}</button><span v-if="!rowNodes(row).length">—</span></td>
                </tr></tbody>
              </table>
              <p v-if="!rows.length">暂无匹配数据</p>
            </div>
          </template>
          </template>
        </main>
      </div>
    </section>
  </div>
</template>

<script>
import { buildDrilldownTree, tileStatusLabel } from '../services/drilldownService';
import { enrichParcelStats } from '../services/scopeStatistics';
import ScopeStatistics from './ScopeStatistics.vue';

export default {
    name: 'DrilldownPanel',
    components: { ScopeStatistics },
    props: {
        root: { type: Object, required: true }, nodes: { type: Array, default: () => [] },
        selectedId: { type: [String, Number], default: '' }, stats: { type: Object, default: null },
        loading: Boolean, error: { type: String, default: '' },
        selectedPlot: { type: Object, default: null }, summary: { type: Object, default: null }
    },
    data: () => ({ currentScope: true, keyword: '', tab: 'regions', tabs: [{ key: 'regions', label: '区域' }, { key: 'parcels', label: '小地块' }, { key: 'farmers', label: '农户汇总' }] }),
    computed: {
        filteredTree() {
            return buildDrilldownTree(this.root, this.nodes).map(region => ({ ...region,
                children: this.matches(region) ? region.children : region.children.filter(this.matches)
            })).filter(region => this.matches(region) || region.children.length);
        },
        rows() {
            const rows = this.stats?.[this.tab] || [];
            return (this.tab === 'parcels' ? enrichParcelStats(rows, this.nodes) : rows).filter(this.matches);
        },
        summaryMetrics() {
            return [
                { key: 'region_count', label: '区域数' }, { key: 'parcel_count', label: '小地块数' },
                { key: 'farmer_count', label: '农户数' }, { key: 'tree_count', label: '总株数' },
                { key: 'region_area', label: '区域面积（亩）' }, { key: 'parcel_area', label: '农户林地面积（亩）' },
                { key: 'in_region_trees', label: '区域内株数' }, { key: 'in_parcel_trees', label: '农户林地内株数' },
                { key: 'outside_parcel_trees', label: '区域内未归属小地块株数' }, { key: 'outside_region_trees', label: '区域外株数' },
                { key: 'trees_per_mu', label: '区域株密度（株/亩）' }, { key: 'parcel_trees_per_mu', label: '农户林地株密度（株/亩）' }
            ];
        }
    },
    methods: {
        tileStatusLabel,
        sameId(a, b) { return String(a) === String(b); },
        matches(row) { return `${row.name || ''} ${row.farmer_name || ''}`.includes(this.keyword.trim()); },
        format(value) { return value == null ? '—' : Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 }); },
        rowNodes(row) {
            const ids = row.parcel_ids || [row.plot_id];
            return this.nodes.filter(node => ids.some(id => this.sameId(id, node.id)));
        }
    }
};
</script>

<style scoped lang="less">
@import (reference) "~@/styles/components/plot-scrollbar.less";
.scope-panel, .scope-tree, .scope-table-wrap { .plot-scrollbar(); }
.low-coverage { color: #ffbd75; }
.scope-overlay { position: fixed; inset: 0; z-index: 1200; background: #0009; display: flex; align-items: center; justify-content: center; }
.scope-panel { width: min(1320px, 94vw); max-height: 86vh; overflow: auto; color: #f0e4d2; background: #0d2a28; border: 1px solid #c69c6d70; border-radius: 8px; padding: 22px; box-sizing: border-box; }
header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; } h3 { margin: 0 0 6px; } small { color: #b9d1ca; }
button, input { font: inherit; color: inherit; border: 1px solid #c69c6d75; border-radius: 4px; background: transparent; padding: 7px 10px; } button { cursor: pointer; } button:hover, button.active { background: #c69c6d28; border-color: #c69c6d; } button:focus-visible, input:focus-visible { outline: 2px solid #e2c59a; }
.scope-content { display: flex; gap: 20px; } .scope-tree { width: 245px; flex-shrink: 0; max-height: 61vh; overflow: auto; } .scope-tree input { box-sizing: border-box; width: 100%; margin-bottom: 10px; } .scope-tree button { text-align: left; margin: 3px 0; width: 100%; } .scope-tree summary { display: flex; cursor: pointer; } .scope-tree .parcel { padding-left: 22px; } .scope-data { min-width: 0; flex: 1; }
.scope-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; } .scope-metrics div { display: flex; flex-direction: column; gap: 4px; } .scope-metrics strong { font-size: 23px; } .scope-metrics span { font-size: 11px; color: #b9d1ca; } .scope-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
.scope-table-wrap { overflow: auto; max-height: 40vh; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { text-align: left; white-space: nowrap; padding: 10px 8px; border-bottom: 1px solid #c69c6d42; } th { position: sticky; top: 0; background: #163633; color: #e1c99e; } td button { margin: 2px; } .tile-status { display: block; margin-top: 4px; color: #b9d1ca; }
@media (max-width: 900px) { .scope-content { flex-direction: column; } .scope-tree { width: 100%; max-height: 24vh; } .scope-metrics { grid-template-columns: repeat(3, 1fr); } }
</style>
